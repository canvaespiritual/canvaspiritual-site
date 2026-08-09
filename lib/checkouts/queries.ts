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
      produto:
        checkout.sale?.productName ?? null,

          valor:
            checkout.sale?.grossAmount != null
              ? checkout.sale.grossAmount.toLocaleString(
                  "pt-BR",
                  {
                    style: "currency",
                    currency:
                      checkout.sale.currency || "BRL",
                  },
                )
              : null,

          link_pagamento:
            checkout.sale?.checkoutUrl ?? null,

          link_acesso:
            checkout.sale?.accessUrl ?? null,
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
        l.id,
        l.name,
        l.email,
        l.phone,

        l.utm_source,
        l.utm_medium,
        l.utm_campaign,
        l.utm_content,
        l.utm_term,

        l.page_url,
        l.referrer,

        l.status,

        l.kiwify_order_id,
        l.kiwify_status,

        l.paid_at,
        l.pago_em,

        l.created_at,
        l.updated_at,

        l.pago,

        s.id AS sale_id,
        s.source AS sale_source,
        s.status AS sale_status,

        s.gross_amount AS sale_gross_amount,
        s.net_amount AS sale_net_amount,
        s.currency AS sale_currency,

        s.payment_method AS sale_payment_method,
        s.installments AS sale_installments,

        s.sale_date AS sale_date,

        s.closer_name AS sale_closer_name,
        s.notes AS sale_notes,

        s.kiwify_order_id AS sale_kiwify_order_id,
        s.kiwify_order_ref AS sale_kiwify_order_ref,

        s.kiwify_fee AS sale_kiwify_fee,

        s.product_id AS sale_product_id,
        s.product_name AS sale_product_name,

        s.checkout_url AS sale_checkout_url,
        s.access_url AS sale_access_url,

          COUNT(*) OVER()::text
            AS total_count,

          COUNT(*) FILTER (
            WHERE l.pago IS TRUE
          ) OVER()::text
            AS paid_count,

          COUNT(*) FILTER (
            WHERE l.pago IS NOT TRUE
          ) OVER()::text
            AS pending_count,

          COUNT(*) FILTER (
            WHERE
              (
                l.created_at
                AT TIME ZONE 'America/Sao_Paulo'
              )::date
              =
              (
                NOW()
                AT TIME ZONE 'America/Sao_Paulo'
              )::date
          ) OVER()::text
            AS today_count

        FROM public.leads_precheckout l

          LEFT JOIN LATERAL (
            SELECT
              cs.*
            FROM public.checkout_sales cs
            WHERE cs.checkout_lead_id = l.id
            ORDER BY cs.sale_date DESC
            LIMIT 1
          ) s ON TRUE

          ORDER BY l.created_at DESC

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