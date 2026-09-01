"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

type Platform =
  | "google"
  | "meta";

type FinancialSummary = {
  sessions: number;
  plays: number;
  pitchReached: number;

  checkouts: number;

  sales: number;
  directSales: number;
  recoveredSales: number;

  netRevenue: number;
  directNetRevenue: number;
  recoveredNetRevenue: number;

  playRate: number;
  pitchRate: number;
  checkoutRate: number;
  checkoutConversionRate: number;

  averageNetTicket: number;

  valuePerSession: number;
  valuePerPlay: number;
  valuePerPitch: number;
  valuePerCheckout: number;
};

type FinancialCreativeRow =
  FinancialSummary & {
    source: string | null;

    campaignId: string | null;
    campaignDisplayName: string | null;

    adId: string | null;
    adDisplayName: string | null;
  };

type FinanceiroResponse = {
  ok: boolean;
  summary?: FinancialSummary;
  creatives?: FinancialCreativeRow[];
  error?: string;
};

type Simulation = {
  platform: Platform;
  spend: string;
};

const EMPTY_SUMMARY: FinancialSummary = {
  sessions: 0,
  plays: 0,
  pitchReached: 0,

  checkouts: 0,

  sales: 0,
  directSales: 0,
  recoveredSales: 0,

  netRevenue: 0,
  directNetRevenue: 0,
  recoveredNetRevenue: 0,

  playRate: 0,
  pitchRate: 0,
  checkoutRate: 0,
  checkoutConversionRate: 0,

  averageNetTicket: 0,

  valuePerSession: 0,
  valuePerPlay: 0,
  valuePerPitch: 0,
  valuePerCheckout: 0,
};

