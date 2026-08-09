import { NextRequest, NextResponse } from "next/server";

import { precheckoutDb } from "@/lib/precheckout-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CampaignLandingContentRow {
  id: string;
  campaign_id: string;
  headline: string;
  highlight_text: string | null;
  subheadline: string | null;
  active: boolean;
  created_at: Date | string;
  updated_at: Date | string;
}

function normalizeText(value: unknown): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function rowToClient(
  row: CampaignLandingContentRow,
) {
  return {
    id: row.id,
    campaignId: row.campaign_id,
    headline: row.headline,
    highlightText: row.highlight_text,
    subheadline: row.subheadline,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/*
 * Lista todas as personalizações cadastradas.
 *
 * Uso administrativo.
 */
export async function GET() {
  try {
    const result =
      await precheckoutDb.query<CampaignLandingContentRow>(
        `
          SELECT
            id,
            campaign_id,
            headline,
            highlight_text,
            subheadline,
            active,
            created_at,
            updated_at

          FROM public.campaign_landing_content

          ORDER BY updated_at DESC
        `,
      );

    return NextResponse.json({
      contents: result.rows.map(rowToClient),
    });
  } catch (error) {
    console.error(
      "Erro ao carregar conteúdos das campanhas:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível carregar os conteúdos das campanhas.",
      },
      {
        status: 500,
      },
    );
  }
}

/*
 * Cria ou atualiza a personalização de uma campanha.
 *
 * campaign_id é UNIQUE no PostgreSQL.
 * Portanto podemos usar ON CONFLICT para fazer UPSERT.
 */
export async function POST(
  request: NextRequest,
) {
  try {
    const body = (await request.json()) as {
      campaignId?: unknown;
      headline?: unknown;
      highlightText?: unknown;
      subheadline?: unknown;
      active?: unknown;
    };

    const campaignId = normalizeText(
      body.campaignId,
    );

    const headline = normalizeText(
      body.headline,
    );

    const highlightText =
      normalizeText(body.highlightText) || null;

    const subheadline =
      normalizeText(body.subheadline) || null;

    const active =
      typeof body.active === "boolean"
        ? body.active
        : true;

    if (!campaignId) {
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

    if (!headline) {
      return NextResponse.json(
        {
          error:
            "Informe a headline.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * Se houver destaque, ele precisa existir
     * literalmente dentro da headline.
     *
     * Isso evita configurações impossíveis de
     * renderizar depois na VSL.
     */
    if (
      highlightText &&
      !headline
        .toLocaleLowerCase("pt-BR")
        .includes(
          highlightText.toLocaleLowerCase(
            "pt-BR",
          ),
        )
    ) {
      return NextResponse.json(
        {
          error:
            "O trecho destacado precisa existir dentro da headline.",
        },
        {
          status: 400,
        },
      );
    }

    const result =
      await precheckoutDb.query<CampaignLandingContentRow>(
        `
          INSERT INTO public.campaign_landing_content (
            campaign_id,
            headline,
            highlight_text,
            subheadline,
            active,
            created_at,
            updated_at
          )

          VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            NOW(),
            NOW()
          )

          ON CONFLICT (campaign_id)

          DO UPDATE SET
            headline = EXCLUDED.headline,
            highlight_text =
              EXCLUDED.highlight_text,
            subheadline =
              EXCLUDED.subheadline,
            active = EXCLUDED.active,
            updated_at = NOW()

          RETURNING
            id,
            campaign_id,
            headline,
            highlight_text,
            subheadline,
            active,
            created_at,
            updated_at
        `,
        [
          campaignId,
          headline,
          highlightText,
          subheadline,
          active,
        ],
      );

    const content = result.rows[0];

    if (!content) {
      throw new Error(
        "O banco não retornou o conteúdo salvo.",
      );
    }

    return NextResponse.json(
      {
        content: rowToClient(content),
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "Erro ao salvar conteúdo da campanha:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível salvar o conteúdo da campanha.",
      },
      {
        status: 500,
      },
    );
  }
}