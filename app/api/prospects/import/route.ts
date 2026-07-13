import { NextResponse } from "next/server";

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { databaseProspectToClient } from "@/lib/prospect-mapper";
import type { Prospect } from "@/types/prospect";
import { detectLanguage } from "@/lib/language";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ImportRequestBody {
  prospects?: unknown;
  fileNames?: unknown;
  rowsReceived?: unknown;
  invalidRows?: unknown;
}

interface NormalizedProspect {
  username: string;
  fullName: string;
  biography: string;
  businessCategoryName: string;
  followersCount: number;
  postsCount: number;
  verified: boolean;
  isBusinessAccount: boolean;

  instagramUrl: string;
  externalUrl: string;

  businessAddress: string;
  cidade: string;
  bairro: string;
  estado: string;
  pais: string;
  idioma: string;

  whatsapp: string;
  email: string;

  profissao: string;
  especialidades: string[];

  voucher: string;
  observacoes: string;

  origens: string[];
  searchTerms: string[];
  searchSources: string[];
}

function normalizeText(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function normalizeUsername(value: unknown): string {
  return normalizeText(value)
    .replace(/^@/, "")
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/\/.*$/, "")
    .trim()
    .toLowerCase();
}

function normalizeNumber(value: unknown): number {
  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed >= 0
    ? Math.round(parsed)
    : 0;
}

function normalizeBoolean(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  return ["true", "1", "sim", "yes"].includes(
    normalizeText(value).toLowerCase(),
  );
}

function normalizeStringArray(value: unknown): string[] {
  const values = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split("|")
      : [];

  return Array.from(
    new Set(
      values
        .map((item) => normalizeText(item))
        .filter(Boolean),
    ),
  );
}

