"use client";

import type { ProspectStatus } from "@/types/prospect";

export interface ProspectFilterValues {
  search: string;
  status: ProspectStatus | "todos";
  searchTerm: string;
  contactType: "todos" | "instagram" | "whatsapp";
  businessOnly: boolean;
  minimumFollowers: number;
}

interface ProspectFiltersProps {
  filters: ProspectFilterValues;
  searchTerms: string[];
  onChange: (filters: ProspectFilterValues) => void;
  onReset: () => void;
}

export default function ProspectFilters({
  filters,
  searchTerms,
  onChange,
  onReset,
}: ProspectFiltersProps) {
  function updateFilter<K extends keyof ProspectFilterValues>(
    key: K,
    value: ProspectFilterValues[K],
  ) {
    onChange({
      ...filters,
      [key]: value,
    });
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <div className="md:col-span-2">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Buscar
          </label>

          <input
            type="search"
            value={filters.search}
            onChange={(event) =>
              updateFilter("search", event.target.value)
            }
            placeholder="Nome, @, bio, profissão, cidade..."
            className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-zinc-500"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Status
          </label>

          <select
            value={filters.status}
            onChange={(event) =>
              updateFilter(
                "status",
                event.target.value as ProspectStatus | "todos",
              )
            }
            className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-zinc-500"
          >
            <option value="todos">Todos</option>
            <option value="novo">Novo</option>
            <option value="mensagem_enviada">Mensagem enviada</option>
            <option value="respondeu">Respondeu</option>
            <option value="cadastrado">Cadastrado</option>
            <option value="ativado">Ativado</option>
            <option value="ignorar">Ignorar</option>
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Lista de origem
          </label>

          <select
            value={filters.searchTerm}
            onChange={(event) =>
              updateFilter("searchTerm", event.target.value)
            }
            className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-zinc-500"
          >
            <option value="todos">Todas</option>

            {searchTerms.map((term) => (
              <option key={term} value={term}>
                {term}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Canal
          </label>

          <select
            value={filters.contactType}
            onChange={(event) =>
              updateFilter(
                "contactType",
                event.target.value as ProspectFilterValues["contactType"],
              )
            }
            className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-zinc-500"
          >
            <option value="todos">Todos</option>
            <option value="instagram">Instagram</option>
            <option value="whatsapp">Com WhatsApp</option>
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Seguidores mínimos
          </label>

          <input
            type="number"
            min={0}
            step={100}
            value={filters.minimumFollowers}
            onChange={(event) =>
              updateFilter(
                "minimumFollowers",
                Math.max(0, Number(event.target.value) || 0),
              )
            }
            className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-zinc-500"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700">
          <input
            type="checkbox"
            checked={filters.businessOnly}
            onChange={(event) =>
              updateFilter("businessOnly", event.target.checked)
            }
            className="h-4 w-4 rounded border-zinc-300"
          />

          Mostrar apenas contas comerciais
        </label>

        <button
          type="button"
          onClick={onReset}
          className="rounded-lg px-3 py-2 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100"
        >
          Limpar filtros
        </button>
      </div>
    </section>
  );
}