"use client";

import { useRef, useState } from "react";

interface ImportButtonProps {
  onFilesSelected: (files: File[]) => Promise<void> | void;
  disabled?: boolean;
}

export default function ImportButton({
  onFilesSelected,
  disabled = false,
}: ImportButtonProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  async function handleFiles(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const selectedFiles = Array.from(event.target.files ?? []);

    if (selectedFiles.length === 0) {
      return;
    }

    setIsImporting(true);

    try {
      await onFilesSelected(selectedFiles);
    } finally {
      setIsImporting(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        multiple
        onChange={handleFiles}
        className="hidden"
      />

      <button
        type="button"
        disabled={disabled || isImporting}
        onClick={() => inputRef.current?.click()}
        className="rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isImporting ? "Importando..." : "Importar CSV"}
      </button>
    </>
  );
}