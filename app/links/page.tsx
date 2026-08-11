"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

type LinkItem = {
  title: string;
  description: string;
  href: string;
  content: string;
  icon: string;
  featured?: boolean;
};

const LINKS: LinkItem[] = [
  {
    title: "Assista à Aula Gratuita",
    description:
      "Conheça as 3 etapas da autocura emocional e descubra uma nova forma de compreender seus padrões.",
    href: "https://api.canvaspiritual.com/codigodaharmonia.html",
    content: "aula",
    icon: "▶",
    featured: true,
  },
  {
    title: "Faça seu Mapa da Alma",
    description:
      "Faça sua autoanálise e conheça melhor suas forças e padrões emocionais.",
    href: "https://api.canvaspiritual.com/quiz-geral.html?vend=da620ac4-1d83-4a3a-87b3-4ad34e356df2",
    content: "mapa_da_alma",
    icon: "✦",
  },
  {
    title: "As 48 Prisões Emocionais",
    description:
      "Conheça padrões emocionais que podem estar se repetindo silenciosamente na sua vida.",
    href: "https://api.canvaspiritual.com/landing-48-prisoes.html",
    content: "48_prisoes",
    icon: "◇",
  },
  {
    title: "Ebook Canva Espiritual",
    description:
      "Aprofunde seu conhecimento sobre o Mapa da Alma e a Engenharia da Consciência.",
    href: "https://api.canvaspiritual.com/ebookcanvaespiritual.html",
    content: "ebook",
    icon: "▤",
  },
  {
    title: "Renda Extra",
    description:
      "Compartilhe o Mapa da Alma, cadastre novas pessoas e conheça nosso programa de distribuição.",
    href: "https://api.canvaspiritual.com/distribuicao/apresentacao.html",
    content: "distribuidor",
    icon: "↗",
  },
];

function buildTrackedUrl(
  href: string,
  source: string,
  medium: string,
  campaign: string,
  content: string,
) {
  const url = new URL(href);

  url.searchParams.set("utm_source", source);
  url.searchParams.set("utm_medium", medium);
  url.searchParams.set("utm_campaign", campaign);
  url.searchParams.set("utm_content", content);

  return url.toString();
}