function mergeArrays(
  first: string[],
  second: string[],
): string[] {
  return Array.from(
    new Set(
      [...first, ...second]
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

function normalizeProspect(
  value: unknown,
): NormalizedProspect | null {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return null;
  }

  const prospect = value as Partial<Prospect>;
  const username = normalizeUsername(prospect.username);

  if (!username) {
    return null;
  }

  const instagramUrl =
    normalizeText(prospect.url) ||
    `https://www.instagram.com/${username}/`;

  return {
    username,
    fullName: normalizeText(prospect.fullName),
    biography: normalizeText(prospect.biography),

    businessCategoryName: normalizeText(
      prospect.businessCategoryName,
    ),

    followersCount: normalizeNumber(
      prospect.followersCount,
    ),

    postsCount: normalizeNumber(prospect.postsCount),

    verified: normalizeBoolean(prospect.verified),

    isBusinessAccount: normalizeBoolean(
      prospect.isBusinessAccount,
    ),

    instagramUrl,
    externalUrl: normalizeText(prospect.externalUrl),

    businessAddress: normalizeText(
      prospect.businessAddress,
    ),

    cidade: normalizeText(prospect.cidade),
    bairro: normalizeText(prospect.bairro),
    estado: normalizeText(prospect.estado),
    pais: normalizeText(prospect.pais),
    idioma:
  normalizeText(prospect.idioma) ||
  detectLanguage(
    normalizeText(prospect.biography),
    normalizeText(prospect.fullName),
    normalizeText(prospect.businessAddress),
  ),

    whatsapp: normalizeText(prospect.whatsapp),
    email: normalizeText(prospect.email),

    profissao: normalizeText(prospect.profissao),

    especialidades: normalizeStringArray(
      prospect.especialidades,
    ),

    voucher: normalizeText(prospect.voucher),
    observacoes: normalizeText(prospect.observacoes),

    origens: normalizeStringArray(prospect.origem),
    searchTerms: normalizeStringArray(
      prospect.searchTerm,
    ),
    searchSources: normalizeStringArray(
      prospect.searchSource,
    ),
  };
}

function mergeIncomingProspects(
  existing: NormalizedProspect,
  incoming: NormalizedProspect,
): NormalizedProspect {
  return {
    username: existing.username,

    fullName:
      existing.fullName || incoming.fullName,

    biography:
      existing.biography || incoming.biography,

    businessCategoryName:
      existing.businessCategoryName ||
      incoming.businessCategoryName,

    followersCount: Math.max(
      existing.followersCount,
      incoming.followersCount,
    ),

    postsCount: Math.max(
      existing.postsCount,
      incoming.postsCount,
    ),

    verified:
      existing.verified || incoming.verified,

    isBusinessAccount:
      existing.isBusinessAccount ||
      incoming.isBusinessAccount,

    instagramUrl:
      existing.instagramUrl ||
      incoming.instagramUrl,

    externalUrl:
      existing.externalUrl ||
      incoming.externalUrl,

    businessAddress:
      existing.businessAddress ||
      incoming.businessAddress,

    cidade:
      existing.cidade || incoming.cidade,

    bairro:
      existing.bairro || incoming.bairro,

    estado:
      existing.estado || incoming.estado,

    pais:
      existing.pais || incoming.pais,

    idioma:
  existing.idioma ||
  incoming.idioma,  

    whatsapp:
      existing.whatsapp || incoming.whatsapp,

    email:
      existing.email || incoming.email,

    profissao:
      existing.profissao || incoming.profissao,

    especialidades: mergeArrays(
      existing.especialidades,
      incoming.especialidades,
    ),

    voucher:
      existing.voucher || incoming.voucher,

    observacoes:
      existing.observacoes ||
      incoming.observacoes,

    origens: mergeArrays(
      existing.origens,
      incoming.origens,
    ),

    searchTerms: mergeArrays(
      existing.searchTerms,
      incoming.searchTerms,
    ),

    searchSources: mergeArrays(
      existing.searchSources,
      incoming.searchSources,
    ),
  };
}

function buildUpdateData(
  current: {
    fullName: string;
    biography: string;
    businessCategoryName: string;
    followersCount: number;
    postsCount: number;
    verified: boolean;
    isBusinessAccount: boolean;
    instagramUrl: string;
    externalUrl: string;
    businessAddress: string;
    cidade: string;
    bairro: string;
    estado: string;
    pais: string;
    idioma: string;
    whatsapp: string;
    email: string;
    profissao: string;
    especialidades: string[];
    voucher: string;
    observacoes: string;
    origens: string[];
    searchTerms: string[];
    searchSources: string[];
  },
  incoming: NormalizedProspect,
): Prisma.ProspectUpdateInput {
  return {
    fullName:
      current.fullName || incoming.fullName,

    biography:
      current.biography || incoming.biography,

    businessCategoryName:
      current.businessCategoryName ||
      incoming.businessCategoryName,

    followersCount: Math.max(
      current.followersCount,
      incoming.followersCount,
    ),

    postsCount: Math.max(
      current.postsCount,
      incoming.postsCount,
    ),

    verified:
      current.verified || incoming.verified,

    isBusinessAccount:
      current.isBusinessAccount ||
      incoming.isBusinessAccount,

    instagramUrl:
      current.instagramUrl ||
      incoming.instagramUrl,

    externalUrl:
      current.externalUrl ||
      incoming.externalUrl,

    businessAddress:
      current.businessAddress ||
      incoming.businessAddress,

    cidade:
      current.cidade || incoming.cidade,

    bairro:
      current.bairro || incoming.bairro,

    estado:
      current.estado || incoming.estado,

    pais:
      current.pais || incoming.pais,

    whatsapp:
      current.whatsapp || incoming.whatsapp,

    email:
      current.email || incoming.email,

    idioma:
  current.idioma ||
  incoming.idioma,  

    profissao:
      current.profissao || incoming.profissao,

    especialidades: mergeArrays(
      current.especialidades,
      incoming.especialidades,
    ),

    voucher:
      current.voucher || incoming.voucher,

    observacoes:
      current.observacoes ||
      incoming.observacoes,

    origens: mergeArrays(
      current.origens,
      incoming.origens,
    ),

    searchTerms: mergeArrays(
      current.searchTerms,
      incoming.searchTerms,
    ),

    searchSources: mergeArrays(
      current.searchSources,
      incoming.searchSources,
    ),
  };
}

async function processUpdates(
  updates: Array<{
    username: string;
    data: Prisma.ProspectUpdateInput;
  }>,
): Promise<void> {
  const batchSize = 50;

  for (
    let index = 0;
    index < updates.length;
    index += batchSize
  ) {
    const batch = updates.slice(
      index,
      index + batchSize,
    );

    await prisma.$transaction(
      batch.map((item) =>
        prisma.prospect.update({
          where: {
            username: item.username,
          },
          data: item.data,
        }),
      ),
    );
  }
}

export async function POST(request: Request) {
  try {
    const body =
      (await request.json()) as ImportRequestBody;

    if (!Array.isArray(body.prospects)) {
      return NextResponse.json(
        {
          error:
            "O campo prospects precisa ser uma lista.",
        },
        {
          status: 400,
        },
      );
    }

    const normalizedMap = new Map<
      string,
      NormalizedProspect
    >();

    let invalidRows = 0;

    for (const value of body.prospects) {
      const normalized = normalizeProspect(value);

      if (!normalized) {
        invalidRows += 1;
        continue;
      }

      const existing =
        normalizedMap.get(normalized.username);

      if (existing) {
        normalizedMap.set(
          normalized.username,
          mergeIncomingProspects(
            existing,
            normalized,
          ),
        );
      } else {
        normalizedMap.set(
          normalized.username,
          normalized,
        );
      }
    }

    const normalizedProspects = Array.from(
      normalizedMap.values(),
    );

    if (normalizedProspects.length === 0) {
      return NextResponse.json(
        {
          error:
            "Nenhum prospect válido foi recebido.",
        },
        {
          status: 400,
        },
      );
    }

    const usernames = normalizedProspects.map(
      (prospect) => prospect.username,
    );

    const existingProspects =
      await prisma.prospect.findMany({
        where: {
          username: {
            in: usernames,
          },
        },
      });

    const existingMap = new Map(
      existingProspects.map((prospect) => [
        prospect.username,
        prospect,
      ]),
    );

    const prospectsToCreate =
      normalizedProspects.filter(
        (prospect) =>
          !existingMap.has(prospect.username),
      );

    const prospectsToUpdate =
      normalizedProspects
        .filter((prospect) =>
          existingMap.has(prospect.username),
        )
        .map((incoming) => {
          const current = existingMap.get(
            incoming.username,
          );

          if (!current) {
            throw new Error(
              `Prospect existente não encontrado: ${incoming.username}`,
            );
          }

          return {
            username: incoming.username,
            data: buildUpdateData(
              current,
              incoming,
            ),
          };
        });

    if (prospectsToCreate.length > 0) {
      await prisma.prospect.createMany({
        data: prospectsToCreate.map(
          (prospect) => ({
            username: prospect.username,
            fullName: prospect.fullName,
            biography: prospect.biography,

            businessCategoryName:
              prospect.businessCategoryName,

            followersCount:
              prospect.followersCount,

            postsCount:
              prospect.postsCount,

            verified:
              prospect.verified,

            isBusinessAccount:
              prospect.isBusinessAccount,

            instagramUrl:
              prospect.instagramUrl,

            externalUrl:
              prospect.externalUrl,

            businessAddress:
              prospect.businessAddress,

            cidade: prospect.cidade,
            bairro: prospect.bairro,
            estado: prospect.estado,
            pais: prospect.pais,
            idioma: prospect.idioma,

            whatsapp: prospect.whatsapp,
            email: prospect.email,

            profissao: prospect.profissao,

            especialidades:
              prospect.especialidades,

            voucher: prospect.voucher,

            observacoes:
              prospect.observacoes,

            origens: prospect.origens,

            searchTerms:
              prospect.searchTerms,

            searchSources:
              prospect.searchSources,
          }),
        ),

        skipDuplicates: true,
      });
    }

    if (prospectsToUpdate.length > 0) {
      await processUpdates(prospectsToUpdate);
    }

    const fileNames = normalizeStringArray(
      body.fileNames,
    );

    const rowsReceived =
      normalizeNumber(body.rowsReceived) ||
      body.prospects.length;

    const invalidRowsFromClient =
      normalizeNumber(body.invalidRows);

    const totalInvalidRows =
      invalidRows + invalidRowsFromClient;

    await prisma.prospectImport.create({
      data: {
        fileName:
          fileNames.join(" | ") ||
          "importacao-sem-nome",

        rowsReceived,

        newProspects:
          prospectsToCreate.length,

        updatedProspects:
          prospectsToUpdate.length,

        invalidRows: totalInvalidRows,
      },
    });

    const savedProspects =
      await prisma.prospect.findMany({
        where: {
          username: {
            in: usernames,
          },
        },

        orderBy: {
          followersCount: "desc",
        },
      });

    return NextResponse.json({
      success: true,

      summary: {
        rowsReceived,
        validProspects:
          normalizedProspects.length,

        newProspects:
          prospectsToCreate.length,

        updatedProspects:
          prospectsToUpdate.length,

        duplicatesInsideImport:
          body.prospects.length -
          invalidRows -
          normalizedProspects.length,

        invalidRows: totalInvalidRows,
      },

      prospects: savedProspects.map(
        databaseProspectToClient,
      ),
    });
  } catch (error) {
    console.error(
      "Erro ao importar prospects:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível importar os prospects.",
      },
      {
        status: 500,
      },
    );
  }
}