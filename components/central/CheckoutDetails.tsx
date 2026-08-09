"use client";

import {
  useEffect,
  useState,
} from "react";

import type { CheckoutLead } from "@/types/checkout";
import ManualSaleForm from "./ManualSaleForm";

interface CheckoutDetailsProps {
  checkout: CheckoutLead | null;
  onClose: () => void;
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value));
}

function createWhatsAppUrl(
  phoneValue: string,
  message: string,
): string {
  const phone = normalizePhone(phoneValue);

  if (!phone) {
    return "";
  }

  return `https://wa.me/${phone}?text=${encodeURIComponent(
    message,
  )}`;
}

export default function CheckoutDetails({
  checkout,
  onClose,
}: CheckoutDetailsProps) {
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setMessage(checkout?.message?.content ?? "");
    setCopied(false);
  }, [checkout]);

  if (!checkout) {
    return null;
  }

  const whatsappUrl = createWhatsAppUrl(
    checkout.phone,
    message,
  );

  async function handleCopyMessage() {
    if (!message.trim()) {
      window.alert(
        "Não há nenhuma mensagem para copiar.",
      );

      return;
    }

    try {
      await navigator.clipboard.writeText(message);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      window.alert(
        "Não foi possível copiar a mensagem.",
      );
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex justify-end bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Detalhes do checkout"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <aside className="h-full w-full max-w-xl overflow-y-auto border-l border-neutral-800 bg-neutral-950 shadow-2xl">
        <header className="sticky top-0 z-10 flex items-start justify-between gap-5 border-b border-neutral-800 bg-neutral-950/95 px-5 py-5 backdrop-blur sm:px-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Detalhes do checkout
            </p>

            <h2 className="mt-2 text-2xl font-bold text-white">
              {checkout.name}
            </h2>

            <p className="mt-1 text-sm text-neutral-500">
              Recebido em{" "}
              {formatDate(checkout.createdAt)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-neutral-700 text-xl text-neutral-300 transition hover:bg-neutral-800 hover:text-white"
            aria-label="Fechar detalhes"
          >
            ×
          </button>
        </header>

        <div className="space-y-6 p-5 sm:p-7">
          <section className="grid gap-3 sm:grid-cols-2">
            <InformationCard
              label="Pagamento"
              value={
                checkout.paid
                  ? "Pago"
                  : "Pendente"
              }
              highlighted={checkout.paid}
            />

            <InformationCard
              label="Status"
              value={
                checkout.kiwifyStatus ??
                checkout.status
              }
            />
          </section>
          {checkout.sale && (
  <DetailsSection title="Venda">
    <DetailItem
      label="Origem da venda"
      value={
        checkout.sale.source === "manual"
          ? "Recuperação manual"
          : "Kiwify"
      }
    />

    <DetailItem
      label="Produto"
      value={
        checkout.sale.productName ??
        "Não informado"
      }
    />

    <DetailItem
      label="Valor bruto"
      value={
        checkout.sale.grossAmount != null
          ? checkout.sale.grossAmount.toLocaleString(
              "pt-BR",
              {
                style: "currency",
                currency:
                  checkout.sale.currency ||
                  "BRL",
              },
            )
          : "Não informado"
      }
    />

    <DetailItem
      label="Valor líquido"
      value={
        checkout.sale.netAmount != null
          ? checkout.sale.netAmount.toLocaleString(
              "pt-BR",
              {
                style: "currency",
                currency:
                  checkout.sale.currency ||
                  "BRL",
              },
            )
          : "Não informado"
      }
    />

    <DetailItem
      label="Forma de pagamento"
      value={
        checkout.sale.paymentMethod ??
        "Não informada"
      }
    />

    <DetailItem
      label="Parcelas"
      value={String(
        checkout.sale.installments,
      )}
    />

    <DetailItem
      label="Data da venda"
      value={formatDate(
        checkout.sale.saleDate,
      )}
    />

    {checkout.sale.kiwifyFee != null && (
      <DetailItem
        label="Taxa Kiwify"
        value={checkout.sale.kiwifyFee.toLocaleString(
          "pt-BR",
          {
            style: "currency",
            currency:
              checkout.sale.currency ||
              "BRL",
          },
        )}
      />
    )}

    {checkout.sale.closerName && (
      <DetailItem
        label="Closer"
        value={checkout.sale.closerName}
      />
    )}
  </DetailsSection>
  
)}

          <DetailsSection title="Contato">
            <DetailItem
              label="Telefone"
              value={
                checkout.phone ||
                "Não informado"
              }
            />

            <DetailItem
              label="E-mail"
              value={
                checkout.email ||
                "Não informado"
              }
            />
          </DetailsSection>

          <DetailsSection title="Origem">
            <DetailItem
              label="Campanha"
              value={
                checkout.campaignDisplayName ??
                checkout.campaignName ??
                checkout.campaignId ??
                "Não identificada"
              }
              secondaryValue={
                checkout.campaignId
              }
            />

            <DetailItem
              label="Conjunto"
              value={
                checkout.adsetDisplayName ??
                checkout.adsetName ??
                checkout.adsetId ??
                "Não identificado"
              }
              secondaryValue={
                checkout.adsetId
              }
            />

            <DetailItem
              label="Anúncio / criativo"
              value={
                checkout.adDisplayName ??
                checkout.adName ??
                checkout.adId ??
                "Não identificado"
              }
              secondaryValue={checkout.adId}
            />

            <DetailItem
              label="Origem"
              value={
                checkout.utmSource ??
                "Não informada"
              }
            />

            <DetailItem
              label="Meio"
              value={
                checkout.utmMedium ??
                "Não informado"
              }
            />
          </DetailsSection>

          <DetailsSection title="Registro">
            <DetailItem
              label="ID do lead"
              value={checkout.id}
            />

            <DetailItem
              label="ID do pedido Kiwify"
              value={
                checkout.kiwifyOrderId ??
                "Ainda não vinculado"
              }
            />

            <DetailItem
              label="Criado em"
              value={formatDate(
                checkout.createdAt,
              )}
            />

            <DetailItem
              label="Atualizado em"
              value={formatDate(
                checkout.updatedAt,
              )}
            />

            {checkout.paidAt && (
              <DetailItem
                label="Pagamento identificado em"
                value={formatDate(
                  checkout.paidAt,
                )}
              />
            )}
          </DetailsSection>
          {!checkout.sale && (
  <ManualSaleForm
    checkout={checkout}
    onSaved={() => {
      window.location.reload();
    }}
  />
)}

          {(checkout.pageUrl ||
            checkout.referrer) && (
            <DetailsSection title="Navegação">
              {checkout.pageUrl && (
                <LinkDetail
                  label="Página de origem"
                  href={checkout.pageUrl}
                />
              )}
              {checkout.sale?.checkoutUrl && (
  <LinkDetail
    label="Reenviar pagamento"
    href={checkout.sale.checkoutUrl}
  />
)}

{checkout.sale?.accessUrl && (
  <LinkDetail
    label="Acesso ao produto"
    href={checkout.sale.accessUrl}
  />
)}
              {checkout.referrer && (
                <LinkDetail
                  label="Referência"
                  href={checkout.referrer}
                />
              )}
            </DetailsSection>
          )}

          <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">
                  Mensagem de atendimento
                </h3>

                <p className="mt-1 text-sm text-neutral-500">
                  Você pode editar o texto antes de
                  abrir o WhatsApp.
                </p>
              </div>

              {checkout.message?.templateName && (
                <span className="w-fit rounded-full border border-neutral-700 bg-neutral-950 px-3 py-1 text-xs font-semibold text-neutral-400">
                  {
                    checkout.message
                      .templateName
                  }
                </span>
              )}
            </div>

            <textarea
              value={message}
              onChange={(event) => {
                setMessage(event.target.value);
                setCopied(false);
              }}
              rows={10}
              placeholder="Nenhuma mensagem foi configurada para este tipo de checkout."
              className="mt-4 min-h-56 w-full resize-y rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-sm leading-6 text-neutral-300 outline-none transition placeholder:text-neutral-600 focus:border-emerald-700"
            />

            {checkout.message?.senderName && (
              <p className="mt-2 text-xs text-neutral-600">
                Atendente configurado:{" "}
                {
                  checkout.message
                    .senderName
                }
              </p>
            )}

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() =>
                  void handleCopyMessage()
                }
                disabled={!message.trim()}
                className="rounded-xl border border-neutral-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {copied
                  ? "Mensagem copiada"
                  : "Copiar mensagem"}
              </button>

              {whatsappUrl &&
              message.trim() ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
                >
                  Abrir WhatsApp
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="cursor-not-allowed rounded-xl bg-neutral-800 px-4 py-3 text-sm font-semibold text-neutral-500"
                >
                  {!normalizePhone(
                    checkout.phone,
                  )
                    ? "Telefone inválido"
                    : "Mensagem vazia"}
                </button>
              )}
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}

