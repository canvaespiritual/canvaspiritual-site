import { NextResponse } from "next/server";

import {
  detectCheckoutEvents,
} from "@/lib/central/checkout-events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isTemporarilyAllowed(): boolean {
  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  return (
    process.env.CENTRAL_API_ENABLED === "true"
  );
}

export async function POST() {
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
    const result =
      await detectCheckoutEvents();

    return NextResponse.json(
      result,
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
      "Erro ao detectar eventos de checkout:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível verificar novos eventos.",
      },
      {
        status: 500,
      },
    );
  }
}