import { engenhariaContent } from "@/lib/engenharia/content";

export default function EngenhariaGarantia() {
  const { garantia } = engenhariaContent;

  return (
    <section className="bg-white py-14 sm:py-18">
      <div className="mx-auto max-w-[880px] px-4 sm:px-6">
        <div className="rounded-[26px] border border-[#ddd8cf] bg-[#fbfaf7] p-6 sm:p-9">
          <div className="grid gap-7 sm:grid-cols-[120px_1fr] sm:items-center">
            <div className="mx-auto grid h-[110px] w-[110px] place-items-center rounded-full border border-[#d2c8bb] bg-white text-center">
              <div>
                <strong className="block text-[34px] leading-none text-[#332b24]">
                  7
                </strong>

                <span className="mt-1 block text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#81766b]">
                  dias
                </span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#8b7968]">
                Você decide com calma
              </span>

              <h2 className="mt-2 text-[25px] font-bold tracking-[-0.03em] text-[#24211d] sm:text-[30px]">
                {garantia.titulo}
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#6f6961]">
                {garantia.texto}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {garantia.itens.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-[#ddd8cf] bg-white px-3 py-2 text-[11px] font-semibold text-[#625a52]"
                  >
                    ✓ {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}