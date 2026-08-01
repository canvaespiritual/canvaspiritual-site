"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

type MessageTemplateType =
  | "checkout_pending"
  | "payment_approved"
  | "followup_pending"
  | "access_confirmation";

type MessageTemplate = {
  id: string;
  type: MessageTemplateType;
  name: string;
  content: string;
  active: boolean;
  senderName: string;
  createdAt: string;
  updatedAt: string;
};

type TemplatesResponse = {
  templates?: MessageTemplate[];
  template?: MessageTemplate;
  error?: string;
};

const TEMPLATE_LABELS: Record<
  MessageTemplateType,
  string
> = {
  checkout_pending: "Pagamento pendente",
  payment_approved: "Pagamento aprovado",
  followup_pending: "Follow-up pendente",
  access_confirmation: "Confirmação de acesso",
};

const EMPTY_FORM = {
  type: "checkout_pending" as MessageTemplateType,
  name: "",
  senderName: "",
  content: "",
  active: true,
};

const AVAILABLE_VARIABLES = [
  "{{primeiro_nome}}",
  "{{nome_completo}}",
  "{{atendente}}",
  "{{campanha}}",
  "{{conjunto}}",
  "{{criativo}}",
  "{{status_pagamento}}",
  "{{data_checkout}}",
  "{{produto}}",
  "{{valor}}",
  "{{link_pagamento}}",
  "{{link_acesso}}",
];

