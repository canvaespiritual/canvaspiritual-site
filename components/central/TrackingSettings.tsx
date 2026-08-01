"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

type TrackingEntityType =
  | "campaign"
  | "adset"
  | "ad";

type TrackingAlias = {
  id: string;
  platform: string;
  entityType: TrackingEntityType;
  externalId: string;
  name: string;
  adAccountId: string | null;
  platformStatus: string | null;
  createdAt: string;
  updatedAt: string;
};

type TrackingResponse = {
  aliases?: TrackingAlias[];
  alias?: TrackingAlias;
  error?: string;
};

const ENTITY_LABELS: Record<
  TrackingEntityType,
  string
> = {
  campaign: "Campanha",
  adset: "Conjunto",
  ad: "Anúncio",
};

const EMPTY_FORM = {
  entityType: "campaign" as TrackingEntityType,
  externalId: "",
  name: "",
  adAccountId: "",
};

export default function TrackingSettings() {
  const [aliases, setAliases] = useState<
    TrackingAlias[]
  >([]);

  const [form, setForm] = useState(EMPTY_FORM);

  const [editingId, setEditingId] = useState<
    string | null
  >(null);

  const [filter, setFilter] = useState<
    "all" | TrackingEntityType
  >("all");

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadAliases = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/central/tracking",
        {
          cache: "no-store",
        },
      );

      const data =
        (await response.json()) as TrackingResponse;

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Não foi possível carregar o tracking.",
        );
      }

      setAliases(data.aliases ?? []);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Não foi possível carregar o tracking.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAliases();
  }, [loadAliases]);

  const visibleAliases = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLocaleLowerCase("pt-BR");

    return aliases.filter((alias) => {
      if (
        filter !== "all" &&
        alias.entityType !== filter
      ) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return [
        alias.name,
        alias.externalId,
        alias.adAccountId ?? "",
        ENTITY_LABELS[alias.entityType],
      ].some((value) =>
        value
          .toLocaleLowerCase("pt-BR")
          .includes(normalizedSearch),
      );
    });
  }, [aliases, filter, search]);

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
  }

  function handleEdit(alias: TrackingAlias) {
    setEditingId(alias.id);

    setForm({
      entityType: alias.entityType,
      externalId: alias.externalId,
      name: alias.name,
      adAccountId: alias.adAccountId ?? "",
    });

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const url = editingId
        ? `/api/central/tracking/${editingId}`
        : "/api/central/tracking";

      const response = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          platform: "meta",
          entityType: form.entityType,
          externalId: form.externalId,
          name: form.name,
          adAccountId:
            form.adAccountId.trim() || null,
        }),
      });

      const data =
        (await response.json()) as TrackingResponse;

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Não foi possível salvar o tracking.",
        );
      }

      setSuccess(
        editingId
          ? "Tracking atualizado com sucesso."
          : "Tracking cadastrado com sucesso.",
      );

      resetForm();
      await loadAliases();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Não foi possível salvar o tracking.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(
    alias: TrackingAlias,
  ) {
    const confirmed = window.confirm(
      `Excluir o nome "${alias.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/central/tracking/${alias.id}`,
        {
          method: "DELETE",
        },
      );

      const data =
        (await response.json()) as TrackingResponse;

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Não foi possível excluir o tracking.",
        );
      }

      if (editingId === alias.id) {
        resetForm();
      }

      setSuccess(
        "Tracking excluído com sucesso.",
      );

      await loadAliases();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Não foi possível excluir o tracking.",
      );
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 sm:p-6">
        <div className="mb-5">
          <h3 className="text-lg font-semibold text-white">
            {editingId
              ? "Editar identificação"
              : "Nova identificação"}
          </h3>

          <p className="mt-1 text-sm text-neutral-500">
            O ID original será preservado. O nome amigável
            será usado na Central.
          </p>
        </div>

        <form
          onSubmit={(event) =>
            void handleSubmit(event)
          }
          className="grid gap-4 lg:grid-cols-2"
        >
          <Field label="Tipo">
            <select
              value={form.entityType}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  entityType: event.target
                    .value as TrackingEntityType,
                }))
              }
              className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-600"
            >
              <option value="campaign">
                Campanha
              </option>

              <option value="adset">
                Conjunto
              </option>

              <option value="ad">
                Anúncio
              </option>
            </select>
          </Field>

          <Field label="ID da conta de anúncios">
            <input
              value={form.adAccountId}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  adAccountId:
                    event.target.value,
                }))
              }
              placeholder="Opcional"
              className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-emerald-600"
            />
          </Field>

          <Field label="ID original">
            <input
              required
              value={form.externalId}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  externalId:
                    event.target.value,
                }))
              }
              placeholder="Ex.: 120247350038810574"
              className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-emerald-600"
            />
          </Field>

          <Field label="Nome amigável">
            <input
              required
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              placeholder="Ex.: Criativo Cura Emocional"
              className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-emerald-600"
            />
          </Field>

          <div className="flex flex-wrap gap-3 lg:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Salvando..."
                : editingId
                  ? "Salvar alterações"
                  : "Cadastrar nome"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-neutral-700 px-5 py-3 text-sm font-semibold text-neutral-200 transition hover:bg-neutral-800"
              >
                Cancelar edição
              </button>
            )}
          </div>
        </form>

        {error && (
          <FeedbackMessage variant="error">
            {error}
          </FeedbackMessage>
        )}

        {success && (
          <FeedbackMessage variant="success">
            {success}
          </FeedbackMessage>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
        <div className="border-b border-neutral-800 p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">
                Identificações cadastradas
              </h3>

              <p className="mt-1 text-sm text-neutral-500">
                {visibleAliases.length.toLocaleString(
                  "pt-BR",
                )}{" "}
                registro(s) encontrado(s).
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <select
                value={filter}
                onChange={(event) =>
                  setFilter(
                    event.target.value as
                      | "all"
                      | TrackingEntityType,
                  )
                }
                className="rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white outline-none focus:border-emerald-600"
              >
                <option value="all">
                  Todos os tipos
                </option>

                <option value="campaign">
                  Campanhas
                </option>

                <option value="adset">
                  Conjuntos
                </option>

                <option value="ad">
                  Anúncios
                </option>
              </select>

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Buscar nome ou ID"
                className="rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-emerald-600"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-neutral-500">
            Carregando tracking...
          </div>
        ) : visibleAliases.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm font-medium text-neutral-300">
              Nenhuma identificação encontrada.
            </p>

            <p className="mt-1 text-sm text-neutral-600">
              Cadastre o primeiro nome amigável no
              formulário acima.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left">
              <thead className="border-b border-neutral-800 bg-neutral-950/60">
                <tr className="text-xs uppercase tracking-[0.14em] text-neutral-500">
                  <th className="px-5 py-4 font-semibold">
                    Tipo
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Nome
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    ID original
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Conta
                  </th>

                  <th className="px-5 py-4 text-right font-semibold">
                    Ações
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-800">
                {visibleAliases.map((alias) => (
                  <tr
                    key={alias.id}
                    className="text-sm text-neutral-300"
                  >
                    <td className="px-5 py-4">
                      <span className="rounded-full border border-neutral-700 bg-neutral-950 px-3 py-1 text-xs font-semibold text-neutral-300">
                        {
                          ENTITY_LABELS[
                            alias.entityType
                          ]
                        }
                      </span>
                    </td>

                    <td className="px-5 py-4 font-semibold text-white">
                      {alias.name}
                    </td>

                    <td className="px-5 py-4 font-mono text-xs text-neutral-400">
                      {alias.externalId}
                    </td>

                    <td className="px-5 py-4 font-mono text-xs text-neutral-500">
                      {alias.adAccountId ?? "—"}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(alias)
                          }
                          className="rounded-lg border border-neutral-700 px-3 py-2 text-xs font-semibold text-neutral-200 transition hover:bg-neutral-800"
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            void handleDelete(alias)
                          }
                          className="rounded-lg border border-red-900 px-3 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-950"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

interface FieldProps {
  label: string;
  children: React.ReactNode;
}

function Field({
  label,
  children,
}: FieldProps) {
  return (
    <label>
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
        {label}
      </span>

      {children}
    </label>
  );
}

interface FeedbackMessageProps {
  variant: "error" | "success";
  children: React.ReactNode;
}

function FeedbackMessage({
  variant,
  children,
}: FeedbackMessageProps) {
  return (
    <p
      className={`mt-5 rounded-xl border px-4 py-3 text-sm ${
        variant === "error"
          ? "border-red-900 bg-red-950/50 text-red-300"
          : "border-emerald-900 bg-emerald-950/50 text-emerald-300"
      }`}
    >
      {children}
    </p>
  );
}