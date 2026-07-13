"use client";

import type { ProspectStatus } from "@/types/prospect";

export interface ProspectFilterValues {
  search: string;
  status: ProspectStatus | "todos";
  searchTerm: string;
  contactType: "todos" | "instagram" | "whatsapp";
  businessOnly: boolean;
  minimumFollowers: number;
  maximumFollowers: number;
  idioma: string;
}

interface ProspectFiltersProps {
  filters: ProspectFilterValues;
  searchTerms: string[];
  languages: string[];
  onChange: (filters: ProspectFilterValues) => void;
  onReset: () => void;
}

export default function ProspectFilters({
  filters,
  searchTerms,
  languages,
  onChange,
  onReset,
}: ProspectFiltersProps) {
  function updateFilter<
    K extends keyof ProspectFilterValues,
  >(
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
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
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
            className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-zinc-500"
          />
        </div>

        <FilterSelect
          label="Status"
          value={filters.status}
          onChange={(value) =>
            updateFilter(
              "status",
              value as ProspectFilterValues["status"],
            )
          }
          options={[
            ["todos", "Todos"],
            ["novo", "Novo"],
            ["mensagem_enviada", "Mensagem enviada"],
            ["respondeu", "Respondeu"],
            ["cadastrado", "Cadastrado"],
            ["ativado", "Ativado"],
            ["ignorar", "Ignorar"],
          ]}
        />

        <FilterSelect
          label="Lista de origem"
          value={filters.searchTerm}
          onChange={(value) =>
            updateFilter("searchTerm", value)
          }
          options={[
            ["todos", "Todas"],
            ...searchTerms.map(
              (term) => [term, term] as [string, string],
            ),
          ]}
        />

        <FilterSelect
          label="Idioma"
          value={filters.idioma}
          onChange={(value) =>
            updateFilter("idioma", value)
          }
          options={[
            ["todos", "Todos"],
            ...languages.map(
              (language) =>
                [language, language] as [string, string],
            ),
          ]}
        />

        <FilterSelect
          label="Canal"
          value={filters.contactType}
          onChange={(value) =>
            updateFilter(
              "contactType",
              value as ProspectFilterValues["contactType"],
            )
          }
          options={[
            ["todos", "Todos"],
            ["instagram", "Instagram"],
            ["whatsapp", "Com WhatsApp"],
          ]}
        />

        <NumberFilter
          label="Seguidores mínimos"
          value={filters.minimumFollowers}
          onChange={(value) =>
            updateFilter("minimumFollowers", value)
          }
        />

        <NumberFilter
          label="Seguidores máximos"
          value={filters.maximumFollowers}
          placeholder="Sem limite"
          onChange={(value) =>
            updateFilter("maximumFollowers", value)
          }
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700">
          <input
            type="checkbox"
            checked={filters.businessOnly}
            onChange={(event) =>
              updateFilter(
                "businessOnly",
                event.target.checked,
              )
            }
            className="h-4 w-4 rounded border-zinc-300"
          />

          Mostrar apenas contas comerciais
        </label>

        <button
          type="button"
          onClick={onReset}
          className="rounded-lg px-3 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-100"
        >
          Limpar filtros
        </button>
      </div>
    </section>
  );
}

interface FilterSelectProps {
  label: string;
  value: string;
  options: Array<[string, string]>;
  onChange: (value: string) => void;
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: FilterSelectProps) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-zinc-500"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option
            key={optionValue}
            value={optionValue}
          >
            {optionLabel}
          </option>
        ))}
      </select>
    </div>
  );
}

interface NumberFilterProps {
  label: string;
  value: number;
  placeholder?: string;
  onChange: (value: number) => void;
}

function NumberFilter({
  label,
  value,
  placeholder,
  onChange,
}: NumberFilterProps) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </label>

      <input
        type="number"
        min={0}
        step={100}
        value={value || ""}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(
            Math.max(
              0,
              Number(event.target.value) || 0,
            ),
          )
        }
        className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-zinc-500"
      />
    </div>
  );
}