import { engenhariaContent } from "@/lib/engenharia/content";

export default function EngenhariaHero() {
  const { hero } = engenhariaContent;

  return (
    <section className="relative overflow-hidden bg-[#fbfaf7]">
      <div className="absolute -right-32 -top-40 h-[420px] w-[420px] rounded-full bg-[#b59b7c]/15 blur-3xl" />

      <div className="relative mx-auto max-w-[960px] px-4 pb-14 pt-16 text-center sm:px-6 sm:pb-20 sm:pt-24">
        <span className="mb-5 inline-block text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#6d5a48]">
          {hero.eyebrow}
        </span>

        <h1 className="mx-auto max-w-[850px] text-[38px] font-bold leading-[1.03] tracking-[-0.045em] text-[#24211d] sm:text-[52px] lg:text-[64px]">
          {hero.headline}
        </h1>

        <p className="mx-auto mt-6 max-w-[700px] text-[16px] leading-7 text-[#6f6961] sm:text-[18px] sm:leading-8">
          {hero.context}
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href="#aula"
            className="rounded-full bg-[#332b24] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#181512]"
          >
            Assistir à apresentação
          </a>

          <a
            href="#conteudo-programatico"
            className="rounded-full border border-[#cfc8bd] bg-white px-6 py-3.5 text-sm font-bold text-[#332b24] transition hover:border-[#332b24]"
          >
            Ver conteúdo completo
          </a>
        </div>

        <div className="mx-auto mt-8 flex max-w-[650px] flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-[#817970]">
          <span>• 6 etapas</span>
          <span>• 50+ aulas</span>
          <span>• Conteúdo mobile</span>
          <span>• 7 dias de garantia</span>
        </div>
      </div>
    </section>
  );
}