type CampaignAnalyticsRow = {
  campaignId: string | null;
  campaignName: string | null;

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

type CampaignTableProps = {
  campaigns: CampaignAnalyticsRow[];
  selectedCampaignId?: string | null;
  onSelectCampaign?: (
    campaignId: string | null,
  ) => void;
};

function formatPercentage(
  value: number,
): string {
  return `${value.toFixed(1)}%`;
}

function formatDuration(
  totalSeconds: number,
): string {
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

function getCampaignLabel(
  campaign: CampaignAnalyticsRow,
): string {
  return (
    campaign.campaignName ||
    campaign.campaignId ||
    "Sem campanha identificada"
  );
}

export function CampaignTable({
  campaigns,
  selectedCampaignId,
  onSelectCampaign,
}: CampaignTableProps) {
  if (campaigns.length === 0) {
    return (
      <section
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: "16px",
          padding: "24px",
          background: "#ffffff",
        }}
      >
        <h2
          style={{
            margin: 0,
            color: "#0f172a",
            fontSize: "18px",
          }}
        >
          Desempenho por campanha
        </h2>

        <p
          style={{
            margin: "10px 0 0",
            color: "#64748b",
          }}
        >
          Ainda não há campanhas registradas.
        </p>
      </section>
    );
  }

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
          Desempenho por campanha
        </h2>

        <p
          style={{
            margin: "6px 0 0",
            color: "#64748b",
            fontSize: "13px",
          }}
        >
          Clique em uma campanha para visualizar
          sua retenção individual.
        </p>
      </div>

      <div
        style={{
          overflowX: "auto",
        }}
      >
        <table
          style={{
            width: "100%",
            minWidth: "1100px",
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
                "Campanha",
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
                      label === "Campanha"
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
            {campaigns.map((campaign) => {
              const rowKey =
                campaign.campaignId ||
                "sem-campanha";

              const isSelected =
                selectedCampaignId ===
                campaign.campaignId;

              return (
                <tr
                  key={rowKey}
                  onClick={() =>
                    onSelectCampaign?.(
                      campaign.campaignId,
                    )
                  }
                  style={{
                    cursor: onSelectCampaign
                      ? "pointer"
                      : "default",

                    background: isSelected
                      ? "#eff6ff"
                      : "#ffffff",
                  }}
                >
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
                    <div>
                      {getCampaignLabel(campaign)}
                    </div>

                    {campaign.campaignName &&
                      campaign.campaignId && (
                        <div
                          style={{
                            marginTop: "3px",
                            color: "#94a3b8",
                            fontSize: "11px",
                            fontWeight: 400,
                          }}
                        >
                          {campaign.campaignId}
                        </div>
                      )}
                  </td>

                  <td style={numberCellStyle}>
                    {campaign.visitors.toLocaleString(
                      "pt-BR",
                    )}
                  </td>

                  <td style={numberCellStyle}>
                    {campaign.sessions.toLocaleString(
                      "pt-BR",
                    )}
                  </td>

                  <td style={numberCellStyle}>
                    {campaign.plays.toLocaleString(
                      "pt-BR",
                    )}
                  </td>

                  <td style={numberCellStyle}>
                    {formatPercentage(
                      campaign.playRate,
                    )}
                  </td>

                  <td style={numberCellStyle}>
                    {campaign.pitchReached.toLocaleString(
                      "pt-BR",
                    )}
                  </td>

                  <td style={numberCellStyle}>
                    {formatPercentage(
                      campaign.pitchRate,
                    )}
                  </td>

                  <td style={numberCellStyle}>
                    {campaign.checkoutOpened.toLocaleString(
                      "pt-BR",
                    )}
                  </td>

                  <td style={numberCellStyle}>
                    {formatPercentage(
                      campaign.checkoutRate,
                    )}
                  </td>

                  <td style={numberCellStyle}>
                    {formatDuration(
                      campaign.averageWatchSeconds,
                    )}
                  </td>

                  <td style={numberCellStyle}>
                    {formatDuration(
                      campaign.averageMaxReachedSecond,
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

const numberCellStyle = {
  padding: "14px",
  textAlign: "right" as const,
  borderBottom: "1px solid #f1f5f9",
  color: "#334155",
  fontSize: "13px",
  whiteSpace: "nowrap" as const,
};