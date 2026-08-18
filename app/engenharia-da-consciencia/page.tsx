import type { Metadata } from "next";

import EngenhariaAutor from "@/components/engenharia/EngenhariaAutor";
import EngenhariaBonus from "@/components/engenharia/EngenhariaBonus";
import EngenhariaCaminhos from "@/components/engenharia/EngenhariaCaminhos";
import EngenhariaFaq from "@/components/engenharia/EngenhariaFaq";
import EngenhariaGarantia from "@/components/engenharia/EngenhariaGarantia";
import EngenhariaHeader from "@/components/engenharia/EngenhariaHeader";
import EngenhariaHero from "@/components/engenharia/EngenhariaHero";
import EngenhariaMetodo from "@/components/engenharia/EngenhariaMetodo";
import EngenhariaOferta from "@/components/engenharia/EngenhariaOferta";
import EngenhariaProgramatico from "@/components/engenharia/EngenhariaProgramatico";
import EngenhariaProvaSocial from "@/components/engenharia/EngenhariaProvaSocial";
import EngenhariaTransformacao from "@/components/engenharia/EngenhariaTransformacao";
import EngenhariaVsl from "@/components/engenharia/EngenhariaVsl";
import EngenhariaWhatsApp from "@/components/engenharia/EngenhariaWhatsApp";

export const metadata: Metadata = {
  title:
    "Engenharia da Consciência | Autoconhecimento e Autogoverno",

  description:
    "Conheça a Engenharia da Consciência: uma jornada estruturada de autoconhecimento, autogoverno e desenvolvimento da consciência.",

  alternates: {
    canonical:
      "https://canvaspiritual.com/engenharia-da-consciencia",
  },
};

export default function EngenhariaDaConscienciaPage() {
  return (
    <>
      <EngenhariaHeader />

      <main>
        <EngenhariaHero />

        <EngenhariaVsl />

        <EngenhariaMetodo />

        <EngenhariaTransformacao />

        <EngenhariaProvaSocial
          id="12"
          variant="compact"
          background="cream"
          eyebrow="Mudanças percebidas"
        />

        <EngenhariaCaminhos />

        <EngenhariaAutor />

        <EngenhariaProgramatico />

        <EngenhariaProvaSocial
          id="03"
          variant="regular"
          eyebrow="Sobre as aulas"
          title="Quando uma aula faz você querer assistir à próxima"
          description="Um relato espontâneo sobre a experiência de percorrer o conteúdo."
        />

        <EngenhariaBonus />

        <EngenhariaProvaSocial
          id="13"
          variant="story"
          background="cream"
          eyebrow="Uma experiência completa"
          title="“Eu assisti o curso inteiro em 3 dias.”"
          description="Este relato atravessa praticamente toda a jornada: aulas, material, diagnóstico e a experiência pessoal com o conteúdo."
        />

        <EngenhariaOferta />

        <EngenhariaProvaSocial
          id="16"
          variant="regular"
          eyebrow="Depois de conhecer a jornada"
          title="Curso, quiz e relatório na experiência de quem já passou pelo processo"
        />

        <EngenhariaGarantia />

        <EngenhariaFaq />
      </main>

      <EngenhariaWhatsApp phone="5521972702210" />
    </>
  );
}