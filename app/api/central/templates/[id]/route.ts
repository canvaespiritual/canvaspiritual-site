import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  MessageTemplateType,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

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

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;

    const existingTemplate =
      await prisma.messageTemplate.findUnique({
        where: {
          id,
        },
      });

    if (!existingTemplate) {
      return NextResponse.json(
        {
          error:
            "Template não encontrado.",
        },
        {
          status: 404,
        },
      );
    }

    const body = (await request.json()) as {
      type?: unknown;
      name?: unknown;
      content?: unknown;
      senderName?: unknown;
      active?: unknown;
    };

    const typeText =
      body.type === undefined
        ? existingTemplate.type
        : normalizeText(body.type);

    if (!isValidTemplateType(typeText)) {
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

    const name =
      body.name === undefined
        ? existingTemplate.name
        : normalizeText(body.name);

    const content =
      body.content === undefined
        ? existingTemplate.content
        : normalizeText(body.content);

    const senderName =
  body.senderName === undefined
    ? existingTemplate.senderName
    : normalizeText(body.senderName);

    const active =
      typeof body.active === "boolean"
        ? body.active
        : existingTemplate.active;

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
          type: typeText,
          active: true,
          id: {
            not: id,
          },
        },
        data: {
          active: false,
        },
      });
    }

    const template =
      await prisma.messageTemplate.update({
        where: {
          id,
        },
        data: {
          type: typeText,
          name,
          content,
          senderName,
          active,
        },
      });

    return NextResponse.json({
      template,
    });
  } catch (error) {
    console.error(
      "Erro ao atualizar template:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível atualizar o template.",
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

    const existingTemplate =
      await prisma.messageTemplate.findUnique({
        where: {
          id,
        },
      });

    if (!existingTemplate) {
      return NextResponse.json(
        {
          error:
            "Template não encontrado.",
        },
        {
          status: 404,
        },
      );
    }

    await prisma.messageTemplate.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Erro ao excluir template:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível excluir o template.",
      },
      {
        status: 500,
      },
    );
  }
}