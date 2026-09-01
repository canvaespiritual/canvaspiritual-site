import CentralHeader from "@/components/central/CentralHeader";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export default async function LeadsQuizPage() {
  const leads = await prisma.quizLead.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 100,
  });

  return (
    <>
      <CentralHeader />

      <section className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div>
          <h2 className="text-xl font-bold text-white">
            Leads do Quiz
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Exibindo os últimos{" "}
            {leads.length.toLocaleString("pt-BR")} registros.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-800">
              <thead className="bg-neutral-950">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    Lead
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    Contato
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    Zona
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    Data
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    Ação
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-800">
                {leads.map((lead) => {
                  const phone = lead.phone.replace(/\D/g, "");

                  return (
                    <tr
                      key={lead.id}
                      className="hover:bg-neutral-800/50"
                    >
                      <td className="px-4 py-4">
                        <div className="font-semibold text-white">
                          {lead.name || "Sem nome"}
                        </div>

                        <div className="mt-1 text-sm text-neutral-500">
                          {lead.email || "Sem e-mail"}
                        </div>
                      </td>

                      <td className="px-4 py-4 text-sm text-neutral-300">
                        {lead.phone || "Sem telefone"}
                      </td>

                      <td className="px-4 py-4 text-sm text-neutral-300">
                        {lead.zonaPredominante || "-"}
                      </td>

                      <td className="px-4 py-4 text-sm text-neutral-400">
                        {formatDate(lead.createdAt)}
                      </td>

                      <td className="px-4 py-4 text-right">
                        {phone ? (
                          <a
                            href={`https://wa.me/${phone}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex rounded-lg border border-emerald-700 bg-emerald-950 px-3 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-900 hover:text-white"
                          >
                            WhatsApp
                          </a>
                        ) : (
                          <span className="text-sm text-neutral-600">
                            -
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {leads.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-sm text-neutral-500"
                    >
                      Nenhum lead do Quiz recebido ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}

