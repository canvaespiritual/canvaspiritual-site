-- CreateTable
CREATE TABLE "campaign_aliases" (
    "id" UUID NOT NULL,
    "platform" TEXT NOT NULL DEFAULT 'meta',
    "external_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ad_account_id" TEXT,
    "platform_status" TEXT,
    "raw_data" JSONB,
    "last_synced_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "campaign_aliases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "campaign_aliases_name_idx" ON "campaign_aliases"("name");

-- CreateIndex
CREATE INDEX "campaign_aliases_ad_account_id_idx" ON "campaign_aliases"("ad_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "campaign_aliases_platform_external_id_key" ON "campaign_aliases"("platform", "external_id");
