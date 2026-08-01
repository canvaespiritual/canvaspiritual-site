import {
  MessageTemplateType,
} from "@/generated/prisma/client";

import { prisma } from "@/lib/db";
import { precheckoutDb } from "@/lib/precheckout-db";

import {
  databaseCheckoutToClient,
  type DatabaseCheckoutRow,
} from "@/lib/checkouts/mapper";

import {
  applyTrackingAlias,
  getTrackingAliasMaps,
} from "@/lib/central/tracking-aliases";

import {
  getFirstName,
  renderMessageTemplate,
} from "@/lib/central/message-templates";

import type {
  CheckoutLead,
  CheckoutMessage,
} from "@/types/checkout";

export interface ListCheckoutLeadsOptions {
  limit?: number;
  offset?: number;
}

export interface CheckoutSummary {
  total: number;
  paid: number;
  pending: number;
  today: number;
}

export interface CheckoutLeadPage {
  checkouts: CheckoutLead[];

  summary: CheckoutSummary;

  total: number;
  limit: number;
  offset: number;
}

interface DatabaseCheckoutRowWithSummary
  extends DatabaseCheckoutRow {
  total_count: string;
  paid_count: string;
  pending_count: string;
  today_count: string;
}

const DEFAULT_LIMIT = 50;
const MAXIMUM_LIMIT = 200;

function normalizeLimit(value?: number): number {
  if (
    value === undefined ||
    !Number.isInteger(value) ||
    value <= 0
  ) {
    return DEFAULT_LIMIT;
  }

  return Math.min(value, MAXIMUM_LIMIT);
}

function normalizeOffset(value?: number): number {
  if (
    value === undefined ||
    !Number.isInteger(value) ||
    value < 0
  ) {
    return 0;
  }

  return value;
}

function parseCount(value?: string): number {
  const parsed = Number.parseInt(value ?? "0", 10);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

function formatCheckoutDate(
  isoDate: string,
): string {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function getPaymentStatusLabel(
  checkout: CheckoutLead,
): string {
  if (checkout.paid) {
    return "Pagamento aprovado";
  }

  return (
    checkout.kiwifyStatus ||
    checkout.status ||
    "Pagamento pendente"
  );
}

type ActiveTemplate = {
  id: string;
  type: MessageTemplateType;
  name: string;
  content: string;
  senderName: string;
};

function buildCheckoutMessage(
  checkout: CheckoutLead,
  template: ActiveTemplate | undefined,
): CheckoutMessage | null {
  if (!template) {
    return null;
  }

  const content = renderMessageTemplate(
    template.content,
    {
      primeiro_nome: getFirstName(
        checkout.name,
      ),

      nome_completo: checkout.name,

      atendente: template.senderName,

      campanha:
        checkout.campaignDisplayName,

      conjunto:
        checkout.adsetDisplayName,

      criativo:
        checkout.adDisplayName,

      status_pagamento:
        getPaymentStatusLabel(checkout),

      data_checkout:
        formatCheckoutDate(
          checkout.createdAt,
        ),

      /*
       * Estes dados ainda não existem na tabela
       * leads_precheckout.
       *
       * Quando forem adicionados, basta preencher
       * as variáveis abaixo.
       */
      produto: null,
      valor: null,
      link_pagamento: null,
      link_acesso: null,
    },
  );

  return {
    templateId: template.id,
    templateType: template.type,
    templateName: template.name,
    senderName: template.senderName,
    content,
  };
}

export async function listCheckoutLeads(
  options: ListCheckoutLeadsOptions = {},
): Promise<CheckoutLeadPage> {
  const limit = normalizeLimit(options.limit);
  const offset = normalizeOffset(options.offset);

  const checkoutResult =
    await precheckoutDb.query<DatabaseCheckoutRowWithSummary>(
      `
        SELECT
          id,
          name,
          email,
          phone,

          utm_source,
          utm_medium,
          utm_campaign,
          utm_content,
          utm_term,

          page_url,
          referrer,

          status,

          kiwify_order_id,
          kiwify_status,

          paid_at,
          pago_em,

          created_at,
          updated_at,

          pago,

          COUNT(*) OVER()::text
            AS total_count,

          COUNT(*) FILTER (
            WHERE pago IS TRUE
          ) OVER()::text
            AS paid_count,

          COUNT(*) FILTER (
            WHERE pago IS NOT TRUE
          ) OVER()::text
            AS pending_count,

          COUNT(*) FILTER (
            WHERE
              (
                created_at
                AT TIME ZONE 'America/Sao_Paulo'
              )::date
              =
              (
                NOW()
                AT TIME ZONE 'America/Sao_Paulo'
              )::date
          ) OVER()::text
            AS today_count

        FROM public.leads_precheckout

        ORDER BY created_at DESC

        LIMIT $1
        OFFSET $2
      `,
      [limit, offset],
    );

  const mappedCheckouts =
    checkoutResult.rows.map(
      databaseCheckoutToClient,
    );

  /*
   * Apenas duas consultas complementares:
   *
   * 1. todos os aliases de tracking;
   * 2. os dois templates principais ativos.
   *
   * Não fazemos uma consulta por cliente.
   */
  const [
    trackingAliases,
    activeTemplates,
  ] = await Promise.all([
    getTrackingAliasMaps("meta"),

    prisma.messageTemplate.findMany({
      where: {
        active: true,

        type: {
          in: [
            MessageTemplateType.checkout_pending,
            MessageTemplateType.payment_approved,
          ],
        },
      },

      select: {
        id: true,
        type: true,
        name: true,
        content: true,
        senderName: true,
      },
    }),
  ]);

  const templateByType =
    new Map<MessageTemplateType, ActiveTemplate>(
      activeTemplates.map((template) => [
        template.type,
        template,
      ]),
    );

  const checkouts = mappedCheckouts.map(
    (checkout): CheckoutLead => {
      const campaignName =
        checkout.campaignId
          ? trackingAliases.campaigns[
              checkout.campaignId
            ] ?? null
          : null;

      const adsetName =
        checkout.adsetId
          ? trackingAliases.adsets[
              checkout.adsetId
            ] ?? null
          : null;

      const adName =
        checkout.adId
          ? trackingAliases.ads[
              checkout.adId
            ] ?? null
          : null;

      const enrichedCheckout: CheckoutLead = {
        ...checkout,

        campaignName,

        campaignDisplayName:
          applyTrackingAlias(
            checkout.campaignId,
            trackingAliases.campaigns,
          ),

        adsetName,

        adsetDisplayName:
          applyTrackingAlias(
            checkout.adsetId,
            trackingAliases.adsets,
          ),

        adName,

        adDisplayName:
          applyTrackingAlias(
            checkout.adId,
            trackingAliases.ads,
          ),
      };

      const templateType = checkout.paid
        ? MessageTemplateType.payment_approved
        : MessageTemplateType.checkout_pending;

      return {
        ...enrichedCheckout,

        message: buildCheckoutMessage(
          enrichedCheckout,
          templateByType.get(templateType),
        ),
      };
    },
  );

  const firstRow = checkoutResult.rows[0];

  const summary: CheckoutSummary = {
    total: parseCount(firstRow?.total_count),
    paid: parseCount(firstRow?.paid_count),
    pending: parseCount(firstRow?.pending_count),
    today: parseCount(firstRow?.today_count),
  };

  return {
    checkouts,
    summary,

    total: summary.total,
    limit,
    offset,
  };
}