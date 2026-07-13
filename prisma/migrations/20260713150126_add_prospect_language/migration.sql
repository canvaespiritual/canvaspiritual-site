-- AlterTable
ALTER TABLE "prospects" ADD COLUMN     "idioma" TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE INDEX "prospects_idioma_idx" ON "prospects"("idioma");
