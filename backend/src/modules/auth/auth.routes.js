const express = require("express");
const authController = require("./auth.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const validateDto = require("../../middlewares/validate.middleware");
const {
  createRegistrationRequestDto,
  loginDto,
  verifyEmailDto,
} = require("./auth.dto");
const {
  cedulaUpload,
  attachCedulaPhotoMeta,
} = require("../../middlewares/cedula-upload.middleware");
const validateRegistrationRequest = require("../../middlewares/validate-registration-request.middleware");

const router = express.Router();

router.post(
  "/register-request",
  cedulaUpload.single("cedulaPhoto"),
  attachCedulaPhotoMeta,
  validateRegistrationRequest,
  authController.registerRequest
);
router.post(
  "/register-institutional",
  validateDto(createRegistrationRequestDto),
  authController.registerInstitutional
);
router.post("/verify-email", validateDto(verifyEmailDto), authController.verifyEmail);
router.post("/login", validateDto(loginDto), authController.login);
router.get("/me", authMiddleware, authController.me);

module.exports = router;
