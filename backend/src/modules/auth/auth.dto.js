const { z } = require("zod");

const institutionalEmailSchema = z
  .string()
  .trim()
  .email("Correo inválido")
  .toLowerCase();

const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres");

const createRegistrationRequestDto = z.object({
  institutionalEmail: institutionalEmailSchema,

  password: passwordSchema,

  firstName: z
    .string()
    .trim()
    .min(1, "Nombres obligatorios"),

  lastName: z
    .string()
    .trim()
    .min(1, "Apellidos obligatorios"),

  area: z
    .string()
    .trim()
    .optional()
    .nullable(),

  description: z
    .string()
    .trim()
    .optional()
    .nullable(),
});

const loginDto = z.object({
  institutionalEmail: institutionalEmailSchema,

  password: z
    .string()
    .min(1, "Contraseña obligatoria"),
});

module.exports = {
  createRegistrationRequestDto,
  loginDto,
};