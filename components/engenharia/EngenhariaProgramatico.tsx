import { engenhariaContent } from "@/lib/engenharia/content";

export default function EngenhariaProgramatico() {
  return (
    <section
      id="conteudo-programatico"
      className="bg-[#fbfaf7] py-16 sm:py-20"
    >
      <div className="mx-auto max-w-[980px] px-4 sm:px-6">
        <div className="mx-auto max-w-[730px] text-center">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#6d5a48]">
            Conteúdo programático
          </span>

          <h2 className="mt-3 text-[29px] font-bold tracking-[-0.035em] text-[#24211d] sm:text-[40px]">
            As 6 Chaves da Jornada
          </h2>

          <p className="mt-4 text-[15px] leading-7 text-[#6f6961]">
            Abra cada Chave e veja exatamente as aulas que compõem o curso.
          </p>
        </div>

        <div className="mt-10 space-y-3">
          {engenhariaContent.modulos.map((modulo) => (
            <details
              key={modulo.numero}
              className="group overflow-hidden rounded-[20px] border border-[#ddd8cf] bg-white"
            >
              <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-5 sm:px-6">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f1eee8] text-xs font-extrabold text-[#6d5a48]">
                  {String(modulo.numero).padStart(2, "0")}
                </span>

                <div className="min-w-0 flex-1">
                  <h3 className="mb-0 text-[17px] font-bold text-[#24211d] sm:text-lg">
                    {modulo.titulo}
                  </h3>

                  <p className="mb-0 mt-1 hidden text-sm text-[#817970] sm:block">
                    {modulo.resumo}
                  </p>
                </div>

                <span className="text-2xl font-light text-[#8d8176] transition group-open:rotate-45">
                  +
                </span>
              </summary>

              <div className="border-t border-[#ece8e2] bg-[#fbfaf7] px-5 py-5 sm:px-6">
                <p className="mb-5 text-sm leading-6 text-[#6f6961] sm:hidden">
                  {modulo.resumo}
                </p>

                <div className="space-y-2">
                  {modulo.aulas.map((aula, index) => (
                    <div
                      key={aula.titulo}
                      className="grid grid-cols-[28px_1fr] gap-3 rounded-xl px-2 py-3"
                    >
                      <span className="text-[10px] font-extrabold text-[#b59b7c]">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <div>
                        <h4 className="text-sm font-bold text-[#332b24]">
                          {aula.titulo}
                        </h4>

                        <p className="mb-0 mt-1 text-[13px] leading-5 text-[#777068]">
                          {aula.descricao}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-xl bg-[#f1eee8] p-4">
                  <strong className="text-[10px] uppercase tracking-wider text-[#6d5a48]">
                    Resultado da etapa
                  </strong>

                  <p className="mb-0 mt-2 text-sm leading-6 text-[#55504a]">
                    {modulo.resultado}
                  </p>
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}