export default function LinksPage() {
  const searchParams = useSearchParams();

  const tracking = useMemo(() => {
    return {
      source:
        searchParams.get("utm_source") || "direct",
      medium:
        searchParams.get("utm_medium") || "organic",
      campaign:
        searchParams.get("utm_campaign") || "bio",
    };
  }, [searchParams]);

  return (
    <main className="linksPage">
      <div className="linksContainer">
        <header className="linksHeader">
          <div className="brandMark">C</div>

          <p className="brand">CANVA ESPIRITUAL</p>

          <h1>Por onde você quer começar?</h1>

          <p className="intro">
            Escolha abaixo o conteúdo que mais combina
            com o seu momento.
          </p>
        </header>

        <section className="linksList">
          {LINKS.map((item) => {
            const trackedHref = buildTrackedUrl(
              item.href,
              tracking.source,
              tracking.medium,
              tracking.campaign,
              item.content,
            );

            return (
              <a
                key={item.content}
                href={trackedHref}
                className={`linkCard ${
                  item.featured ? "featured" : ""
                }`}
              >
                <div className="linkIcon">
                  {item.icon}
                </div>

                <div className="linkText">
                  {item.featured && (
                    <span className="recommended">
                      COMECE POR AQUI
                    </span>
                  )}

                  <strong>{item.title}</strong>

                  <span>{item.description}</span>
                </div>

                <div className="arrow">→</div>
              </a>
            );
          })}
        </section>

        <div className="divider" />

        <p className="footerText">
          Autoconhecimento • Autogoverno • Autorealização
        </p>

        <p className="copyright">
          © Canva Espiritual
        </p>
      </div>

      <style jsx>{`
        .linksPage {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at top,
              rgba(255, 170, 0, 0.08),
              transparent 32%
            ),
            #080808;
          color: #ffffff;
          padding: 48px 18px 40px;
          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }

        .linksContainer {
          width: 100%;
          max-width: 640px;
          margin: 0 auto;
        }

        .linksHeader {
          text-align: center;
          margin-bottom: 32px;
        }

        .brandMark {
          width: 58px;
          height: 58px;
          margin: 0 auto 16px;
          border: 1px solid #f5a000;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #f5a000;
          font-size: 28px;
          font-weight: 800;
        }

        .brand {
          color: #f5a000;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 4px;
          margin: 0 0 16px;
        }

        h1 {
          font-size: clamp(30px, 7vw, 46px);
          line-height: 1.04;
          letter-spacing: -1.5px;
          margin: 0 auto 14px;
          max-width: 560px;
        }

        .intro {
          color: #a9a9a9;
          max-width: 470px;
          margin: 0 auto;
          font-size: 16px;
          line-height: 1.5;
        }

        .linksList {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .linkCard {
          position: relative;
          display: flex;
          align-items: center;
          gap: 16px;

          padding: 19px 18px;

          border: 1px solid #282828;
          border-radius: 18px;

          background: #111111;
          color: #ffffff;

          text-decoration: none;

          transition:
            transform 0.18s ease,
            border-color 0.18s ease,
            background 0.18s ease;
        }

        .linkCard:hover {
          transform: translateY(-2px);
          border-color: #555;
          background: #151515;
        }

        .linkCard.featured {
          border-color: rgba(245, 160, 0, 0.7);
          background:
            linear-gradient(
              135deg,
              rgba(245, 160, 0, 0.13),
              rgba(245, 160, 0, 0.025)
            ),
            #111111;
        }

        .linkIcon {
          flex: 0 0 46px;
          width: 46px;
          height: 46px;

          border-radius: 14px;

          display: flex;
          align-items: center;
          justify-content: center;

          background: #1d1d1d;
          color: #f5a000;

          font-size: 21px;
          font-weight: 700;
        }

        .featured .linkIcon {
          background: #f5a000;
          color: #080808;
        }

        .linkText {
          min-width: 0;
          flex: 1;

          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .linkText strong {
          font-size: 17px;
          line-height: 1.2;
        }

        .linkText > span:not(.recommended) {
          color: #999999;
          font-size: 13px;
          line-height: 1.4;
        }

        .recommended {
          width: fit-content;

          color: #f5a000;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.4px;
        }

        .arrow {
          flex: 0 0 auto;
          color: #6e6e6e;
          font-size: 21px;
          padding-left: 4px;
        }

        .featured .arrow {
          color: #f5a000;
        }

        .divider {
          height: 1px;
          background: #202020;
          margin: 34px 0 22px;
        }

        .footerText {
          text-align: center;
          color: #777777;
          font-size: 12px;
          line-height: 1.5;
          margin: 0;
        }

        .copyright {
          text-align: center;
          color: #454545;
          font-size: 11px;
          margin: 10px 0 0;
        }

        @media (max-width: 480px) {
          .linksPage {
            padding:
              34px 14px
              calc(30px + env(safe-area-inset-bottom));
          }

          .linksHeader {
            margin-bottom: 26px;
          }

          .brandMark {
            width: 52px;
            height: 52px;
            font-size: 25px;
          }

          h1 {
            font-size: 34px;
          }

          .intro {
            font-size: 14px;
          }

          .linkCard {
            padding: 17px 15px;
            gap: 13px;
            border-radius: 16px;
          }

          .linkIcon {
            flex-basis: 42px;
            width: 42px;
            height: 42px;
          }

          .linkText strong {
            font-size: 16px;
          }

          .linkText > span:not(.recommended) {
            font-size: 12px;
          }
        }
      `}</style>
    </main>
  );
}