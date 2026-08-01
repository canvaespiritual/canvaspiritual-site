import type { CheckoutLead } from "@/types/checkout";

export interface DatabaseCheckoutRow {
  id: string;

  name: string;
  email: string;
  phone: string;

  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;

  page_url: string | null;
  referrer: string | null;

  status: string;

  kiwify_order_id: string | null;
  kiwify_status: string | null;

  paid_at: Date | string | null;
  pago_em: Date | string | null;

  created_at: Date | string;
  updated_at: Date | string;

  pago: boolean | null;
}

function dateToIsoString(
  value: Date | string | null,
): string | null {
  if (!value) {
    return null;
  }

  const date =
    value instanceof Date
      ? value
      : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function requiredDateToIsoString(
  value: Date | string,
): string {
  return (
    dateToIsoString(value) ??
    new Date(0).toISOString()
  );
}

function normalizeNullableText(
  value: string | null,
): string | null {
  const normalized = value?.trim() ?? "";

  return normalized || null;
}

function normalizeRequiredText(
  value: string | null | undefined,
): string {
  return value?.trim() ?? "";
}

export function databaseCheckoutToClient(
  row: DatabaseCheckoutRow,
): CheckoutLead {
  const campaignId = normalizeNullableText(
    row.utm_campaign,
  );

  /*
   * Mapeamento atual das UTMs da Meta:
   *
   * utm_campaign = campaign ID
   * utm_term     = adset ID
   * utm_content  = ad ID
   */
  const adsetId = normalizeNullableText(
    row.utm_term,
  );

  const adId = normalizeNullableText(
    row.utm_content,
  );

  return {
    id: row.id,

    name: normalizeRequiredText(row.name),
    email: normalizeRequiredText(row.email),
    phone: normalizeRequiredText(row.phone),

    utmSource: normalizeNullableText(
      row.utm_source,
    ),

    utmMedium: normalizeNullableText(
      row.utm_medium,
    ),

    utmCampaign: campaignId,
    utmContent: adId,
    utmTerm: adsetId,

    campaignId,
    campaignName: null,
    campaignDisplayName: campaignId,

    adsetId,
    adsetName: null,
    adsetDisplayName: adsetId,

    adId,
    adName: null,
    adDisplayName: adId,

    pageUrl: normalizeNullableText(
      row.page_url,
    ),

    referrer: normalizeNullableText(
      row.referrer,
    ),

    status: normalizeRequiredText(row.status),

    kiwifyOrderId: normalizeNullableText(
      row.kiwify_order_id,
    ),

    kiwifyStatus: normalizeNullableText(
      row.kiwify_status,
    ),

    paid: row.pago === true,

    paidAt:
      dateToIsoString(row.pago_em) ??
      dateToIsoString(row.paid_at),

    createdAt: requiredDateToIsoString(
      row.created_at,
    ),

    updatedAt: requiredDateToIsoString(
      row.updated_at,
    ),

    message: null,
  };
}