function money(
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

function percentage(
  value: number,
): string {
  return `${value.toFixed(1)}%`;
}

function number(
  value: number,
): string {
  return value.toLocaleString(
    "pt-BR",
  );
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

  const parsed =
    Number(normalized);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

function effectiveSpend(
  spend: number,
  platform: Platform,
): number {
  if (platform === "meta") {
    return spend * 1.1275;
  }

  return spend;
}

function divide(
  numerator: number,
  denominator: number,
): number {
  if (denominator <= 0) {
    return 0;
  }

  return numerator / denominator;
}

function getCreativeKey(
  row: FinancialCreativeRow,
): string {
  return [
    row.source ?? "sem-fonte",
    row.campaignId ?? "sem-campanha",
    row.adId ?? "sem-anuncio",
  ].join("::");
}

function platformFromSource(
  source: string | null,
): Platform {
  return source === "meta"
    ? "meta"
    : "google";
}

function getToday(): string {
  const date = new Date();

  const offset =
    date.getTimezoneOffset() *
    60_000;

  return new Date(
    date.getTime() - offset,
  )
    .toISOString()
    .slice(0, 10);
}

function getDaysAgo(
  days: number,
): string {
  const date = new Date();

  date.setDate(
    date.getDate() - days,
  );

  const offset =
    date.getTimezoneOffset() *
    60_000;

  return new Date(
    date.getTime() - offset,
  )
    .toISOString()
    .slice(0, 10);
}

export default function FinanceiroDashboard() {
  const [summary, setSummary] =
    useState<FinancialSummary>(
      EMPTY_SUMMARY,
    );

  const [
    creatives,
    setCreatives,
  ] = useState<
    FinancialCreativeRow[]
  >([]);

  const [
    dateFrom,
    setDateFrom,
  ] = useState(
    getDaysAgo(29),
  );

  const [
    dateTo,
    setDateTo,
  ] = useState(
    getToday(),
  );

  const [
    appliedDateFrom,
    setAppliedDateFrom,
  ] = useState(
    getDaysAgo(29),
  );

  const [
    appliedDateTo,
    setAppliedDateTo,
  ] = useState(
    getToday(),
  );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    generalPlatform,
    setGeneralPlatform,
  ] =
    useState<Platform>("google");

  const [
    generalSpend,
    setGeneralSpend,
  ] = useState("");

  const [
    creativeSimulations,
    setCreativeSimulations,
  ] = useState<
    Record<string, Simulation>
  >({});

  const loadData =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const params =
          new URLSearchParams();

        if (appliedDateFrom) {
          params.set(
            "date_from",
            `${appliedDateFrom}T00:00:00-03:00`,
          );
        }

        if (appliedDateTo) {
          params.set(
            "date_to",
            `${appliedDateTo}T23:59:59.999-03:00`,
          );
        }

        const response =
          await fetch(
            `/api/central/financeiro?${params.toString()}`,
            {
              cache: "no-store",
            },
          );

        const data =
          (await response.json()) as FinanceiroResponse;

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Não foi possível carregar o financeiro.",
          );
        }

        setSummary(
          data.summary ??
            EMPTY_SUMMARY,
        );

        setCreatives(
          data.creatives ?? [],
        );
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Não foi possível carregar o financeiro.",
        );
      } finally {
        setLoading(false);
      }
    }, [
      appliedDateFrom,
      appliedDateTo,
    ]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  function applyDateFilter() {
    setAppliedDateFrom(
      dateFrom,
    );

    setAppliedDateTo(
      dateTo,
    );

    /*
     * Muito importante:
     * mudou o período, zeramos toda
     * simulação manual de mídia.
     */
    setGeneralSpend("");

    setCreativeSimulations({});
  }

  function useQuickRange(
    days: number,
  ) {
    const from =
      getDaysAgo(days - 1);

    const to =
      getToday();

    setDateFrom(from);
    setDateTo(to);

    setAppliedDateFrom(from);
    setAppliedDateTo(to);

    setGeneralSpend("");
    setCreativeSimulations({});
  }

  const generalSimulation =
    useMemo(() => {
      const enteredSpend =
        parseMoney(
          generalSpend,
        );

      const realSpend =
        effectiveSpend(
          enteredSpend,
          generalPlatform,
        );

      return {
        enteredSpend,
        realSpend,

        costPerSession:
          divide(
            realSpend,
            summary.sessions,
          ),

        costPerPlay:
          divide(
            realSpend,
            summary.plays,
          ),

        costPerPitch:
          divide(
            realSpend,
            summary.pitchReached,
          ),

        costPerCheckout:
          divide(
            realSpend,
            summary.checkouts,
          ),

        costPerSale:
          divide(
            realSpend,
            summary.sales,
          ),

        roi:
          realSpend > 0
            ? summary.netRevenue /
              realSpend
            : 0,

        result:
          summary.netRevenue -
          realSpend,

        margin:
          summary.netRevenue > 0
            ? (
                (
                  summary.netRevenue -
                  realSpend
                ) /
                summary.netRevenue
              ) *
              100
            : 0,
      };
    }, [
      generalSpend,
      generalPlatform,
      summary,
    ]);

  function getSimulation(
    row: FinancialCreativeRow,
  ): Simulation {
    const key =
      getCreativeKey(row);

    return (
      creativeSimulations[
        key
      ] ?? {
        platform:
          platformFromSource(
            row.source,
          ),
        spend: "",
      }
    );
  }

  function updateSimulation(
    row: FinancialCreativeRow,
    changes: Partial<Simulation>,
  ) {
    const key =
      getCreativeKey(row);

    const current =
      getSimulation(row);

    setCreativeSimulations(
      (previous) => ({
        ...previous,

        [key]: {
          ...current,
          ...changes,
        },
      }),
    );
  }

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
          Unit Economics
        </p>

        <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
          Financeiro do Funil
        </h2>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-400">
          Descubra quanto cada sessão,
          play, pitch e checkout está
          efetivamente valendo para a
          operação.
        </p>
      </section>

      <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Data inicial">
              <input
                type="date"
                value={dateFrom}
                onChange={(
                  event,
                ) =>
                  setDateFrom(
                    event.target
                      .value,
                  )
                }
                className="input-financeiro"
              />
            </Field>

            <Field label="Data final">
              <input
                type="date"
                value={dateTo}
                onChange={(
                  event,
                ) =>
                  setDateTo(
                    event.target
                      .value,
                  )
                }
                className="input-financeiro"
              />
            </Field>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                useQuickRange(1)
              }
              className="button-secondary"
            >
              Hoje
            </button>

            <button
              type="button"
              onClick={() =>
                useQuickRange(7)
              }
              className="button-secondary"
            >
              7 dias
            </button>

            <button
              type="button"
              onClick={() =>
                useQuickRange(30)
              }
              className="button-secondary"
            >
              30 dias
            </button>

            <button
              type="button"
              onClick={
                applyDateFilter
              }
              className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-500"
            >
              Aplicar período
            </button>
          </div>
        </div>

        <p className="mt-4 text-xs text-neutral-500">
          Período analisado:{" "}
          <strong className="text-neutral-300">
            {appliedDateFrom}
          </strong>{" "}
          até{" "}
          <strong className="text-neutral-300">
            {appliedDateTo}
          </strong>
        </p>
      </section>

      {error && (
        <div className="rounded-xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-10 text-center text-neutral-500">
          Calculando financeiro...
        </div>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Receita líquida"
              value={money(
                summary.netRevenue,
              )}
              detail={`${summary.sales} venda(s)`}
            />

            <MetricCard
              label="Checkouts"
              value={number(
                summary.checkouts,
              )}
              detail={`${percentage(
                summary.checkoutConversionRate,
              )} viraram venda`}
            />

            <MetricCard
              label="Valor / Checkout"
              value={money(
                summary.valuePerCheckout,
              )}
              detail="Principal régua de monetização"
              important
            />

            <MetricCard
              label="Ticket líquido"
              value={money(
                summary.averageNetTicket,
              )}
              detail="Média por venda"
            />
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Sessões"
              value={number(
                summary.sessions,
              )}
              detail={`${money(
                summary.valuePerSession,
              )} por sessão`}
            />

            <MetricCard
              label="Plays"
              value={number(
                summary.plays,
              )}
              detail={`${percentage(
                summary.playRate,
              )} play rate • ${money(
                summary.valuePerPlay,
              )}/play`}
            />

            <MetricCard
              label="Pitch"
              value={number(
                summary.pitchReached,
              )}
              detail={`${percentage(
                summary.pitchRate,
              )} dos plays • ${money(
                summary.valuePerPitch,
              )}/pitch`}
            />

            <MetricCard
              label="Recuperações"
              value={number(
                summary.recoveredSales,
              )}
              detail={`${money(
                summary.recoveredNetRevenue,
              )} líquidos`}
            />
          </section>

          <section className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 lg:col-span-2">
              <h3 className="text-base font-semibold text-white">
                Composição da receita
              </h3>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <MiniMetric
                  label="Vendas diretas"
                  value={number(
                    summary.directSales,
                  )}
                  detail={money(
                    summary.directNetRevenue,
                  )}
                />

                <MiniMetric
                  label="Recuperadas"
                  value={number(
                    summary.recoveredSales,
                  )}
                  detail={money(
                    summary.recoveredNetRevenue,
                  )}
                />

                <MiniMetric
                  label="Conversão final"
                  value={percentage(
                    summary.checkoutConversionRate,
                  )}
                  detail={`${summary.sales}/${summary.checkouts} checkouts`}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-amber-900/60 bg-amber-950/20 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-amber-400">
                Break-even
              </p>

              <p className="mt-3 text-sm text-neutral-400">
                Custo real máximo por
                checkout:
              </p>

              <strong className="mt-1 block text-3xl text-white">
                {money(
                  summary.valuePerCheckout,
                )}
              </strong>

              <div className="mt-5 space-y-3 border-t border-amber-900/50 pt-4 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-neutral-500">
                    Google
                  </span>

                  <strong className="text-neutral-200">
                    {money(
                      summary.valuePerCheckout,
                    )}
                  </strong>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-neutral-500">
                    Meta no painel
                  </span>

                  <strong className="text-neutral-200">
                    {money(
                      summary.valuePerCheckout /
                        1.1275,
                    )}
                  </strong>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 sm:p-6">
            <div>
              <h3 className="text-lg font-semibold text-white">
                Simulação geral de mídia
              </h3>

              <p className="mt-1 text-sm text-neutral-500">
                O valor informado não é
                salvo. Ele serve apenas para
                calcular o período acima.
              </p>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field label="Plataforma">
                <select
                  value={
                    generalPlatform
                  }
                  onChange={(
                    event,
                  ) =>
                    setGeneralPlatform(
                      event.target
                        .value as Platform,
                    )
                  }
                  className="input-financeiro"
                >
                  <option value="google">
                    Google
                  </option>

                  <option value="meta">
                    Meta (+12,75%)
                  </option>
                </select>
              </Field>

              <Field label="Gasto exibido no painel">
                <input
                  type="text"
                  inputMode="decimal"
                  value={
                    generalSpend
                  }
                  onChange={(
                    event,
                  ) =>
                    setGeneralSpend(
                      event.target
                        .value,
                    )
                  }
                  placeholder="Ex.: 1.000,00"
                  className="input-financeiro"
                />
              </Field>
            </div>

            {generalSimulation.enteredSpend >
              0 && (
              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <MiniMetric
                  label="Custo real"
                  value={money(
                    generalSimulation.realSpend,
                  )}
                  detail={
                    generalPlatform ===
                    "meta"
                      ? "Inclui +12,75%"
                      : "Sem acréscimo"
                  }
                />

                <MiniMetric
                  label="Custo / Checkout"
                  value={money(
                    generalSimulation.costPerCheckout,
                  )}
                  detail={`Valor: ${money(
                    summary.valuePerCheckout,
                  )}`}
                />

                <MiniMetric
                  label="ROI líquido"
                  value={`${generalSimulation.roi.toFixed(
                    2,
                  )}x`}
                  detail={`Receita ${money(
                    summary.netRevenue,
                  )}`}
                />

                <MiniMetric
                  label="Resultado"
                  value={money(
                    generalSimulation.result,
                  )}
                  detail={`${generalSimulation.margin.toFixed(
                    1,
                  )}% margem`}
                />

                <MiniMetric
                  label="Custo / Play"
                  value={money(
                    generalSimulation.costPerPlay,
                  )}
                  detail={`${summary.plays} plays`}
                />

                <MiniMetric
                  label="Custo / Pitch"
                  value={money(
                    generalSimulation.costPerPitch,
                  )}
                  detail={`${summary.pitchReached} pitches`}
                />

                <MiniMetric
                  label="Custo / Sessão"
                  value={money(
                    generalSimulation.costPerSession,
                  )}
                  detail={`${summary.sessions} sessões`}
                />

                <MiniMetric
                  label="CPA"
                  value={money(
                    generalSimulation.costPerSale,
                  )}
                  detail={`${summary.sales} vendas`}
                />
              </div>
            )}
          </section>

          <section className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
            <div className="border-b border-neutral-800 p-5 sm:p-6">
              <h3 className="text-lg font-semibold text-white">
                Valor por criativo
              </h3>

              <p className="mt-1 text-sm text-neutral-500">
                Cada linha usa os dados do
                mesmo período selecionado
                acima.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1500px] text-left">
                <thead className="border-b border-neutral-800 bg-neutral-950/60">
                  <tr className="text-xs uppercase tracking-[0.12em] text-neutral-500">
                    <th className="px-4 py-4">
                      Criativo
                    </th>

                    <th className="px-4 py-4">
                      Sessões
                    </th>

                    <th className="px-4 py-4">
                      Plays
                    </th>

                    <th className="px-4 py-4">
                      Pitch
                    </th>

                    <th className="px-4 py-4">
                      Checkouts
                    </th>

                    <th className="px-4 py-4">
                      Vendas
                    </th>

                    <th className="px-4 py-4">
                      Recup.
                    </th>

                    <th className="px-4 py-4">
                      Receita líquida
                    </th>

                    <th className="px-4 py-4">
                      Valor /
                      Checkout
                    </th>

                    <th className="px-4 py-4">
                      Simulação
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-neutral-800">
                  {creatives.map(
                    (row) => (
                      <CreativeRow
                        key={getCreativeKey(
                          row,
                        )}
                        row={row}
                        simulation={getSimulation(
                          row,
                        )}
                        onChange={(
                          changes,
                        ) =>
                          updateSimulation(
                            row,
                            changes,
                          )
                        }
                      />
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <style jsx>{`
        :global(.input-financeiro) {
          width: 100%;
          border: 1px solid rgb(64 64 64);
          border-radius: 0.75rem;
          background: rgb(10 10 10);
          padding: 0.75rem 1rem;
          color: white;
          font-size: 0.875rem;
          outline: none;
        }

        :global(.input-financeiro:focus) {
          border-color: rgb(5 150 105);
        }

        :global(.button-secondary) {
          border: 1px solid rgb(64 64 64);
          border-radius: 0.75rem;
          padding: 0.75rem 1rem;
          color: rgb(212 212 212);
          font-size: 0.875rem;
          font-weight: 600;
          transition: 0.2s;
        }

        :global(.button-secondary:hover) {
          background: rgb(38 38 38);
          color: white;
        }
      `}</style>
    </div>
  );
}

function CreativeRow({
  row,
  simulation,
  onChange,
}: {
  row: FinancialCreativeRow;
  simulation: Simulation;
  onChange: (
    changes: Partial<Simulation>,
  ) => void;
}) {
  const spend =
    parseMoney(
      simulation.spend,
    );

  const realSpend =
    effectiveSpend(
      spend,
      simulation.platform,
    );

  const roi =
    realSpend > 0
      ? row.netRevenue /
        realSpend
      : 0;

  const costPerCheckout =
    divide(
      realSpend,
      row.checkouts,
    );

  const result =
    row.netRevenue -
    realSpend;

  return (
    <tr className="align-top text-sm text-neutral-300">
      <td className="px-4 py-4">
  <strong className="block text-white">
    {row.adDisplayName ||
      row.adId ||
      "Sem anúncio"}
  </strong>

  {row.adDisplayName &&
    row.adId &&
    row.adDisplayName !==
      row.adId && (
      <span className="mt-1 block font-mono text-[10px] text-neutral-600">
        {row.adId}
      </span>
    )}

  <span className="mt-1 block text-xs text-neutral-500">
    {row.source ||
      "sem origem"}{" "}
    •{" "}
    {row.campaignDisplayName ||
      row.campaignId ||
      "sem campanha"}
  </span>
</td>

      <td className="px-4 py-4">
        {number(
          row.sessions,
        )}
      </td>

      <td className="px-4 py-4">
        {number(
          row.plays,
        )}

        <span className="block text-xs text-neutral-600">
          {percentage(
            row.playRate,
          )}
        </span>
      </td>

      <td className="px-4 py-4">
        {number(
          row.pitchReached,
        )}

        <span className="block text-xs text-neutral-600">
          {percentage(
            row.pitchRate,
          )}
        </span>
      </td>

      <td className="px-4 py-4">
        {number(
          row.checkouts,
        )}
      </td>

      <td className="px-4 py-4">
        {number(
          row.sales,
        )}

        <span className="block text-xs text-neutral-600">
          {percentage(
            row.checkoutConversionRate,
          )}
        </span>
      </td>

      <td className="px-4 py-4">
        {number(
          row.recoveredSales,
        )}
      </td>

      <td className="px-4 py-4 font-semibold text-white">
        {money(
          row.netRevenue,
        )}
      </td>

      <td className="px-4 py-4">
        <strong className="text-lg text-emerald-400">
          {money(
            row.valuePerCheckout,
          )}
        </strong>

        <span className="mt-1 block text-xs text-neutral-600">
          Pitch{" "}
          {money(
            row.valuePerPitch,
          )}
        </span>
      </td>

      <td className="px-4 py-4">
        <div className="w-[260px] space-y-2">
          <div className="grid grid-cols-[100px_1fr] gap-2">
            <select
              value={
                simulation.platform
              }
              onChange={(
                event,
              ) =>
                onChange({
                  platform:
                    event.target
                      .value as Platform,
                })
              }
              className="rounded-lg border border-neutral-700 bg-neutral-950 px-2 py-2 text-xs text-white"
            >
              <option value="google">
                Google
              </option>

              <option value="meta">
                Meta
              </option>
            </select>

            <input
              type="text"
              inputMode="decimal"
              value={
                simulation.spend
              }
              onChange={(
                event,
              ) =>
                onChange({
                  spend:
                    event.target
                      .value,
                })
              }
              placeholder="Gasto"
              className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs text-white outline-none"
            />
          </div>

          {spend > 0 && (
            <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-3 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-500">
                  Custo real
                </span>

                <strong>
                  {money(
                    realSpend,
                  )}
                </strong>
              </div>

              <div className="mt-1 flex justify-between">
                <span className="text-neutral-500">
                  Custo/checkout
                </span>

                <strong>
                  {money(
                    costPerCheckout,
                  )}
                </strong>
              </div>

              <div className="mt-1 flex justify-between">
                <span className="text-neutral-500">
                  ROI
                </span>

                <strong>
                  {roi.toFixed(
                    2,
                  )}
                  x
                </strong>
              </div>

              <div className="mt-1 flex justify-between">
                <span className="text-neutral-500">
                  Resultado
                </span>

                <strong>
                  {money(
                    result,
                  )}
                </strong>
              </div>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

function MetricCard({
  label,
  value,
  detail,
  important = false,
}: {
  label: string;
  value: string;
  detail: string;
  important?: boolean;
}) {
  return (
    <div
      className={
        important
          ? "rounded-2xl border border-emerald-700 bg-emerald-950/30 p-5"
          : "rounded-2xl border border-neutral-800 bg-neutral-900 p-5"
      }
    >
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
        {label}
      </p>

      <strong
        className={
          important
            ? "mt-3 block text-3xl text-emerald-400"
            : "mt-3 block text-2xl text-white"
        }
      >
        {value}
      </strong>

      <p className="mt-2 text-xs text-neutral-500">
        {detail}
      </p>
    </div>
  );
}

function MiniMetric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
      <p className="text-xs text-neutral-500">
        {label}
      </p>

      <strong className="mt-1 block text-lg text-white">
        {value}
      </strong>

      <span className="mt-1 block text-xs text-neutral-600">
        {detail}
      </span>
    </div>
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
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
        {label}
      </span>

      {children}
    </label>
  );
}