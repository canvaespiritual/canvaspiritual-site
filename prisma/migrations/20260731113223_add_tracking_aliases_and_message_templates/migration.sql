/*
  Migração da estrutura antiga de aliases de campanha
  para uma estrutura genérica de rastreamento.

  Também cria os modelos editáveis de mensagens.
*/

-- CreateEnum
CREATE TYPE "TrackingEntityType"
AS ENUM (
  'campaign',
  'adset',
  'ad'
);

-- CreateEnum
CREATE TYPE "MessageTemplateType"
AS ENUM (
  'checkout_pending',
  'payment_approved',
  'followup_pending',
  'access_confirmation'
);

-- CreateTable
CREATE TABLE "tracking_aliases" (
  "id" UUID NOT NULL,
  "platform" TEXT NOT NULL DEFAULT 'meta',
  "entity_type" "TrackingEntityType" NOT NULL,
  "external_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "ad_account_id" TEXT,
  "platform_status" TEXT,
  "raw_data" JSONB,
  "last_synced_at" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,

  CONSTRAINT "tracking_aliases_pkey"
    PRIMARY KEY ("id")
);

-- Copia os aliases antigos como entidades do tipo campaign
INSERT INTO "tracking_aliases" (
  "id",
  "platform",
  "entity_type",
  "external_id",
  "name",
  "ad_account_id",
  "platform_status",
  "raw_data",
  "last_synced_at",
  "created_at",
  "updated_at"
)
SELECT
  "id",
  "platform",
  'campaign'::"TrackingEntityType",
  "external_id",
  "name",
  "ad_account_id",
  "platform_status",
  "raw_data",
  "last_synced_at",
  "created_at",
  "updated_at"
FROM "campaign_aliases";

-- CreateTable
CREATE TABLE "message_templates" (
  "id" UUID NOT NULL,
  "type" "MessageTemplateType" NOT NULL,
  "name" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "sender_name" TEXT NOT NULL DEFAULT '',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,

  CONSTRAINT "message_templates_pkey"
    PRIMARY KEY ("id")
);

-- Templates iniciais totalmente editáveis pelo painel

INSERT INTO "message_templates" (
  "id",
  "type",
  "name",
  "content",
  "active",
  "sender_name",
  "created_at",
  "updated_at"
)
VALUES
(
  gen_random_uuid(),
  'checkout_pending',
  'Checkout pendente',
  E'Olá, {{primeiro_nome}}! Tudo bem?\n\nAqui é {{atendente}}, do suporte do Canva Espiritual.\n\nVi que você iniciou sua inscrição, mas o pagamento ainda aparece como pendente para nós.\n\nFicou alguma dúvida ou teve alguma dificuldade para concluir? Estou por aqui para ajudar.',
  true,
  '',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  gen_random_uuid(),
  'payment_approved',
  'Pagamento aprovado',
  E'Olá, {{primeiro_nome}}! Tudo bem?\n\nAqui é {{atendente}}, do suporte do Canva Espiritual.\n\nVi que seu pagamento foi aprovado e estou passando para confirmar se você recebeu o acesso corretamente.\n\nCaso tenha qualquer dificuldade para entrar, pode me chamar por aqui.',
  true,
  '',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  gen_random_uuid(),
  'followup_pending',
  'Follow-up de pagamento pendente',
  E'Olá, {{primeiro_nome}}! Passando novamente para saber se você conseguiu concluir sua inscrição.\n\nCaso tenha ocorrido alguma dificuldade no pagamento ou tenha ficado alguma dúvida, posso ajudar por aqui.',
  true,
  '',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  gen_random_uuid(),
  'access_confirmation',
  'Confirmação de acesso',
  E'Olá, {{primeiro_nome}}! Tudo certo com seu acesso?\n\nQuero confirmar se você conseguiu entrar normalmente e visualizar o conteúdo. Se precisar de ajuda, pode falar comigo por aqui.',
  true,
  '',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "tracking_aliases_entity_type_idx"
ON "tracking_aliases"("entity_type");

-- CreateIndex
CREATE INDEX "tracking_aliases_name_idx"
ON "tracking_aliases"("name");

-- CreateIndex
CREATE INDEX "tracking_aliases_ad_account_id_idx"
ON "tracking_aliases"("ad_account_id");

-- CreateIndex
CREATE UNIQUE INDEX
"tracking_aliases_platform_entity_type_external_id_key"
ON "tracking_aliases"(
  "platform",
  "entity_type",
  "external_id"
);

-- CreateIndex
CREATE UNIQUE INDEX "message_templates_type_key"
ON "message_templates"("type");

-- A tabela antiga só é removida depois da cópia
DROP TABLE "campaign_aliases";