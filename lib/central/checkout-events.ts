import { createHash } from "node:crypto";

import {
  CheckoutEventType,
  Prisma,
} from "@/generated/prisma/client";

import { prisma } from "@/lib/db";
import { precheckoutDb } from "@/lib/precheckout-db";

interface PrecheckoutEventRow {
  id: string;
  name: string;
  phone: string;

  status: string;

  kiwify_order_id: string | null;
  kiwify_status: string | null;

  pago: boolean | null;
  paid_at: Date | string | null;
  pago_em: Date | string | null;

  created_at: Date | string;
  updated_at: Date | string;
}

interface CheckoutEventSnapshot {
  checkoutId: string;
  name: string;
  phone: string;

  status: string;
  kiwifyOrderId: string | null;
  kiwifyStatus: string | null;

  paid: boolean;
  paidAt: string | null;

  createdAt: string;
  updatedAt: string;
}

function snapshotToJson(
  snapshot: CheckoutEventSnapshot,
): Prisma.InputJsonObject {
  return {
    checkoutId: snapshot.checkoutId,
    name: snapshot.name,
    phone: snapshot.phone,
    status: snapshot.status,
    kiwifyOrderId: snapshot.kiwifyOrderId,
    kiwifyStatus: snapshot.kiwifyStatus,
    paid: snapshot.paid,
    paidAt: snapshot.paidAt,
    createdAt: snapshot.createdAt,
    updatedAt: snapshot.updatedAt,
  };
}

interface StoredEventPayload {
  snapshot?: CheckoutEventSnapshot;
}

export interface DetectedCheckoutEvent {
  id: string;

  checkoutLeadId: string;
  eventType: CheckoutEventType;

  customerName: string;
  phone: string;

  checkoutUpdatedAt: string;
  createdAt: string;
}

export interface CheckoutEventDetectionResult {
  initialized: boolean;
  events: DetectedCheckoutEvent[];
}

const MAXIMUM_ROWS_PER_CHECK = 100;

