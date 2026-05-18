const express = require("express");
const incidentController = require("./incident.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const requireRole = require("../../middlewares/role.middleware");

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  requireRole("admin", "moderator"),
  incidentController.getPendingIncidents
);

router.patch(
  "/:id/resolve",
  authMiddleware,
  requireRole("admin", "moderator"),
  incidentController.resolveIncident
);

module.exports = router;
