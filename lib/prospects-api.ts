import type { Prospect } from "@/types/prospect";

interface GetProspectsResponse {
  prospects: Prospect[];
  total: number;
}

interface ImportProspectsPayload {
  prospects: Prospect[];
  fileNames: string[];
  rowsReceived: number;
  invalidRows: number;
}

export interface ImportSummary {
  rowsReceived: number;
  validProspects: number;
  newProspects: number;
  updatedProspects: number;
  duplicatesInsideImport: number;
  invalidRows: number;
}

interface ImportProspectsResponse {
  success: boolean;
  summary: ImportSummary;
  prospects: Prospect[];
}

interface UpdateProspectResponse {
  prospect: Prospect;
}

interface ClearProspectsResponse {
  success: boolean;
  deletedProspects: number;
}

async function readJsonResponse<T>(
  response: Response,
): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    const message =
      typeof data?.error === "string"
        ? data.error
        : "O servidor retornou um erro.";

    throw new Error(message);
  }

  return data as T;
}

export async function fetchProspects(): Promise<Prospect[]> {
  const response = await fetch("/api/prospects", {
    method: "GET",
    cache: "no-store",
  });

  const data =
    await readJsonResponse<GetProspectsResponse>(response);

  return data.prospects;
}

export async function sendProspectsImport(
  payload: ImportProspectsPayload,
): Promise<ImportProspectsResponse> {
  const response = await fetch("/api/prospects/import", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(payload),
  });

  return readJsonResponse<ImportProspectsResponse>(response);
}

export async function updateProspect(
  username: string,
  updates: Partial<Prospect>,
): Promise<Prospect> {
  const response = await fetch(
    `/api/prospects/${encodeURIComponent(username)}`,
    {
      method: "PATCH",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(updates),
    },
  );

  const data =
    await readJsonResponse<UpdateProspectResponse>(response);

  return data.prospect;
}

export async function clearProspectsDatabase(): Promise<number> {
  const response = await fetch("/api/prospects", {
    method: "DELETE",
  });

  const data =
    await readJsonResponse<ClearProspectsResponse>(response);

  return data.deletedProspects;
}