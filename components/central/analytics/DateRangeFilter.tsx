"use client";

type DateRangeFilterProps = {
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onApply: () => void;
  onClear: () => void;
};

export function DateRangeFilter({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onApply,
  onClear,
}: DateRangeFilterProps) {
  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-base font-bold text-white">
            Período
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Selecione as datas que deseja analisar.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="grid gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
              Data inicial
            </span>

            <input
              type="date"
              value={dateFrom}
              onChange={(event) =>
                onDateFromChange(event.target.value)
              }
              className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-500"
            />
          </label>

          <label className="grid gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
              Data final
            </span>

            <input
              type="date"
              value={dateTo}
              onChange={(event) =>
                onDateToChange(event.target.value)
              }
              className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-500"
            />
          </label>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onApply}
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-500"
            >
              Aplicar
            </button>

            <button
              type="button"
              onClick={onClear}
              className="rounded-lg border border-neutral-700 px-4 py-2 text-sm font-semibold text-neutral-300 transition hover:bg-neutral-800 hover:text-white"
            >
              Limpar
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}