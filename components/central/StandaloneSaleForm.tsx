"use client";

import {
  useMemo,
  useState,
} from "react";

type PaymentMethod =
  | "pix"
  | "boleto"
  | "credit_card"
  | "bank_transfer"
  | "other";

interface ManualInstallment {
  installmentNumber: number;
  amount: string;
  dueDate: string;
  status:
    | "pending"
    | "paid";
  paymentMethod: PaymentMethod;
}

interface StandaloneSaleFormProps {
  onSaved?: () => void;
  onCancel?: () => void;
}

function todayForInput(): string {
  const now = new Date();

  const offset =
    now.getTimezoneOffset() * 60_000;

  return new Date(
    now.getTime() - offset,
  )
    .toISOString()
    .slice(0, 16);
}

function parseMoney(
  value: string,
): number {
  if (!value.trim()) {
    return 0;
  }

  const normalized = value
    .replace(/\./g, "")
    .replace(",", ".");

  const parsed = Number(normalized);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

function formatMoney(
  value: number,
): string {
  return value.toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    },
  );
}

export default function StandaloneSaleForm({
  onSaved,
  onCancel,
}: StandaloneSaleFormProps) {
  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [grossAmount, setGrossAmount] =
    useState("");

  const [netAmount, setNetAmount] =
    useState("");

  const [
    paymentMethod,
    setPaymentMethod,
  ] = useState<PaymentMethod>("pix");

  const [saleDate, setSaleDate] =
    useState(todayForInput());

  const [closerName, setCloserName] =
    useState("Lucas");

  const [productName, setProductName] =
    useState(
      "Travessia - Canva Espiritual",
    );

  const [notes, setNotes] =
    useState("");

  const [
    hasInstallments,
    setHasInstallments,
  ] = useState(false);

  const [
    installments,
    setInstallments,
  ] = useState<ManualInstallment[]>([]);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState(false);

  const grossAmountNumber = useMemo(
    () => parseMoney(grossAmount),
    [grossAmount],
  );

  const netAmountNumber = useMemo(
    () =>
      netAmount.trim()
        ? parseMoney(netAmount)
        : grossAmountNumber,
    [
      netAmount,
      grossAmountNumber,
    ],
  );

  const installmentsTotal =
    useMemo(
      () =>
        installments.reduce(
          (total, installment) =>
            total +
            parseMoney(
              installment.amount,
            ),
          0,
        ),
      [installments],
    );

  function addInstallment() {
    setInstallments((current) => [
      ...current,
      {
        installmentNumber:
          current.length + 1,
        amount: "",
        dueDate: "",
        status:
          current.length === 0
            ? "paid"
            : "pending",
        paymentMethod,
      },
    ]);
  }

  function removeInstallment(
    index: number,
  ) {
    setInstallments((current) =>
      current
        .filter(
          (_, currentIndex) =>
            currentIndex !== index,
        )
        .map(
          (
            installment,
            currentIndex,
          ) => ({
            ...installment,
            installmentNumber:
              currentIndex + 1,
          }),
        ),
    );
  }

  function updateInstallment(
    index: number,
    changes: Partial<ManualInstallment>,
  ) {
    setInstallments((current) =>
      current.map(
        (
          installment,
          currentIndex,
        ) =>
          currentIndex === index
            ? {
                ...installment,
                ...changes,
              }
            : installment,
      ),
    );
  }

  async function handleSubmit(
    event: React.FormEvent,
  ) {
    event.preventDefault();

    setError("");
    setSuccess(false);

    if (!name.trim()) {
      setError(
        "Informe o nome do cliente.",
      );
      return;
    }

    if (!email.trim()) {
      setError(
        "Informe o e-mail do cliente.",
      );
      return;
    }

    if (!phone.trim()) {
      setError(
        "Informe o telefone do cliente.",
      );
      return;
    }

    if (
      !grossAmountNumber ||
      grossAmountNumber <= 0
    ) {
      setError(
        "Informe o valor da venda.",
      );
      return;
    }

    if (!saleDate) {
      setError(
        "Informe a data da venda.",
      );
      return;
    }

    if (
      hasInstallments &&
      installments.length === 0
    ) {
      setError(
        "Cadastre pelo menos uma parcela.",
      );
      return;
    }

    if (hasInstallments) {
      const invalidInstallment =
        installments.some(
          (installment) =>
            !installment.amount ||
            !installment.dueDate ||
            parseMoney(
              installment.amount,
            ) <= 0,
        );

      if (invalidInstallment) {
        setError(
          "Preencha valor e vencimento de todas as parcelas.",
        );
        return;
      }
    }

    setSaving(true);

    try {
      const response = await fetch(
        "/api/central/sales/manual",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            name:
              name.trim(),

            email:
              email.trim(),

            phone:
              phone.trim(),

            grossAmount:
              grossAmountNumber,

            netAmount:
              netAmountNumber,

            saleDate:
              new Date(
                saleDate,
              ).toISOString(),

            paymentMethod,

            installmentsCount:
              hasInstallments
                ? installments.length
                : 1,

            closerName:
              closerName.trim() ||
              null,

            notes:
              notes.trim() ||
              null,

            productName:
              productName.trim() ||
              null,

            installments:
              hasInstallments
                ? installments.map(
                    (installment) => ({
                      installmentNumber:
                        installment.installmentNumber,

                      amount:
                        parseMoney(
                          installment.amount,
                        ),

                      dueDate:
                        installment.dueDate,

                      status:
                        installment.status,

                      paymentMethod:
                        installment.paymentMethod,
                    }),
                  )
                : [],
          }),
        },
      );

      const result =
        (await response.json()) as {
          ok?: boolean;
          error?: string;
        };

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Não foi possível registrar a venda.",
        );
      }

      setSuccess(true);

      onSaved?.();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível registrar a venda.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-2xl border border-emerald-900/60 bg-emerald-950/20 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-white">
            Cadastrar venda avulsa
          </h3>

          <p className="mt-1 text-sm text-neutral-500">
            Use para vendas feitas fora do fluxo de checkout.
          </p>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-neutral-700 px-3 py-2 text-xs font-semibold text-neutral-300 transition hover:bg-neutral-800 hover:text-white"
          >
            Fechar
          </button>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-5 space-y-5"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome do cliente">
            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value,
                )
              }
              placeholder="Nome completo"
              className="input-central"
            />
          </Field>

          <Field label="E-mail">
            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value,
                )
              }
              placeholder="cliente@email.com"
              className="input-central"
            />
          </Field>

          <Field label="Telefone">
            <input
              type="text"
              value={phone}
              onChange={(event) =>
                setPhone(
                  event.target.value,
                )
              }
              placeholder="5521999999999"
              className="input-central"
            />
          </Field>

          <Field label="Produto">
            <input
              type="text"
              value={productName}
              onChange={(event) =>
                setProductName(
                  event.target.value,
                )
              }
              className="input-central"
            />
          </Field>

          <Field label="Valor da venda">
            <input
              type="text"
              inputMode="decimal"
              value={grossAmount}
              onChange={(event) =>
                setGrossAmount(
                  event.target.value,
                )
              }
              placeholder="360,00"
              className="input-central"
            />
          </Field>

          <Field label="Valor líquido">
            <input
              type="text"
              inputMode="decimal"
              value={netAmount}
              onChange={(event) =>
                setNetAmount(
                  event.target.value,
                )
              }
              placeholder={
                grossAmount ||
                "Mesmo valor da venda"
              }
              className="input-central"
            />
          </Field>

          <Field label="Forma de pagamento">
            <select
              value={paymentMethod}
              onChange={(event) =>
                setPaymentMethod(
                  event.target
                    .value as PaymentMethod,
                )
              }
              className="input-central"
            >
              <option value="pix">
                PIX
              </option>

              <option value="boleto">
                Boleto
              </option>

              <option value="credit_card">
                Cartão
              </option>

              <option value="bank_transfer">
                Transferência
              </option>

              <option value="other">
                Outro
              </option>
            </select>
          </Field>

          <Field label="Data da venda">
            <input
              type="datetime-local"
              value={saleDate}
              onChange={(event) =>
                setSaleDate(
                  event.target.value,
                )
              }
              className="input-central"
            />
          </Field>

          <Field label="Closer">
            <input
              type="text"
              value={closerName}
              onChange={(event) =>
                setCloserName(
                  event.target.value,
                )
              }
              placeholder="Lucas"
              className="input-central"
            />
          </Field>
        </div>

        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-950 p-4">
          <input
            type="checkbox"
            checked={hasInstallments}
            onChange={(event) => {
              const checked =
                event.target.checked;

              setHasInstallments(
                checked,
              );

              if (
                checked &&
                installments.length === 0
              ) {
                addInstallment();
              }
            }}
          />

          <span className="text-sm font-medium text-neutral-300">
            Venda com cobranças /
            parcelas manuais
          </span>
        </label>

        {hasInstallments && (
          <div className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-950 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">
                  Parcelas
                </p>

                <p className="mt-1 text-xs text-neutral-500">
                  Total cadastrado:{" "}
                  {formatMoney(
                    installmentsTotal,
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={addInstallment}
                className="rounded-lg border border-neutral-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-neutral-800"
              >
                + Parcela
              </button>
            </div>

            {installments.map(
              (
                installment,
                index,
              ) => (
                <div
                  key={
                    installment.installmentNumber
                  }
                  className="rounded-xl border border-neutral-800 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <strong className="text-sm text-white">
                      Parcela{" "}
                      {
                        installment.installmentNumber
                      }
                    </strong>

                    <button
                      type="button"
                      onClick={() =>
                        removeInstallment(
                          index,
                        )
                      }
                      className="text-xs font-semibold text-red-400 hover:text-red-300"
                    >
                      Remover
                    </button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Valor">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={
                          installment.amount
                        }
                        onChange={(
                          event,
                        ) =>
                          updateInstallment(
                            index,
                            {
                              amount:
                                event
                                  .target
                                  .value,
                            },
                          )
                        }
                        placeholder="120,00"
                        className="input-central"
                      />
                    </Field>

                    <Field label="Vencimento">
                      <input
                        type="date"
                        value={
                          installment.dueDate
                        }
                        onChange={(
                          event,
                        ) =>
                          updateInstallment(
                            index,
                            {
                              dueDate:
                                event
                                  .target
                                  .value,
                            },
                          )
                        }
                        className="input-central"
                      />
                    </Field>

                    <Field label="Status">
                      <select
                        value={
                          installment.status
                        }
                        onChange={(
                          event,
                        ) =>
                          updateInstallment(
                            index,
                            {
                              status:
                                event
                                  .target
                                  .value as
                                  | "pending"
                                  | "paid",
                            },
                          )
                        }
                        className="input-central"
                      >
                        <option value="paid">
                          Paga
                        </option>

                        <option value="pending">
                          Pendente
                        </option>
                      </select>
                    </Field>

                    <Field label="Método">
                      <select
                        value={
                          installment.paymentMethod
                        }
                        onChange={(
                          event,
                        ) =>
                          updateInstallment(
                            index,
                            {
                              paymentMethod:
                                event
                                  .target
                                  .value as PaymentMethod,
                            },
                          )
                        }
                        className="input-central"
                      >
                        <option value="pix">
                          PIX
                        </option>

                        <option value="boleto">
                          Boleto
                        </option>

                        <option value="credit_card">
                          Cartão
                        </option>

                        <option value="bank_transfer">
                          Transferência
                        </option>

                        <option value="other">
                          Outro
                        </option>
                      </select>
                    </Field>
                  </div>
                </div>
              ),
            )}
          </div>
        )}

        <Field label="Observações">
          <textarea
            rows={3}
            value={notes}
            onChange={(event) =>
              setNotes(
                event.target.value,
              )
            }
            placeholder="Ex.: venda orgânica realizada pelo WhatsApp."
            className="input-central resize-y"
          />
        </Field>

        {error && (
          <p className="rounded-xl border border-red-900 bg-red-950/40 p-3 text-sm text-red-300">
            {error}
          </p>
        )}

        {success && (
          <p className="rounded-xl border border-emerald-800 bg-emerald-950/50 p-3 text-sm text-emerald-300">
            Venda avulsa registrada com sucesso.
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving
            ? "Registrando..."
            : "Registrar venda avulsa"}
        </button>
      </form>

      <style jsx>{`
        :global(.input-central) {
          width: 100%;
          border: 1px solid rgb(38 38 38);
          border-radius: 0.75rem;
          background: rgb(10 10 10);
          padding: 0.75rem;
          color: white;
          font-size: 0.875rem;
          outline: none;
        }

        :global(.input-central:focus) {
          border-color: rgb(4 120 87);
        }
      `}</style>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium text-neutral-500">
        {label}
      </span>

      {children}
    </label>
  );
}