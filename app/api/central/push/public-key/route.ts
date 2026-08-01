import { NextResponse } from "next/server";

import {
  getVapidPublicKey,
} from "@/lib/push/web-push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(
      {
        publicKey: getVapidPublicKey(),
      },
      {
        headers: {
          "Cache-Control": "no-store",
          "X-Robots-Tag":
            "noindex, nofollow, noarchive",
        },
      },
    );
  } catch (error) {
    console.error(
      "Erro ao carregar chave pública VAPID:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Configuração de notificações indisponível.",
      },
      {
        status: 500,
      },
    );
  }
}