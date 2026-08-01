import {
  timingSafeEqual,
} from "node:crypto";

import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  registerIncomingCheckoutEvent,
  type IncomingCheckoutEvent,
} from "@/lib/central/incoming-checkout-event";

import {
  sendPushToActiveSubscriptions,
} from "@/lib/push/web-push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeSecretComparison(
  received: string,
  expected: string,
): boolean {
  const receivedBuffer =
    Buffer.from(received);

  const expectedBuffer =
    Buffer.from(expected);

  if (
    receivedBuffer.length !==
    expectedBuffer.length
  ) {
    return false;
  }

  return timingSafeEqual(
    receivedBuffer,
    expectedBuffer,
  );
}

function isAuthorized(
  request: NextRequest,
): boolean {
  const expectedSecret = String(
    process.env.CENTRAL_EVENTS_SECRET || "",
  ).trim();

  if (!expectedSecret) {
    console.error(
      "CENTRAL_EVENTS_SECRET não configurado.",
    );

    return false;
  }

  const receivedSecret = String(
    request.headers.get(
      "x-central-events-secret",
    ) || "",
  ).trim();

  if (!receivedSecret) {
    return false;
  }

  return safeSecretComparison(
    receivedSecret,
    expectedSecret,
  );
}

function getCustomerName(
  body: IncomingCheckoutEvent,
): string {
  const customer =
    typeof body.customer === "object" &&
    body.customer !== null &&
    !Array.isArray(body.customer)
      ? body.customer as Record<string, unknown>
      : {};

  return (
    typeof customer.name === "string" &&
    customer.name.trim()
      ? customer.name.trim()
      : "Cliente"
  );
}

function getPushMessage(
  eventType: string,
  customerName: string,
): {
  title: string;
  body: string;
} {
  switch (eventType) {
    case "payment_approved":
      return {
        title: "💰 Venda aprovada!",
        body:
          `${customerName} concluiu o pagamento.`,
      };

    case "created":
      return {
        title: "🛒 Novo checkout",
        body:
          `${customerName} iniciou um checkout.`,
      };

    case "status_changed":
      return {
        title: "🔄 Status atualizado",
        body:
          `O checkout de ${customerName} mudou de status.`,
      };

    case "order_linked":
      return {
        title: "📦 Pedido vinculado",
        body:
          `${customerName} recebeu um pedido da Kiwify.`,
      };

    case "payment_changed":
      return {
        title: "💳 Pagamento atualizado",
        body:
          `O pagamento de ${customerName} foi atualizado.`,
      };

    default:
      return {
        title: "🔔 Checkout atualizado",
        body:
          `${customerName} teve uma nova atualização no checkout.`,
      };
  }
}

export async function POST(
  request: NextRequest,
) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        ok: false,
        error: "unauthorized",
      },
      {
        status: 401,

        headers: {
          "Cache-Control": "no-store",
          "X-Robots-Tag":
            "noindex, nofollow, noarchive",
        },
      },
    );
  }

  try {
    const body =
      (await request.json()) as
        IncomingCheckoutEvent;

    const result =
      await registerIncomingCheckoutEvent(
        body,
      );

    if (result.created) {
      const customerName =
        getCustomerName(body);

      const message =
        getPushMessage(
          result.eventType,
          customerName,
        );

      const delivery =
        await sendPushToActiveSubscriptions({
          title: message.title,
          body: message.body,

          url: "/central/checkouts",

          tag:
            `checkout-event-${result.eventId}`,

          eventId:
            result.eventId,

          checkoutLeadId:
            typeof body.checkoutLeadId === "string"
              ? body.checkoutLeadId
              : undefined,
        });

      console.log(
        "Web Push enviado:",
        delivery,
      );
    }

    return NextResponse.json(
      {
        ok: true,
        ...result,
      },
      {
        status:
          result.created
            ? 201
            : 200,

        headers: {
          "Cache-Control": "no-store",
          "X-Robots-Tag":
            "noindex, nofollow, noarchive",
        },
      },
    );
  } catch (error) {
    console.error(
      "Erro ao receber evento interno de checkout:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Evento inválido.";

    const isValidationError =
      message.includes("obrigatório");

    return NextResponse.json(
      {
        ok: false,

        error: isValidationError
          ? message
          : "Não foi possível registrar o evento.",
      },
      {
        status:
          isValidationError
            ? 400
            : 500,

        headers: {
          "Cache-Control": "no-store",
          "X-Robots-Tag":
            "noindex, nofollow, noarchive",
        },
      },
    );
  }
}