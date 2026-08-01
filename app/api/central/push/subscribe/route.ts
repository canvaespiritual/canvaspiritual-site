import {
  NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface SubscribeBody {
  subscription?: {
    endpoint?: unknown;

    keys?: {
      p256dh?: unknown;
      auth?: unknown;
    };
  };

  label?: unknown;
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
      (await request.json()) as SubscribeBody;

    const endpoint = normalizeText(
      body.subscription?.endpoint,
    );

    const p256dh = normalizeText(
      body.subscription?.keys?.p256dh,
    );

    const auth = normalizeText(
      body.subscription?.keys?.auth,
    );

    const label =
      normalizeText(body.label) ||
      "Dispositivo da Central";

    if (!endpoint || !p256dh || !auth) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Inscrição push incompleta.",
        },
        {
          status: 400,
        },
      );
    }

    const subscription =
      await prisma.pushSubscription.upsert({
        where: {
          endpoint,
        },

        update: {
          p256dh,
          auth,
          label,

          userAgent:
            request.headers.get(
              "user-agent",
            ) ?? "",

          active: true,
          lastUsedAt: new Date(),
        },

        create: {
          endpoint,
          p256dh,
          auth,
          label,

          userAgent:
            request.headers.get(
              "user-agent",
            ) ?? "",

          active: true,
          lastUsedAt: new Date(),
        },

        select: {
          id: true,
          active: true,
          label: true,
          createdAt: true,
          updatedAt: true,
        },
      });

    return NextResponse.json(
      {
        ok: true,
        subscription,
      },
      {
        status: 201,
        headers: {
          "Cache-Control": "no-store",
          "X-Robots-Tag":
            "noindex, nofollow, noarchive",
        },
      },
    );
  } catch (error) {
    console.error(
      "Erro ao salvar inscrição push:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Não foi possível ativar as notificações.",
      },
      {
        status: 500,
      },
    );
  }
}