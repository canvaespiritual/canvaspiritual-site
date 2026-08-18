import { NextResponse } from "next/server";

import { precheckoutDb } from "@/lib/precheckout-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PaymentMethod =
  | "pix"
  | "boleto"
  | "credit_card"
  | "bank_transfer"
  | "other";

type InstallmentInput = {
  installmentNumber: number;
  amount: number;
  dueDate: string;

  status?:
    | "pending"
    | "paid"
    | "overdue"
    | "cancelled";

  paidAt?: string | null;

  paymentMethod?: PaymentMethod | null;

  notes?: string | null;
};

type ManualStandaloneSaleInput = {
  name: string;
  email: string;
  phone: string;

  grossAmount: number;

  netAmount?: number | null;

  saleDate?: string | null;

  paymentMethod: PaymentMethod;

  installmentsCount?: number;

  closerName?: string | null;
  notes?: string | null;

  discountAmount?: number | null;
  discountPercentage?: number | null;

  productId?: string | null;
  productName?: string | null;

  checkoutUrl?: string | null;

  installments?: InstallmentInput[];
};

function isTemporarilyAllowed(): boolean {
  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  return (
    process.env.CENTRAL_API_ENABLED === "true"
  );
}

function normalizeText(
  value: unknown,
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();

  return normalized || null;
}

function normalizeMoney(
  value: unknown,
): number | null {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const parsed = Number(value);

  if (
    !Number.isFinite(parsed) ||
    parsed < 0
  ) {
    return null;
  }

  return Math.round(parsed * 100) / 100;
}

function isPaymentMethod(
  value: unknown,
): value is PaymentMethod {
  return [
    "pix",
    "boleto",
    "credit_card",
    "bank_transfer",
    "other",
  ].includes(String(value));
}

function isValidDate(
  value: string,
): boolean {
  const parsed = new Date(value);

  return !Number.isNaN(parsed.getTime());
}

