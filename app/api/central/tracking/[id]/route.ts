import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  TrackingEntityType,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/db";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

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

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;

    const existing =
      await prisma.trackingAlias.findUnique({
        where: {
          id,
        },
      });

    if (!existing) {
      return NextResponse.json(
        {
          error:
            "Registro de tracking nÃ£o encontrado.",
        },
        {
          status: 404,
        },
      );
    }

    const body = (await request.json()) as {
      entityType?: unknown;
      externalId?: unknown;
      name?: unknown;
      adAccountId?: unknown;
    };

    const entityType =
      body.entityType === undefined
        ? existing.entityType
        : normalizeText(body.entityType);

    const externalId =
      body.externalId === undefined
        ? existing.externalId
        : normalizeText(body.externalId);

    const name =
      body.name === undefined
        ? existing.name
        : normalizeText(body.name);

    const adAccountId =
      body.adAccountId === undefined
        ? existing.adAccountId
        : normalizeText(body.adAccountId) ||
          null;

    if (
      typeof entityType !== "string" ||
      !isValidEntityType(entityType)
    ) {
      return NextResponse.json(
        {
          error:
            "Tipo de entidade invÃ¡lido.",
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
      await prisma.trackingAlias.update({
        where: {
          id,
        },
        data: {
          entityType,
          externalId,
          name,
          adAccountId,
        },
      });

    return NextResponse.json({
      alias,
    });
  } catch (error) {
    console.error(
      "Erro ao atualizar tracking:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "NÃ£o foi possÃ­vel atualizar o tracking.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;

    const existing =
      await prisma.trackingAlias.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
        },
      });

    if (!existing) {
      return NextResponse.json(
        {
          error:
            "Registro de tracking nÃ£o encontrado.",
        },
        {
          status: 404,
        },
      );
    }

    await prisma.trackingAlias.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Erro ao excluir tracking:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "NÃ£o foi possÃ­vel excluir o tracking.",
      },
      {
        status: 500,
      },
    );
  }
}
