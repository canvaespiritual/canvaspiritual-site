import {
  NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface UnsubscribeBody {
  endpoint?: unknown;
}

function normalizeText(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

export async function POST(
  request: NextRequest,
) {
  try {
    const body =
      (await request.json()) as
        UnsubscribeBody;

    const endpoint = normalizeText(
      body.endpoint,
    );

    if (!endpoint) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Endpoint da inscrição obrigatório.",
        },
        {
          status: 400,
        },
      );
    }

    const result =
      await prisma.pushSubscription.updateMany({
        where: {
          endpoint,
        },

        data: {
          active: false,
        },
      });

    return NextResponse.json({
      ok: true,
      deactivated:
        result.count > 0,
    });
  } catch (error) {
    console.error(
      "Erro ao desativar inscrição push:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Não foi possível desativar as notificações.",
      },
      {
        status: 500,
      },
    );
  }
}