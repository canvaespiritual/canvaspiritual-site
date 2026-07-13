import Papa from "papaparse";
import type { Prospect, ProspectStatus } from "@/types/prospect";
import { detectLanguage } from "@/lib/language";

type CsvRow = Record<string, string | undefined>;

export interface CsvImportResult {
  prospects: Prospect[];
  errors: string[];
  filesProcessed: number;
  rowsProcessed: number;
}

function normalizeText(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function normalizeNumber(value: unknown): number {
  const parsed = Number(normalizeText(value).replace(",", "."));

  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeBoolean(value: unknown): boolean {
  const normalized = normalizeText(value).toLowerCase();

  return ["true", "1", "yes", "sim", "verdadeiro"].includes(normalized);
}

function normalizeUsername(value: unknown): string {
  return normalizeText(value)
    .replace(/^@/, "")
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/\/.*$/, "")
    .trim()
    .toLowerCase();
}

function extractUsernameFromUrl(value: unknown): string {
  const url = normalizeText(value);

  if (!url) {
    return "";
  }

  const match = url.match(/instagram\.com\/([^/?#]+)/i);

  return match?.[1] ? normalizeUsername(match[1]) : "";
}

function generateInstagramUrl(username: string): string {
  return username ? `https://www.instagram.com/${username}/` : "";
}

function createProspect(row: CsvRow, fileName: string): Prospect | null {
  const username =
    normalizeUsername(row.username) ||
    extractUsernameFromUrl(row.url) ||
    extractUsernameFromUrl(row.inputUrl);

  if (!username) {
    return null;
  }

  const now = new Date().toISOString();

  const status: ProspectStatus = "novo";

  return {
    username,
    fullName: normalizeText(row.fullName),

    biography: normalizeText(row.biography),
    businessCategoryName: normalizeText(row.businessCategoryName),
    followersCount: normalizeNumber(row.followersCount),
    postsCount: normalizeNumber(row.postsCount),
    verified: normalizeBoolean(row.verified),
    isBusinessAccount: normalizeBoolean(row.isBusinessAccount),

    url: normalizeText(row.url) || generateInstagramUrl(username),
    externalUrl: normalizeText(row.externalUrl),

    businessAddress: normalizeText(row.businessAddress),
    cidade: normalizeText(row.cidade),
    bairro: normalizeText(row.bairro),
    estado: normalizeText(row.estado),
    pais: normalizeText(row.pais),
    idioma:
  normalizeText(row.idioma) ||
  detectLanguage(
    normalizeText(row.biography),
    normalizeText(row.fullName),
    normalizeText(row.businessAddress),
  ),
    whatsapp: normalizeText(row.whatsapp),
    email: normalizeText(row.email),

    origem: normalizeText(row.origem) || fileName,
    profissao:
      normalizeText(row.profissao) ||
      normalizeText(row.businessCategoryName),
    especialidades: normalizeText(row.especialidades)
      .split(/[;,|]/)
      .map((item) => item.trim())
      .filter(Boolean),

    voucher: normalizeText(row.voucher),
    observacoes: normalizeText(row.observacoes),

    status,

    importedAt: now,
    updatedAt: now,

    searchTerm: normalizeText(row.searchTerm),
    searchSource: normalizeText(row.searchSource),
  };
}

function parseCsvFile(file: File): Promise<{
  prospects: Prospect[];
  errors: string[];
  rowsProcessed: number;
}> {
  return new Promise((resolve) => {
    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),

      complete: (result) => {
        const prospects: Prospect[] = [];
        const errors: string[] = [];

        result.data.forEach((row, index) => {
          const prospect = createProspect(row, file.name);

          if (prospect) {
            prospects.push(prospect);
          } else {
            errors.push(
              `${file.name}: linha ${index + 2} sem username válido.`,
            );
          }
        });

        result.errors.forEach((error) => {
          errors.push(
            `${file.name}: linha ${error.row ?? "desconhecida"} — ${error.message}`,
          );
        });

        resolve({
          prospects,
          errors,
          rowsProcessed: result.data.length,
        });
      },

      error: (error) => {
        resolve({
          prospects: [],
          errors: [`${file.name}: ${error.message}`],
          rowsProcessed: 0,
        });
      },
    });
  });
}

export async function importCsvFiles(
  files: File[],
): Promise<CsvImportResult> {
  const allProspects: Prospect[] = [];
  const allErrors: string[] = [];
  let rowsProcessed = 0;

  for (const file of files) {
    const result = await parseCsvFile(file);

    allProspects.push(...result.prospects);
    allErrors.push(...result.errors);
    rowsProcessed += result.rowsProcessed;
  }

  return {
    prospects: allProspects,
    errors: allErrors,
    filesProcessed: files.length,
    rowsProcessed,
  };
}