import { createHash } from "node:crypto";

import {
  CheckoutEventType,
  Prisma,
} from "@/generated/prisma/client";

import { prisma } from "@/lib/db";

const ACCEPTED_EVENT_TYPES = new Set([
  "created",
  "updated",
  "payment_approved",
  "payment_changed",
  "order_linked",
  "status_changed",
]);

export interface IncomingCheckoutEvent {
  eventType?: unknown;
  source?: unknown;

  checkoutLeadId?: unknown;
  externalEventId?: unknown;

  providerEvent?: unknown;
  customer?: unknown;
  checkout?: unknown;
  tracking?: unknown;
}

interface NormalizedCheckoutEvent {
  eventType: CheckoutEventType;
  source: string;

  checkoutLeadId: string;
  externalEventId: string | null;

  customerName: string;
  email: string;
  phone: string;

  checkoutStatus: string;
  paid: boolean;

  kiwifyOrderId: string | null;
  kiwifyStatus: string | null;
  paidAt: string | null;

  checkoutCreatedAt: string | null;
  checkoutUpdatedAt: string;

  providerEvent:
    | Prisma.InputJsonObject
    | null;

  tracking:
    | Prisma.InputJsonObject
    | null;
}

export interface RegisterIncomingEventResult {
  created: boolean;
  duplicate: boolean;
  eventId: string;
  eventType: CheckoutEventType;
}

