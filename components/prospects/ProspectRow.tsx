"use client";

import { useState } from "react";
import type {
  Prospect,
  ProspectStatus,
} from "@/types/prospect";
import {
  copyMessage,
  createFollowUpMessage,
  createInitialMessage,
  createVoucherMessage,
} from "@/lib/messages";
import StatusBadge from "./StatusBadge";

interface ProspectRowProps {
  prospect: Prospect;
  onUpdate: (
    username: string,
    updates: Partial<Prospect>,
  ) => void;
}

const statusOptions: Array<{
  value: ProspectStatus;
  label: string;
}> = [
  { value: "novo", label: "Novo" },
  { value: "mensagem_enviada", label: "Mensagem enviada" },
  { value: "respondeu", label: "Respondeu" },
  { value: "cadastrado", label: "Cadastrado" },
  { value: "ativado", label: "Ativado" },
  { value: "ignorar", label: "Ignorar" },
];

function formatFollowers(value: number): string {
  return value.toLocaleString("pt-BR");
}

function getWhatsAppUrl(whatsapp: string): string {
  const digits = whatsapp.replace(/\D/g, "");

  return digits ? `https://wa.me/${digits}` : "";
}

export default function ProspectRow({
  prospect,
  onUpdate,
}: ProspectRowProps) {
  const [copiedLabel, setCopiedLabel] = useState("");
  const [showDetails, setShowDetails] = useState(false);

  async function handleCopy(
    label: string,
    message: string,
    changeStatus = false,
  ) {
    try {
      await copyMessage(message);
      setCopiedLabel(label);

      if (changeStatus && prospect.status === "novo") {
        onUpdate(prospect.username, {
          status: "mensagem_enviada",
          updatedAt: new Date().toISOString(),
        });
      }

      window.setTimeout(() => {
        setCopiedLabel("");
      }, 1800);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível copiar a mensagem.";

      window.alert(message);
    }
  }

  const whatsappUrl = getWhatsAppUrl(prospect.whatsapp);

  return (
    <>
      <tr className="border-b border-zinc-100 align-top hover:bg-zinc-50">
        <td className="px-4 py-4">
          <div className="min-w-48">
            <p className="font-semibold text-zinc-900">
              {prospect.fullName || "Sem nome"}
            </p>

            <a
              href={
                prospect.url ||
                `https://www.instagram.com/${prospect.username}/`
              }
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-block text-sm font-medium text-blue-600 hover:underline"
            >
              @{prospect.username}
            </a>

            {prospect.verified && (
              <span className="ml-2 text-xs font-semibold text-blue-600">
                Verificado
              </span>
            )}
          </div>
        </td>

        <td className="px-4 py-4">
          <div className="min-w-44">
            <p className="text-sm font-medium text-zinc-800">
              {prospect.profissao ||
                prospect.businessCategoryName ||
                prospect.searchTerm ||
                "Não classificado"}
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              {formatFollowers(prospect.followersCount)} seguidores
            </p>

            {prospect.isBusinessAccount && (
              <p className="mt-1 text-xs font-medium text-emerald-700">
                Conta comercial
              </p>
            )}
          </div>
        </td>

        <td className="px-4 py-4">
          <div className="min-w-40 text-sm text-zinc-700">
            {prospect.whatsapp ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-emerald-700 hover:underline"
              >
                {prospect.whatsapp}
              </a>
            ) : (
              <span className="text-zinc-400">
                Sem WhatsApp
              </span>
            )}

            {(prospect.cidade ||
              prospect.estado ||
              prospect.pais) && (
              <p className="mt-2 text-xs text-zinc-500">
                {[prospect.cidade, prospect.estado, prospect.pais]
                  .filter(Boolean)
                  .join(" • ")}
              </p>
            )}
          </div>
        </td>

        <td className="px-4 py-4">
          <div className="min-w-40">
            <p className="line-clamp-2 text-sm text-zinc-700">
              {prospect.searchTerm || "Sem origem de busca"}
            </p>

            <p className="mt-1 line-clamp-1 text-xs text-zinc-400">
              {prospect.origem}
            </p>
          </div>
        </td>

        <td className="px-4 py-4">
          <div className="min-w-44">
            <StatusBadge status={prospect.status} />

            <select
              value={prospect.status}
              onChange={(event) =>
                onUpdate(prospect.username, {
                  status: event.target.value as ProspectStatus,
                  updatedAt: new Date().toISOString(),
                })
              }
              className="mt-2 block w-full rounded-lg border border-zinc-300 px-2 py-2 text-xs text-zinc-800 outline-none focus:border-zinc-500"
            >
              {statusOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </td>

        <td className="px-4 py-4">
          <div className="flex min-w-48 flex-col gap-2">
            <button
              type="button"
              onClick={() =>
                handleCopy(
                  "Mensagem copiada",
                  createInitialMessage(prospect),
                  true,
                )
              }
              className="rounded-lg bg-zinc-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-zinc-700"
            >
              {copiedLabel === "Mensagem copiada"
                ? "Copiada!"
                : "Copiar mensagem inicial"}
            </button>

            <button
              type="button"
              onClick={() =>
                handleCopy(
                  "Voucher copiado",
                  createVoucherMessage(prospect),
                )
              }
              className="rounded-lg border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100"
            >
              {copiedLabel === "Voucher copiado"
                ? "Copiada!"
                : "Copiar mensagem voucher"}
            </button>

            <button
              type="button"
              onClick={() =>
                handleCopy(
                  "Follow-up copiado",
                  createFollowUpMessage(prospect),
                )
              }
              className="rounded-lg border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100"
            >
              {copiedLabel === "Follow-up copiado"
                ? "Copiada!"
                : "Copiar follow-up"}
            </button>

            <button
              type="button"
              onClick={() => setShowDetails((value) => !value)}
              className="rounded-lg px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-50"
            >
              {showDetails ? "Fechar detalhes" : "Ver e editar"}
            </button>
          </div>
        </td>
      </tr>

      {showDetails && (
        <tr className="border-b border-zinc-200 bg-zinc-50">
          <td colSpan={6} className="px-4 py-5">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <label className="text-sm font-medium text-zinc-700">
                Profissão
                <input
                  value={prospect.profissao}
                  onChange={(event) =>
                    onUpdate(prospect.username, {
                      profissao: event.target.value,
                      updatedAt: new Date().toISOString(),
                    })
                  }
                  className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500"
                />
              </label>

              <label className="text-sm font-medium text-zinc-700">
                WhatsApp
                <input
                  value={prospect.whatsapp}
                  onChange={(event) =>
                    onUpdate(prospect.username, {
                      whatsapp: event.target.value,
                      updatedAt: new Date().toISOString(),
                    })
                  }
                  placeholder="5511999999999"
                  className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500"
                />
              </label>

              <label className="text-sm font-medium text-zinc-700">
                E-mail
                <input
                  type="email"
                  value={prospect.email}
                  onChange={(event) =>
                    onUpdate(prospect.username, {
                      email: event.target.value,
                      updatedAt: new Date().toISOString(),
                    })
                  }
                  className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500"
                />
              </label>

              <label className="text-sm font-medium text-zinc-700">
                Voucher
                <input
                  value={prospect.voucher}
                  onChange={(event) =>
                    onUpdate(prospect.username, {
                      voucher: event.target.value,
                      updatedAt: new Date().toISOString(),
                    })
                  }
                  className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm uppercase outline-none focus:border-zinc-500"
                />
              </label>

              <label className="text-sm font-medium text-zinc-700">
                Cidade
                <input
                  value={prospect.cidade}
                  onChange={(event) =>
                    onUpdate(prospect.username, {
                      cidade: event.target.value,
                      updatedAt: new Date().toISOString(),
                    })
                  }
                  className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500"
                />
              </label>

              <label className="text-sm font-medium text-zinc-700">
                Bairro
                <input
                  value={prospect.bairro}
                  onChange={(event) =>
                    onUpdate(prospect.username, {
                      bairro: event.target.value,
                      updatedAt: new Date().toISOString(),
                    })
                  }
                  className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500"
                />
              </label>

              <label className="text-sm font-medium text-zinc-700">
                Estado
                <input
                  value={prospect.estado}
                  onChange={(event) =>
                    onUpdate(prospect.username, {
                      estado: event.target.value,
                      updatedAt: new Date().toISOString(),
                    })
                  }
                  className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500"
                />
              </label>

              <label className="text-sm font-medium text-zinc-700">
                País
                <input
                  value={prospect.pais}
                  onChange={(event) =>
                    onUpdate(prospect.username, {
                      pais: event.target.value,
                      updatedAt: new Date().toISOString(),
                    })
                  }
                  className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500"
                />
              </label>

              <label className="text-sm font-medium text-zinc-700 md:col-span-2 xl:col-span-4">
                Bio
                <textarea
                  value={prospect.biography}
                  onChange={(event) =>
                    onUpdate(prospect.username, {
                      biography: event.target.value,
                      updatedAt: new Date().toISOString(),
                    })
                  }
                  rows={3}
                  className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500"
                />
              </label>

              <label className="text-sm font-medium text-zinc-700 md:col-span-2 xl:col-span-4">
                Observações
                <textarea
                  value={prospect.observacoes}
                  onChange={(event) =>
                    onUpdate(prospect.username, {
                      observacoes: event.target.value,
                      updatedAt: new Date().toISOString(),
                    })
                  }
                  rows={3}
                  placeholder="Ex.: respondeu pelo Instagram, pediu contato na próxima semana..."
                  className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500"
                />
              </label>
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              {prospect.externalUrl && (
                <a
                  href={prospect.externalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-blue-700 hover:underline"
                >
                  Abrir link da bio
                </a>
              )}

              <a
                href={
                  prospect.url ||
                  `https://www.instagram.com/${prospect.username}/`
                }
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-blue-700 hover:underline"
              >
                Abrir Instagram
              </a>

              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-emerald-700 hover:underline"
                >
                  Abrir WhatsApp
                </a>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}