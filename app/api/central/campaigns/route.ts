import { NextResponse } from "next/server";

import {
  listCampaignAliases,
  saveCampaignAlias,
} from "@/lib/campaigns/queries";

import type { CampaignAliasInput } from "@/types/campaign-alias";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isTemporarilyAllowed(): boolean {
  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  return process.env.CENTRAL_API_ENABLED === "true";
}

function normalizeUnknownText(
  value: unknown,
): string {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value).trim();
}

export async function GET() {
  if (!isTemporarilyAllowed()) {
    return NextResponse.json(
      {
        error: "Recurso não encontrado.",
      },
      {
        status: 404,
      },
    );
  }

  try {
    const campaigns =
      await listCampaignAliases();

    return NextResponse.json(
      {
        campaigns,
        total: campaigns.length,
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
      "Erro ao carregar campanhas:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível carregar as campanhas.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(request: Request) {
  if (!isTemporarilyAllowed()) {
    return NextResponse.json(
      {
        error: "Recurso não encontrado.",
      },
      {
        status: 404,
      },
    );
  }

  try {
    const body = (await request.json()) as {
      platform?: unknown;
      externalId?: unknown;
      name?: unknown;
    };

    const input: CampaignAliasInput = {
      platform:
        normalizeUnknownText(body.platform) ||
        "meta",

      externalId: normalizeUnknownText(
        body.externalId,
      ),

      name: normalizeUnknownText(body.name),
    };

    if (!input.externalId) {
      return NextResponse.json(
        {
          error:
            "Informe o ID da campanha.",
        },
        {
          status: 400,
        },
      );
    }

    if (!input.name) {
      return NextResponse.json(
        {
          error:
            "Informe o nome da campanha.",
        },
        {
          status: 400,
        },
      );
    }

    const campaign =
      await saveCampaignAlias(input);

    return NextResponse.json(
      {
        campaign,
      },
      {
        status: 200,

        headers: {
          "Cache-Control": "no-store",

          "X-Robots-Tag":
            "noindex, nofollow, noarchive",
        },
      },
    );
  } catch (error) {
    console.error(
      "Erro ao salvar campanha:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Não foi possível salvar a campanha.";

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 500,
      },
    );
  }
}