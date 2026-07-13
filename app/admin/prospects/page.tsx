"use client";

import { useEffect, useMemo, useState } from "react";

import ProspectFilters, {
  type ProspectFilterValues,
} from "@/components/prospects/ProspectFilters";
import ProspectTable from "@/components/prospects/ProspectTable";
import Toolbar from "@/components/prospects/Toolbar";

import { importCsvFiles } from "@/lib/csv";
import { deduplicateProspects } from "@/lib/dedupe";
import {
  clearProspectsDatabase,
  fetchProspects,
  sendProspectsImport,
  updateProspect,
} from "@/lib/prospects-api";

import type { Prospect } from "@/types/prospect";

const ITEMS_PER_PAGE = 50;

const initialFilters: ProspectFilterValues = {
  search: "",
  status: "todos",
  searchTerm: "todos",
  contactType: "todos",
  businessOnly: false,
  minimumFollowers: 0,
  maximumFollowers: 0,
  idioma: "todos",
};

function normalizeForSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function splitCombinedValues(value: string): string[] {
  return value
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
}

function exportBackup(prospects: Prospect[]): void {
  const content = JSON.stringify(prospects, null, 2);

  const blob = new Blob([content], {
    type: "application/json;charset=utf-8",
  });

  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = objectUrl;
  anchor.download = `prospects-backup-${new Date()
    .toISOString()
    .slice(0, 10)}.json`;

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(objectUrl);
}

