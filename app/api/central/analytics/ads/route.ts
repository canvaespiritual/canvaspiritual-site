import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  getCampaignAdAnalytics,
  type AnalyticsFilters,
} from "@/lib/analytics/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getOptionalParam(
  request: NextRequest,
  name: string,
): string | null {
  const value =
    request.nextUrl.searchParams.get(name);

  const normalized = value?.trim();

  return normalized || null;
}

function buildFilters(
  request: NextRequest,
): AnalyticsFilters {
  return {
    vslId: getOptionalParam(
      request,
      "vsl_id",
    ),

    videoId: getOptionalParam(
      request,
      "video_id",
    ),

    productId: getOptionalParam(
      request,
      "product_id",
    ),

    campaignId: getOptionalParam(
      request,
      "campaign_id",
    ),

    adsetId: getOptionalParam(
      request,
      "adset_id",
    ),

    adId: getOptionalParam(
      request,
      "ad_id",
    ),

    utmSource: getOptionalParam(
      request,
      "utm_source",
    ),

    dateFrom: getOptionalParam(
      request,
      "date_from",
    ),

    dateTo: getOptionalParam(
      request,
      "date_to",
    ),
  };
}

export async function GET(
  request: NextRequest,
) {
  try {
    const filters =
      buildFilters(request);

    const ads =
      await getCampaignAdAnalytics(
        filters,
      );

    return NextResponse.json({
      ok: true,
      ads,
    });
  } catch (error) {
    console.error(
      "[central/analytics/ads] error:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Não foi possível carregar os anúncios.",
      },
      {
        status: 500,
      },
    );
  }
}