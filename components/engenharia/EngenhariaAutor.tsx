import Image from "next/image";

export default function EngenhariaAutor() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-[1000px] px-4 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-14">
          <div className="relative">
            <div className="relative h-[340px] overflow-hidden rounded-[28px] border border-[#ddd8cf] bg-[#f1eee8] sm:h-[420px] lg:h-auto lg:aspect-[4/5]">              <Image
                src="/img/engenharia/autor/gustavo-prado-05.jpg"
                alt="Gustavo Prado, autor da Engenharia da Consciência"
                fill
                sizes="(max-width: 1024px) 100vw, 420px"
                className="object-cover object-[center_32%]"
              />
            </div>

            <div className="absolute -bottom-5 -right-3 hidden max-w-[220px] rounded-[20px] border border-[#ddd8cf] bg-white p-5 shadow-[0_18px_50px_rgba(47,38,29,.10)] sm:block">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#9a8b7c]">
                Uma ideia central
              </span>

              <p className="mb-0 mt-2 text-sm font-semibold leading-6 text-[#332b24]">
                Autoconhecimento não precisa permanecer abstrato. Ele pode ser
                organizado, observado e praticado.
              </p>
            </div>
          </div>

          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#6d5a48]">
              Quem está por trás do método
            </span>

            <h2 className="mt-3 text-[29px] font-bold leading-[1.08] tracking-[-0.035em] text-[#24211d] sm:text-[40px]">
              Uma busca por transformar conhecimento espiritual em algo
              aplicável à vida real
            </h2>

            <div className="mt-6 space-y-4 text-[15px] leading-7 text-[#625c55]">
              <p>
                A Engenharia da Consciência nasceu da tentativa de organizar
                conhecimentos que, muitas vezes, aparecem separados:
                espiritualidade, autoconhecimento, comportamento, emoções,
                hábitos e propósito.
              </p>

              <p>
                Em vez de apenas acumular conceitos, a proposta passou a ser
                construir mapas simples para observar a própria vida:
                reconhecer estados, compreender padrões e transformar
                percepção em prática.
              </p>

              <p>
                Dessa organização surgiram o Mapa da Alma, as etapas de
                autogoverno e uma jornada progressiva que hoje compõe a
                Engenharia da Consciência.
              </p>
            </div>

            <div className="mt-7 flex items-center gap-4 border-t border-[#e4dfd7] pt-6">
              <div>
                <strong className="block text-base text-[#24211d]">
                  Gustavo Prado
                </strong>

                <span className="text-sm text-[#817970]">
                  Autor da Engenharia da Consciência
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}