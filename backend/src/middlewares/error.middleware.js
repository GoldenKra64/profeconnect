const { ApiResponse } = require("../config/api.response");

/**
 * Middleware para manejar errores generales || 500
 */
function errorMiddleware(error, req, res, next) {
  console.error(error);

  const statusCode = error.statusCode || 500;

  let message = error.message || "Error interno del servidor";

  if (
    error.code === "ETIMEDOUT" ||
    error.code === "ECONNREFUSED" ||
    /timeout|timed out/i.test(String(message))
  ) {
    message =
      "No se pudo conectar a la base de datos";
  }

  const response = new ApiResponse(false, statusCode, message);

  return res.status(statusCode).json(response);
}

module.exports = errorMiddleware;