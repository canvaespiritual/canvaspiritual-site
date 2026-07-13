-- CreateEnum
CREATE TYPE "ProspectStatus" AS ENUM ('novo', 'mensagem_enviada', 'respondeu', 'cadastrado', 'ativado', 'ignorar');

-- CreateTable
CREATE TABLE "prospects" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "fullName" TEXT NOT NULL DEFAULT '',
    "biography" TEXT NOT NULL DEFAULT '',
    "businessCategoryName" TEXT NOT NULL DEFAULT '',
    "followersCount" INTEGER NOT NULL DEFAULT 0,
    "postsCount" INTEGER NOT NULL DEFAULT 0,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "isBusinessAccount" BOOLEAN NOT NULL DEFAULT false,
    "instagramUrl" TEXT NOT NULL DEFAULT '',
    "externalUrl" TEXT NOT NULL DEFAULT '',
    "businessAddress" TEXT NOT NULL DEFAULT '',
    "cidade" TEXT NOT NULL DEFAULT '',
    "bairro" TEXT NOT NULL DEFAULT '',
    "estado" TEXT NOT NULL DEFAULT '',
    "pais" TEXT NOT NULL DEFAULT '',
    "whatsapp" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "profissao" TEXT NOT NULL DEFAULT '',
    "especialidades" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "voucher" TEXT NOT NULL DEFAULT '',
    "observacoes" TEXT NOT NULL DEFAULT '',
    "status" "ProspectStatus" NOT NULL DEFAULT 'novo',
    "origens" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "searchTerms" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "searchSources" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prospects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prospect_imports" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "rowsReceived" INTEGER NOT NULL DEFAULT 0,
    "newProspects" INTEGER NOT NULL DEFAULT 0,
    "updatedProspects" INTEGER NOT NULL DEFAULT 0,
    "invalidRows" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prospect_imports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "prospects_username_key" ON "prospects"("username");

-- CreateIndex
CREATE INDEX "prospects_status_idx" ON "prospects"("status");

-- CreateIndex
CREATE INDEX "prospects_followersCount_idx" ON "prospects"("followersCount");

-- CreateIndex
CREATE INDEX "prospects_cidade_idx" ON "prospects"("cidade");

-- CreateIndex
CREATE INDEX "prospects_estado_idx" ON "prospects"("estado");

-- CreateIndex
CREATE INDEX "prospects_profissao_idx" ON "prospects"("profissao");

-- CreateIndex
CREATE INDEX "prospect_imports_createdAt_idx" ON "prospect_imports"("createdAt");
