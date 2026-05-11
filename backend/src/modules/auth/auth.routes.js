const express = require("express");
const authController = require("./auth.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const validateDto = require("../../middlewares/validate.middleware");
const { createRegistrationRequestDto, loginDto } = require("./auth.dto");

const router = express.Router();

router.post("/register-request", validateDto(createRegistrationRequestDto), authController.registerRequest);
router.post("/login", validateDto(loginDto), authController.login);
router.get("/me", authMiddleware, authController.me);

module.exports = router;