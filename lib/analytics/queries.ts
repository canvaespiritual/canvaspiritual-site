import { analyticsDb } from "@/lib/analytics-db";
import {
  applyTrackingAlias,
  getTrackingAliasMaps,
} from "@/lib/central/tracking-aliases";
export interface AnalyticsFilters {
  vslId?: string | null;
  videoId?: string | null;
  productId?: string | null;

  campaignId?: string | null;
  adsetId?: string | null;
  adId?: string | null;

  utmSource?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
}

export interface AnalyticsSummary {
  visitors: number;
  sessions: number;
  plays: number;
  pitchReached: number;
  checkoutOpened: number;

  playRate: number;
  pitchRate: number;
  checkoutRate: number;

  averageWatchSeconds: number;
  averageMaxReachedSecond: number;
}

export interface RetentionPoint {
  second: number;
  viewers: number;
  percentage: number;
}

export interface TrafficSourceRow {
  source: string;
  sessions: number;
  plays: number;
  pitchReached: number;
  checkoutOpened: number;
  playRate: number;
  pitchRate: number;
  checkoutRate: number;
}

export interface CampaignAnalyticsRow {
  campaignId: string | null;
  campaignName: string | null;

  sessions: number;
  visitors: number;
  plays: number;
  pitchReached: number;
  checkoutOpened: number;

  playRate: number;
  pitchRate: number;
  checkoutRate: number;

  averageWatchSeconds: number;
  averageMaxReachedSecond: number;
}

interface DatabaseAnalyticsSummaryRow {
  visitors: string;
  sessions: string;
  plays: string;
  pitch_reached: string;
  checkout_opened: string;
  average_watch_seconds: string | null;
  average_max_reached_second: string | null;
}

interface DatabaseRetentionRow {
  second: number | string;
  viewers: string;
}

interface DatabaseTrafficSourceRow {
  source: string | null;
  sessions: string;
  plays: string;
  pitch_reached: string;
  checkout_opened: string;
}

interface DatabaseCampaignAnalyticsRow {
  campaign_id: string | null;
  campaign_name: string | null;

  sessions: string;
  visitors: string;
  plays: string;
  pitch_reached: string;
  checkout_opened: string;

  average_watch_seconds: string | null;
  average_max_reached_second: string | null;
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
  const parsed = Number(value ?? 0);

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

function addFilter(
  conditions: string[],
  values: unknown[],
  column: string,
  value: unknown,
): void {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return;
  }

  values.push(value);

  conditions.push(
    `${column} = $${values.length}`,
  );
}

function buildSessionFilter(
  filters: AnalyticsFilters,
  alias = "s",
): {
  whereSql: string;
  values: unknown[];
} {
  const conditions: string[] = [];
  const values: unknown[] = [];

  addFilter(
    conditions,
    values,
    `${alias}.vsl_id`,
    filters.vslId,
  );

  addFilter(
    conditions,
    values,
    `${alias}.video_id`,
    filters.videoId,
  );

  addFilter(
    conditions,
    values,
    `${alias}.product_id`,
    filters.productId,
  );

  addFilter(
    conditions,
    values,
    `${alias}.campaign_id`,
    filters.campaignId,
  );

  addFilter(
    conditions,
    values,
    `${alias}.adset_id`,
    filters.adsetId,
  );

  addFilter(
    conditions,
    values,
    `${alias}.ad_id`,
    filters.adId,
  );

  addFilter(
    conditions,
    values,
    `${alias}.utm_source`,
    filters.utmSource,
  );

  if (filters.dateFrom) {
    values.push(filters.dateFrom);

    conditions.push(
      `${alias}.started_at >= $${values.length}::timestamptz`,
    );
  }

  if (filters.dateTo) {
    values.push(filters.dateTo);

    conditions.push(
      `${alias}.started_at <= $${values.length}::timestamptz`,
    );
  }

  return {
    whereSql:
      conditions.length > 0
        ? `WHERE ${conditions.join(" AND ")}`
        : "",

    values,
  };
}

