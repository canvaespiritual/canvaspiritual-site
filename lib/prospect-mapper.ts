import type {
  Prospect as DatabaseProspect,
  ProspectStatus as DatabaseProspectStatus,
} from "@/generated/prisma/client";

import type {
  Prospect,
  ProspectStatus,
} from "@/types/prospect";

export function databaseProspectToClient(
  prospect: DatabaseProspect,
): Prospect {
  return {
    username: prospect.username,
    fullName: prospect.fullName,

    biography: prospect.biography,
    businessCategoryName: prospect.businessCategoryName,
    followersCount: prospect.followersCount,
    postsCount: prospect.postsCount,
    verified: prospect.verified,
    isBusinessAccount: prospect.isBusinessAccount,

    url: prospect.instagramUrl,
    externalUrl: prospect.externalUrl,

    businessAddress: prospect.businessAddress,
    cidade: prospect.cidade,
    bairro: prospect.bairro,
    estado: prospect.estado,
    pais: prospect.pais,

    whatsapp: prospect.whatsapp,
    email: prospect.email,

    origem: prospect.origens.join(" | "),
    profissao: prospect.profissao,
    especialidades: prospect.especialidades,

    voucher: prospect.voucher,
    observacoes: prospect.observacoes,

    status: prospect.status as ProspectStatus,

    importedAt: prospect.importedAt.toISOString(),
    updatedAt: prospect.updatedAt.toISOString(),

    searchTerm: prospect.searchTerms.join(" | "),
    searchSource: prospect.searchSources.join(" | "),
  };
}

export function isValidProspectStatus(
  value: unknown,
): value is DatabaseProspectStatus {
  return (
    typeof value === "string" &&
    [
      "novo",
      "mensagem_enviada",
      "respondeu",
      "cadastrado",
      "ativado",
      "ignorar",
    ].includes(value)
  );
}