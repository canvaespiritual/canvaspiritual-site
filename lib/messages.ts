import type { Prospect } from "@/types/prospect";

function getFirstName(fullName: string): string {
  const cleaned = fullName.trim();

  if (!cleaned) {
    return "";
  }

  return cleaned.split(/\s+/)[0];
}

function getGreeting(prospect: Prospect): string {
  const firstName = getFirstName(prospect.fullName);

  return firstName ? `Olá, ${firstName}!` : "Olá!";
}

function getProfessionalReference(prospect: Prospect): string {
  if (prospect.profissao) {
    return prospect.profissao;
  }

  if (prospect.businessCategoryName) {
    return prospect.businessCategoryName;
  }

  if (prospect.searchTerm) {
    return prospect.searchTerm;
  }

  return "autoconhecimento e desenvolvimento humano";
}

export function createInitialMessage(
  prospect: Prospect,
): string {
  const greeting = getGreeting(prospect);
  const professionalReference =
    getProfessionalReference(prospect);

  return `${greeting}

Encontrei seu perfil pesquisando profissionais de ${professionalReference} e achei que esta ferramenta pode combinar com o seu trabalho.

Criamos um Check-up Emocional que pode ser usado como porta de entrada para novos atendimentos, relacionamento com seguidores e também como uma fonte complementar de receita.

Posso te enviar uma apresentação curta mostrando como funciona?`;
}

export function createVoucherMessage(
  prospect: Prospect,
): string {
  const greeting = getGreeting(prospect);

  const voucherText = prospect.voucher
    ? `Seu voucher de demonstração é: ${prospect.voucher}`
    : "Também posso liberar um voucher para você testar o relatório completo gratuitamente.";

  return `${greeting}

Separei o acesso para você conhecer o Check-up Emocional na prática.

${voucherText}

Depois do teste, você também poderá assistir à apresentação do modelo de parceria.`;
}

export function createFollowUpMessage(
  prospect: Prospect,
): string {
  const firstName = getFirstName(prospect.fullName);
  const name = firstName ? `, ${firstName}` : "";

  return `Olá${name}! Passando só para confirmar se você conseguiu ver minha mensagem sobre o Check-up Emocional.

A proposta é usar a ferramenta como apoio de relacionamento, porta de entrada para novos atendimentos e possível receita complementar.`;
}

export async function copyMessage(
  message: string,
): Promise<void> {
  if (!navigator.clipboard) {
    throw new Error(
      "Seu navegador não permitiu copiar a mensagem automaticamente.",
    );
  }

  await navigator.clipboard.writeText(message);
}