export default function MessageTemplatesSettings() {
  const [templates, setTemplates] = useState<
    MessageTemplate[]
  >([]);

  const [form, setForm] = useState(EMPTY_FORM);

  const [editingId, setEditingId] = useState<
    string | null
  >(null);

  const [filter, setFilter] = useState<
    "all" | MessageTemplateType
  >("all");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/central/templates",
        {
          cache: "no-store",
        },
      );

      const data =
        (await response.json()) as TemplatesResponse;

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Não foi possível carregar os templates.",
        );
      }

      setTemplates(data.templates ?? []);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Não foi possível carregar os templates.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTemplates();
  }, [loadTemplates]);

  const visibleTemplates = useMemo(() => {
    if (filter === "all") {
      return templates;
    }

    return templates.filter(
      (template) => template.type === filter,
    );
  }, [filter, templates]);

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
  }

  function handleEdit(template: MessageTemplate) {
    setEditingId(template.id);

    setForm({
      type: template.type,
      name: template.name,
      senderName: template.senderName,
      content: template.content,
      active: template.active,
    });

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function insertVariable(variable: string) {
    setForm((current) => ({
      ...current,
      content: current.content
        ? `${current.content} ${variable}`
        : variable,
    }));
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
        ? `/api/central/templates/${editingId}`
        : "/api/central/templates";

      const response = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data =
        (await response.json()) as TemplatesResponse;

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Não foi possível salvar o template.",
        );
      }

      setSuccess(
        editingId
          ? "Template atualizado com sucesso."
          : "Template criado com sucesso.",
      );

      resetForm();
      await loadTemplates();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Não foi possível salvar o template.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(
    template: MessageTemplate,
  ) {
    const confirmed = window.confirm(
      `Excluir o template "${template.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/central/templates/${template.id}`,
        {
          method: "DELETE",
        },
      );

      const data =
        (await response.json()) as TemplatesResponse;

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Não foi possível excluir o template.",
        );
      }

      if (editingId === template.id) {
        resetForm();
      }

      setSuccess(
        "Template excluído com sucesso.",
      );

      await loadTemplates();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Não foi possível excluir o template.",
      );
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 sm:p-6">
        <div className="mb-5">
          <h3 className="text-lg font-semibold text-white">
            {editingId
              ? "Editar template"
              : "Novo template"}
          </h3>

          <p className="mt-1 text-sm text-neutral-500">
            O template ativo será usado automaticamente
            nos checkouts correspondentes.
          </p>
        </div>

        <form
          onSubmit={(event) =>
            void handleSubmit(event)
          }
          className="space-y-5"
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="Tipo">
              <select
                value={form.type}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    type: event.target
                      .value as MessageTemplateType,
                  }))
                }
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white outline-none focus:border-emerald-600"
              >
                {Object.entries(
                  TEMPLATE_LABELS,
                ).map(([value, label]) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Nome do template">
              <input
                required
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="Ex.: Primeiro contato - pagamento pendente"
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-emerald-600"
              />
            </Field>

            <Field label="Nome do atendente">
              <input
                value={form.senderName}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    senderName:
                      event.target.value,
                  }))
                }
                placeholder="Ex.: Lucas"
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-emerald-600"
              />
            </Field>

            <Field label="Status">
              <label className="flex min-h-12 items-center gap-3 rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      active:
                        event.target.checked,
                    }))
                  }
                  className="h-4 w-4 accent-emerald-600"
                />

                <span className="text-sm text-neutral-300">
                  Template ativo
                </span>
              </label>
            </Field>
          </div>

          <Field label="Conteúdo da mensagem">
            <textarea
              required
              value={form.content}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  content:
                    event.target.value,
                }))
              }
              rows={12}
              placeholder="Digite a mensagem..."
              className="min-h-64 w-full resize-y rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-neutral-600 focus:border-emerald-600"
            />
          </Field>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Variáveis disponíveis
            </p>

            <div className="flex flex-wrap gap-2">
              {AVAILABLE_VARIABLES.map(
                (variable) => (
                  <button
                    key={variable}
                    type="button"
                    onClick={() =>
                      insertVariable(variable)
                    }
                    className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 font-mono text-xs text-neutral-300 transition hover:border-emerald-700 hover:text-white"
                  >
                    {variable}
                  </button>
                ),
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Salvando..."
                : editingId
                  ? "Salvar alterações"
                  : "Criar template"}
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
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">
                Templates cadastrados
              </h3>

              <p className="mt-1 text-sm text-neutral-500">
                {visibleTemplates.length} registro(s).
              </p>
            </div>

            <select
              value={filter}
              onChange={(event) =>
                setFilter(
                  event.target.value as
                    | "all"
                    | MessageTemplateType,
                )
              }
              className="rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white outline-none focus:border-emerald-600"
            >
              <option value="all">
                Todos os tipos
              </option>

              {Object.entries(
                TEMPLATE_LABELS,
              ).map(([value, label]) => (
                <option
                  key={value}
                  value={value}
                >
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-neutral-500">
            Carregando templates...
          </div>
        ) : visibleTemplates.length === 0 ? (
          <div className="p-8 text-center text-sm text-neutral-500">
            Nenhum template encontrado.
          </div>
        ) : (
          <div className="divide-y divide-neutral-800">
            {visibleTemplates.map(
              (template) => (
                <article
                  key={template.id}
                  className="p-5 sm:p-6"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-semibold text-white">
                          {template.name}
                        </h4>

                        <span className="rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-400">
                          {
                            TEMPLATE_LABELS[
                              template.type
                            ]
                          }
                        </span>

                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                            template.active
                              ? "border-emerald-800 bg-emerald-950 text-emerald-300"
                              : "border-neutral-700 bg-neutral-950 text-neutral-500"
                          }`}
                        >
                          {template.active
                            ? "Ativo"
                            : "Inativo"}
                        </span>
                      </div>

                      {template.senderName && (
                        <p className="mt-2 text-sm text-neutral-500">
                          Atendente:{" "}
                          {template.senderName}
                        </p>
                      )}

                      <div className="mt-4 whitespace-pre-wrap rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-sm leading-6 text-neutral-300">
                        {template.content}
                      </div>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleEdit(template)
                        }
                        className="rounded-lg border border-neutral-700 px-3 py-2 text-xs font-semibold text-neutral-200 transition hover:bg-neutral-800"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          void handleDelete(
                            template,
                          )
                        }
                        className="rounded-lg border border-red-900 px-3 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-950"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </article>
              ),
            )}
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
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
        {label}
      </p>

      {children}
    </div>
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