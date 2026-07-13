export type DetectedLanguage =
  | "Português"
  | "Espanhol"
  | "Inglês"
  | "Outro"
  | "Indefinido";

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function countMatches(
  text: string,
  words: string[],
): number {
  return words.reduce((score, word) => {
    const regex = new RegExp(
      `(^|\\s|[^a-z])${word}($|\\s|[^a-z])`,
      "g",
    );

    return score + (text.match(regex)?.length ?? 0);
  }, 0);
}

export function detectLanguage(
  ...values: Array<string | undefined | null>
): DetectedLanguage {
  const originalText = values
    .filter(Boolean)
    .join(" ")
    .trim();

  if (!originalText) {
    return "Indefinido";
  }

  const text = normalizeText(originalText);

  const portugueseScore = countMatches(text, [
    "sou",
    "voce",
    "terapeuta",
    "atendimento",
    "atendimentos",
    "saude",
    "emocional",
    "online",
    "presencial",
    "agendamento",
    "brasil",
    "brasileiro",
    "brasileira",
    "para",
    "com",
    "seu",
    "sua",
    "meu",
    "minha",
  ]);

  const spanishScore = countMatches(text, [
    "soy",
    "eres",
    "terapeuta",
    "terapia",
    "salud",
    "emocional",
    "citas",
    "sesiones",
    "atencion",
    "presencial",
    "espana",
    "mexico",
    "argentina",
    "colombia",
    "para",
    "con",
    "tu",
    "tus",
  ]);

  const englishScore = countMatches(text, [
    "i",
    "am",
    "therapist",
    "therapy",
    "healing",
    "health",
    "emotional",
    "sessions",
    "appointment",
    "online",
    "wellness",
    "coach",
    "with",
    "your",
    "you",
  ]);

  const scores = [
    {
      language: "Português" as const,
      score: portugueseScore,
    },
    {
      language: "Espanhol" as const,
      score: spanishScore,
    },
    {
      language: "Inglês" as const,
      score: englishScore,
    },
  ].sort((first, second) => second.score - first.score);

  const winner = scores[0];
  const secondPlace = scores[1];

  if (winner.score === 0) {
    return "Indefinido";
  }

  if (
    winner.score === secondPlace.score &&
    winner.score < 3
  ) {
    return "Indefinido";
  }

  return winner.language;
}