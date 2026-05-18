const prisma = require("../../lib/prisma");

class IncidentService {
  async getPendingIncidents() {
    return await prisma.securityIncident.findMany({
      where: {
        status: "PENDING",
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            institutionalEmail: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async resolveIncident(id) {
    return await prisma.securityIncident.update({
      where: { id: parseInt(id) },
      data: { status: "RESOLVED" },
    });
  }

  async getIncidentById(id) {
    return await prisma.securityIncident.findUnique({
      where: { id: parseInt(id) }
    });
  }
}

module.exports = new IncidentService();
