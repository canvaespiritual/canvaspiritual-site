import type { Prospect } from "@/types/prospect";

export interface DedupeResult {
  prospects: Prospect[];
  duplicatesRemoved: number;
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(
    new Set(
      values
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  );
}

function mergeTextValues(first: string, second: string): string {
  if (!first) {
    return second;
  }

  if (!second || first === second) {
    return first;
  }

  return uniqueStrings([first, second]).join(" | ");
}

function mergeProspects(
  existing: Prospect,
  incoming: Prospect,
): Prospect {
  return {
    ...existing,

    fullName: existing.fullName || incoming.fullName,
    biography: existing.biography || incoming.biography,

    businessCategoryName: mergeTextValues(
      existing.businessCategoryName,
      incoming.businessCategoryName,
    ),

    followersCount: Math.max(
      existing.followersCount,
      incoming.followersCount,
    ),

    postsCount: Math.max(existing.postsCount, incoming.postsCount),

    verified: existing.verified || incoming.verified,

    isBusinessAccount:
      existing.isBusinessAccount || incoming.isBusinessAccount,

    url: existing.url || incoming.url,
    externalUrl: existing.externalUrl || incoming.externalUrl,

    businessAddress:
      existing.businessAddress || incoming.businessAddress,

    cidade: existing.cidade || incoming.cidade,
    bairro: existing.bairro || incoming.bairro,
    estado: existing.estado || incoming.estado,
    pais: existing.pais || incoming.pais,

    whatsapp: existing.whatsapp || incoming.whatsapp,
    email: existing.email || incoming.email,

    origem: mergeTextValues(existing.origem, incoming.origem),

    profissao: existing.profissao || incoming.profissao,

    especialidades: uniqueStrings([
      ...existing.especialidades,
      ...incoming.especialidades,
    ]),

    voucher: existing.voucher || incoming.voucher,

    observacoes: mergeTextValues(
      existing.observacoes,
      incoming.observacoes,
    ),

    searchTerm: mergeTextValues(
      existing.searchTerm,
      incoming.searchTerm,
    ),

    searchSource: mergeTextValues(
      existing.searchSource,
      incoming.searchSource,
    ),

    importedAt:
      existing.importedAt < incoming.importedAt
        ? existing.importedAt
        : incoming.importedAt,

    updatedAt: new Date().toISOString(),
  };
}

export function deduplicateProspects(
  prospects: Prospect[],
): DedupeResult {
  const map = new Map<string, Prospect>();

  for (const prospect of prospects) {
    const key = prospect.username.trim().toLowerCase();

    if (!key) {
      continue;
    }

    const existing = map.get(key);

    if (existing) {
      map.set(key, mergeProspects(existing, prospect));
    } else {
      map.set(key, prospect);
    }
  }

  return {
    prospects: Array.from(map.values()),
    duplicatesRemoved: prospects.length - map.size,
  };
}