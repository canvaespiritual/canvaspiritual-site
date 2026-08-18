import { engenhariaContent } from "@/lib/engenharia/content";

export default function EngenhariaMetodo() {
  return (
    <section className="bg-[#fbfaf7] py-16 sm:py-20">
      <div className="mx-auto max-w-[1040px] px-4 sm:px-6">
        <div className="mx-auto max-w-[720px] text-center">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#6d5a48]">
            O caminho
          </span>

          <h2 className="mt-3 text-[29px] font-bold tracking-[-0.035em] text-[#24211d] sm:text-[40px]">
            Da percepção de si ao governo consciente da própria vida
          </h2>

          <p className="mt-4 text-[15px] leading-7 text-[#6f6961]">
            A jornada organiza o autoconhecimento em uma sequência progressiva,
            para você não depender apenas de conceitos soltos.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {engenhariaContent.pilares.map((pilar) => (
            <article
              key={pilar.numero}
              className="rounded-[22px] border border-[#ddd8cf] bg-white p-6 sm:p-7"
            >
              <span className="text-xs font-extrabold text-[#b59b7c]">
                {pilar.numero}
              </span>

              <h3 className="mt-8 text-xl font-bold text-[#24211d]">
                {pilar.titulo}
              </h3>

              <p className="mt-3 text-sm leading-6 text-[#6f6961]">
                {pilar.texto}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}