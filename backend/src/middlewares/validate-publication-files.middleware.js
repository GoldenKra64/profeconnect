const { ApiResponse } = require("../config/api.response");

function validatePublicationFiles(
  req,
  res,
  next
) {

  const files = req.files || [];

  const images =
    files.filter(
      f =>
        f.mimetype.startsWith("image/")
    );

  const documents =
    files.filter(
      f =>
        !f.mimetype.startsWith("image/")
    );

    if (images.length > 4) {
      return res.status(400).json(new ApiResponse(false, 400, "Máximo 4 imágenes", {}));
    }

    if (documents.length > 1) {
      return res.status(400).json(new ApiResponse(false, 400, "Máximo 1 documento", {}));
    }

  for (const image of images) {

    if (image.size > 100 * 1024) {

      return res.status(400).json(new ApiResponse(false, 400, "El tamaño máximo de la imagen es de 100KB", {}));

    }
  }

  for (const doc of documents) {

    if (doc.size > 5 * 1024 * 1024) {

      return res.status(400).json({
        message:
          "El documento no puede superar 5MB",
      });

    }
  }

  next();
}

module.exports =
  validatePublicationFiles;