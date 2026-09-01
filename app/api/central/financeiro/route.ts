import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  getFinancialAnalytics,
  type FinancialFilters,
} from "@/lib/financeiro/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getOptionalParam(
  request: NextRequest,
  name: string,
): string | null {
  const value =
    request.nextUrl.searchParams.get(name);

  const normalized =
    value?.trim();

  return normalized || null;
}

function buildFilters(
  request: NextRequest,
): FinancialFilters {
  return {
    dateFrom:
      getOptionalParam(
        request,
        "date_from",
      ),

    dateTo:
      getOptionalParam(
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

    const result =
      await getFinancialAnalytics(
        filters,
      );

    return NextResponse.json({
      ok: true,
      summary: result.summary,
      creatives: result.creatives,
    });
  } catch (error) {
    console.error(
      "[central/financeiro] error:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Não foi possível carregar os dados financeiros.",
      },
      {
        status: 500,
      },
    );
  }
}