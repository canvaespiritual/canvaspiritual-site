"use client";

import { useState } from "react";

import { engenhariaContent } from "@/lib/engenharia/content";

export default function EngenhariaFaq() {
  const [activeIndex, setActiveIndex] =
    useState<number | null>(0);

  return (
    <section className="bg-[#fbfaf7] py-16 sm:py-20">
      <div className="mx-auto max-w-[820px] px-4 sm:px-6">
        <div className="text-center">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#6d5a48]">
            Perguntas frequentes
          </span>

          <h2 className="mt-3 text-[29px] font-bold tracking-[-0.035em] text-[#24211d] sm:text-[40px]">
            Antes de começar
          </h2>

          <p className="mx-auto mt-4 max-w-[600px] text-[15px] leading-7 text-[#6f6961]">
            Algumas respostas para você conhecer melhor a proposta da jornada.
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-[22px] border border-[#ddd8cf] bg-white">
          {engenhariaContent.faq.map((item, index) => {
            const open = activeIndex === index;

            return (
              <article
                key={item.pergunta}
                className={
                  index > 0
                    ? "border-t border-[#e7e2da]"
                    : ""
                }
              >
                <button
                  type="button"
                  onClick={() =>
                    setActiveIndex(open ? null : index)
                  }
                  aria-expanded={open}
                  className="flex w-full items-center gap-4 px-5 py-5 text-left sm:px-6"
                >
                  <span className="flex-1 text-sm font-bold leading-6 text-[#332b24] sm:text-[15px]">
                    {item.pergunta}
                  </span>

                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[#d8d1c7] text-lg font-light text-[#766b60] transition ${
                      open ? "rotate-45 bg-[#f1eee8]" : ""
                    }`}
                  >
                    +
                  </span>
                </button>

                <div
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ${
                    open
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="mb-0 px-5 pb-5 pr-14 text-sm leading-6 text-[#6f6961] sm:px-6 sm:pb-6 sm:pr-16">
                      {item.resposta}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}