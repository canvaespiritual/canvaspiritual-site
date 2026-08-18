export type DepoimentoTema =
  | "curso"
  | "aulas"
  | "material"
  | "transformacao"
  | "diagnostico"
  | "proposito"
  | "clareza"
  | "relatorio";

export interface EngenhariaDepoimento {
  id: string;
  src: string;
  alt: string;
  resumo: string;
  temas: DepoimentoTema[];
  formato: "curto" | "medio" | "longo";
}

export const engenhariaDepoimentos: EngenhariaDepoimento[] = [
  {
    id: "01",
    src: "/img/engenharia/depoimentos/prova-social-01.jpg",
    alt: "Depoimento real de aluna sobre a organização e objetividade das aulas",
    resumo:
      "Suas aulas são muito bem organizadas. Cada frase traz um conteúdo intenso e preciso.",
    temas: ["curso", "aulas"],
    formato: "curto",
  },
  {
    id: "02",
    src: "/img/engenharia/depoimentos/prova-social-02.jpg",
    alt: "Depoimento real sobre a qualidade e objetividade do material escrito",
    resumo:
      "O material escrito é sucinto e por isso mesmo é tão bom.",
    temas: ["curso", "material"],
    formato: "medio",
  },
  {
    id: "03",
    src: "/img/engenharia/depoimentos/prova-social-03.jpg",
    alt: "Depoimento real de aluna que concluiu o curso em três dias",
    resumo:
      "Eu fiz em 3 dias porque queria sempre assistir a próxima aula.",
    temas: ["curso", "aulas", "material"],
    formato: "medio",
  },
  {
    id: "04",
    src: "/img/engenharia/depoimentos/prova-social-04.png",
    alt: "Depoimento real sobre a precisão do diagnóstico",
    resumo:
      "A construção deste diagnóstico é muito certeira no meu caso.",
    temas: ["diagnostico", "relatorio"],
    formato: "curto",
  },
  {
    id: "05",
    src: "/img/engenharia/depoimentos/prova-social-05.png",
    alt: "Depoimento real destacando profundidade e estudo do conteúdo",
    resumo:
      "Estou gostando. Muita profundidade e estudo da sua parte.",
    temas: ["curso", "aulas"],
    formato: "curto",
  },
  {
    id: "06",
    src: "/img/engenharia/depoimentos/prova-social-06.png",
    alt: "Depoimento real sobre uma experiência prazerosa e transformadora com o conteúdo",
    resumo:
      "Está sendo muito prazeroso e frutificante.",
    temas: ["transformacao", "curso"],
    formato: "medio",
  },
  {
    id: "07",
    src: "/img/engenharia/depoimentos/prova-social-07.png",
    alt: "Depoimento real sobre a profundidade do curso",
    resumo:
      "Estou gostando. Muita profundidade e estudo da sua parte.",
    temas: ["curso"],
    formato: "curto",
  },
  {
    id: "08",
    src: "/img/engenharia/depoimentos/prova-social-08.png",
    alt: "Depoimento real de aluna que reassiste às aulas com o esposo",
    resumo:
      "Esta aula é uma das minhas preferidas. Assisto diversas vezes junto com meu esposo.",
    temas: ["curso", "aulas"],
    formato: "curto",
  },
  {
    id: "09",
    src: "/img/engenharia/depoimentos/prova-social-09.png",
    alt: "Depoimento real sobre propósito e autoconhecimento",
    resumo:
      "Me sinto a caminho do meu propósito.",
    temas: ["transformacao", "proposito"],
    formato: "medio",
  },
  {
    id: "10",
    src: "/img/engenharia/depoimentos/prova-social-10.png",
    alt: "Depoimento real sobre clareza das explicações e transformação contínua",
    resumo:
      "Me vejo transformar lentamente, mas de forma contínua.",
    temas: ["transformacao", "clareza"],
    formato: "medio",
  },
  {
    id: "11",
    src: "/img/engenharia/depoimentos/prova-social-11.png",
    alt: "Depoimento real sobre o material escrito do curso",
    resumo:
      "O material escrito é sucinto e por isso mesmo é tão bom.",
    temas: ["curso", "material"],
    formato: "curto",
  },
  {
    id: "12",
    src: "/img/engenharia/depoimentos/prova-social-12.png",
    alt: "Depoimento real sobre mudança percebida no dia a dia",
    resumo:
      "Está me libertando de mim mesma. Tenho até visto mudança no meu dia a dia.",
    temas: ["transformacao"],
    formato: "medio",
  },
  {
    id: "13",
    src: "/img/engenharia/depoimentos/prova-social-13.jpeg",
    alt: "Depoimento completo e real de aluna sobre sua experiência com a Engenharia da Consciência",
    resumo:
      "Relato completo sobre aulas, diagnóstico, organização do curso e mudanças percebidas durante a jornada.",
    temas: [
      "curso",
      "aulas",
      "material",
      "transformacao",
      "diagnostico",
      "clareza",
    ],
    formato: "longo",
  },
  {
    id: "14",
    src: "/img/engenharia/depoimentos/prova-social-14.jpeg",
    alt: "Depoimento real sobre clareza e percepção dos próprios comportamentos",
    resumo:
      "Seu curso me trouxe esta clareza e a possibilidade de enxergar meus comportamentos de forma mais objetiva.",
    temas: ["clareza", "transformacao", "curso"],
    formato: "medio",
  },
  {
    id: "15",
    src: "/img/engenharia/depoimentos/prova-social-15.jpeg",
    alt: "Depoimento real sobre a precisão do relatório e do diagnóstico",
    resumo:
      "Não sei como você elaborou o relatório, mas é cirúrgico.",
    temas: ["diagnostico", "relatorio", "clareza"],
    formato: "longo",
  },
  {
    id: "16",
    src: "/img/engenharia/depoimentos/prova-social-16.jpeg",
    alt: "Depoimento real sobre o curso, o quiz e o relatório",
    resumo:
      "O curso é maravilhoso. Me trouxe clareza, beleza, entendimento e alegria.",
    temas: ["curso", "clareza", "relatorio", "transformacao"],
    formato: "longo",
  },
  {
    id: "17",
    src: "/img/engenharia/depoimentos/prova-social-17.png",
    alt: "Depoimento real sobre clareza e compreensão do próprio comportamento",
    resumo:
      "O relatório me fez enxergar meu comportamento por um ângulo que jamais imaginei.",
    temas: ["clareza", "relatorio"],
    formato: "medio",
  },
];

export function getEngenhariaDepoimento(
  id: string,
): EngenhariaDepoimento | undefined {
  return engenhariaDepoimentos.find(
    (depoimento) => depoimento.id === id,
  );
}