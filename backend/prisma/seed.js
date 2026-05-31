require("dotenv/config");

const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const {
  resolvePostgresConnectionString,
  sslOptionForPg,
} = require("../src/lib/resolve-database-url");

const connectionString = resolvePostgresConnectionString();
const ssl = sslOptionForPg(connectionString);
const pool = new Pool({
  connectionString,
  ...(ssl !== undefined ? { ssl } : {}),
  connectionTimeoutMillis: 60_000,
  max: 5,
});
const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

async function main() {
  console.log("Iniciando seed inicial...");

  const roles = [
    {
      name: "docente",
      description: "Usuario docente de la plataforma",
    },
    {
      name: "moderador",
      description: "Usuario encargado de moderar contenido y reportes",
    },
    {
      name: "admin",
      description: "Administrador del sistema con permisos de gestión",
    },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {
        description: role.description,
        active: true,
      },
      create: {
        name: role.name,
        description: role.description,
        active: true,
      },
    });
  }

  const categories = [
    "Recursos",
    "Lengua y Literatura",
    "Matemática",
    "Ciencias Naturales",
    "Ciencias Sociales",
    "Inglés",
    "Educación Física",
    "Educación Cultural y Artística",
    "Biología",
    "Física",
    "Química",
    "Historia",
    "Filosofía",
    "Educación para la Ciudadanía",
    "Emprendimiento y Gestión",
    "Tutoría",
    "Participación Estudiantil",
    "Religión",
    "Informática / Computación",
  ];

  for (const name of categories) {
    const existingCategory = await prisma.tag.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
    });

    if (existingCategory) {
      if (existingCategory.name !== name) {
        await prisma.tag.update({
          where: { id: existingCategory.id },
          data: { name },
        });
      }
      continue;
    }

    await prisma.tag.create({
      data: { name },
    });
  }

  const adminRole = await prisma.role.findUnique({
    where: { name: "admin" },
  });

  if (!adminRole) {
    throw new Error("No se pudo encontrar el rol admin.");
  }

  const adminEmail = process.env.ADMIN_EMAIL || "admin@institucion.edu.ec";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin123456";

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const adminUser = await prisma.user.upsert({
    where: {
      institutionalEmail: adminEmail.toLowerCase(),
    },
    update: {
      passwordHash,
      roleId: adminRole.id,
      status: "ACTIVO",
    },
    create: {
      institutionalEmail: adminEmail.toLowerCase(),
      passwordHash,
      firstName: "Administrador",
      lastName: "Sistema",
      status: "ACTIVO",
      roleId: adminRole.id,
    },
  });

  console.log("Roles creados o actualizados correctamente.");
  console.log("CategorÃ­as creadas o actualizadas correctamente.");
  console.log(`Usuario administrador inicial: ${adminUser.institutionalEmail}`);
  console.log("Seed finalizada correctamente.");
}

main()
  .catch((error) => {
    console.error("Error ejecutando seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
