"use client";

import type { Prospect } from "@/types/prospect";
import ProspectRow from "./ProspectRow";

interface ProspectTableProps {
  prospects: Prospect[];
  onUpdate: (
    username: string,
    updates: Partial<Prospect>,
  ) => void;
}

export default function ProspectTable({
  prospects,
  onUpdate,
}: ProspectTableProps) {
  if (prospects.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
        <h2 className="text-lg font-semibold text-zinc-900">
          Nenhum prospect encontrado
        </h2>

        <p className="mt-2 text-sm text-zinc-500">
          Importe os arquivos CSV ou altere os filtros da
          pesquisa.
        </p>
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead className="bg-zinc-100">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Perfil
              </th>

              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Profissão
              </th>

              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Contato
              </th>

              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Origem
              </th>

              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Status
              </th>

              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Ações
              </th>
            </tr>
          </thead>

          <tbody>
            {prospects.map((prospect) => (
              <ProspectRow
                key={prospect.username}
                prospect={prospect}
                onUpdate={onUpdate}
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}