import { MessageTemplateType } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";

export type MessageVariables = {
  primeiro_nome?: string | null;
  nome_completo?: string | null;
  atendente?: string | null;
  campanha?: string | null;
  conjunto?: string | null;
  criativo?: string | null;
  status_pagamento?: string | null;
  data_checkout?: string | null;
  produto?: string | null;
  valor?: string | null;
  link_pagamento?: string | null;
  link_acesso?: string | null;
};

const EMPTY_VARIABLE_VALUE = "";

export function getFirstName(fullName?: string | null): string {
  const normalizedName = fullName?.trim();

  if (!normalizedName) {
    return "";
  }

  return normalizedName.split(/\s+/)[0] || "";
}

/**
 * Decide qual mensagem principal deve aparecer ao abrir o lead.
 */
export function getCheckoutTemplateType(
  paid: boolean,
): MessageTemplateType {
  return paid
    ? MessageTemplateType.payment_approved
    : MessageTemplateType.checkout_pending;
}

export async function getMessageTemplate(
  type: MessageTemplateType,
) {
  return prisma.messageTemplate.findUnique({
    where: {
      type,
    },
  });
}

export async function getActiveMessageTemplate(
  type: MessageTemplateType,
) {
  return prisma.messageTemplate.findFirst({
    where: {
      type,
      active: true,
    },
  });
}

/**
 * Troca variáveis no formato {{variavel}}.
 *
 * Variáveis desconhecidas permanecem no texto para que erros
 * de configuração não passem despercebidos silenciosamente.
 */
export function renderMessageTemplate(
  content: string,
  variables: MessageVariables,
): string {
  return content.replace(
    /{{\s*([a-zA-Z0-9_]+)\s*}}/g,
    (originalToken, variableName: string) => {
      if (!(variableName in variables)) {
        return originalToken;
      }

      const value =
        variables[variableName as keyof MessageVariables];

      return value?.toString().trim() || EMPTY_VARIABLE_VALUE;
    },
  );
}

type BuildCheckoutMessageParams = {
  paid: boolean;
  customerName?: string | null;
  campaignName?: string | null;
  adsetName?: string | null;
  adName?: string | null;
  checkoutDate?: string | null;
  paymentStatus?: string | null;
  productName?: string | null;
  amount?: string | null;
  paymentLink?: string | null;
  accessLink?: string | null;
};

/**
 * Busca o modelo correto e devolve o texto pronto para aparecer
 * no textarea do drawer.
 */
export async function buildCheckoutMessage({
  paid,
  customerName,
  campaignName,
  adsetName,
  adName,
  checkoutDate,
  paymentStatus,
  productName,
  amount,
  paymentLink,
  accessLink,
}: BuildCheckoutMessageParams): Promise<{
  templateId: string | null;
  templateType: MessageTemplateType;
  templateName: string;
  senderName: string;
  content: string;
}> {
  const templateType = getCheckoutTemplateType(paid);
  const template = await getActiveMessageTemplate(templateType);

  if (!template) {
    return {
      templateId: null,
      templateType,
      templateName: "",
      senderName: "",
      content: "",
    };
  }

  const content = renderMessageTemplate(template.content, {
    primeiro_nome: getFirstName(customerName),
    nome_completo: customerName,
    atendente: template.senderName,
    campanha: campaignName,
    conjunto: adsetName,
    criativo: adName,
    status_pagamento: paymentStatus,
    data_checkout: checkoutDate,
    produto: productName,
    valor: amount,
    link_pagamento: paymentLink,
    link_acesso: accessLink,
  });

  return {
    templateId: template.id,
    templateType: template.type,
    templateName: template.name,
    senderName: template.senderName,
    content,
  };
}