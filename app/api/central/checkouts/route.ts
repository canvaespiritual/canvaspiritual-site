import { NextResponse } from "next/server";

import { listCheckoutLeads } from "@/lib/checkouts/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseIntegerParameter(
  value: string | null,
): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);

  return Number.isInteger(parsed)
    ? parsed
    : undefined;
}


function isTemporarilyAllowed(): boolean {
  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  return process.env.CENTRAL_API_ENABLED === "true";
}

export async function GET(request: Request) {
  if (!isTemporarilyAllowed()) {
    return NextResponse.json(
      {
        error: "Não foi possível carregar os checkouts.",
      },
      {
        status: 404,
      },
    );
  }

  try {
    const url = new URL(request.url);

    const limit = parseIntegerParameter(
      url.searchParams.get("limit"),
    );

    const offset = parseIntegerParameter(
      url.searchParams.get("offset"),
    );

    const result = await listCheckoutLeads({
      limit,
      offset,
    });

    return NextResponse.json(
      {
        checkouts: result.checkouts,
         summary: result.summary,

        pagination: {
          total: result.total,
          limit: result.limit,
          offset: result.offset,

          hasMore:
            result.offset +
              result.checkouts.length <
            result.total,
        },
      },
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
          "X-Robots-Tag":
            "noindex, nofollow, noarchive",
        },
      },
    );
  } catch (error) {
    console.error(
      "Erro ao carregar leads de precheckout:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível carregar os checkouts.",
      },
      {
        status: 500,

        headers: {
          "Cache-Control": "no-store",
          "X-Robots-Tag":
            "noindex, nofollow, noarchive",
        },
      },
    );
  }
}