import { NextResponse } from "next/server";

import type {
  Prisma,
  ProspectStatus as DatabaseProspectStatus,
} from "@/generated/prisma/client";

import { prisma } from "@/lib/db";
import {
  databaseProspectToClient,
  isValidProspectStatus,
} from "@/lib/prospect-mapper";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{
    username: string;
  }>;
}

interface UpdateProspectBody {
  fullName?: unknown;
  biography?: unknown;
  businessCategoryName?: unknown;

  whatsapp?: unknown;
  email?: unknown;

  cidade?: unknown;
  bairro?: unknown;
  estado?: unknown;
  pais?: unknown;
  idioma?: unknown;
  businessAddress?: unknown;

  profissao?: unknown;
  especialidades?: unknown;

  voucher?: unknown;
  observacoes?: unknown;
  status?: unknown;

  externalUrl?: unknown;
}

function normalizeText(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function normalizeStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return Array.from(
      new Set(
        value
          .map((item) => normalizeText(item))
          .filter(Boolean),
      ),
    );
  }

  if (typeof value === "string") {
    return Array.from(
      new Set(
        value
          .split(/[;,|]/)
          .map((item) => item.trim())
          .filter(Boolean),
      ),
    );
  }

  return [];
}

export async function PATCH(
  request: Request,
  context: RouteContext,
) {
  try {
    const { username: encodedUsername } = await context.params;

    const username = decodeURIComponent(encodedUsername)
      .replace(/^@/, "")
      .trim()
      .toLowerCase();

    if (!username) {
      return NextResponse.json(
        {
          error: "Username inválido.",
        },
        {
          status: 400,
        },
      );
    }

    const body = (await request.json()) as UpdateProspectBody;

    const data: Prisma.ProspectUpdateInput = {};

    if (body.fullName !== undefined) {
      data.fullName = normalizeText(body.fullName);
    }

    if (body.biography !== undefined) {
      data.biography = normalizeText(body.biography);
    }

    if (body.businessCategoryName !== undefined) {
      data.businessCategoryName = normalizeText(
        body.businessCategoryName,
      );
    }

    if (body.whatsapp !== undefined) {
      data.whatsapp = normalizeText(body.whatsapp);
    }

    if (body.email !== undefined) {
      data.email = normalizeText(body.email);
    }

    if (body.cidade !== undefined) {
      data.cidade = normalizeText(body.cidade);
    }

    if (body.bairro !== undefined) {
      data.bairro = normalizeText(body.bairro);
    }

    if (body.estado !== undefined) {
      data.estado = normalizeText(body.estado);
    }

    if (body.pais !== undefined) {
      data.pais = normalizeText(body.pais);
    }
    if (body.idioma !== undefined) {
  data.idioma = normalizeText(body.idioma);
}
    if (body.businessAddress !== undefined) {
      data.businessAddress = normalizeText(
        body.businessAddress,
      );
    }

    if (body.profissao !== undefined) {
      data.profissao = normalizeText(body.profissao);
    }

    if (body.especialidades !== undefined) {
      data.especialidades = normalizeStringArray(
        body.especialidades,
      );
    }

    if (body.voucher !== undefined) {
      data.voucher = normalizeText(body.voucher);
    }

    if (body.observacoes !== undefined) {
      data.observacoes = normalizeText(body.observacoes);
    }

    if (body.externalUrl !== undefined) {
      data.externalUrl = normalizeText(body.externalUrl);
    }

    if (body.status !== undefined) {
      if (!isValidProspectStatus(body.status)) {
        return NextResponse.json(
          {
            error: "Status inválido.",
          },
          {
            status: 400,
          },
        );
      }

      data.status = body.status as DatabaseProspectStatus;
    }

    const existingProspect =
      await prisma.prospect.findUnique({
        where: {
          username,
        },
        select: {
          id: true,
        },
      });

    if (!existingProspect) {
      return NextResponse.json(
        {
          error: "Prospect não encontrado.",
        },
        {
          status: 404,
        },
      );
    }

    const updatedProspect = await prisma.prospect.update({
      where: {
        username,
      },
      data,
    });

    return NextResponse.json({
      prospect: databaseProspectToClient(updatedProspect),
    });
  } catch (error) {
    console.error("Erro ao atualizar prospect:", error);

    return NextResponse.json(
      {
        error: "Não foi possível atualizar o prospect.",
      },
      {
        status: 500,
      },
    );
  }
}