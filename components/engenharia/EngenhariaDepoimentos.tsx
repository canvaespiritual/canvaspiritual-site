import Image from "next/image";

import { engenhariaContent } from "@/lib/engenharia/content";

export default function EngenhariaDepoimentos() {
  return (
    <section className="bg-amber-50 py-20 text-neutral-950">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-800">
            Experiências reais
          </span>

          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            O que alunos perceberam ao longo da jornada
          </h2>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {engenhariaContent.depoimentos.map((depoimento) => (
            <article
              key={depoimento.nome}
              className="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm"
            >
              <div className="flex gap-4">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-neutral-200">
                  <Image
                    src={depoimento.imagem}
                    alt={depoimento.nome}
                    fill
                    className="object-cover"
                  />
                </div>

                <div>
                  <p className="text-base italic leading-7 text-neutral-700">
                    “{depoimento.texto}”
                  </p>

                  <div className="mt-4">
                    <strong className="block text-neutral-950">
                      {depoimento.nome}
                    </strong>

                    <span className="text-sm text-neutral-500">
                      {depoimento.profissao}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}