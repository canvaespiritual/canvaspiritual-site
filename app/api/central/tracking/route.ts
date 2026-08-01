import { NextRequest, NextResponse } from "next/server";

import {
  TrackingEntityType,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const VALID_ENTITY_TYPES = new Set<string>([
  TrackingEntityType.campaign,
  TrackingEntityType.adset,
  TrackingEntityType.ad,
]);

function normalizeText(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function isValidEntityType(
  value: string,
): value is TrackingEntityType {
  return VALID_ENTITY_TYPES.has(value);
}

export async function GET(
  request: NextRequest,
) {
  try {
    const searchParams =
      request.nextUrl.searchParams;

    const platform =
      normalizeText(
        searchParams.get("platform"),
      ) || "meta";

    const entityTypeParam = normalizeText(
  searchParams.get("entityType"),
);

let entityType:
  | TrackingEntityType
  | undefined;

if (entityTypeParam) {
  if (!isValidEntityType(entityTypeParam)) {
    return NextResponse.json(
      {
        error: "Tipo de entidade inválido.",
      },
      {
        status: 400,
      },
    );
  }

  entityType = entityTypeParam;
}

const where: {
  platform: string;
  entityType?: TrackingEntityType;
} = {
  platform,
};

if (entityType !== undefined) {
  where.entityType = entityType;
}

const aliases = await prisma.trackingAlias.findMany({
  where,
  orderBy: [
    {
      entityType: "asc",
    },
    {
      name: "asc",
    },
  ],
});

    return NextResponse.json({
      aliases,
    });
  } catch (error) {
    console.error(
      "Erro ao listar aliases de tracking:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "NÃ£o foi possÃ­vel carregar o tracking.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(
  request: NextRequest,
) {
  try {
    const body = (await request.json()) as {
      platform?: unknown;
      entityType?: unknown;
      externalId?: unknown;
      name?: unknown;
      adAccountId?: unknown;
    };

    const platform =
      normalizeText(body.platform) || "meta";

    const entityType = normalizeText(
      body.entityType,
    );

    const externalId = normalizeText(
      body.externalId,
    );

    const name = normalizeText(body.name);

    const adAccountId =
      normalizeText(body.adAccountId) ||
      null;

    if (!isValidEntityType(entityType)) {
      return NextResponse.json(
        {
          error:
            "Selecione um tipo vÃ¡lido.",
        },
        {
          status: 400,
        },
      );
    }

    if (!externalId) {
      return NextResponse.json(
        {
          error:
            "Informe o ID da entidade.",
        },
        {
          status: 400,
        },
      );
    }

    if (!name) {
      return NextResponse.json(
        {
          error:
            "Informe o nome amigÃ¡vel.",
        },
        {
          status: 400,
        },
      );
    }

    const alias =
      await prisma.trackingAlias.upsert({
        where: {
          platform_entityType_externalId:
            {
              platform,
              entityType,
              externalId,
            },
        },
        update: {
          name,
          adAccountId,
        },
        create: {
          platform,
          entityType,
          externalId,
          name,
          adAccountId,
        },
      });

    return NextResponse.json(
      {
        alias,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "Erro ao salvar alias de tracking:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "NÃ£o foi possÃ­vel salvar o tracking.",
      },
      {
        status: 500,
      },
    );
  }
}
