-- AlterTable
ALTER TABLE "adjuntos_publicacion" ADD COLUMN     "isSuspicious" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "incidentes_seguridad" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "fileName" TEXT NOT NULL,
    "attemptedMime" TEXT NOT NULL,
    "detectedMime" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "physicalPath" TEXT,
    "postId" INTEGER,
    "fileMetadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incidentes_seguridad_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "incidentes_seguridad" ADD CONSTRAINT "incidentes_seguridad_userId_fkey" FOREIGN KEY ("userId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidentes_seguridad" ADD CONSTRAINT "incidentes_seguridad_postId_fkey" FOREIGN KEY ("postId") REFERENCES "publicaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;
