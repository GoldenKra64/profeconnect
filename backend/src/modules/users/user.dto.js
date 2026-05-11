const { z } = require("zod");

const VALID_USER_STATUSES = [
  "ACTIVO",
  "INACTIVO",
  "PENDIENTE",
  "BLOQUEADO",
];

const userIdParamDto = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "ID de usuario no válido")
    .transform(Number),
});

const updateUserStatusDto = z.object({
  status: z.enum(VALID_USER_STATUSES, {
    errorMap: () => ({
      message: "Estado de usuario no válido",
    }),
  }),
});

module.exports = {
  userIdParamDto,
  updateUserStatusDto,
};