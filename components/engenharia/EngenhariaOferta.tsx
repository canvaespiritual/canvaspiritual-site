import { engenhariaContent } from "@/lib/engenharia/content";

export default function EngenhariaOferta() {
  const { oferta } = engenhariaContent;

  return (
    <section
      id="oferta"
      className="bg-[#fbfaf7] py-16 sm:py-24"
    >
      <div className="mx-auto max-w-[920px] px-4 sm:px-6">
        <div className="overflow-hidden rounded-[28px] border border-[#d7d0c6] bg-white shadow-[0_24px_80px_rgba(47,38,29,.08)]">
          <div className="grid lg:grid-cols-[1.08fr_.92fr]">
            <div className="p-6 sm:p-9 lg:p-10">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#7a6756]">
                {oferta.tag}
              </span>

              <h2 className="mt-4 text-[30px] font-bold leading-[1.06] tracking-[-0.04em] text-[#24211d] sm:text-[40px]">
                {oferta.titulo}
              </h2>

              <p className="mt-5 max-w-[520px] text-[15px] leading-7 text-[#6f6961]">
                {oferta.descricao}
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {oferta.itens.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-sm text-[#514b44]"
                  >
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#eee8df] text-[10px] font-bold text-[#6d5a48]">
                      ✓
                    </span>

                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col justify-center bg-[#332b24] p-6 text-white sm:p-9 lg:p-10">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#d6c2aa]">
                Acesso à jornada
              </span>

              <div className="mt-5">
                <span className="block text-sm text-white/55">
                  De R$ {oferta.precoDe}
                </span>

                <div className="mt-1 flex items-end gap-2">
                  <span className="text-sm font-semibold text-[#d6c2aa]">
                    por
                  </span>

                  <strong className="text-[52px] font-bold leading-none tracking-[-0.05em]">
                    R$ {oferta.preco}
                  </strong>
                </div>

                <p className="mb-0 mt-3 text-xs leading-5 text-white/60">
                  {oferta.parcelas}
                </p>
              </div>

              <a
                href={oferta.checkoutUrl}
                className="mt-7 block rounded-full bg-[#f1e5d4] px-5 py-4 text-center text-sm font-extrabold text-[#332b24] transition hover:bg-white"
              >
                Quero acessar a jornada
              </a>

              <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-white/55">
                <span>✓ Acesso imediato</span>
                <span>✓ Ambiente seguro</span>
                <span>✓ 7 dias de garantia</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}