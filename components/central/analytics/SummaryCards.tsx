type SummaryCardsProps = {
  visitors: number;
  sessions: number;
  plays: number;
  pitchReached: number;
  checkoutOpened: number;

  playRate: number;
  pitchRate: number;
  checkoutRate: number;

  averageWatchSeconds: number;
  averageMaxReachedSecond: number;
};

function formatDuration(totalSeconds: number): string {
  const safeSeconds = Math.max(
    0,
    Math.round(totalSeconds),
  );

  const minutes = Math.floor(
    safeSeconds / 60,
  );

  const seconds = safeSeconds % 60;

  return `${minutes}:${String(seconds).padStart(
    2,
    "0",
  )}`;
}

function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function SummaryCards({
  visitors,
  sessions,
  plays,
  pitchReached,
  checkoutOpened,
  playRate,
  pitchRate,
  checkoutRate,
  averageWatchSeconds,
  averageMaxReachedSecond,
}: SummaryCardsProps) {
  const cards = [
    {
      label: "Visitantes",
      value: visitors.toLocaleString("pt-BR"),
      helper: `${sessions.toLocaleString(
        "pt-BR",
      )} sessões`,
    },
    {
      label: "Plays",
      value: plays.toLocaleString("pt-BR"),
      helper: `Play rate: ${formatPercentage(
        playRate,
      )}`,
    },
    {
      label: "Chegaram ao pitch",
      value: pitchReached.toLocaleString(
        "pt-BR",
      ),
      helper: `Dos plays: ${formatPercentage(
        pitchRate,
      )}`,
    },
    {
      label: "Abriram checkout",
      value: checkoutOpened.toLocaleString(
        "pt-BR",
      ),
      helper: `Dos plays: ${formatPercentage(
        checkoutRate,
      )}`,
    },
    {
      label: "Tempo médio assistido",
      value: formatDuration(
        averageWatchSeconds,
      ),
      helper: "Consumo real médio",
    },
    {
      label: "Maior ponto médio",
      value: formatDuration(
        averageMaxReachedSecond,
      ),
      helper: "Média do ponto máximo",
    },
  ];

  return (
    <section
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "16px",
      }}
    >
      {cards.map((card) => (
        <article
          key={card.label}
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "16px",
            padding: "18px",
            background: "#ffffff",
            boxShadow:
              "0 8px 24px rgba(15, 23, 42, 0.04)",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            {card.label}
          </p>

          <strong
            style={{
              display: "block",
              marginTop: "8px",
              fontSize: "28px",
              lineHeight: 1.1,
              color: "#0f172a",
            }}
          >
            {card.value}
          </strong>

          <p
            style={{
              margin: "8px 0 0",
              color: "#64748b",
              fontSize: "12px",
            }}
          >
            {card.helper}
          </p>
        </article>
      ))}
    </section>
  );
}