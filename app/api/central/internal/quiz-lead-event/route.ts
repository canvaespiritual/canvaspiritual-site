import {
  timingSafeEqual,
} from "node:crypto";

import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  prisma,
} from "@/lib/db";

import {
  sendPushToActiveSubscriptions,
} from "@/lib/push/web-push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type QuizLeadEvent = {
  eventType?: string;
  source?: string;
  sessionId?: string;
  externalEventId?: string;

  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };

  quiz?: {
    createdAt?: string;
    language?: string;
    affiliateRef?: string | null;
    mediaVibracional?: number | null;
    zonaPredominante?: string | null;
    codigoArquetipo?: string | null;
  };
};

function safeSecretComparison(
  received: string,
  expected: string,
): boolean {
  const receivedBuffer =
    Buffer.from(received);

  const expectedBuffer =
    Buffer.from(expected);

  if (
    receivedBuffer.length !==
    expectedBuffer.length
  ) {
    return false;
  }

  return timingSafeEqual(
    receivedBuffer,
    expectedBuffer,
  );
}

function isAuthorized(
  request: NextRequest,
): boolean {
  const expectedSecret = String(
    process.env.CENTRAL_EVENTS_SECRET || "",
  ).trim();

  if (!expectedSecret) {
    console.error(
      "CENTRAL_EVENTS_SECRET nao configurado.",
    );

    return false;
  }

  const receivedSecret = String(
    request.headers.get(
      "x-central-events-secret",
    ) || "",
  ).trim();

  if (!receivedSecret) {
    return false;
  }

  return safeSecretComparison(
    receivedSecret,
    expectedSecret,
  );
}

export async function POST(
  request: NextRequest,
) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        ok: false,
        error: "unauthorized",
      },
      {
        status: 401,
        headers: {
          "Cache-Control": "no-store",
          "X-Robots-Tag":
            "noindex, nofollow, noarchive",
        },
      },
    );
  }

  try {
    const body =
      (await request.json()) as QuizLeadEvent;

    const sessionId =
      String(body.sessionId || "").trim();

    if (!sessionId) {
      return NextResponse.json(
        {
          ok: false,
          error: "sessionId obrigatorio",
        },
        {
          status: 400,
        },
      );
    }

    const existing =
      await prisma.quizLead.findUnique({
        where: {
          sessionId,
        },
      });

    const customer =
      body.customer || {};

    const quiz =
      body.quiz || {};

    const lead =
      await prisma.quizLead.upsert({
        where: {
          sessionId,
        },

        create: {
          sessionId,

          name:
            String(customer.name || "").trim(),

          email:
            String(customer.email || "").trim(),

          phone:
            String(customer.phone || "").trim(),

          language:
            String(quiz.language || "").trim(),

          affiliateRef:
            quiz.affiliateRef
              ? String(quiz.affiliateRef)
              : null,

          mediaVibracional:
            typeof quiz.mediaVibracional === "number"
              ? quiz.mediaVibracional
              : null,

          zonaPredominante:
            quiz.zonaPredominante
              ? String(quiz.zonaPredominante)
              : null,

          codigoArquetipo:
            quiz.codigoArquetipo
              ? String(quiz.codigoArquetipo)
              : null,

          source:
            String(body.source || "quiz"),

          payload:
            body as object,

          createdAt:
            quiz.createdAt
              ? new Date(quiz.createdAt)
              : new Date(),
        },

        update: {
          name:
            String(customer.name || "").trim(),

          email:
            String(customer.email || "").trim(),

          phone:
            String(customer.phone || "").trim(),

          language:
            String(quiz.language || "").trim(),

          affiliateRef:
            quiz.affiliateRef
              ? String(quiz.affiliateRef)
              : null,

          mediaVibracional:
            typeof quiz.mediaVibracional === "number"
              ? quiz.mediaVibracional
              : null,

          zonaPredominante:
            quiz.zonaPredominante
              ? String(quiz.zonaPredominante)
              : null,

          codigoArquetipo:
            quiz.codigoArquetipo
              ? String(quiz.codigoArquetipo)
              : null,

          source:
            String(body.source || "quiz"),

          payload:
            body as object,
        },
      });

    const created = !existing;

    if (created) {
      await sendPushToActiveSubscriptions({
        title: "Novo lead do Quiz",
        body:
          `${lead.name || "Novo lead"} concluiu o Check-up Emocional.`,
        url: "/central/leads-quiz",
        tag: `quiz-lead-${lead.id}`,
      });
    }

    return NextResponse.json(
      {
        ok: true,
        created,
        leadId: lead.id,
        sessionId: lead.sessionId,
      },
      {
        status: created ? 201 : 200,

        headers: {
          "Cache-Control": "no-store",
          "X-Robots-Tag":
            "noindex, nofollow, noarchive",
        },
      },
    );
  } catch (error) {
    console.error(
      "Erro ao receber lead do quiz:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Nao foi possivel registrar o lead do quiz.",
      },
      {
        status: 500,

        headers: {
          "Cache-Control": "no-store",
          "X-Robots-Tag":
            "noindex, nofollow, noarchive",
        },
      },
    );
  }
}
