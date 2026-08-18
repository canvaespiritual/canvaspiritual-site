type AdAnalyticsRow = {
  campaignId: string | null;
  campaignName: string | null;

  adId: string | null;
  adName: string | null;

  sessions: number;
  visitors: number;
  plays: number;
  pitchReached: number;
  checkoutOpened: number;

  playRate: number;
  pitchRate: number;
  checkoutRate: number;

  averageWatchSeconds: number;
  averageMaxReachedSecond: number;
};

type AdTableProps = {
  ads: AdAnalyticsRow[];
  campaignLabel?: string | null;
};

function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

function formatDuration(totalSeconds: number): string {
  const safeSeconds = Math.max(
    0,
    Math.round(totalSeconds),
  );

  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  return `${minutes}:${String(seconds).padStart(
    2,
    "0",
  )}`;
}

function getAdLabel(ad: AdAnalyticsRow): string {
  return (
    ad.adName ||
    ad.adId ||
    "Anúncio não identificado"
  );
}

export function AdTable({
  ads,
  campaignLabel,
}: AdTableProps) {
  return (
    <section
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: "16px",
        background: "#ffffff",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "20px",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <h2
          style={{
            margin: 0,
            color: "#0f172a",
            fontSize: "18px",
          }}
        >
          Desempenho por anúncio
        </h2>

        <p
          style={{
            margin: "6px 0 0",
            color: "#64748b",
            fontSize: "13px",
          }}
        >
          {campaignLabel
            ? `Criativos da campanha ${campaignLabel}.`
            : "Selecione uma campanha para visualizar os criativos."}
        </p>
      </div>

      {ads.length === 0 ? (
        <div
          style={{
            padding: "24px 20px",
            color: "#64748b",
            fontSize: "14px",
          }}
        >
          Nenhum anúncio encontrado para esta campanha.
        </div>
      ) : (
        <div
          style={{
            overflowX: "auto",
          }}
        >
          <table
            style={{
              width: "100%",
              minWidth: "1200px",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#f8fafc",
                }}
              >
                {[
                  "Anúncio",
                  "Visitantes",
                  "Sessões",
                  "Plays",
                  "Play rate",
                  "Pitch",
                  "Taxa pitch",
                  "Checkout",
                  "Taxa checkout",
                  "Tempo médio",
                  "Ponto máximo médio",
                ].map((label) => (
                  <th
                    key={label}
                    style={{
                      padding: "12px 14px",
                      textAlign:
                        label === "Anúncio"
                          ? "left"
                          : "right",
                      color: "#475569",
                      fontSize: "12px",
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                      borderBottom:
                        "1px solid #e5e7eb",
                    }}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {ads.map((ad, index) => {
                const rowKey =
                  ad.adId ||
                  `sem-anuncio-${index}`;

                return (
                  <tr key={rowKey}>
                    <td
                      style={{
                        padding: "14px",
                        borderBottom:
                          "1px solid #f1f5f9",
                        color: "#0f172a",
                        fontSize: "13px",
                        fontWeight: 600,
                      }}
                    >
                      <div>{getAdLabel(ad)}</div>

                      {ad.adName && ad.adId && (
                        <div
                          style={{
                            marginTop: "3px",
                            color: "#94a3b8",
                            fontSize: "11px",
                            fontWeight: 400,
                          }}
                        >
                          {ad.adId}
                        </div>
                      )}
                    </td>

                    <td style={numberCellStyle}>
                      {ad.visitors.toLocaleString(
                        "pt-BR",
                      )}
                    </td>

                    <td style={numberCellStyle}>
                      {ad.sessions.toLocaleString(
                        "pt-BR",
                      )}
                    </td>

                    <td style={numberCellStyle}>
                      {ad.plays.toLocaleString(
                        "pt-BR",
                      )}
                    </td>

                    <td style={numberCellStyle}>
                      {formatPercentage(ad.playRate)}
                    </td>

                    <td style={numberCellStyle}>
                      {ad.pitchReached.toLocaleString(
                        "pt-BR",
                      )}
                    </td>

                    <td style={numberCellStyle}>
                      {formatPercentage(ad.pitchRate)}
                    </td>

                    <td style={numberCellStyle}>
                      {ad.checkoutOpened.toLocaleString(
                        "pt-BR",
                      )}
                    </td>

                    <td style={numberCellStyle}>
                      {formatPercentage(
                        ad.checkoutRate,
                      )}
                    </td>

                    <td style={numberCellStyle}>
                      {formatDuration(
                        ad.averageWatchSeconds,
                      )}
                    </td>

                    <td style={numberCellStyle}>
                      {formatDuration(
                        ad.averageMaxReachedSecond,
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

const numberCellStyle = {
  padding: "14px",
  textAlign: "right" as const,
  borderBottom: "1px solid #f1f5f9",
  color: "#334155",
  whiteSpace: "nowrap" as const,
};