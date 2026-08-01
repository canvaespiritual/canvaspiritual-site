"use client";

import type { CheckoutLead } from "@/types/checkout";

interface CheckoutTableProps {
  checkouts: CheckoutLead[];
  onOpenCheckout: (checkout: CheckoutLead) => void;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "medium",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value));
}

function getSourceLabel(source: string | null): string {
  const normalized = source?.trim().toLowerCase();

  if (normalized === "ig") {
    return "Instagram";
  }

  if (normalized === "fb") {
    return "Facebook";
  }

  return source?.trim() || "—";
}

export default function CheckoutTable({
  checkouts,
  onOpenCheckout,
}: CheckoutTableProps) {
  if (checkouts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-700 bg-neutral-900 px-6 py-16 text-center">
        <h3 className="text-lg font-semibold text-white">
          Nenhum checkout encontrado
        </h3>

        <p className="mt-2 text-sm text-neutral-500">
          Altere os filtros ou tente buscar outro contato.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop */}
      <section className="hidden overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 md:block">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead className="bg-neutral-900">
              <tr>
                <TableHeader>Lead</TableHeader>
                <TableHeader>Campanha</TableHeader>
                <TableHeader>Origem</TableHeader>
                <TableHeader>Entrada</TableHeader>
                <TableHeader>Pagamento</TableHeader>
                <TableHeader>Ação</TableHeader>
              </tr>
            </thead>

            <tbody>
              {checkouts.map((checkout) => (
                <tr
                  key={checkout.id}
                  className="border-t border-neutral-800 transition hover:bg-neutral-900/70"
                >
                  <td className="px-4 py-4">
                    <div className="min-w-56">
                      <p className="font-semibold text-white">
                        {checkout.name}
                      </p>

                      <p className="mt-1 text-xs text-neutral-500">
                        {checkout.phone}
                      </p>

                      <p className="mt-1 max-w-64 truncate text-xs text-neutral-600">
                        {checkout.email}
                      </p>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div className="min-w-48">
                      <p className="max-w-64 truncate text-sm font-medium text-neutral-200">
                        {checkout.campaignDisplayName ??
                          "Não identificada"}
                      </p>

                      {checkout.campaignName &&
                        checkout.campaignId && (
                          <p className="mt-1 text-xs text-neutral-600">
                            ID {checkout.campaignId}
                          </p>
                        )}
                    </div>
                  </td>

                  <td className="px-4 py-4 text-sm text-neutral-300">
                    {getSourceLabel(checkout.utmSource)}
                  </td>

                  <td className="px-4 py-4 text-sm text-neutral-300">
                    {formatDate(checkout.createdAt)}
                  </td>

                  <td className="px-4 py-4">
                    <PaymentBadge paid={checkout.paid} />
                  </td>

                  <td className="px-4 py-4">
                    <button
                      type="button"
                      onClick={() =>
                        onOpenCheckout(checkout)
                      }
                      className="rounded-lg border border-neutral-700 px-3 py-2 text-xs font-semibold text-white transition hover:border-neutral-500 hover:bg-neutral-800"
                    >
                      Abrir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Celular / PWA */}
      <section className="grid gap-3 md:hidden">
        {checkouts.map((checkout) => (
          <button
            key={checkout.id}
            type="button"
            onClick={() => onOpenCheckout(checkout)}
            className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 text-left transition active:scale-[0.99]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate font-semibold text-white">
                  {checkout.name}
                </p>

                <p className="mt-1 text-sm text-neutral-500">
                  {getSourceLabel(checkout.utmSource)}
                </p>
              </div>

              <PaymentBadge paid={checkout.paid} />
            </div>

            <p className="mt-4 line-clamp-2 text-sm font-medium text-neutral-300">
              {checkout.campaignDisplayName ??
                "Campanha não identificada"}
            </p>

            <div className="mt-4 flex items-center justify-between gap-3 border-t border-neutral-800 pt-3">
              <span className="text-xs text-neutral-500">
                {formatDate(checkout.createdAt)}
              </span>

              <span className="text-xs font-semibold text-neutral-300">
                Ver detalhes →
              </span>
            </div>
          </button>
        ))}
      </section>
    </>
  );
}

function TableHeader({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
      {children}
    </th>
  );
}

function PaymentBadge({
  paid,
}: {
  paid: boolean;
}) {
  return paid ? (
    <span className="inline-flex rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-400">
      Pago
    </span>
  ) : (
    <span className="inline-flex rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-400">
      Pendente
    </span>
  );
}