export default function ProspectsPage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);

  const [filters, setFilters] =
    useState<ProspectFilterValues>(initialFilters);

  const [duplicatesRemoved, setDuplicatesRemoved] =
    useState(0);

  const [isProcessing, setIsProcessing] =
    useState(false);

  const [isLoaded, setIsLoaded] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  const [importMessage, setImportMessage] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    void loadDatabaseProspects();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  async function loadDatabaseProspects() {
    setErrorMessage("");

    try {
      const databaseProspects = await fetchProspects();

      setProspects(databaseProspects);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível carregar a base.";

      setErrorMessage(message);
    } finally {
      setIsLoaded(true);
    }
  }

  async function handleImport(files: File[]) {
    if (files.length === 0) {
      return;
    }

    setIsProcessing(true);
    setImportMessage("");
    setErrorMessage("");

    try {
      const imported = await importCsvFiles(files);

      const localDeduplication =
        deduplicateProspects(imported.prospects);

      const response = await sendProspectsImport({
        prospects: localDeduplication.prospects,

        fileNames: files.map((file) => file.name),

        rowsReceived: imported.rowsProcessed,

        invalidRows: imported.errors.length,
      });

      const duplicateCount =
        localDeduplication.duplicatesRemoved +
        response.summary.updatedProspects;

      setDuplicatesRemoved(duplicateCount);

      await loadDatabaseProspects();

      setImportMessage(
        [
          `${files.length} arquivo(s) processado(s).`,
          `${response.summary.newProspects.toLocaleString(
            "pt-BR",
          )} novo(s).`,
          `${response.summary.updatedProspects.toLocaleString(
            "pt-BR",
          )} já existente(s) atualizado(s).`,
          `${duplicateCount.toLocaleString(
            "pt-BR",
          )} repetição(ões) identificada(s).`,
          `${response.summary.invalidRows.toLocaleString(
            "pt-BR",
          )} linha(s) inválida(s).`,
        ].join(" "),
      );

      if (imported.errors.length > 0) {
        console.warn(
          "Erros encontrados nos CSVs:",
          imported.errors,
        );
      }

      setCurrentPage(1);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível importar os arquivos.";

      setErrorMessage(message);
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleUpdateProspect(
    username: string,
    updates: Partial<Prospect>,
  ) {
    const normalizedUsername = username
      .trim()
      .toLowerCase();

    const previousProspects = prospects;

    setProspects((currentProspects) =>
      currentProspects.map((prospect) =>
        prospect.username.toLowerCase() ===
        normalizedUsername
          ? {
              ...prospect,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : prospect,
      ),
    );

    try {
      const savedProspect = await updateProspect(
        username,
        updates,
      );

      setProspects((currentProspects) =>
        currentProspects.map((prospect) =>
          prospect.username.toLowerCase() ===
          normalizedUsername
            ? savedProspect
            : prospect,
        ),
      );
    } catch (error) {
      setProspects(previousProspects);

      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível salvar a alteração.";

      window.alert(message);
    }
  }

  async function handleClearBase() {
    setIsProcessing(true);
    setErrorMessage("");
    setImportMessage("");

    try {
      const deletedCount =
        await clearProspectsDatabase();

      setProspects([]);
      setDuplicatesRemoved(0);
      setFilters(initialFilters);
      setCurrentPage(1);

      setImportMessage(
        `${deletedCount.toLocaleString(
          "pt-BR",
        )} prospect(s) apagado(s) do banco.`,
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível limpar a base.";

      setErrorMessage(message);
    } finally {
      setIsProcessing(false);
    }
  }

  function handleExportBackup() {
    exportBackup(prospects);
  }

  const searchTerms = useMemo(() => {
  const terms = new Set<string>();

  prospects.forEach((prospect) => {
    splitCombinedValues(prospect.searchTerm).forEach(
      (term) => {
        terms.add(term);
      },
    );
  });

  return Array.from(terms).sort((first, second) =>
    first.localeCompare(second, "pt-BR"),
  );
}, [prospects]);

const languages = useMemo(() => {
  const languageSet = new Set<string>();

  prospects.forEach((prospect) => {
    const language = prospect.idioma?.trim();

    if (language) {
      languageSet.add(language);
    }
  });

  return Array.from(languageSet).sort(
    (first, second) =>
      first.localeCompare(second, "pt-BR"),
  );
}, [prospects]);


  const filteredProspects = useMemo(() => {
    const normalizedSearch = normalizeForSearch(
      filters.search,
    );

    return prospects
      .filter((prospect) => {
        if (
          filters.status !== "todos" &&
          prospect.status !== filters.status
        ) {
          return false;
        }

        if (
          filters.businessOnly &&
          !prospect.isBusinessAccount
        ) {
          return false;
        }

        if (
          prospect.followersCount <
          filters.minimumFollowers
        ) {
          return false;
        }
        if (
  filters.maximumFollowers > 0 &&
  prospect.followersCount >
    filters.maximumFollowers
) {
  return false;
}

if (
  filters.idioma !== "todos" &&
  prospect.idioma !== filters.idioma
) {
  return false;
}

        if (
          filters.contactType === "whatsapp" &&
          !prospect.whatsapp.trim()
        ) {
          return false;
        }

        if (
          filters.contactType === "instagram" &&
          !prospect.username.trim()
        ) {
          return false;
        }

        if (filters.searchTerm !== "todos") {
          const prospectTerms =
            splitCombinedValues(
              prospect.searchTerm,
            );

          const matchesTerm =
            prospectTerms.includes(
              filters.searchTerm,
            );

          if (!matchesTerm) {
            return false;
          }
        }

        if (normalizedSearch) {
          const searchableContent =
            normalizeForSearch(
              [
                prospect.username,
                prospect.fullName,
                prospect.biography,
                prospect.businessCategoryName,
                prospect.profissao,
                prospect.especialidades.join(" "),
                prospect.whatsapp,
                prospect.email,
                prospect.cidade,
                prospect.bairro,
                prospect.estado,
                prospect.pais,
                prospect.idioma,
                prospect.searchTerm,
                prospect.origem,
                prospect.observacoes,
              ].join(" "),
            );

          if (
            !searchableContent.includes(
              normalizedSearch,
            )
          ) {
            return false;
          }
        }

        return true;
      })
      .sort((first, second) => {
        if (
          first.status === "novo" &&
          second.status !== "novo"
        ) {
          return -1;
        }

        if (
          first.status !== "novo" &&
          second.status === "novo"
        ) {
          return 1;
        }

        return (
          second.followersCount -
          first.followersCount
        );
      });
  }, [prospects, filters]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredProspects.length / ITEMS_PER_PAGE,
    ),
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages,
  );

  const paginatedProspects = useMemo(() => {
    const startIndex =
      (safeCurrentPage - 1) * ITEMS_PER_PAGE;

    return filteredProspects.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE,
    );
  }, [filteredProspects, safeCurrentPage]);

  const statusCounts = useMemo(
    () => ({
      novos: prospects.filter(
        (prospect) =>
          prospect.status === "novo",
      ).length,

      contatados: prospects.filter(
        (prospect) =>
          prospect.status ===
          "mensagem_enviada",
      ).length,

      responderam: prospects.filter(
        (prospect) =>
          prospect.status === "respondeu",
      ).length,

      cadastrados: prospects.filter(
        (prospect) =>
          prospect.status === "cadastrado",
      ).length,

      ativados: prospects.filter(
        (prospect) =>
          prospect.status === "ativado",
      ).length,
    }),
    [prospects],
  );

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-zinc-50 px-4 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center shadow-sm">
            <p className="text-sm font-medium text-zinc-500">
              Carregando dados do PostgreSQL...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        <header className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Canva Espiritual
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-950">
            Prospecção comercial
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">
            Base compartilhada, armazenada no
            PostgreSQL e disponível para toda a
            operação comercial.
          </p>
        </header>

        <div className="space-y-5">
          <Toolbar
            totalProspects={prospects.length}
            duplicatesRemoved={duplicatesRemoved}
            onImport={handleImport}
            onExportBackup={handleExportBackup}
            onClear={() => void handleClearBase()}
            isProcessing={isProcessing}
          />

          {importMessage && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
              {importMessage}
            </div>
          )}

          {errorMessage && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {errorMessage}
            </div>
          )}

          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <StatusCard
              label="Novos"
              value={statusCounts.novos}
            />

            <StatusCard
              label="Mensagem enviada"
              value={statusCounts.contatados}
            />

            <StatusCard
              label="Responderam"
              value={statusCounts.responderam}
            />

            <StatusCard
              label="Cadastrados"
              value={statusCounts.cadastrados}
            />

            <StatusCard
              label="Ativados"
              value={statusCounts.ativados}
            />
          </section>

          <ProspectFilters
            filters={filters}
            searchTerms={searchTerms}
            languages={languages}
            onChange={setFilters}
            onReset={() =>
              setFilters(initialFilters)
            }
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-zinc-600">
              Exibindo{" "}
              <strong className="text-zinc-900">
                {paginatedProspects.length.toLocaleString(
                  "pt-BR",
                )}
              </strong>{" "}
              de{" "}
              <strong className="text-zinc-900">
                {filteredProspects.length.toLocaleString(
                  "pt-BR",
                )}
              </strong>{" "}
              resultados filtrados.
            </p>

            {isProcessing && (
              <p className="text-sm font-semibold text-amber-700">
                Processando e salvando no banco...
              </p>
            )}
          </div>

          <ProspectTable
            prospects={paginatedProspects}
            onUpdate={
              handleUpdateProspect
            }
          />

          {filteredProspects.length >
            ITEMS_PER_PAGE && (
            <Pagination
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>
    </main>
  );
}

