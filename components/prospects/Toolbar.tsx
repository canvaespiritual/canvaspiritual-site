"use client";

import ImportButton from "./ImportButton";

interface ToolbarProps {
  totalProspects: number;
  duplicatesRemoved: number;
  onImport: (files: File[]) => Promise<void> | void;
  onExportBackup: () => void;
  onClear: () => void;
  isProcessing?: boolean;
}

export default function Toolbar({
  totalProspects,
  duplicatesRemoved,
  onImport,
  onExportBackup,
  onClear,
  isProcessing = false,
}: ToolbarProps) {
  function handleClear() {
    const confirmed = window.confirm(
      "Tem certeza que deseja apagar todos os prospects salvos neste navegador?",
    );

    if (confirmed) {
      onClear();
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-sm font-medium text-zinc-500">
          Base comercial
        </p>

        <div className="mt-1 flex flex-wrap items-center gap-3">
          <strong className="text-2xl text-zinc-900">
            {totalProspects.toLocaleString("pt-BR")}
          </strong>

          <span className="text-sm text-zinc-500">
            prospects únicos
          </span>

          {duplicatesRemoved > 0 && (
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
              {duplicatesRemoved.toLocaleString("pt-BR")} duplicados
              removidos
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <ImportButton
          onFilesSelected={onImport}
          disabled={isProcessing}
        />

        <button
          type="button"
          onClick={onExportBackup}
          disabled={totalProspects === 0}
          className="rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Exportar backup
        </button>

        <button
          type="button"
          onClick={handleClear}
          disabled={totalProspects === 0}
          className="rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Limpar base
        </button>
      </div>
    </div>
  );
}