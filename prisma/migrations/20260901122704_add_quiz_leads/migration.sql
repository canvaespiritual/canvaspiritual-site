-- CreateTable
CREATE TABLE "quiz_leads" (
    "id" UUID NOT NULL,
    "session_id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "language" TEXT NOT NULL DEFAULT '',
    "affiliate_ref" TEXT,
    "media_vibracional" DOUBLE PRECISION,
    "zona_predominante" TEXT,
    "codigo_arquetipo" TEXT,
    "source" TEXT NOT NULL DEFAULT 'quiz',
    "payload" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "quiz_leads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "quiz_leads_session_id_key" ON "quiz_leads"("session_id");

-- CreateIndex
CREATE INDEX "quiz_leads_created_at_idx" ON "quiz_leads"("created_at");

-- CreateIndex
CREATE INDEX "quiz_leads_phone_idx" ON "quiz_leads"("phone");

-- CreateIndex
CREATE INDEX "quiz_leads_email_idx" ON "quiz_leads"("email");
