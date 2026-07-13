import type { Prospect } from "@/types/prospect";

const STORAGE_KEY = "canva_spiritual_prospects_v1";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function loadProspects(): Prospect[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    return Array.isArray(parsed) ? (parsed as Prospect[]) : [];
  } catch (error) {
    console.error("Erro ao carregar prospects:", error);
    return [];
  }
}

export function saveProspects(prospects: Prospect[]): void {
  if (!isBrowser()) {
    return;
  }

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(prospects),
    );
  } catch (error) {
    console.error("Erro ao salvar prospects:", error);

    throw new Error(
      "Não foi possível salvar os dados no navegador. O armazenamento pode estar cheio.",
    );
  }
}

export function clearProspects(): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}

export function exportProspectsBackup(
  prospects: Prospect[],
): void {
  if (!isBrowser()) {
    return;
  }

  const content = JSON.stringify(prospects, null, 2);
  const blob = new Blob([content], {
    type: "application/json;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = `prospects-backup-${new Date()
    .toISOString()
    .slice(0, 10)}.json`;

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(url);
}