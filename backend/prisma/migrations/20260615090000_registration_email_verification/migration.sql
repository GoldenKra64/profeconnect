-- CreateEnum
CREATE TYPE "RegistrationRequestMethod" AS ENUM ('CEDULA', 'INSTITUTIONAL_EMAIL');

-- AlterTable
ALTER TABLE "solicitudes_registro"
ADD COLUMN "method" "RegistrationRequestMethod" NOT NULL DEFAULT 'CEDULA',
ADD COLUMN "emailVerifiedAt" TIMESTAMP(3),
ADD COLUMN "verificationTokenHash" TEXT,
ADD COLUMN "verificationTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN "verificationSentAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "solicitudes_registro_verificationTokenHash_idx" ON "solicitudes_registro"("verificationTokenHash");
