const express = require("express");
const categoryController = require("./category.controller");
const authMiddleware = require("../../middlewares/auth.middleware");

const router = express.Router();

router.get("/", authMiddleware, categoryController.getCategories);

module.exports = router;