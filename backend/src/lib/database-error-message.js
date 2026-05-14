"use strict";

const DB_HINT =
  "Comprueba que PostgreSQL esté en ejecución (Docker Desktop encendido, luego desde la raíz del repo: `docker compose up -d postgres`). " +
  "En `backend/`: `npm run prisma:deploy` y `npm run db:seed`. Revisa DATABASE_URL/DIRECT_URL en backend/.env (usuario por defecto: amigo / amigo_dev).";

/**
 * Mensaje corto para el cliente JSON (evita párrafos de stack de Prisma).
 */
function publicMessageForDbError(error, rawMessage = "") {
  const message = `${rawMessage || error?.message || ""}`;
  const lower = message.toLowerCase();
  const code = error?.code;

  if (
    code === "ECONNREFUSED" ||
    /ECONNREFUSED|ENOTFOUND/i.test(message)
  ) {
    return `No hay conectividad al servidor de PostgreSQL. ${DB_HINT}`;
  }

  if (
    code === "P1001" ||
    code === "P1008" ||
    /Can't reach database server/i.test(message) ||
    /timeout|timed out/i.test(message) ||
    code === "ETIMEDOUT"
  ) {
    return `No se puede alcanzar la base de datos. ${DB_HINT}`;
  }

  if (
    code === "P1000" ||
    /Authentication failed against the database server/i.test(message) ||
    /database credentials .*not valid/i.test(message) ||
    /password authentication failed/i.test(message) ||
    /28P01/.test(message) ||
    /password fall/i.test(lower) ||
    (/para el usuario/i.test(message) &&
      (/password/i.test(lower) ||
        /autentificaci/i.test(lower))) ||
    /invalid.?password/i.test(lower)
  ) {
    const extra =
      rawMessage.includes("usuario") &&
      (/amigo/i.test(lower) ||
        /\bpostgres\b/i.test(lower));

    return `${extra ? "Usuario o contraseña de PostgreSQL incorrectos para la URL actual. Si usa Docker con datos antiguos, pruebe: docker compose down -v ; docker compose up -d postgres. " : ""}${DB_HINT}`;
  }

  if (/can't connect|connection refused/i.test(message)) {
    return `Fallo de conexión con la base de datos. ${DB_HINT}`;
  }

  return "";
}

module.exports = {
  publicMessageForDbError,
  DB_HINT,
};
