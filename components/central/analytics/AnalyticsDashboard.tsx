"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { SummaryCards } from "@/components/central/analytics/SummaryCards";
import { RetentionChart } from "@/components/central/analytics/RetentionChart";
import { CampaignTable } from "@/components/central/analytics/CampaignTable";
import { CampaignRetentionChart } from "@/components/central/analytics/CampaignRetentionChart";
import { DateRangeFilter } from "@/components/central/analytics/DateRangeFilter";
type AnalyticsSummary = {
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

type RetentionPoint = {
  second: number;
  viewers: number;
  percentage: number;
};

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

type SummaryResponse = {
  ok: boolean;
  summary?: AnalyticsSummary;
  error?: string;
};

type RetentionResponse = {
  ok: boolean;
  retention?: RetentionPoint[];
  error?: string;
};

type CampaignsResponse = {
  ok: boolean;
  campaigns?: CampaignAnalyticsRow[];
  error?: string;
};

type CampaignDetailsResponse = {
  ok: boolean;
  campaignId?: string;
  summary?: AnalyticsSummary;
  retention?: RetentionPoint[];
  error?: string;
};

const EMPTY_SUMMARY: AnalyticsSummary = {
  visitors: 0,
  sessions: 0,
  plays: 0,
  pitchReached: 0,
  checkoutOpened: 0,

  playRate: 0,
  pitchRate: 0,
  checkoutRate: 0,

  averageWatchSeconds: 0,
  averageMaxReachedSecond: 0,
};

function getCampaignLabel(
  campaign: CampaignAnalyticsRow,
): string {
  return (
    campaign.campaignName ||
    campaign.campaignId ||
    "Sem campanha identificada"
  );
}

async function fetchJson<T>(
  input: string,
): Promise<T> {
  const response = await fetch(input, {
    method: "GET",
    cache: "no-store",
  });

  const data = (await response.json()) as T;

  if (!response.ok) {
    throw new Error(
      `Falha ao carregar ${input}`,
    );
  }

  return data;
}
function buildAnalyticsQuery(
  dateFrom: string,
  dateTo: string,
): string {
  const params = new URLSearchParams();

  if (dateFrom) {
    params.set(
      "date_from",
      `${dateFrom}T00:00:00-03:00`,
    );
  }

  if (dateTo) {
    params.set(
      "date_to",
      `${dateTo}T23:59:59.999-03:00`,
    );
  }

  const query = params.toString();

  return query ? `?${query}` : "";
}

export function AnalyticsDashboard() {
  const [
    summary,
    setSummary,
  ] = useState<AnalyticsSummary>(
    EMPTY_SUMMARY,
  );

  const [
    retention,
    setRetention,
  ] = useState<RetentionPoint[]>([]);

  const [
    campaigns,
    setCampaigns,
  ] = useState<CampaignAnalyticsRow[]>([]);

  const [
    selectedCampaignId,
    setSelectedCampaignId,
  ] = useState<string | null>(null);

  const [
    selectedCampaignSummary,
    setSelectedCampaignSummary,
  ] = useState<AnalyticsSummary | null>(
    null,
  );

  const [
    selectedCampaignRetention,
    setSelectedCampaignRetention,
  ] = useState<RetentionPoint[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    campaignLoading,
    setCampaignLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const [dateFrom, setDateFrom] = useState("");

const [dateTo, setDateTo] = useState("");

const [
  appliedDateFrom,
  setAppliedDateFrom,
] = useState("");

const [
  appliedDateTo,
  setAppliedDateTo,
] = useState("");


  const selectedCampaign = useMemo(
    () =>
      campaigns.find(
        (campaign) =>
          campaign.campaignId ===
          selectedCampaignId,
      ) ?? null,
    [campaigns, selectedCampaignId],
  );
const analyticsQuery = useMemo(
  () =>
    buildAnalyticsQuery(
      appliedDateFrom,
      appliedDateTo,
    ),
  [appliedDateFrom, appliedDateTo],
);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      setLoading(true);
      setError(null);

      try {
        const [
          summaryResponse,
          retentionResponse,
          campaignsResponse,
        ] = await Promise.all([
          fetchJson<SummaryResponse>(
            `/api/central/analytics/summary${analyticsQuery}`,
          ),

          fetchJson<RetentionResponse>(
            `/api/central/analytics/retention${analyticsQuery}`,
          ),

          fetchJson<CampaignsResponse>(
            `/api/central/analytics/campaigns${analyticsQuery}`,
          ),
        ]);

        if (!active) {
          return;
        }

        if (!summaryResponse.ok) {
          throw new Error(
            summaryResponse.error ||
              "Erro ao carregar o resumo.",
          );
        }

        if (!retentionResponse.ok) {
          throw new Error(
            retentionResponse.error ||
              "Erro ao carregar a retenção.",
          );
        }

        if (!campaignsResponse.ok) {
          throw new Error(
            campaignsResponse.error ||
              "Erro ao carregar as campanhas.",
          );
        }

        setSummary(
          summaryResponse.summary ??
            EMPTY_SUMMARY,
        );

        setRetention(
          retentionResponse.retention ?? [],
        );

        setCampaigns(
          campaignsResponse.campaigns ?? [],
        );
      } catch (loadError) {
        if (!active) {
          return;
        }

        console.error(
          "[AnalyticsDashboard] error:",
          loadError,
        );

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Não foi possível carregar o analytics.",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, [analyticsQuery]);

  async function selectCampaign(
    campaignId: string | null,
  ) {
    if (!campaignId) {
      setSelectedCampaignId(null);
      setSelectedCampaignSummary(null);
      setSelectedCampaignRetention([]);
      return;
    }

    setSelectedCampaignId(campaignId);
    setCampaignLoading(true);
    setError(null);

    try {
      const response =
        await fetchJson<CampaignDetailsResponse>(
         `/api/central/analytics/campaign/${encodeURIComponent(
  campaignId,
)}${analyticsQuery}`,
        );

      if (!response.ok) {
        throw new Error(
          response.error ||
            "Erro ao carregar a campanha.",
        );
      }

      setSelectedCampaignSummary(
        response.summary ?? EMPTY_SUMMARY,
      );

      setSelectedCampaignRetention(
        response.retention ?? [],
      );
    } catch (campaignError) {
      console.error(
        "[AnalyticsDashboard/campaign] error:",
        campaignError,
      );

      setError(
        campaignError instanceof Error
          ? campaignError.message
          : "Não foi possível carregar a campanha.",
      );
    } finally {
      setCampaignLoading(false);
    }
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: "320px",
          display: "grid",
          placeItems: "center",
          color: "#64748b",
        }}
      >
        Carregando analytics...
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gap: "24px",
      }}
    >
      {error && (
        <div
          role="alert"
          style={{
            border: "1px solid #fecaca",
            borderRadius: "12px",
            padding: "14px 16px",
            background: "#fef2f2",
            color: "#b91c1c",
          }}
        >
          {error}
        </div>
      )}
    <DateRangeFilter
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onApply={() => {
            setSelectedCampaignId(null);
            setSelectedCampaignSummary(null);
            setSelectedCampaignRetention([]);

            setAppliedDateFrom(dateFrom);
            setAppliedDateTo(dateTo);
        }}
        onClear={() => {
            setDateFrom("");
            setDateTo("");

            setAppliedDateFrom("");
            setAppliedDateTo("");

            setSelectedCampaignId(null);
            setSelectedCampaignSummary(null);
            setSelectedCampaignRetention([]);
  }}
/>
      <SummaryCards
        {...(
          selectedCampaignSummary ||
          summary
        )}
      />

      {selectedCampaignId ? (
        <div
          style={{
            position: "relative",
          }}
        >
          {campaignLoading && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 2,
                display: "grid",
                placeItems: "center",
                borderRadius: "16px",
                background:
                  "rgba(255,255,255,0.78)",
                color: "#475569",
                fontWeight: 600,
              }}
            >
              Carregando campanha...
            </div>
          )}

          <CampaignRetentionChart
            campaignLabel={
              selectedCampaign
                ? getCampaignLabel(
                    selectedCampaign,
                  )
                : selectedCampaignId
            }
            data={
              selectedCampaignRetention
            }
            onClear={() =>
              selectCampaign(null)
            }
          />
        </div>
      ) : (
        <RetentionChart data={retention} />
      )}

      <CampaignTable
        campaigns={campaigns}
        selectedCampaignId={
          selectedCampaignId
        }
        onSelectCampaign={
          selectCampaign
        }
      />
    </div>
  );
}