interface StatusCardProps {
  label: string;
  value: number;
}

function StatusCard({
  label,
  value,
}: StatusCardProps) {
  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-zinc-950">
        {value.toLocaleString("pt-BR")}
      </p>
    </article>
  );
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const pages = getPaginationPages(
    currentPage,
    totalPages,
  );

  function changePage(page: number) {
    const validPage = Math.min(
      Math.max(page, 1),
      totalPages,
    );

    onPageChange(validPage);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <nav
      aria-label="Paginação dos prospects"
      className="flex flex-wrap items-center justify-center gap-2"
    >
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() =>
          changePage(currentPage - 1)
        }
        className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Anterior
      </button>

      {pages.map((page, index) => {
        if (page === "...") {
          return (
            <span
              key={`ellipsis-${index}`}
              className="px-2 text-sm text-zinc-400"
            >
              ...
            </span>
          );
        }

        return (
          <button
            key={page}
            type="button"
            onClick={() => changePage(page)}
            className={
              page === currentPage
                ? "rounded-lg bg-zinc-900 px-3 py-2 text-sm font-semibold text-white"
                : "rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
            }
          >
            {page}
          </button>
        );
      })}

      <button
        type="button"
        disabled={
          currentPage === totalPages
        }
        onClick={() =>
          changePage(currentPage + 1)
        }
        className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Próxima
      </button>
    </nav>
  );
}

function getPaginationPages(
  currentPage: number,
  totalPages: number,
): Array<number | "..."> {
  if (totalPages <= 7) {
    return Array.from(
      { length: totalPages },
      (_, index) => index + 1,
    );
  }

  if (currentPage <= 4) {
    return [
      1,
      2,
      3,
      4,
      5,
      "...",
      totalPages,
    ];
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      "...",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
}