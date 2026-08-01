export interface CampaignAlias {
  id: string;

  platform: string;
  externalId: string;
  name: string;

  adAccountId: string | null;
  platformStatus: string | null;

  lastSyncedAt: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface CampaignAliasInput {
  platform?: string;
  externalId: string;
  name: string;
}

export interface CampaignAliasListResponse {
  campaigns: CampaignAlias[];
  total: number;
}