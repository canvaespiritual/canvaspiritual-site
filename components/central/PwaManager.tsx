"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

type PushState =
  | "loading"
  | "unsupported"
  | "blocked"
  | "inactive"
  | "active"
  | "error";

interface PublicKeyResponse {
  publicKey?: string;
  error?: string;
}

interface ApiResponse {
  ok?: boolean;
  error?: string;
}

function urlBase64ToUint8Array(
  base64String: string,
): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat(
    (4 - (base64String.length % 4)) % 4,
  );

  const base64 = (
    base64String + padding
  )
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);

  const outputArray = new Uint8Array(
    rawData.length,
  );

  for (
    let index = 0;
    index < rawData.length;
    index += 1
  ) {
    outputArray[index] =
      rawData.charCodeAt(index);
  }

  return outputArray;
}

function getDeviceLabel(): string {
  const platform =
    navigator.platform?.trim() ||
    "Dispositivo";

  const mobile =
    /Android|iPhone|iPad|iPod/i.test(
      navigator.userAgent,
    );

  return mobile
    ? `Celular - ${platform}`
    : `Computador - ${platform}`;
}

async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration> {
  const existing =
    await navigator.serviceWorker.getRegistration(
      "/central/",
    );

  if (existing) {
    return existing;
  }

 const registration =
  await navigator.serviceWorker.register(
    "/central-sw.js?v=3",
    {
      scope: "/central/",
      updateViaCache: "none",
    },
  );

await registration.update();

  return navigator.serviceWorker.ready;
}

async function sendSubscriptionToServer(
  subscription: PushSubscription,
): Promise<void> {
  const serialized =
    subscription.toJSON();

  const response = await fetch(
    "/api/central/push/subscribe",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        subscription: serialized,
        label: getDeviceLabel(),
      }),
    },
  );

  const data =
    (await response.json()) as ApiResponse;

  if (!response.ok) {
    throw new Error(
      data.error ||
        "Não foi possível salvar a inscrição.",
    );
  }
}

async function deactivateSubscriptionOnServer(
  endpoint: string,
): Promise<void> {
  const response = await fetch(
    "/api/central/push/unsubscribe",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        endpoint,
      }),
    },
  );

  const data =
    (await response.json()) as ApiResponse;

  if (!response.ok) {
    throw new Error(
      data.error ||
        "Não foi possível desativar a inscrição.",
    );
  }
}

