import * as webPush from "web-push";

import { prisma } from "@/lib/db";

const vapidPublicKey = String(
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "",
).trim();

const vapidPrivateKey = String(
  process.env.VAPID_PRIVATE_KEY ?? "",
).trim();

const vapidSubject = String(
  process.env.VAPID_SUBJECT ?? "",
).trim();

let configured = false;

export interface CentralPushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  eventId?: string;
  checkoutLeadId?: string;
}

export interface PushDeliveryResult {
  attempted: number;
  delivered: number;
  deactivated: number;
  failed: number;
}

export function getVapidPublicKey(): string {
  if (!vapidPublicKey) {
    throw new Error(
      "NEXT_PUBLIC_VAPID_PUBLIC_KEY não configurada.",
    );
  }

  return vapidPublicKey;
}

function configureWebPush(): void {
  if (configured) {
    return;
  }

  if (
    !vapidPublicKey ||
    !vapidPrivateKey ||
    !vapidSubject
  ) {
    throw new Error(
      "Configuração VAPID incompleta.",
    );
  }

  webPush.setVapidDetails(
    vapidSubject,
    vapidPublicKey,
    vapidPrivateKey,
  );

  configured = true;
}

function shouldDeactivateSubscription(
  statusCode: number | undefined,
): boolean {
  return statusCode === 404 || statusCode === 410;
}

export async function sendPushToActiveSubscriptions(
  payload: CentralPushPayload,
): Promise<PushDeliveryResult> {
  configureWebPush();

  const subscriptions =
    await prisma.pushSubscription.findMany({
      where: {
        active: true,
      },

      select: {
        id: true,
        endpoint: true,
        p256dh: true,
        auth: true,
      },
    });

  const result: PushDeliveryResult = {
    attempted: subscriptions.length,
    delivered: 0,
    deactivated: 0,
    failed: 0,
  };

  const message = JSON.stringify({
    title: payload.title,
    body: payload.body,

    url:
      payload.url ??
      "/central/checkouts",

    tag:
      payload.tag ??
      `central-${payload.eventId ?? Date.now()}`,

    eventId: payload.eventId ?? null,

    checkoutLeadId:
      payload.checkoutLeadId ?? null,
  });

  await Promise.allSettled(
    subscriptions.map(async (subscription) => {
      try {
        await webPush.sendNotification(
          {
            endpoint: subscription.endpoint,

            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          },
          message,
          {
            TTL: 60 * 60,
            urgency: "high",
          },
        );

        result.delivered += 1;

        await prisma.pushSubscription.update({
          where: {
            id: subscription.id,
          },

          data: {
            lastUsedAt: new Date(),
          },
        });
      } catch (error) {
        const statusCode =
          typeof error === "object" &&
          error !== null &&
          "statusCode" in error &&
          typeof error.statusCode === "number"
            ? error.statusCode
            : undefined;

        if (
          shouldDeactivateSubscription(
            statusCode,
          )
        ) {
          result.deactivated += 1;

          await prisma.pushSubscription.update({
            where: {
              id: subscription.id,
            },

            data: {
              active: false,
          },
          });

          return;
        }

        result.failed += 1;

        console.error(
          "Erro ao enviar Web Push:",
          error,
        );
      }
    }),
  );

  return result;
}