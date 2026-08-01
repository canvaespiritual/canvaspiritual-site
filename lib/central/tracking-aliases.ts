import { TrackingEntityType } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";

export type TrackingAliasMap = {
  campaigns: Record<string, string>;
  adsets: Record<string, string>;
  ads: Record<string, string>;
};

type ResolveTrackingNameParams = {
  platform?: string;
  entityType: TrackingEntityType;
  externalId?: string | null;
};

/**
 * Retorna o nome amigável cadastrado para uma entidade da plataforma.
 * Caso ainda não exista alias, retorna o próprio ID externo.
 */
export async function resolveTrackingName({
  platform = "meta",
  entityType,
  externalId,
}: ResolveTrackingNameParams): Promise<string | null> {
  const normalizedExternalId = externalId?.trim();

  if (!normalizedExternalId) {
    return null;
  }

  const alias = await prisma.trackingAlias.findUnique({
    where: {
      platform_entityType_externalId: {
        platform,
        entityType,
        externalId: normalizedExternalId,
      },
    },
    select: {
      name: true,
    },
  });

  return alias?.name || normalizedExternalId;
}

/**
 * Busca todos os aliases e devolve mapas indexados pelo ID externo.
 * Útil quando uma listagem contém muitos checkouts.
 */
export async function getTrackingAliasMaps(
  platform = "meta",
): Promise<TrackingAliasMap> {
  const aliases = await prisma.trackingAlias.findMany({
    where: {
      platform,
    },
    select: {
      entityType: true,
      externalId: true,
      name: true,
    },
  });

  const maps: TrackingAliasMap = {
    campaigns: {},
    adsets: {},
    ads: {},
  };

  for (const alias of aliases) {
    if (alias.entityType === TrackingEntityType.campaign) {
      maps.campaigns[alias.externalId] = alias.name;
    }

    if (alias.entityType === TrackingEntityType.adset) {
      maps.adsets[alias.externalId] = alias.name;
    }

    if (alias.entityType === TrackingEntityType.ad) {
      maps.ads[alias.externalId] = alias.name;
    }
  }

  return maps;
}

/**
 * Retorna o alias ou, enquanto ele não estiver cadastrado,
 * mantém o ID original visível.
 */
export function applyTrackingAlias(
  externalId: string | null | undefined,
  aliases: Record<string, string>,
): string | null {
  const normalizedExternalId = externalId?.trim();

  if (!normalizedExternalId) {
    return null;
  }

  return aliases[normalizedExternalId] || normalizedExternalId;
}