export async function getAnalyticsSummary(
  filters: AnalyticsFilters = {},
): Promise<AnalyticsSummary> {
  const {
    whereSql,
    values,
  } = buildSessionFilter(filters, "s");

  const result =
    await analyticsDb.query<DatabaseAnalyticsSummaryRow>(
      `
        SELECT
          COUNT(
            DISTINCT s.visitor_id
          )::text
            AS visitors,

          COUNT(*)::text
            AS sessions,

          COUNT(*) FILTER (
            WHERE s.play_started IS TRUE
          )::text
            AS plays,

          COUNT(*) FILTER (
            WHERE s.pitch_reached IS TRUE
          )::text
            AS pitch_reached,

          COUNT(*) FILTER (
            WHERE s.checkout_clicked IS TRUE
          )::text
            AS checkout_opened,

          COALESCE(
            AVG(s.total_watch_seconds),
            0
          )::text
            AS average_watch_seconds,

          COALESCE(
            AVG(s.max_reached_second),
            0
          )::text
            AS average_max_reached_second

        FROM public.analytics_sessions s

        ${whereSql}
      `,
      values,
    );

  const row = result.rows[0];

  const visitors =
    parseInteger(row?.visitors);

  const sessions =
    parseInteger(row?.sessions);

  const plays =
    parseInteger(row?.plays);

  const pitchReached =
    parseInteger(row?.pitch_reached);

  const checkoutOpened =
    parseInteger(row?.checkout_opened);

  return {
    visitors,
    sessions,
    plays,
    pitchReached,
    checkoutOpened,

    playRate:
      calculateRate(
        plays,
        sessions,
      ),

    pitchRate:
      calculateRate(
        pitchReached,
        plays,
      ),

    checkoutRate:
      calculateRate(
        checkoutOpened,
        plays,
      ),

    averageWatchSeconds:
      Number(
        parseDecimal(
          row?.average_watch_seconds,
        ).toFixed(2),
      ),

    averageMaxReachedSecond:
      Number(
        parseDecimal(
          row?.average_max_reached_second,
        ).toFixed(2),
      ),
  };
}

export async function getRetentionCurve(
  filters: AnalyticsFilters = {},
): Promise<RetentionPoint[]> {
  const {
    whereSql,
    values,
  } = buildSessionFilter(filters, "s");

  const result =
    await analyticsDb.query<DatabaseRetentionRow>(
      `
        WITH filtered_sessions AS (
          SELECT
            s.id
          FROM public.analytics_sessions s
          ${whereSql}
        ),

        watched_seconds AS (
          SELECT DISTINCT
            r.session_id,

            generate_series(
              FLOOR(r.start_second)::integer,
              CEIL(r.end_second)::integer - 1
            ) AS second

          FROM public.analytics_watch_ranges r

          INNER JOIN filtered_sessions fs
            ON fs.id = r.session_id

          WHERE
            r.end_second >
            r.start_second
        )

        SELECT
          second,

          COUNT(
            DISTINCT session_id
          )::text
            AS viewers

        FROM watched_seconds

        WHERE second >= 0

        GROUP BY second

        ORDER BY second ASC
      `,
      values,
    );

  const viewerCounts =
    result.rows.map((row) => ({
      second:
        parseInteger(row.second),

      viewers:
        parseInteger(row.viewers),
    }));

  const initialViewers =
    viewerCounts[0]?.viewers ?? 0;

  return viewerCounts.map((point) => ({
    ...point,

    percentage:
      calculateRate(
        point.viewers,
        initialViewers,
      ),
  }));
}

