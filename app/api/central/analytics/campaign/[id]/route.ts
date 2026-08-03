import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  getAnalyticsSummary,
  getRetentionCurve,
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

  return value?.trim() || null;
}

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    const { id } = await context.params;

    const campaignId =
      decodeURIComponent(id).trim();

    if (!campaignId) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "O identificador da campanha é obrigatório.",
        },
        {
          status: 400,
        },
      );
    }

    const filters: AnalyticsFilters = {
      campaignId,

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

    const [
      summary,
      retention,
    ] = await Promise.all([
      getAnalyticsSummary(filters),
      getRetentionCurve(filters),
    ]);

    return NextResponse.json({
      ok: true,
      campaignId,
      summary,
      retention,
    });
  } catch (error) {
    console.error(
      "[central/analytics/campaign/id] error:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Não foi possível carregar os dados da campanha.",
      },
      {
        status: 500,
      },
    );
  }
}