function normalizeText(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function normalizeNullableText(
  value: unknown,
): string | null {
  const normalized = normalizeText(value);

  return normalized || null;
}

function normalizeBoolean(
  value: unknown,
): boolean {
  return value === true;
}

function normalizeIsoDate(
  value: unknown,
): string | null {
  if (
    typeof value !== "string" &&
    !(value instanceof Date)
  ) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function objectValue(
  value: unknown,
): Record<string, unknown> {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return {};
  }

  return value as Record<string, unknown>;
}

function normalizeEventType(
  value: unknown,
): CheckoutEventType {
  const normalized = normalizeText(
    value,
  ).toLowerCase();

  if (!ACCEPTED_EVENT_TYPES.has(normalized)) {
    return CheckoutEventType.updated;
  }

  return normalized as CheckoutEventType;
}

function recordToJson(
  value: unknown,
): Prisma.InputJsonObject | null {
  const record = objectValue(value);

  const entries = Object.entries(record).filter(
    (
      entry,
    ): entry is [
      string,
      string | number | boolean | null,
    ] => {
      const item = entry[1];

      return (
        item === null ||
        typeof item === "string" ||
        typeof item === "number" ||
        typeof item === "boolean"
      );
    },
  );

  if (entries.length === 0) {
    return null;
  }

  return Object.fromEntries(
    entries,
  ) as Prisma.InputJsonObject;
}

function normalizeIncomingEvent(
  input: IncomingCheckoutEvent,
): NormalizedCheckoutEvent {
  const customer = objectValue(
    input.customer,
  );

  const checkout = objectValue(
    input.checkout,
  );

  const checkoutLeadId = normalizeText(
    input.checkoutLeadId,
  );

  if (!checkoutLeadId) {
    throw new Error(
      "checkoutLeadId é obrigatório.",
    );
  }

  const checkoutUpdatedAt =
    normalizeIsoDate(
      checkout.updatedAt,
    ) ?? new Date().toISOString();

  return {
    eventType: normalizeEventType(
      input.eventType,
    ),

    source:
      normalizeText(input.source) ||
      "unknown",

    checkoutLeadId,

    externalEventId:
      normalizeNullableText(
        input.externalEventId,
      ),

    customerName:
      normalizeText(customer.name) ||
      "Cliente",

    email: normalizeText(customer.email),
    phone: normalizeText(customer.phone),

    checkoutStatus:
      normalizeText(checkout.status) ||
      "unknown",

    paid: normalizeBoolean(
      checkout.paid,
    ),

    kiwifyOrderId:
      normalizeNullableText(
        checkout.kiwifyOrderId,
      ),

    kiwifyStatus:
      normalizeNullableText(
        checkout.kiwifyStatus,
      ),

    paidAt: normalizeIsoDate(
      checkout.paidAt,
    ),

    checkoutCreatedAt:
      normalizeIsoDate(
        checkout.createdAt,
      ),

    checkoutUpdatedAt,

    providerEvent: recordToJson(
      input.providerEvent,
    ),

    tracking: recordToJson(
      input.tracking,
    ),
  };
}

function createEventKey(
  event: NormalizedCheckoutEvent,
): string {
  /*
   * Webhook da Kiwify:
   * usa o eventId original como principal proteção
   * contra reenvios da mesma notificação.
   */
  if (event.externalEventId) {
    return createHash("sha256")
      .update(
        [
          event.source,
          event.externalEventId,
          event.eventType,
        ].join(":"),
      )
      .digest("hex");
  }

  /*
   * Precheckout:
   * cada nova tentativa atualiza updated_at,
   * portanto gera um evento diferente mesmo
   * quando o e-mail já existia anteriormente.
   */
  return createHash("sha256")
    .update(
      [
        event.source,
        event.checkoutLeadId,
        event.eventType,
        event.checkoutUpdatedAt,
        event.checkoutStatus,
        event.paid ? "paid" : "pending",
        event.kiwifyOrderId ?? "",
        event.kiwifyStatus ?? "",
      ].join(":"),
    )
    .digest("hex");
}

function eventPayload(
  event: NormalizedCheckoutEvent,
): Prisma.InputJsonObject {
  return {
    source: event.source,

    customer: {
      name: event.customerName,
      email: event.email,
      phone: event.phone,
    },

    checkout: {
      status: event.checkoutStatus,
      paid: event.paid,

      kiwifyOrderId:
        event.kiwifyOrderId,

      kiwifyStatus:
        event.kiwifyStatus,

      paidAt: event.paidAt,

      createdAt:
        event.checkoutCreatedAt,

      updatedAt:
        event.checkoutUpdatedAt,
    },

    ...(event.externalEventId
      ? {
          externalEventId:
            event.externalEventId,
        }
      : {}),

    ...(event.providerEvent
      ? {
          providerEvent:
            event.providerEvent,
        }
      : {}),

    ...(event.tracking
      ? {
          tracking:
            event.tracking,
        }
      : {}),
  } as Prisma.InputJsonObject;
}
export async function registerIncomingCheckoutEvent(
  input: IncomingCheckoutEvent,
): Promise<RegisterIncomingEventResult> {
  const event = normalizeIncomingEvent(
    input,
  );

  const eventKey = createEventKey(event);

  const existing =
    await prisma.checkoutNotificationEvent.findUnique({
      where: {
        eventKey,
      },

      select: {
        id: true,
        eventType: true,
      },
    });

  if (existing) {
    return {
      created: false,
      duplicate: true,
      eventId: existing.id,
      eventType: existing.eventType,
    };
  }

  try {
    const created =
      await prisma.checkoutNotificationEvent.create({
        data: {
          checkoutLeadId:
            event.checkoutLeadId,

          eventKey,
          eventType: event.eventType,

          customerName:
            event.customerName,

          phone: event.phone,

          checkoutUpdatedAt:
            new Date(
              event.checkoutUpdatedAt,
            ),

          payload: eventPayload(event),
        },

        select: {
          id: true,
          eventType: true,
        },
      });

    return {
      created: true,
      duplicate: false,
      eventId: created.id,
      eventType: created.eventType,
    };
  } catch (error) {
    /*
     * Proteção contra duas requisições iguais
     * chegando praticamente ao mesmo tempo.
     */
    if (
      error instanceof
        Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const duplicate =
        await prisma.checkoutNotificationEvent.findUniqueOrThrow({
          where: {
            eventKey,
          },

          select: {
            id: true,
            eventType: true,
          },
        });

      return {
        created: false,
        duplicate: true,
        eventId: duplicate.id,
        eventType: duplicate.eventType,
      };
    }

    throw error;
  }
}