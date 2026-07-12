"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type SearchArticle = {
  slug: string;
  title: string;
  description: string;
  category: string;
  searchText: string;
};

type HelpSearchProps = {
  articles: SearchArticle[];
};

function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export default function HelpSearch({ articles }: HelpSearchProps) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const normalizedQuery = normalizeSearch(query);

    if (normalizedQuery.length < 2) {
      return [];
    }

    return articles
      .filter((article) =>
        normalizeSearch(article.searchText).includes(normalizedQuery),
      )
      .slice(0, 8);
  }, [articles, query]);

  const shouldShowResults = query.trim().length >= 2;

  return (
    <div className="help-search-wrapper">
      <div className="help-search-box">
        <span className="help-search-icon" aria-hidden="true">
          ⌕
        </span>

        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Busque por comissão, Asaas, relatório, reembolso..."
          aria-label="Pesquisar na Central de Ajuda"
        />

        {query && (
          <button
            type="button"
            className="help-search-clear"
            onClick={() => setQuery("")}
            aria-label="Limpar pesquisa"
          >
            ×
          </button>
        )}
      </div>

      {shouldShowResults && (
        <div className="help-search-results">
          {results.length > 0 ? (
            results.map((article) => (
              <Link
                key={article.slug}
                href={`/ajuda/${article.slug}`}
                className="help-search-result"
                onClick={() => setQuery("")}
              >
                <span>{article.category}</span>
                <strong>{article.title}</strong>
                <p>{article.description}</p>
              </Link>
            ))
          ) : (
            <div className="help-search-empty">
              <strong>Nenhum artigo encontrado</strong>
              <p>
                Tente pesquisar usando outras palavras ou entre em contato com
                o suporte.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}