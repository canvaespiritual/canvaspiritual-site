export type ProspectStatus =
  | "novo"
  | "mensagem_enviada"
  | "respondeu"
  | "cadastrado"
  | "ativado"
  | "ignorar";

export interface Prospect {

  // Identificação

  username: string;
  fullName: string;

  // Instagram

  biography: string;
  businessCategoryName: string;
  followersCount: number;
  postsCount: number;
  verified: boolean;
  isBusinessAccount: boolean;

  // Links

  url: string;
  externalUrl: string;

  // Localização

  businessAddress: string;
  cidade: string;
  bairro: string;
  estado: string;
  pais: string;

  // Contato

  whatsapp: string;
  email: string;

  // Organização

  origem: string;
  profissao: string;
  especialidades: string[];

  // Comercial

  voucher: string;
  observacoes: string;

  status: ProspectStatus;

  // Datas

  importedAt: string;
  updatedAt: string;

  // Busca

  searchTerm: string;
  searchSource: string;
}