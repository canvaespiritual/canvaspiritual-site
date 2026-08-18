"use client";

import { useEffect, useState } from "react";

const PLAYER_URL =
  "https://scripts.converteai.net/ab0d5dbd-353e-4147-a5c6-52ab96121828/players/6921af18929a71f0a170c388/v4/embed.html";

export default function EngenhariaVsl() {
  const [src, setSrc] = useState(PLAYER_URL);

  useEffect(() => {
    const search = window.location.search;

    const separator = search ? "&" : "?";

    setSrc(
      `${PLAYER_URL}${search}${separator}vl=${encodeURIComponent(
        window.location.href,
      )}`,
    );
  }, []);

  return (
    <section
      id="aula"
      className="border-y border-[#e6e1da] bg-white py-14 sm:py-20"
    >
      <div className="mx-auto max-w-[940px] px-4 sm:px-6">
        <div className="mx-auto mb-8 max-w-[720px] text-center">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#6d5a48]">
            Apresentação
          </span>

          <h2 className="mt-3 text-[28px] font-bold leading-tight tracking-[-0.035em] text-[#24211d] sm:text-[36px]">
            Entenda primeiro como funciona a Engenharia da Consciência
          </h2>

          <p className="mx-auto mt-4 max-w-[620px] text-[15px] leading-7 text-[#6f6961]">
            Assista à apresentação e conheça a lógica do método, o Mapa da
            Alma, o autogoverno e o caminho proposto pela jornada.
          </p>
        </div>

        <div className="overflow-hidden rounded-[22px] border border-[#d8d2c9] bg-[#181512] shadow-[0_22px_70px_rgba(47,38,29,.12)]">
          <div className="relative aspect-video w-full">
            <iframe
              src={src}
              title="Apresentação da Engenharia da Consciência"
              allowFullScreen
              referrerPolicy="origin"
              className="absolute inset-0 h-full w-full border-0"
            />
          </div>
        </div>

        <p className="mt-5 text-center text-xs leading-5 text-[#8b837a]">
          Prefere conhecer por escrito? Continue descendo. Todo o conteúdo da
          jornada está apresentado nesta página.
        </p>
      </div>
    </section>
  );
}