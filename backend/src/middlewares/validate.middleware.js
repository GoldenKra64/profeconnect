const { ApiResponse } = require("../config/api.response")

/**
 * Middleware para manejar validación de contratos / DTOs
 */
function validateDto(schema, source = "body") {

  return (req, res, next) => {

    const result =
      schema.safeParse(req[source]);

    if (!result.success) {

      return res.status(400).json(new ApiResponse(false, 400, "Errores de validación", 
        result.error.flatten()));

    }

    req[source] = result.data;

    next();
  };
}

module.exports = validateDto;