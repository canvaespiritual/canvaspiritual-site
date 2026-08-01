import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  MessageTemplateType,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const VALID_TEMPLATE_TYPES =
  new Set<MessageTemplateType>([
    MessageTemplateType.checkout_pending,
    MessageTemplateType.payment_approved,
    MessageTemplateType.followup_pending,
    MessageTemplateType.access_confirmation,
  ]);

function normalizeText(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function isValidTemplateType(
  value: string,
): value is MessageTemplateType {
  return VALID_TEMPLATE_TYPES.has(
    value as MessageTemplateType,
  );
}

export async function GET() {
  try {
    const templates =
      await prisma.messageTemplate.findMany({
        orderBy: [
          {
            type: "asc",
          },
          {
            createdAt: "asc",
          },
        ],
      });

    return NextResponse.json({
      templates,
    });
  } catch (error) {
    console.error(
      "Erro ao listar templates:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível carregar os templates.",
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
      type?: unknown;
      name?: unknown;
      content?: unknown;
      senderName?: unknown;
      active?: unknown;
    };

    const type = normalizeText(body.type);
    const name = normalizeText(body.name);
    const content = normalizeText(
      body.content,
    );
   const senderName =
  normalizeText(body.senderName);

    const active =
      typeof body.active === "boolean"
        ? body.active
        : true;

    if (!isValidTemplateType(type)) {
      return NextResponse.json(
        {
          error:
            "Selecione um tipo de template válido.",
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
            "Informe o nome do template.",
        },
        {
          status: 400,
        },
      );
    }

    if (!content) {
      return NextResponse.json(
        {
          error:
            "Informe o conteúdo da mensagem.",
        },
        {
          status: 400,
        },
      );
    }

    if (active) {
      await prisma.messageTemplate.updateMany({
        where: {
          type,
          active: true,
        },
        data: {
          active: false,
        },
      });
    }

    const template =
      await prisma.messageTemplate.create({
        data: {
          type,
          name,
          content,
          senderName,
          active,
        },
      });

    return NextResponse.json(
      {
        template,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "Erro ao criar template:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível criar o template.",
      },
      {
        status: 500,
      },
    );
  }
}