export default function PwaManager() {
  const [state, setState] =
    useState<PushState>("loading");

  const [working, setWorking] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const refreshState = useCallback(
    async () => {
      if (
        !("serviceWorker" in navigator) ||
        !("PushManager" in window) ||
        !("Notification" in window)
      ) {
        setState("unsupported");
        return;
      }

      if (
        Notification.permission ===
        "denied"
      ) {
        setState("blocked");
        return;
      }

      try {
        const registration =
          await getServiceWorkerRegistration();

        const subscription =
          await registration.pushManager
            .getSubscription();

        if (subscription) {
          /*
           * Garante que uma inscrição existente
           * também esteja ativa no banco.
           */
          await sendSubscriptionToServer(
            subscription,
          );

          setState("active");
        } else {
          setState("inactive");
        }
      } catch (error) {
        console.error(
          "Erro ao verificar inscrição push:",
          error,
        );

        setState("error");
      }
    },
    [],
  );

  useEffect(() => {
    void refreshState();
  }, [refreshState]);

  async function enablePush() {
    if (
      !("Notification" in window) ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ) {
      setState("unsupported");
      return;
    }

    try {
      setWorking(true);
      setMessage("");

      const permission =
        await Notification.requestPermission();

      if (permission === "denied") {
        setState("blocked");
        return;
      }

      if (permission !== "granted") {
        setState("inactive");

        setMessage(
          "A permissão de notificações não foi concedida.",
        );

        return;
      }

      const registration =
        await getServiceWorkerRegistration();

      let subscription =
        await registration.pushManager
          .getSubscription();

      if (!subscription) {
        const publicKeyResponse =
          await fetch(
            "/api/central/push/public-key",
            {
              cache: "no-store",
            },
          );

        const publicKeyData =
          (await publicKeyResponse.json()) as
            PublicKeyResponse;

        if (
          !publicKeyResponse.ok ||
          !publicKeyData.publicKey
        ) {
          throw new Error(
            publicKeyData.error ||
              "Chave pública VAPID indisponível.",
          );
        }

        subscription =
          await registration.pushManager.subscribe({
            userVisibleOnly: true,

            applicationServerKey:
              urlBase64ToUint8Array(
                publicKeyData.publicKey,
              ),
          });
      }

      await sendSubscriptionToServer(
        subscription,
      );

      setState("active");

      setMessage(
        "Este dispositivo receberá as notificações da Central.",
      );

      await registration.showNotification(
        "Notificações ativadas",
        {
          body:
            "Este dispositivo foi conectado à Central Operacional.",

          icon: "/icons/central-192.png",
          badge: "/icons/central-192.png",

          tag: "central-push-enabled",

          data: {
            url: "/central/checkouts",
          },
        },
      );
    } catch (error) {
      console.error(
        "Erro ao ativar Web Push:",
        error,
      );

      setState("error");

      setMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível ativar as notificações.",
      );
    } finally {
      setWorking(false);
    }
  }

  async function disablePush() {
    try {
      setWorking(true);
      setMessage("");

      const registration =
        await getServiceWorkerRegistration();

      const subscription =
        await registration.pushManager
          .getSubscription();

      if (!subscription) {
        setState("inactive");

        setMessage(
          "Este dispositivo já estava desativado.",
        );

        return;
      }

      const endpoint =
        subscription.endpoint;

      /*
       * Primeiro desativamos no banco.
       * Depois cancelamos no serviço push.
       */
      await deactivateSubscriptionOnServer(
        endpoint,
      );

      const unsubscribed =
        await subscription.unsubscribe();

      if (!unsubscribed) {
        throw new Error(
          "O navegador não confirmou o cancelamento.",
        );
      }

      setState("inactive");

      setMessage(
        "Notificações desativadas neste dispositivo.",
      );
    } catch (error) {
      console.error(
        "Erro ao desativar Web Push:",
        error,
      );

      setState("error");

      setMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível desativar as notificações.",
      );
    } finally {
      setWorking(false);
    }
  }

  async function sendLocalTest() {
    try {
      setWorking(true);
      setMessage("");

      const registration =
        await getServiceWorkerRegistration();

      await registration.showNotification(
        "Teste da Central",
        {
          body:
            "As notificações estão funcionando neste dispositivo.",

          icon: "/icons/central-192.png",
          badge: "/icons/central-192.png",

          tag: `central-local-test-${Date.now()}`,

          data: {
            url: "/central/checkouts",
          },
        },
      );

      setMessage(
        "Notificação de teste enviada.",
      );
    } catch (error) {
      console.error(
        "Erro ao testar notificação:",
        error,
      );

      setMessage(
        "Não foi possível exibir a notificação de teste.",
      );
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <div className="flex flex-wrap items-center gap-2">
        {state === "loading" && (
          <StatusBadge>
            Preparando notificações...
          </StatusBadge>
        )}

        {state === "unsupported" && (
          <StatusBadge variant="neutral">
            Notificações não suportadas
          </StatusBadge>
        )}

        {state === "blocked" && (
          <StatusBadge variant="error">
            Notificações bloqueadas
          </StatusBadge>
        )}

        {state === "inactive" && (
          <button
            type="button"
            onClick={() =>
              void enablePush()
            }
            disabled={working}
            className="rounded-lg border border-amber-800 bg-amber-950 px-3 py-2 text-xs font-semibold text-amber-300 transition hover:bg-amber-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {working
              ? "Ativando..."
              : "Ativar notificações"}
          </button>
        )}

        {state === "active" && (
          <>
            <StatusBadge variant="success">
              Push ativo
            </StatusBadge>

            <button
              type="button"
              onClick={() =>
                void sendLocalTest()
              }
              disabled={working}
              className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs font-semibold text-neutral-300 transition hover:bg-neutral-800 disabled:opacity-60"
            >
              Testar
            </button>

            <button
              type="button"
              onClick={() =>
                void disablePush()
              }
              disabled={working}
              className="rounded-lg border border-red-900 bg-red-950/60 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-950 disabled:opacity-60"
            >
              {working
                ? "Desativando..."
                : "Desativar"}
            </button>
          </>
        )}

        {state === "error" && (
          <>
            <StatusBadge variant="error">
              Erro nas notificações
            </StatusBadge>

            <button
              type="button"
              onClick={() =>
                void refreshState()
              }
              disabled={working}
              className="rounded-lg border border-neutral-700 px-3 py-2 text-xs font-semibold text-neutral-300 hover:bg-neutral-800 disabled:opacity-60"
            >
              Tentar novamente
            </button>
          </>
        )}
      </div>

      {message && (
        <p className="max-w-sm text-xs leading-5 text-neutral-500">
          {message}
        </p>
      )}
    </div>
  );
}

interface StatusBadgeProps {
  variant?:
    | "neutral"
    | "success"
    | "error";

  children: React.ReactNode;
}

function StatusBadge({
  variant = "neutral",
  children,
}: StatusBadgeProps) {
  const styles = {
    neutral:
      "border-neutral-700 bg-neutral-950 text-neutral-400",

    success:
      "border-emerald-800 bg-emerald-950 text-emerald-300",

    error:
      "border-red-900 bg-red-950 text-red-300",
  };

  return (
    <span
      className={`rounded-lg border px-3 py-2 text-xs font-semibold ${styles[variant]}`}
    >
      {children}
    </span>
  );
}