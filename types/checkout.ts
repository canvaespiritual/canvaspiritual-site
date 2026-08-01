export type CheckoutMessageTemplateType =
  | "checkout_pending"
  | "payment_approved"
  | "followup_pending"
  | "access_confirmation";

export interface CheckoutMessage {
  templateId: string;
  templateType: CheckoutMessageTemplateType;
  templateName: string;
  senderName: string;
  content: string;
}

export interface CheckoutLead {
  id: string;

  name: string;
  email: string;
  phone: string;

  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;

  /*
   * Campanha
   */
  campaignId: string | null;
  campaignName: string | null;
  campaignDisplayName: string | null;

  /*
   * Conjunto de anúncios.
   *
   * Atualmente, o ID é recebido por utm_term.
   */
  adsetId: string | null;
  adsetName: string | null;
  adsetDisplayName: string | null;

  /*
   * Anúncio ou criativo.
   *
   * Atualmente, o ID é recebido por utm_content.
   */
  adId: string | null;
  adName: string | null;
  adDisplayName: string | null;

  pageUrl: string | null;
  referrer: string | null;

  status: string;

  kiwifyOrderId: string | null;
  kiwifyStatus: string | null;

  paid: boolean;
  paidAt: string | null;

  createdAt: string;
  updatedAt: string;

  /*
   * Mensagem padrão já renderizada.
   *
   * O usuário ainda poderá editar o conteúdo no drawer
   * antes de copiar ou abrir o WhatsApp.
   */
  message: CheckoutMessage | null;
}

export interface CheckoutListResponse {
  checkouts: CheckoutLead[];

  summary?: {
    total: number;
    paid: number;
    pending: number;
    today: number;
  };

  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}