function isValidDueDate(
  value: string,
): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export async function POST(
  request: Request,
) {
  if (!isTemporarilyAllowed()) {
    return NextResponse.json(
      {
        error:
          "Operação não disponível.",
      },
      {
        status: 404,
      },
    );
  }

  let body: ManualStandaloneSaleInput;

  try {
    body =
      (await request.json()) as ManualStandaloneSaleInput;
  } catch {
    return NextResponse.json(
      {
        error:
          "Dados da venda inválidos.",
      },
      {
        status: 400,
      },
    );
  }

  const name = normalizeText(body.name);
  const email = normalizeText(body.email);
  const phone = normalizeText(body.phone);

  if (!name) {
    return NextResponse.json(
      {
        error:
          "Informe o nome do cliente.",
      },
      {
        status: 400,
      },
    );
  }

  if (!email) {
    return NextResponse.json(
      {
        error:
          "Informe o e-mail do cliente.",
      },
      {
        status: 400,
      },
    );
  }

  if (!phone) {
    return NextResponse.json(
      {
        error:
          "Informe o telefone do cliente.",
      },
      {
        status: 400,
      },
    );
  }

  const grossAmount = normalizeMoney(
    body.grossAmount,
  );

  if (
    grossAmount === null ||
    grossAmount <= 0
  ) {
    return NextResponse.json(
      {
        error:
          "Informe um valor de venda válido.",
      },
      {
        status: 400,
      },
    );
  }

  const netAmount =
    normalizeMoney(body.netAmount) ??
    grossAmount;

  if (!isPaymentMethod(body.paymentMethod)) {
    return NextResponse.json(
      {
        error:
          "Forma de pagamento inválida.",
      },
      {
        status: 400,
      },
    );
  }

  const saleDate =
    normalizeText(body.saleDate) ??
    new Date().toISOString();

  if (!isValidDate(saleDate)) {
    return NextResponse.json(
      {
        error:
          "Data da venda inválida.",
      },
      {
        status: 400,
      },
    );
  }

  const closerName = normalizeText(
    body.closerName,
  );

  const notes = normalizeText(
    body.notes,
  );

  const discountAmount =
    normalizeMoney(body.discountAmount);

  const discountPercentage =
    normalizeMoney(
      body.discountPercentage,
    );

  const productId = normalizeText(
    body.productId,
  );

  const productName = normalizeText(
    body.productName,
  );

  const checkoutUrl = normalizeText(
    body.checkoutUrl,
  );

  const installmentInputs =
    Array.isArray(body.installments)
      ? body.installments
      : [];

  const installmentsCount =
    Number.isInteger(
      body.installmentsCount,
    ) &&
    Number(body.installmentsCount) > 0
      ? Number(body.installmentsCount)
      : Math.max(
          installmentInputs.length,
          1,
        );

  for (const installment of installmentInputs) {
    if (
      !Number.isInteger(
        installment.installmentNumber,
      ) ||
      installment.installmentNumber <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Número de parcela inválido.",
        },
        {
          status: 400,
        },
      );
    }

    const installmentAmount =
      normalizeMoney(
        installment.amount,
      );

    if (
      installmentAmount === null ||
      installmentAmount <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Valor de parcela inválido.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !isValidDueDate(
        installment.dueDate,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Data de vencimento da parcela inválida.",
        },
        {
          status: 400,
        },
      );
    }

    const installmentStatus =
      installment.status ?? "pending";

    if (
      ![
        "pending",
        "paid",
        "overdue",
        "cancelled",
      ].includes(installmentStatus)
    ) {
      return NextResponse.json(
        {
          error:
            "Status de parcela inválido.",
        },
        {
          status: 400,
        },
      );
    }
  }

  const client =
    await precheckoutDb.connect();

  try {
    await client.query("BEGIN");

    const leadResult =
      await client.query<{
        id: string;
        name: string;
        email: string;
        phone: string;
      }>(
        `
          INSERT INTO public.leads_precheckout (
            name,
            email,
            phone,

            utm_source,
            utm_medium,
            utm_campaign,
            utm_content,
            utm_term,

            page_url,
            referrer,

            status,

            pago,
            pago_em,
            paid_at,

            created_at,
            updated_at
          )
          VALUES (
            $1,
            $2,
            $3,

            'manual',
            'manual',
            'venda_avulsa',
            NULL,
            NULL,

            NULL,
            NULL,

            'paid',

            TRUE,
            $4::timestamptz,
            $4::timestamptz,

            NOW(),
            NOW()
          )

          RETURNING
            id,
            name,
            email,
            phone
        `,
        [
          name,
          email,
          phone,
          saleDate,
        ],
      );

    const lead =
      leadResult.rows[0];

    if (!lead) {
      throw new Error(
        "O banco não retornou o lead criado.",
      );
    }

    const saleResult =
      await client.query<{
        id: string;
        source: string;
        status: string;

        gross_amount: string | null;
        net_amount: string | null;

        currency: string;

        payment_method: string | null;
        installments: number;

        sale_date: Date | string;

        closer_name: string | null;

        product_name: string | null;
      }>(
        `
          INSERT INTO public.checkout_sales (
            checkout_lead_id,

            source,
            status,

            gross_amount,
            net_amount,
            currency,

            payment_method,
            installments,

            sale_date,

            closer_name,
            notes,

            discount_amount,
            discount_percentage,

            product_id,
            product_name,

            checkout_url
          )
          VALUES (
            $1,

            'manual',
            'paid',

            $2,
            $3,
            'BRL',

            $4,
            $5,

            $6::timestamptz,

            $7,
            $8,

            $9,
            $10,

            $11,
            $12,

            $13
          )

          RETURNING
            id,
            source,
            status,

            gross_amount,
            net_amount,

            currency,

            payment_method,
            installments,

            sale_date,

            closer_name,

            product_name
        `,
        [
          lead.id,

          grossAmount,
          netAmount,

          body.paymentMethod,
          installmentsCount,

          saleDate,

          closerName,
          notes,

          discountAmount,
          discountPercentage,

          productId,
          productName,

          checkoutUrl,
        ],
      );

    const sale =
      saleResult.rows[0];

    if (!sale) {
      throw new Error(
        "O banco não retornou a venda criada.",
      );
    }

    for (
      const installment
      of installmentInputs
    ) {
      const installmentAmount =
        normalizeMoney(
          installment.amount,
        );

      const installmentStatus =
        installment.status ??
        "pending";

      const paidAt =
        installmentStatus === "paid"
          ? normalizeText(
              installment.paidAt,
            ) ?? saleDate
          : null;

      const installmentPaymentMethod =
        installment.paymentMethod &&
        isPaymentMethod(
          installment.paymentMethod,
        )
          ? installment.paymentMethod
          : body.paymentMethod;

      await client.query(
        `
          INSERT INTO public.checkout_sale_installments (
            sale_id,

            installment_number,
            amount,

            due_date,
            status,

            paid_at,

            payment_method,
            notes
          )
          VALUES (
            $1,
            $2,
            $3,
            $4::date,
            $5,
            $6::timestamptz,
            $7,
            $8
          )
        `,
        [
          sale.id,

          installment.installmentNumber,
          installmentAmount,

          installment.dueDate,
          installmentStatus,

          paidAt,

          installmentPaymentMethod,
          normalizeText(
            installment.notes,
          ),
        ],
      );
    }

    await client.query("COMMIT");

    return NextResponse.json(
      {
        ok: true,

        lead: {
          id: lead.id,
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
        },

        sale: {
          id: sale.id,

          source: sale.source,
          status: sale.status,

          grossAmount:
            sale.gross_amount !== null
              ? Number(
                  sale.gross_amount,
                )
              : null,

          netAmount:
            sale.net_amount !== null
              ? Number(
                  sale.net_amount,
                )
              : null,

          currency:
            sale.currency,

          paymentMethod:
            sale.payment_method,

          installments:
            sale.installments,

          saleDate:
            new Date(
              sale.sale_date,
            ).toISOString(),

          closerName:
            sale.closer_name,

          productName:
            sale.product_name,
        },

        installmentsCreated:
          installmentInputs.length,
      },
      {
        status: 201,

        headers: {
          "Cache-Control": "no-store",

          "X-Robots-Tag":
            "noindex, nofollow, noarchive",
        },
      },
    );
  } catch (error) {
    await client.query("ROLLBACK");

    console.error(
      "Erro ao registrar venda avulsa:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível registrar a venda avulsa.",
      },
      {
        status: 500,
      },
    );
  } finally {
    client.release();
  }
}