interface DetailsSectionProps {
  title: string;
  children: React.ReactNode;
}

function DetailsSection({
  title,
  children,
}: DetailsSectionProps) {
  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.17em] text-neutral-500">
        {title}
      </h3>

      <div className="space-y-4">
        {children}
      </div>
    </section>
  );
}

interface DetailItemProps {
  label: string;
  value: string;
  secondaryValue?: string | null;
}

function DetailItem({
  label,
  value,
  secondaryValue,
}: DetailItemProps) {
  const showSecondaryValue =
    secondaryValue &&
    secondaryValue !== value;

  return (
    <div>
      <p className="text-xs font-medium text-neutral-500">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-medium text-neutral-200">
        {value}
      </p>

      {showSecondaryValue && (
        <p className="mt-1 break-all font-mono text-xs text-neutral-600">
          ID: {secondaryValue}
        </p>
      )}
    </div>
  );
}

interface LinkDetailProps {
  label: string;
  href: string;
}

function LinkDetail({
  label,
  href,
}: LinkDetailProps) {
  return (
    <div>
      <p className="text-xs font-medium text-neutral-500">
        {label}
      </p>

      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="mt-1 block break-all text-sm font-medium text-blue-400 hover:underline"
      >
        {href}
      </a>
    </div>
  );
}

interface InformationCardProps {
  label: string;
  value: string;
  highlighted?: boolean;
}

function InformationCard({
  label,
  value,
  highlighted = false,
}: InformationCardProps) {
  return (
    <article className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
        {label}
      </p>

      <strong
        className={`mt-2 block text-lg ${
          highlighted
            ? "text-emerald-400"
            : "text-white"
        }`}
      >
        {value}
      </strong>
    </article>
  );
}