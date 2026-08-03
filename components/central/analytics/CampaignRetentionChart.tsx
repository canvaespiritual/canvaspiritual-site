"use client";

type RetentionPoint = {
  second: number;
  viewers: number;
  percentage: number;
};

type CampaignRetentionChartProps = {
  campaignLabel: string;
  data: RetentionPoint[];
  onClear?: () => void;
};

function formatTime(totalSeconds: number): string {
  const safeSeconds = Math.max(
    0,
    Math.floor(totalSeconds),
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

export function CampaignRetentionChart({
  campaignLabel,
  data,
  onClear,
}: CampaignRetentionChartProps) {
  if (data.length === 0) {
    return (
      <section
        style={{
          border: "1px solid #dbeafe",
          borderRadius: "16px",
          padding: "24px",
          background: "#eff6ff",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "16px",
            alignItems: "flex-start",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                color: "#0f172a",
                fontSize: "18px",
              }}
            >
              Retenção da campanha
            </h2>

            <p
              style={{
                margin: "6px 0 0",
                color: "#475569",
                fontSize: "13px",
              }}
            >
              {campaignLabel}
            </p>
          </div>

          {onClear && (
            <button
              type="button"
              onClick={onClear}
              style={{
                border: "1px solid #bfdbfe",
                borderRadius: "10px",
                padding: "8px 12px",
                background: "#ffffff",
                color: "#1d4ed8",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Voltar ao geral
            </button>
          )}
        </div>

        <p
          style={{
            margin: "18px 0 0",
            color: "#64748b",
          }}
        >
          Essa campanha ainda não possui trechos
          assistidos registrados.
        </p>
      </section>
    );
  }

  const width = 1000;
  const height = 320;

  const paddingLeft = 55;
  const paddingRight = 24;
  const paddingTop = 24;
  const paddingBottom = 48;

  const chartWidth =
    width - paddingLeft - paddingRight;

  const chartHeight =
    height - paddingTop - paddingBottom;

  const maxSecond =
    data[data.length - 1]?.second || 1;

  function getX(second: number): number {
    return (
      paddingLeft +
      (second / maxSecond) * chartWidth
    );
  }

  function getY(percentage: number): number {
    return (
      paddingTop +
      chartHeight -
      (percentage / 100) * chartHeight
    );
  }

  const points = data
    .map(
      (point) =>
        `${getX(point.second)},${getY(
          point.percentage,
        )}`,
    )
    .join(" ");

  const xMarkers = [
    0,
    Math.round(maxSecond * 0.25),
    Math.round(maxSecond * 0.5),
    Math.round(maxSecond * 0.75),
    maxSecond,
  ];

  const yMarkers = [100, 75, 50, 25, 0];

  return (
    <section
      style={{
        border: "1px solid #dbeafe",
        borderRadius: "16px",
        padding: "20px",
        background: "#eff6ff",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "16px",
          alignItems: "flex-start",
          marginBottom: "16px",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              color: "#0f172a",
              fontSize: "18px",
            }}
          >
            Retenção da campanha
          </h2>

          <p
            style={{
              margin: "6px 0 0",
              color: "#475569",
              fontSize: "13px",
            }}
          >
            {campaignLabel}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              textAlign: "right",
            }}
          >
            <strong
              style={{
                display: "block",
                color: "#0f172a",
                fontSize: "18px",
              }}
            >
              {formatTime(maxSecond)}
            </strong>

            <span
              style={{
                color: "#64748b",
                fontSize: "12px",
              }}
            >
              último segundo registrado
            </span>
          </div>

          {onClear && (
            <button
              type="button"
              onClick={onClear}
              style={{
                border: "1px solid #bfdbfe",
                borderRadius: "10px",
                padding: "8px 12px",
                background: "#ffffff",
                color: "#1d4ed8",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Voltar ao geral
            </button>
          )}
        </div>
      </div>

      <div
        style={{
          width: "100%",
          overflowX: "auto",
        }}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={`Curva de retenção da campanha ${campaignLabel}`}
          style={{
            display: "block",
            width: "100%",
            minWidth: "700px",
            height: "auto",
          }}
        >
          {yMarkers.map((percentage) => {
            const y = getY(percentage);

            return (
              <g key={percentage}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#bfdbfe"
                  strokeWidth="1"
                />

                <text
                  x={paddingLeft - 10}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="12"
                  fill="#64748b"
                >
                  {percentage}%
                </text>
              </g>
            );
          })}

          {xMarkers.map((second) => {
            const x = getX(second);

            return (
              <g key={second}>
                <line
                  x1={x}
                  y1={paddingTop}
                  x2={x}
                  y2={height - paddingBottom}
                  stroke="#dbeafe"
                  strokeWidth="1"
                />

                <text
                  x={x}
                  y={height - 18}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#64748b"
                >
                  {formatTime(second)}
                </text>
              </g>
            );
          })}

          <polyline
            points={points}
            fill="none"
            stroke="#1d4ed8"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {data.map((point) => (
            <circle
              key={point.second}
              cx={getX(point.second)}
              cy={getY(point.percentage)}
              r="2.5"
              fill="#1d4ed8"
            >
              <title>
                {formatTime(point.second)} —{" "}
                {point.percentage.toFixed(1)}% —{" "}
                {point.viewers} visualizador(es)
              </title>
            </circle>
          ))}
        </svg>
      </div>
    </section>
  );
}