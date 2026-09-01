import { precheckoutDb } from "@/lib/precheckout-db";
import { analyticsDb } from "@/lib/analytics-db";
import {
  applyTrackingAlias,
  getTrackingAliasMaps,
} from "@/lib/central/tracking-aliases";

export interface FinancialFilters {
  dateFrom?: string | null;
  dateTo?: string | null;
}

export interface FinancialSummary {
  sessions: number;
  plays: number;
  pitchReached: number;

  checkouts: number;

  sales: number;
  directSales: number;
  recoveredSales: number;

  netRevenue: number;
  directNetRevenue: number;
  recoveredNetRevenue: number;

  playRate: number;
  pitchRate: number;
  checkoutRate: number;
  checkoutConversionRate: number;

  averageNetTicket: number;

  valuePerSession: number;
  valuePerPlay: number;
  valuePerPitch: number;
  valuePerCheckout: number;
}

export interface FinancialCreativeRow {
  source: string | null;

  campaignId: string | null;
  campaignDisplayName: string | null;

  adId: string | null;
  adDisplayName: string | null;

  sessions: number;
  plays: number;
  pitchReached: number;

  checkouts: number;

  sales: number;
  directSales: number;
  recoveredSales: number;

  netRevenue: number;
  directNetRevenue: number;
  recoveredNetRevenue: number;

  playRate: number;
  pitchRate: number;
  checkoutRate: number;
  checkoutConversionRate: number;

  averageNetTicket: number;

  valuePerSession: number;
  valuePerPlay: number;
  valuePerPitch: number;
  valuePerCheckout: number;
}

interface CheckoutFinancialRow {
  source: string | null;
  campaign_id: string | null;
  ad_id: string | null;

  checkouts: string;

  sales: string;
  direct_sales: string;
  recovered_sales: string;

  net_revenue: string;
  direct_net_revenue: string;
  recovered_net_revenue: string;
}

interface AnalyticsFinancialRow {
  source: string | null;
  campaign_id: string | null;
  ad_id: string | null;

  sessions: string;
  plays: string;
  pitch_reached: string;
}

interface FinancialAccumulator {
  source: string | null;
  campaignId: string | null;
  adId: string | null;

  sessions: number;
  plays: number;
  pitchReached: number;

  checkouts: number;

  sales: number;
  directSales: number;
  recoveredSales: number;

  netRevenue: number;
  directNetRevenue: number;
  recoveredNetRevenue: number;
}

