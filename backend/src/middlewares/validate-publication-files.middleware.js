const { ApiResponse } = require("../config/api.response");
const FileType = require("file-type");
const fs = require("fs");
const prisma = require("../lib/prisma");

const MAX_IMAGE_SIZE_MB = 2;
const MAX_DOCUMENT_SIZE_MB = 10;
const MAX_IMAGES = 4;
const MAX_DOCUMENTS = 1;

const DOCUMENT_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

async function validatePublicationFiles(req, res, next) {
  try {
    const files = req.files || [];

    const images = files.filter((f) => f.mimetype.startsWith("image/"));
    const documents = files.filter((f) => DOCUMENT_MIME_TYPES.has(f.mimetype));

    if (images.length > MAX_IMAGES) {
      return res.status(400).json(new ApiResponse(false, 400, `Máximo ${MAX_IMAGES} imágenes por publicación`, {}));
    }

    if (documents.length > MAX_DOCUMENTS) {
      return res.status(400).json(new ApiResponse(false, 400, `Máximo ${MAX_DOCUMENTS} documento por publicación`, {}));
    }

    // 🛡️ VALIDACIÓN ESTRICTA DE MAGIC NUMBERS
    for (const file of files) {
      const expectedMime = file.mimetype; // Lo que el usuario dice que es (ej. application/pdf)
      const fileTypeResult = await FileType.fromFile(file.path);

      // Si la librería no detecta nada, asumimos de forma segura que es texto plano o un formato sin firma
      const actualMime = fileTypeResult ? fileTypeResult.mime : "text/plain";

      let isMismatch = false;

      // Regla 1: Si dice ser PDF, DEBE ser detectado como PDF real
      if (expectedMime === 'application/pdf' && actualMime !== 'application/pdf') {
        isMismatch = true;
      }
      // Regla 2: Si dice ser Imagen, DEBE ser una imagen real
      else if (expectedMime.startsWith('image/') && !actualMime.startsWith('image/')) {
        isMismatch = true;
      }
      // Regla 3: Si dice ser Word/Excel (o documento), NO puede ser texto plano
      else if (expectedMime.includes('document') || expectedMime.includes('ms-excel')) {
        if (actualMime === 'text/plain' || actualMime.includes('executable')) {
          isMismatch = true;
        }
      }

      if (isMismatch) {
        // 1. NO borramos el archivo malicioso para análisis forense

        // 2. Registramos el incidente en la Base de Datos con la ruta física
        const userId = req.user ? req.user.id : 0;
        await prisma.securityIncident.create({
          data: {
            userId,
            fileName: file.originalname,
            attemptedMime: expectedMime,
            detectedMime: actualMime,
            status: "PENDING",
            physicalPath: file.path,
          },
        });

        // 3. Borramos el resto de archivos inofensivos de esta petición (saltando el malicioso)
        for (const f of files) {
          if (f.path !== file.path && fs.existsSync(f.path)) fs.unlinkSync(f.path);
        }

        // 4. Bloqueamos la petición con el nuevo mensaje
        return res.status(400).json(
          new ApiResponse(false, 400, `ALERTA DE SEGURIDAD: El archivo será inspeccionado por un moderador/administrador por intentar subir un formato que no corresponde a su extensión. Si estas actividades persisten, su cuenta será bloqueada.`, {})
        );
      }
    }

    // Validaciones de tamaño de imágenes
    for (const image of images) {
      const limitBytes = MAX_IMAGE_SIZE_MB * 1024 * 1024;
      if (image.size > limitBytes) {
        return res.status(400).json(new ApiResponse(false, 400, `La imagen "${image.originalname}" supera el límite de ${MAX_IMAGE_SIZE_MB} MB`, {}));
      }
    }

    // Validaciones de tamaño de documentos
    for (const doc of documents) {
      const limitBytes = MAX_DOCUMENT_SIZE_MB * 1024 * 1024;
      if (doc.size > limitBytes) {
        return res.status(400).json(new ApiResponse(false, 400, `El documento "${doc.originalname}" supera el límite de ${MAX_DOCUMENT_SIZE_MB} MB`, {}));
      }
    }

    next();
  } catch (error) {
    // Si algo falla catastróficamente, limpiar el disco
    for (const f of req.files || []) {
      if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
    }
    next(error);
  }
}

module.exports = validatePublicationFiles;