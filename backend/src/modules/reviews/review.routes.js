const express = require("express");
const reviewController = require("./review.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const requireRole = require("../../middlewares/role.middleware");

const userRouter = express.Router();
userRouter.post("/", authMiddleware, reviewController.createReview);

const adminRouter = express.Router();
adminRouter.get(
  "/",
  authMiddleware,
  requireRole("admin"),
  reviewController.getAllReviews
);

module.exports = { userRouter, adminRouter };
