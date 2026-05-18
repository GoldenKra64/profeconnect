const { ApiResponse } = require("../../config/api.response");
const incidentService = require("./incident.service");

class IncidentController {
  async getPendingIncidents(req, res, next) {
    try {
      const incidents = await incidentService.getPendingIncidents();
      res.json(new ApiResponse(true, 200, "Incidentes obtenidos exitosamente", incidents));
    } catch (error) {
      next(error);
    }
  }

  async resolveIncident(req, res, next) {
    try {
      const { id } = req.params;
      const incident = await incidentService.resolveIncident(id);
      res.json(new ApiResponse(true, 200, "Incidente resuelto exitosamente", incident));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new IncidentController();
