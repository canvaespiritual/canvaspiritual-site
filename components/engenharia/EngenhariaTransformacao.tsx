"use client";

import { useState } from "react";

import { engenhariaContent } from "@/lib/engenharia/content";

export default function EngenhariaTransformacao() {
  const [activeIndex, setActiveIndex] = useState(0);

  function toggleItem(index: number) {
    setActiveIndex((current) =>
      current === index ? -1 : index,
    );
  }

  return (
    <section
      id="transformacoes"
      className="bg-white py-16 sm:py-20"
    >
      <div className="mx-auto max-w-[900px] px-4 sm:px-6">
        <header className="mx-auto max-w-[720px] text-center">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#6d5a48]">
            Antes e depois
          </span>

          <h2 className="mt-3 text-[29px] font-bold leading-[1.08] tracking-[-0.035em] text-[#24211d] sm:text-[40px]">
            Veja como diferentes áreas podem mudar quando você aprende a
            reconhecer seus estados
          </h2>

          <p className="mx-auto mt-4 max-w-[650px] text-[15px] leading-7 text-[#6f6961]">
            Escolha o eixo que mais conversa com o seu momento e veja a
            mudança de percepção proposta em cada etapa.
          </p>
        </header>

        <div className="mt-10 overflow-hidden rounded-[24px] border border-[#ddd8cf] bg-[#fbfaf7]">
          {engenhariaContent.transformacoes.map(
            (item, index) => {
              const isOpen = activeIndex === index;

              return (
                <article
                  key={item.eixo}
                  className={`transition-colors ${
                    index > 0
                      ? "border-t border-[#e5e0d8]"
                      : ""
                  } ${
                    isOpen
                      ? "bg-white"
                      : "bg-[#fbfaf7] hover:bg-white/70"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleItem(index)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center gap-4 px-4 py-5 text-left sm:px-6 sm:py-6"
                  >
                    <span
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-[11px] font-extrabold transition ${
                        isOpen
                          ? "bg-[#332b24] text-white"
                          : "bg-[#eee9e2] text-[#776b5f]"
                      }`}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <div className="min-w-0 flex-1">
                      <h3 className="mb-0 text-[16px] font-bold leading-5 text-[#24211d] sm:text-[18px]">
                        {item.eixo}
                      </h3>

                      <p className="mb-0 mt-1.5 text-[13px] leading-5 text-[#817970] sm:text-sm">
                        {item.chamadaCurta}
                      </p>
                    </div>

                    <span
                      aria-hidden="true"
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border text-lg font-light transition-all ${
                        isOpen
                          ? "rotate-45 border-[#332b24] bg-[#332b24] text-white"
                          : "border-[#d4cec5] bg-white text-[#766b60]"
                      }`}
                    >
                      +
                    </span>
                  </button>

                  <div
                    className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-4 pb-6 sm:px-6 sm:pb-7">
                        <div className="ml-0 rounded-[20px] border border-[#e6e1da] bg-[#fbfaf7] p-4 sm:ml-14 sm:p-5">
                          <div className="grid gap-3 md:grid-cols-[1fr_42px_1fr] md:items-stretch">
                            <div className="rounded-[16px] border border-[#e7e2da] bg-white p-4 sm:p-5">
                              <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#9a9187]">
                                Antes
                              </span>

                              <p className="mb-0 mt-2 text-sm leading-6 text-[#6f6961]">
                                {item.antes}
                              </p>
                            </div>

                            <div className="flex items-center justify-center">
                              <span className="grid h-8 w-8 rotate-90 place-items-center rounded-full bg-[#eee9e2] text-sm text-[#6d5a48] md:rotate-0">
                                →
                              </span>
                            </div>

                            <div className="rounded-[16px] border border-[#d8d0c5] bg-[#f3efe9] p-4 sm:p-5">
                              <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#7a6857]">
                                Depois
                              </span>

                              <p className="mb-0 mt-2 text-sm font-medium leading-6 text-[#443c35]">
                                {item.depois}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 rounded-[16px] bg-[#332b24] px-4 py-4 text-white sm:px-5">
                            <div className="flex gap-3">
                              <span
                                aria-hidden="true"
                                className="mt-0.5 text-[#d7c2a8]"
                              >
                                ✦
                              </span>

                              <div>
                                <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#d7c2a8]">
                                  Nova postura
                                </span>

                                <p className="mb-0 mt-1 text-sm font-semibold leading-6 text-white">
                                  {item.identidade}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            },
          )}
        </div>

        <p className="mx-auto mt-5 max-w-[620px] text-center text-xs leading-5 text-[#918980]">
          Não existe uma ordem obrigatória aqui. Abra os eixos que mais
          chamarem sua atenção.
        </p>
      </div>
    </section>
  );
}