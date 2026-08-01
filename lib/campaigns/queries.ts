import { TrackingEntityType } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";

import type {
  CampaignAlias,
  CampaignAliasInput,
} from "@/types/campaign-alias";

function normalizeText(value: string): string {
  return value.trim();
}

function normalizePlatform(value?: string): string {
  const normalized = value?.trim().toLowerCase();

  return normalized || "meta";
}

function dateToIsoString(
  value: Date | null,
): string | null {
  return value?.toISOString() ?? null;
}

function campaignAliasToClient(
  campaign: {
    id: string;
    platform: string;
    externalId: string;
    name: string;
    adAccountId: string | null;
    platformStatus: string | null;
    lastSyncedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  },
): CampaignAlias {
  return {
    id: campaign.id,

    platform: campaign.platform,
    externalId: campaign.externalId,
    name: campaign.name,

    adAccountId: campaign.adAccountId,
    platformStatus: campaign.platformStatus,

    lastSyncedAt: dateToIsoString(
      campaign.lastSyncedAt,
    ),

    createdAt: campaign.createdAt.toISOString(),
    updatedAt: campaign.updatedAt.toISOString(),
  };
}

/**
 * Mantém compatibilidade com a interface atual de campanhas,
 * mas consulta a nova tabela genérica tracking_aliases.
 */
export async function listCampaignAliases(): Promise<
  CampaignAlias[]
> {
  const campaigns =
    await prisma.trackingAlias.findMany({
      where: {
        entityType: TrackingEntityType.campaign,
      },

      orderBy: [
        {
          name: "asc",
        },
        {
          externalId: "asc",
        },
      ],
    });

  return campaigns.map(campaignAliasToClient);
}

export async function saveCampaignAlias(
  input: CampaignAliasInput,
): Promise<CampaignAlias> {
  const platform = normalizePlatform(input.platform);
  const externalId = normalizeText(input.externalId);
  const name = normalizeText(input.name);

  if (!externalId) {
    throw new Error(
      "O ID externo da campanha é obrigatório.",
    );
  }

  if (!name) {
    throw new Error(
      "O nome da campanha é obrigatório.",
    );
  }

  const campaign =
    await prisma.trackingAlias.upsert({
      where: {
        platform_entityType_externalId: {
          platform,
          entityType: TrackingEntityType.campaign,
          externalId,
        },
      },

      update: {
        name,
      },

      create: {
        platform,
        entityType: TrackingEntityType.campaign,
        externalId,
        name,
      },
    });

  return campaignAliasToClient(campaign);
}

export async function getCampaignAliasMap(
  externalIds: string[],
  platform = "meta",
): Promise<Map<string, CampaignAlias>> {
  const uniqueIds = Array.from(
    new Set(
      externalIds
        .map((externalId) => externalId.trim())
        .filter(Boolean),
    ),
  );

  if (uniqueIds.length === 0) {
    return new Map<string, CampaignAlias>();
  }

  const campaigns =
    await prisma.trackingAlias.findMany({
      where: {
        platform: normalizePlatform(platform),
        entityType: TrackingEntityType.campaign,

        externalId: {
          in: uniqueIds,
        },
      },
    });

  return new Map<string, CampaignAlias>(
    campaigns.map((campaign) => {
      const clientCampaign =
        campaignAliasToClient(campaign);

      return [
        clientCampaign.externalId,
        clientCampaign,
      ];
    }),
  );
}