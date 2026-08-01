"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { useRouter } from "next/navigation";

type CheckoutEventType =
  | "created"
  | "updated"
  | "payment_approved"
  | "payment_changed"
  | "order_linked"
  | "status_changed";

interface DetectedCheckoutEvent {
  id: string;
  checkoutLeadId: string;
  eventType: CheckoutEventType;
  customerName: string;
  phone: string;
  checkoutUpdatedAt: string;
  createdAt: string;
}

interface EventsResponse {
  initialized?: boolean;
  events?: DetectedCheckoutEvent[];
  error?: string;
}

interface VisibleAlert {
  id: string;
  title: string;
  description: string;
}

const CHECK_INTERVAL_MS = 10_000;

function getEventText(
  event: DetectedCheckoutEvent,
): {
  title: string;
  description: string;
} {
  const name =
    event.customerName.trim() ||
    "Cliente";

  switch (event.eventType) {
    case "created":
      return {
        title: "Novo checkout",
        description: `${name} iniciou um checkout.`,
      };

    case "payment_approved":
      return {
        title: "Pagamento aprovado",
        description: `${name} concluiu o pagamento.`,
      };

    case "payment_changed":
      return {
        title: "Pagamento atualizado",
        description: `O pagamento de ${name} foi alterado.`,
      };

    case "order_linked":
      return {
        title: "Pedido vinculado",
        description: `${name} recebeu um pedido da Kiwify.`,
      };

    case "status_changed":
      return {
        title: "Status atualizado",
        description: `O checkout de ${name} mudou de status.`,
      };

    default:
      return {
        title: "Checkout atualizado",
        description: `${name} realizou uma nova ação no checkout.`,
      };
  }
}

function playNotificationSound() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (
        window as typeof window & {
          webkitAudioContext?: typeof AudioContext;
        }
      ).webkitAudioContext;

    if (!AudioContextClass) {
      return;
    }

    const context = new AudioContextClass();
    const oscillator =
      context.createOscillator();
    const gain = context.createGain();

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.frequency.value = 880;
    gain.gain.value = 0.08;

    oscillator.start();

    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      context.currentTime + 0.35,
    );

    oscillator.stop(
      context.currentTime + 0.35,
    );
  } catch {
    // Alguns navegadores bloqueiam áudio
    // antes da primeira interação do usuário.
  }
}

function showBrowserNotification(
  title: string,
  description: string,
) {
  if (
    !("Notification" in window) ||
    Notification.permission !== "granted"
  ) {
    return;
  }

  new Notification(title, {
    body: description,
    tag: `checkout-${Date.now()}`,
  });
}

export default function CheckoutEventWatcher() {
  const router = useRouter();

  const [alert, setAlert] =
    useState<VisibleAlert | null>(null);

  const [checking, setChecking] =
    useState(false);

  const requestInProgress = useRef(false);
  const alertTimeout = useRef<number | null>(null);

  const showAlert = useCallback(
    (event: DetectedCheckoutEvent) => {
      const text = getEventText(event);

      setAlert({
        id: event.id,
        title: text.title,
        description: text.description,
      });

      playNotificationSound();

      showBrowserNotification(
        text.title,
        text.description,
      );

      if (alertTimeout.current) {
        window.clearTimeout(
          alertTimeout.current,
        );
      }

      alertTimeout.current =
        window.setTimeout(() => {
          setAlert(null);
        }, 8_000);
    },
    [],
  );

  const checkEvents = useCallback(async () => {
    if (requestInProgress.current) {
      return;
    }

    requestInProgress.current = true;
    setChecking(true);

    try {
      const response = await fetch(
        "/api/central/events/check",
        {
          method: "POST",
          cache: "no-store",
        },
      );

      const data =
        (await response.json()) as EventsResponse;

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Não foi possível verificar eventos.",
        );
      }

      const events = data.events ?? [];

      if (events.length > 0) {
        /*
         * Atualiza os dados exibidos pelo Server
         * Component sem recarregar a página inteira.
         */
        router.refresh();

        /*
         * Exibe primeiro o evento mais recente.
         */
        const newestEvent =
          events[events.length - 1];

        showAlert(newestEvent);
      }
    } catch (error) {
      console.error(
        "Erro no monitor de checkouts:",
        error,
      );
    } finally {
      requestInProgress.current = false;
      setChecking(false);
    }
  }, [router, showAlert]);

  useEffect(() => {
    void checkEvents();

    const interval = window.setInterval(
      () => {
        void checkEvents();
      },
      CHECK_INTERVAL_MS,
    );

    return () => {
      window.clearInterval(interval);

      if (alertTimeout.current) {
        window.clearTimeout(
          alertTimeout.current,
        );
      }
    };
  }, [checkEvents]);

  return (
    <>
      <div className="fixed bottom-4 left-4 z-[80] hidden rounded-full border border-neutral-800 bg-neutral-950/90 px-3 py-2 text-xs text-neutral-500 shadow-lg backdrop-blur sm:block">
        {checking
          ? "Verificando checkouts..."
          : "Monitor em tempo real ativo"}
      </div>

      {alert && (
        <div className="fixed right-4 top-4 z-[150] w-[calc(100%-2rem)] max-w-sm rounded-2xl border border-emerald-800 bg-neutral-950 p-5 shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">
                Nova atividade
              </p>

              <h3 className="mt-2 text-lg font-bold text-white">
                {alert.title}
              </h3>

              <p className="mt-1 text-sm leading-6 text-neutral-400">
                {alert.description}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setAlert(null)}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-white"
              aria-label="Fechar alerta"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}