-- CreateEnum
CREATE TYPE "ReactionType" AS ENUM ('LIKE', 'USEFUL', 'LOVE');

-- CreateTable
CREATE TABLE "reacciones_publicacion" (
    "id" SERIAL NOT NULL,
    "postId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" "ReactionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reacciones_publicacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reacciones_publicacion_postId_userId_key" ON "reacciones_publicacion"("postId", "userId");

-- AddForeignKey
ALTER TABLE "reacciones_publicacion" ADD CONSTRAINT "reacciones_publicacion_postId_fkey" FOREIGN KEY ("postId") REFERENCES "publicaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reacciones_publicacion" ADD CONSTRAINT "reacciones_publicacion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