function parseInteger(
  value: string | number | null | undefined,
): number {
  const parsed = Number.parseInt(
    String(value ?? "0"),
    10,
  );

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

function parseDecimal(
  value: string | number | null | undefined,
): number {
  const parsed = Number.parseFloat(
    String(value ?? "0"),
  );

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

function calculateRate(
  numerator: number,
  denominator: number,
): number {
  if (denominator <= 0) {
    return 0;
  }

  return Number(
    (
      (numerator / denominator) *
      100
    ).toFixed(2),
  );
}

function calculateValue(
  numerator: number,
  denominator: number,
): number {
  if (denominator <= 0) {
    return 0;
  }

  return Number(
    (numerator / denominator).toFixed(2),
  );
}

function normalizeSource(
  value: string | null,
): string | null {
  const normalized =
    value?.trim().toLocaleLowerCase("pt-BR") ??
    "";

  if (!normalized) {
    return null;
  }

  /*
   * Facebook e Instagram pertencem à mesma
   * plataforma de mídia para esta análise.
   */
  if (
    normalized === "fb" ||
    normalized === "facebook" ||
    normalized === "ig" ||
    normalized === "instagram"
  ) {
    return "meta";
  }

  return normalized;
}

function normalizeId(
  value: string | null,
): string | null {
  const normalized = value?.trim() ?? "";

  return normalized || null;
}

function buildDateConditions(
  alias: string,
  filters: FinancialFilters,
  extraConditions: string[] = [],
): {
  sql: string;
  values: string[];
} {
  const conditions: string[] = [
    ...extraConditions,
  ];

  const values: string[] = [];

  if (filters.dateFrom) {
    values.push(filters.dateFrom);

    conditions.push(
      `${alias} >= $${values.length}::timestamptz`,
    );
  }

  if (filters.dateTo) {
    values.push(filters.dateTo);

    conditions.push(
      `${alias} <= $${values.length}::timestamptz`,
    );
  }

  return {
    sql:
      conditions.length > 0
        ? `WHERE ${conditions.join(" AND ")}`
        : "",
    values,
  };
}

function makeKey(
  source: string | null,
  campaignId: string | null,
  adId: string | null,
): string {
  return JSON.stringify([
    normalizeSource(source),
    normalizeId(campaignId),
    normalizeId(adId),
  ]);
}

function emptyAccumulator(
  source: string | null,
  campaignId: string | null,
  adId: string | null,
): FinancialAccumulator {
  return {
    source: normalizeSource(source),
    campaignId: normalizeId(campaignId),
    adId: normalizeId(adId),

    sessions: 0,
    plays: 0,
    pitchReached: 0,

    checkouts: 0,

    sales: 0,
    directSales: 0,
    recoveredSales: 0,

    netRevenue: 0,
    directNetRevenue: 0,
    recoveredNetRevenue: 0,
  };
}

function toCreativeRow(
  row: FinancialAccumulator,
  trackingAliases: Awaited<
    ReturnType<typeof getTrackingAliasMaps>
  >,
): FinancialCreativeRow {
      const useMetaAliases =
    row.source === "meta";

  const campaignDisplayName =
    useMetaAliases
      ? applyTrackingAlias(
          row.campaignId,
          trackingAliases.campaigns,
        )
      : row.campaignId;

  const adDisplayName =
    useMetaAliases
      ? applyTrackingAlias(
          row.adId,
          trackingAliases.ads,
        )
      : row.adId;
  return {
    ...row,

    campaignDisplayName,
    adDisplayName,

    playRate:
      calculateRate(
        row.plays,
        row.sessions,
      ),

    pitchRate:
      calculateRate(
        row.pitchReached,
        row.plays,
      ),

    /*
     * Aqui usamos checkout / plays.
     * É a mesma leitura de funil que já usamos
     * no analytics.
     */
    checkoutRate:
      calculateRate(
        row.checkouts,
        row.plays,
      ),

    checkoutConversionRate:
      calculateRate(
        row.sales,
        row.checkouts,
      ),

    averageNetTicket:
      calculateValue(
        row.netRevenue,
        row.sales,
      ),

    valuePerSession:
      calculateValue(
        row.netRevenue,
        row.sessions,
      ),

    valuePerPlay:
      calculateValue(
        row.netRevenue,
        row.plays,
      ),

    valuePerPitch:
      calculateValue(
        row.netRevenue,
        row.pitchReached,
      ),

    valuePerCheckout:
      calculateValue(
        row.netRevenue,
        row.checkouts,
      ),
  };
}

export async function getFinancialAnalytics(
  filters: FinancialFilters = {},
): Promise<{
  summary: FinancialSummary;
  creatives: FinancialCreativeRow[];
}> {
  /*
   * REGRA DE COORTE:
   *
   * O período selecionado filtra a DATA DO CHECKOUT.
   *
   * Portanto, se o checkout aconteceu no dia 5
   * e a recuperação aconteceu no dia 7,
   * a receita continua pertencendo ao checkout
   * do dia 5.
   */

  const checkoutDates =
  buildDateConditions(
    "l.created_at",
    filters,
    [
      `
        NOT (
          LOWER(
            COALESCE(
              l.utm_source,
              ''
            )
          ) = 'manual'
        )
      `,
      `
        NOT (
          LOWER(
            COALESCE(
              l.utm_campaign,
              ''
            )
          ) = 'venda_avulsa'
        )
      `,
    ],
  );

const analyticsDates =
  buildDateConditions(
    "s.started_at",
    filters,
    [
      `
        LOWER(
          COALESCE(
            s.page_url,
            ''
          )
        ) NOT LIKE '%localhost%'
      `,
    ],
  );

  /*
   * IMPORTANTE:
   *
   * Primeiro agregamos as vendas por checkout.
   * Isso evita multiplicar o número de checkouts
   * caso um lead possua mais de um registro
   * em checkout_sales.
   */
  const checkoutResult =
    await precheckoutDb.query<CheckoutFinancialRow>(
      `
        WITH sales_by_checkout AS (
          SELECT
            cs.checkout_lead_id,

            COUNT(*) FILTER (
              WHERE cs.status = 'paid'
            )::text
              AS sales,

            COUNT(*) FILTER (
              WHERE
                cs.status = 'paid'
                AND cs.source = 'kiwify'
            )::text
              AS direct_sales,

            COUNT(*) FILTER (
              WHERE
                cs.status = 'paid'
                AND cs.source = 'manual'
            )::text
              AS recovered_sales,

            COALESCE(
              SUM(cs.net_amount) FILTER (
                WHERE cs.status = 'paid'
              ),
              0
            )::text
              AS net_revenue,

            COALESCE(
              SUM(cs.net_amount) FILTER (
                WHERE
                  cs.status = 'paid'
                  AND cs.source = 'kiwify'
              ),
              0
            )::text
              AS direct_net_revenue,

            COALESCE(
              SUM(cs.net_amount) FILTER (
                WHERE
                  cs.status = 'paid'
                  AND cs.source = 'manual'
              ),
              0
            )::text
              AS recovered_net_revenue

          FROM public.checkout_sales cs

          GROUP BY cs.checkout_lead_id
        )

        SELECT
          l.utm_source
            AS source,

          l.utm_campaign
            AS campaign_id,

          l.utm_content
            AS ad_id,

          COUNT(*)::text
            AS checkouts,

          COALESCE(
            SUM(
              COALESCE(
                sbc.sales::integer,
                0
              )
            ),
            0
          )::text
            AS sales,

          COALESCE(
            SUM(
              COALESCE(
                sbc.direct_sales::integer,
                0
              )
            ),
            0
          )::text
            AS direct_sales,

          COALESCE(
            SUM(
              COALESCE(
                sbc.recovered_sales::integer,
                0
              )
            ),
            0
          )::text
            AS recovered_sales,

          COALESCE(
            SUM(
              COALESCE(
                sbc.net_revenue::numeric,
                0
              )
            ),
            0
          )::text
            AS net_revenue,

          COALESCE(
            SUM(
              COALESCE(
                sbc.direct_net_revenue::numeric,
                0
              )
            ),
            0
          )::text
            AS direct_net_revenue,

          COALESCE(
            SUM(
              COALESCE(
                sbc.recovered_net_revenue::numeric,
                0
              )
            ),
            0
          )::text
            AS recovered_net_revenue

        FROM public.leads_precheckout l

        LEFT JOIN sales_by_checkout sbc
          ON sbc.checkout_lead_id = l.id

        ${checkoutDates.sql}

        GROUP BY
          l.utm_source,
          l.utm_campaign,
          l.utm_content
      `,
      checkoutDates.values,
    );

  /*
   * Analytics é agregado separadamente.
   *
   * Não fazemos JOIN direto entre
   * analytics_sessions e leads_precheckout,
   * pois isso poderia multiplicar sessões,
   * plays e pitches.
   */
  const analyticsResult =
    await analyticsDb.query<AnalyticsFinancialRow>(
      `
        SELECT
          s.utm_source
            AS source,

          s.campaign_id,

          s.ad_id,

          COUNT(*)::text
            AS sessions,

          COUNT(*) FILTER (
            WHERE s.play_started IS TRUE
          )::text
            AS plays,

          COUNT(*) FILTER (
            WHERE s.pitch_reached IS TRUE
          )::text
            AS pitch_reached

        FROM public.analytics_sessions s

        ${analyticsDates.sql}

        GROUP BY
          s.utm_source,
          s.campaign_id,
          s.ad_id
      `,
      analyticsDates.values,
    );

  const rows =
    new Map<
      string,
      FinancialAccumulator
    >();

  /*
   * Primeiro colocamos os dados de analytics.
   */
  for (const row of analyticsResult.rows) {
    const source =
      normalizeSource(row.source);

    const campaignId =
      normalizeId(row.campaign_id);

    const adId =
      normalizeId(row.ad_id);

    const key =
      makeKey(
        source,
        campaignId,
        adId,
      );

    const accumulator =
      rows.get(key) ??
      emptyAccumulator(
        source,
        campaignId,
        adId,
      );

    accumulator.sessions +=
      parseInteger(row.sessions);

    accumulator.plays +=
      parseInteger(row.plays);

    accumulator.pitchReached +=
      parseInteger(row.pitch_reached);

    rows.set(
      key,
      accumulator,
    );
  }

  /*
   * Depois adicionamos checkout e receita
   * à mesma combinação:
   *
   * plataforma + campanha + anúncio.
   */
  for (const row of checkoutResult.rows) {
    const source =
      normalizeSource(row.source);

    const campaignId =
      normalizeId(row.campaign_id);

    const adId =
      normalizeId(row.ad_id);

    const key =
      makeKey(
        source,
        campaignId,
        adId,
      );

    const accumulator =
      rows.get(key) ??
      emptyAccumulator(
        source,
        campaignId,
        adId,
      );

    accumulator.checkouts +=
      parseInteger(row.checkouts);

    accumulator.sales +=
      parseInteger(row.sales);

    accumulator.directSales +=
      parseInteger(row.direct_sales);

    accumulator.recoveredSales +=
      parseInteger(row.recovered_sales);

    accumulator.netRevenue +=
      parseDecimal(row.net_revenue);

    accumulator.directNetRevenue +=
      parseDecimal(
        row.direct_net_revenue,
      );

    accumulator.recoveredNetRevenue +=
      parseDecimal(
        row.recovered_net_revenue,
      );

    rows.set(
      key,
      accumulator,
    );
  }
const trackingAliases =
  await getTrackingAliasMaps("meta");

  const creatives =
    Array.from(rows.values())
      .map((row) =>
  toCreativeRow(
    row,
    trackingAliases,
  ),
)
      .sort((a, b) => {
        /*
         * Primeiro quem possui checkout.
         * Depois maior receita.
         * Depois maior número de plays.
         */
        if (b.checkouts !== a.checkouts) {
          return b.checkouts - a.checkouts;
        }

        if (b.netRevenue !== a.netRevenue) {
          return b.netRevenue - a.netRevenue;
        }

        return b.plays - a.plays;
      });

  /*
   * RESUMO GERAL
   *
   * Não calculamos a partir das taxas das linhas.
   * Somamos os valores absolutos e somente depois
   * calculamos as taxas gerais.
   */
  const totals =
    creatives.reduce(
      (
        accumulator,
        row,
      ) => {
        accumulator.sessions +=
          row.sessions;

        accumulator.plays +=
          row.plays;

        accumulator.pitchReached +=
          row.pitchReached;

        accumulator.checkouts +=
          row.checkouts;

        accumulator.sales +=
          row.sales;

        accumulator.directSales +=
          row.directSales;

        accumulator.recoveredSales +=
          row.recoveredSales;

        accumulator.netRevenue +=
          row.netRevenue;

        accumulator.directNetRevenue +=
          row.directNetRevenue;

        accumulator.recoveredNetRevenue +=
          row.recoveredNetRevenue;

        return accumulator;
      },
      emptyAccumulator(
        null,
        null,
        null,
      ),
    );

  const summary: FinancialSummary = {
    sessions:
      totals.sessions,

    plays:
      totals.plays,

    pitchReached:
      totals.pitchReached,

    checkouts:
      totals.checkouts,

    sales:
      totals.sales,

    directSales:
      totals.directSales,

    recoveredSales:
      totals.recoveredSales,

    netRevenue:
      Number(
        totals.netRevenue.toFixed(2),
      ),

    directNetRevenue:
      Number(
        totals.directNetRevenue.toFixed(2),
      ),

    recoveredNetRevenue:
      Number(
        totals.recoveredNetRevenue.toFixed(2),
      ),

    playRate:
      calculateRate(
        totals.plays,
        totals.sessions,
      ),

    pitchRate:
      calculateRate(
        totals.pitchReached,
        totals.plays,
      ),

    checkoutRate:
      calculateRate(
        totals.checkouts,
        totals.plays,
      ),

    checkoutConversionRate:
      calculateRate(
        totals.sales,
        totals.checkouts,
      ),

    averageNetTicket:
      calculateValue(
        totals.netRevenue,
        totals.sales,
      ),

    valuePerSession:
      calculateValue(
        totals.netRevenue,
        totals.sessions,
      ),

    valuePerPlay:
      calculateValue(
        totals.netRevenue,
        totals.plays,
      ),

    valuePerPitch:
      calculateValue(
        totals.netRevenue,
        totals.pitchReached,
      ),

    valuePerCheckout:
      calculateValue(
        totals.netRevenue,
        totals.checkouts,
      ),
  };

  return {
    summary,
    creatives,
  };
}