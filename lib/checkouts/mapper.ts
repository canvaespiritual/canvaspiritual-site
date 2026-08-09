import type {
  CheckoutLead,
  CheckoutSale,
} from "@/types/checkout";

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
  sale_id: string | null;

sale_source: string | null;
sale_status: string | null;

sale_gross_amount: string | number | null;
sale_net_amount: string | number | null;
sale_currency: string | null;

sale_payment_method: string | null;
sale_installments: number | null;

sale_date: Date | string | null;

sale_closer_name: string | null;
sale_notes: string | null;

sale_kiwify_order_id: string | null;
sale_kiwify_order_ref: string | null;

sale_kiwify_fee: string | number | null;

sale_product_id: string | null;
sale_product_name: string | null;

sale_checkout_url: string | null;
sale_access_url: string | null;
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

function normalizeNullableNumber(
  value: string | number | null,
): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : null;
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

  const sale: CheckoutSale | null =
  row.sale_id
    ? {
        id: row.sale_id,

        source:
          row.sale_source === "manual"
            ? "manual"
            : "kiwify",

        status: normalizeRequiredText(
          row.sale_status,
        ),

        grossAmount: normalizeNullableNumber(
          row.sale_gross_amount,
        ),

        netAmount: normalizeNullableNumber(
          row.sale_net_amount,
        ),

        currency:
          normalizeRequiredText(
            row.sale_currency,
          ) || "BRL",

        paymentMethod: normalizeNullableText(
          row.sale_payment_method,
        ),

        installments:
          row.sale_installments ?? 1,

        saleDate:
          dateToIsoString(
            row.sale_date,
          ) ?? new Date(0).toISOString(),

        closerName: normalizeNullableText(
          row.sale_closer_name,
        ),

        notes: normalizeNullableText(
          row.sale_notes,
        ),

        kiwifyOrderId: normalizeNullableText(
          row.sale_kiwify_order_id,
        ),

        kiwifyOrderRef: normalizeNullableText(
          row.sale_kiwify_order_ref,
        ),

        kiwifyFee: normalizeNullableNumber(
          row.sale_kiwify_fee,
        ),

        productId: normalizeNullableText(
          row.sale_product_id,
        ),

        productName: normalizeNullableText(
          row.sale_product_name,
        ),

        checkoutUrl: normalizeNullableText(
          row.sale_checkout_url,
        ),

        accessUrl: normalizeNullableText(
          row.sale_access_url,
        ),
      }
    : null;

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
      sale,

    createdAt: requiredDateToIsoString(
      row.created_at,
    ),

    updatedAt: requiredDateToIsoString(
      row.updated_at,
    ),

    message: null,
  };
}