export async function getTrafficSources(
  filters: AnalyticsFilters = {},
): Promise<TrafficSourceRow[]> {
  const {
    whereSql,
    values,
  } = buildSessionFilter(filters, "s");

  const result =
    await analyticsDb.query<DatabaseTrafficSourceRow>(
      `
        SELECT
          COALESCE(
            NULLIF(
              LOWER(TRIM(s.utm_source)),
              ''
            ),

            CASE
              WHEN s.fbclid IS NOT NULL
                THEN 'facebook'

              WHEN s.referrer ILIKE '%instagram%'
                THEN 'instagram'

              WHEN s.referrer ILIKE '%youtube%'
                THEN 'youtube'

              WHEN s.referrer ILIKE '%google%'
                THEN 'google'

              WHEN
                s.referrer IS NULL
                OR TRIM(s.referrer) = ''
                THEN 'direct'

              ELSE 'referral'
            END
          ) AS source,

          COUNT(*)::text
            AS sessions,

          COUNT(*) FILTER (
            WHERE s.play_started IS TRUE
          )::text
            AS plays,

          COUNT(*) FILTER (
            WHERE s.pitch_reached IS TRUE
          )::text
            AS pitch_reached,

          COUNT(*) FILTER (
            WHERE s.checkout_clicked IS TRUE
          )::text
            AS checkout_opened

        FROM public.analytics_sessions s

        ${whereSql}

        GROUP BY source

        ORDER BY COUNT(*) DESC
      `,
      values,
    );

  return result.rows.map((row) => {
    const sessions =
      parseInteger(row.sessions);

    const plays =
      parseInteger(row.plays);

    const pitchReached =
      parseInteger(row.pitch_reached);

    const checkoutOpened =
      parseInteger(row.checkout_opened);

    return {
      source:
        row.source || "unknown",

      sessions,
      plays,
      pitchReached,
      checkoutOpened,

      playRate:
        calculateRate(
          plays,
          sessions,
        ),

      pitchRate:
        calculateRate(
          pitchReached,
          plays,
        ),

      checkoutRate:
        calculateRate(
          checkoutOpened,
          plays,
        ),
    };
  });
}

export async function getCampaignAnalytics(
  filters: AnalyticsFilters = {},
): Promise<CampaignAnalyticsRow[]> {
  const {
    whereSql,
    values,
  } = buildSessionFilter(filters, "s");

  const result =
    await analyticsDb.query<DatabaseCampaignAnalyticsRow>(
      `
        SELECT
          s.campaign_id,

          MAX(
            NULLIF(
              TRIM(s.campaign_name),
              ''
            )
          ) AS campaign_name,

          COUNT(*)::text
            AS sessions,

          COUNT(
            DISTINCT s.visitor_id
          )::text
            AS visitors,

          COUNT(*) FILTER (
            WHERE s.play_started IS TRUE
          )::text
            AS plays,

          COUNT(*) FILTER (
            WHERE s.pitch_reached IS TRUE
          )::text
            AS pitch_reached,

          COUNT(*) FILTER (
            WHERE s.checkout_clicked IS TRUE
          )::text
            AS checkout_opened,

          COALESCE(
            AVG(s.total_watch_seconds),
            0
          )::text
            AS average_watch_seconds,

          COALESCE(
            AVG(s.max_reached_second),
            0
          )::text
            AS average_max_reached_second

        FROM public.analytics_sessions s

        ${whereSql}

        GROUP BY s.campaign_id

        ORDER BY COUNT(*) DESC
      `,
      values,
    );

    const trackingAliases =
    await getTrackingAliasMaps("meta");

  return result.rows.map((row) => {
    const sessions =
      parseInteger(row.sessions);

    const visitors =
      parseInteger(row.visitors);

    const plays =
      parseInteger(row.plays);

    const pitchReached =
      parseInteger(row.pitch_reached);

    const checkoutOpened =
      parseInteger(row.checkout_opened);

    const campaignAlias =
      row.campaign_id
        ? trackingAliases.campaigns[
            row.campaign_id
          ] ?? null
        : null;

    return {
      campaignId:
        row.campaign_id,

      campaignName:
        campaignAlias ||
        row.campaign_name ||
        applyTrackingAlias(
          row.campaign_id,
          trackingAliases.campaigns,
        ),

      sessions,
      visitors,
      plays,
      pitchReached,
      checkoutOpened,

      playRate:
        calculateRate(
          plays,
          sessions,
        ),

      pitchRate:
        calculateRate(
          pitchReached,
          plays,
        ),

      checkoutRate:
        calculateRate(
          checkoutOpened,
          plays,
        ),

      averageWatchSeconds:
        Number(
          parseDecimal(
            row.average_watch_seconds,
          ).toFixed(2),
        ),

      averageMaxReachedSecond:
        Number(
          parseDecimal(
            row.average_max_reached_second,
          ).toFixed(2),
        ),
    };
  });
}