function toIsoString(
  value: Date | string | null,
): string | null {
  if (!value) {
    return null;
  }

  const date =
    value instanceof Date
      ? value
      : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function requiredIsoString(
  value: Date | string,
): string {
  return (
    toIsoString(value) ??
    new Date(0).toISOString()
  );
}

function normalizeNullableText(
  value: string | null,
): string | null {
  const normalized = value?.trim() ?? "";

  return normalized || null;
}

function createSnapshot(
  row: PrecheckoutEventRow,
): CheckoutEventSnapshot {
  return {
    checkoutId: row.id,

    name: row.name.trim(),
    phone: row.phone.trim(),

    status: row.status.trim(),

    kiwifyOrderId: normalizeNullableText(
      row.kiwify_order_id,
    ),

    kiwifyStatus: normalizeNullableText(
      row.kiwify_status,
    ),

    paid: row.pago === true,

    paidAt:
      toIsoString(row.pago_em) ??
      toIsoString(row.paid_at),

    createdAt: requiredIsoString(
      row.created_at,
    ),

    updatedAt: requiredIsoString(
      row.updated_at,
    ),
  };
}

function createEventKey(
  snapshot: CheckoutEventSnapshot,
): string {
  const source = JSON.stringify({
    checkoutId: snapshot.checkoutId,
    updatedAt: snapshot.updatedAt,
    status: snapshot.status,
    kiwifyOrderId: snapshot.kiwifyOrderId,
    kiwifyStatus: snapshot.kiwifyStatus,
    paid: snapshot.paid,
    paidAt: snapshot.paidAt,
  });

  return createHash("sha256")
    .update(source)
    .digest("hex");
}

function getStoredSnapshot(
  payload: unknown,
): CheckoutEventSnapshot | null {
  if (
    !payload ||
    typeof payload !== "object" ||
    Array.isArray(payload)
  ) {
    return null;
  }

  const storedPayload = payload as {
    snapshot?: unknown;
  };

  const snapshot = storedPayload.snapshot;

  if (
    !snapshot ||
    typeof snapshot !== "object" ||
    Array.isArray(snapshot)
  ) {
    return null;
  }

  const value = snapshot as Record<string, unknown>;

  if (
    typeof value.checkoutId !== "string" ||
    typeof value.name !== "string" ||
    typeof value.phone !== "string" ||
    typeof value.status !== "string" ||
    typeof value.paid !== "boolean" ||
    typeof value.createdAt !== "string" ||
    typeof value.updatedAt !== "string"
  ) {
    return null;
  }

  return {
    checkoutId: value.checkoutId,
    name: value.name,
    phone: value.phone,
    status: value.status,

    kiwifyOrderId:
      typeof value.kiwifyOrderId === "string"
        ? value.kiwifyOrderId
        : null,

    kiwifyStatus:
      typeof value.kiwifyStatus === "string"
        ? value.kiwifyStatus
        : null,

    paid: value.paid,

    paidAt:
      typeof value.paidAt === "string"
        ? value.paidAt
        : null,

    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
}

function determineEventType(
  current: CheckoutEventSnapshot,
  previous: CheckoutEventSnapshot | null,
): CheckoutEventType {
  if (!previous) {
    return CheckoutEventType.created;
  }

  if (!previous.paid && current.paid) {
    return CheckoutEventType.payment_approved;
  }

  if (previous.paid !== current.paid) {
    return CheckoutEventType.payment_changed;
  }

  if (
    previous.kiwifyOrderId !==
      current.kiwifyOrderId &&
    current.kiwifyOrderId
  ) {
    return CheckoutEventType.order_linked;
  }

  if (
    previous.status !== current.status ||
    previous.kiwifyStatus !==
      current.kiwifyStatus
  ) {
    return CheckoutEventType.status_changed;
  }

  return CheckoutEventType.updated;
}

async function getRecentCheckouts(): Promise<
  CheckoutEventSnapshot[]
> {
  const result =
    await precheckoutDb.query<PrecheckoutEventRow>(
      `
        SELECT
          id,
          name,
          phone,

          status,

          kiwify_order_id,
          kiwify_status,

          pago,
          paid_at,
          pago_em,

          created_at,
          updated_at

        FROM public.leads_precheckout

        ORDER BY updated_at DESC

        LIMIT $1
      `,
      [MAXIMUM_ROWS_PER_CHECK],
    );

  return result.rows.map(createSnapshot);
}

export async function detectCheckoutEvents(): Promise<
  CheckoutEventDetectionResult
> {
  const snapshots =
    await getRecentCheckouts();

  if (snapshots.length === 0) {
    return {
      initialized: true,
      events: [],
    };
  }

  const existingEventCount =
    await prisma.checkoutNotificationEvent.count();

  /*
   * Primeira execução:
   *
   * cria a linha de base para os registros atuais,
   * mas já marca como notificada para não disparar
   * dezenas de alertas antigos.
   */
  if (existingEventCount === 0) {
    const now = new Date();

    await prisma.checkoutNotificationEvent.createMany({
      data: snapshots.map((snapshot) => ({
        checkoutLeadId: snapshot.checkoutId,

        eventKey: createEventKey(snapshot),
        eventType: CheckoutEventType.created,

        customerName: snapshot.name,
        phone: snapshot.phone,

        checkoutUpdatedAt:
          new Date(snapshot.updatedAt),

        payload: {
  snapshot: snapshotToJson(snapshot),
  baseline: true,
} satisfies Prisma.InputJsonObject,

        notifiedAt: now,
      })),

      skipDuplicates: true,
    });

    return {
      initialized: true,
      events: [],
    };
  }

  const checkoutIds = snapshots.map(
    (snapshot) => snapshot.checkoutId,
  );

  /*
   * Busca o histórico recente desses checkouts.
   * O primeiro evento encontrado para cada ID
   * será considerado o estado anterior.
   */
  const previousEvents =
    await prisma.checkoutNotificationEvent.findMany({
      where: {
        checkoutLeadId: {
          in: checkoutIds,
        },
      },

      orderBy: {
        checkoutUpdatedAt: "desc",
      },

      select: {
        checkoutLeadId: true,
        payload: true,
      },
    });

  const previousSnapshotByCheckout =
    new Map<string, CheckoutEventSnapshot>();

  for (const event of previousEvents) {
    if (
      previousSnapshotByCheckout.has(
        event.checkoutLeadId,
      )
    ) {
      continue;
    }

    const snapshot =
      getStoredSnapshot(event.payload);

    if (snapshot) {
      previousSnapshotByCheckout.set(
        event.checkoutLeadId,
        snapshot,
      );
    }
  }

  const candidateEvents = snapshots.map(
    (snapshot) => {
      const previous =
        previousSnapshotByCheckout.get(
          snapshot.checkoutId,
        ) ?? null;

      return {
        snapshot,
        eventKey: createEventKey(snapshot),
        eventType: determineEventType(
          snapshot,
          previous,
        ),
      };
    },
  );

  const candidateKeys = candidateEvents.map(
    (candidate) => candidate.eventKey,
  );

  const existingKeys =
    await prisma.checkoutNotificationEvent.findMany({
      where: {
        eventKey: {
          in: candidateKeys,
        },
      },

      select: {
        eventKey: true,
      },
    });

  const existingKeySet = new Set(
    existingKeys.map((event) => event.eventKey),
  );

  const newCandidates = candidateEvents.filter(
    (candidate) =>
      !existingKeySet.has(candidate.eventKey),
  );

  if (newCandidates.length === 0) {
    return {
      initialized: false,
      events: [],
    };
  }

  await prisma.checkoutNotificationEvent.createMany({
    data: newCandidates.map(
      ({
        snapshot,
        eventKey,
        eventType,
      }) => ({
        checkoutLeadId: snapshot.checkoutId,

        eventKey,
        eventType,

        customerName: snapshot.name,
        phone: snapshot.phone,

        checkoutUpdatedAt:
          new Date(snapshot.updatedAt),

        payload: {
  snapshot: snapshotToJson(snapshot),
} satisfies Prisma.InputJsonObject,
      }),
    ),

    skipDuplicates: true,
  });

  const createdEvents =
    await prisma.checkoutNotificationEvent.findMany({
      where: {
        eventKey: {
          in: newCandidates.map(
            (candidate) => candidate.eventKey,
          ),
        },
      },

      orderBy: {
        createdAt: "asc",
      },
    });

  return {
    initialized: false,

    events: createdEvents.map((event) => ({
      id: event.id,

      checkoutLeadId:
        event.checkoutLeadId,

      eventType: event.eventType,

      customerName:
        event.customerName,

      phone: event.phone,

      checkoutUpdatedAt:
        event.checkoutUpdatedAt.toISOString(),

      createdAt:
        event.createdAt.toISOString(),
    })),
  };
}