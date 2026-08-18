import { engenhariaContent } from "@/lib/engenharia/content";

export default function EngenhariaBonus() {
  return (
    <section className="bg-[#f1eee8] py-16 sm:py-20">
      <div className="mx-auto max-w-[1040px] px-4 sm:px-6">
        <div className="mx-auto max-w-[720px] text-center">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#6d5a48]">
            Além das aulas
          </span>

          <h2 className="mt-3 text-[29px] font-bold tracking-[-0.035em] text-[#24211d] sm:text-[40px]">
            Bônus para acompanhar sua jornada
          </h2>

          <p className="mt-4 text-[15px] leading-7 text-[#6f6961]">
            Materiais complementares para consultar, praticar e aprofundar os
            conceitos apresentados ao longo das 6 Chaves.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {engenhariaContent.bonus.map((bonus, index) => (
            <article
              key={bonus.titulo}
              className="rounded-[22px] border border-[#ddd8cf] bg-white p-6"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#8b7968]">
                  {bonus.label}
                </span>

                <span className="text-xs font-bold text-[#b59b7c]">
                  0{index + 1}
                </span>
              </div>

              <h3 className="mt-8 text-xl font-bold leading-6 text-[#24211d]">
                {bonus.titulo}
              </h3>

              <p className="mb-0 mt-3 text-sm leading-6 text-[#6f6961]">
                {bonus.texto}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-5 rounded-[22px] border border-[#ddd8cf] bg-[#fbfaf7] p-5 sm:p-7">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#8b7968]">
            Dentro do Cofre da Jornada
          </span>

          <div className="mt-5 grid gap-x-8 gap-y-3 md:grid-cols-2">
            {engenhariaContent.bonusExtras.map((item) => (
              <div
                key={item}
                className="flex gap-3 border-b border-[#e6e1da] pb-3 text-sm leading-6 text-[#5f5952]"
              >
                <span className="mt-[2px] text-[#9d8266]">✦</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}