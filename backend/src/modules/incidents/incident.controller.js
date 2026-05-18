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

  async downloadIncidentFile(req, res, next) {
    try {
      const { id } = req.params;
      const incident = await incidentService.getIncidentById(id);
      
      if (!incident || !incident.physicalPath) {
        return res.status(404).json(new ApiResponse(false, 404, "Archivo no encontrado o no disponible"));
      }

      res.download(incident.physicalPath, incident.fileName, (err) => {
        if (err) {
          next(err);
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new IncidentController();
