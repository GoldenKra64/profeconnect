const { ApiResponse } = require("../config/api.response");

/**
 * Middleware para manejar roles
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(new ApiResponse(false, 401, "No estás autenticado"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json(new ApiResponse(false, 403, "No tienes permisos para acceder a este recurso"));
    }

    next();
  };
}

module.exports = requireRole;