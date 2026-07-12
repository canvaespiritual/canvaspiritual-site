import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  getAllHelpArticles,
  getHelpArticle,
  HELP_CATEGORIES,
} from "@/lib/help";

const WHATSAPP_URL =
  "https://wa.me/5562986530000?text=Ol%C3%A1%2C%20li%20a%20Central%20de%20Ajuda%2C%20mas%20ainda%20preciso%20de%20suporte.%20Meu%20nome%20e%20e-mail%20s%C3%A3o%3A%20";

type ArticlePageProps = {
  params: Promise<{
    slug: string[];
  }>;
};

export function generateStaticParams() {
  return getAllHelpArticles().map((article) => ({
    slug: article.slugParts,
  }));
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getHelpArticle(slug);

  if (!article) {
    return {
      title: "Artigo não encontrado | Canvas Espiritual",
    };
  }

  return {
    title: `${article.title} | Central de Ajuda`,
    description: article.description,
  };
}

export default async function HelpArticlePage({
  params,
}: ArticlePageProps) {
  const { slug } = await params;
  const article = getHelpArticle(slug);

  if (!article) {
    notFound();
  }

  const allArticles = getAllHelpArticles();

  const category = HELP_CATEGORIES.find(
    (item) => item.slug === article.categorySlug,
  );

  const categoryArticles = allArticles.filter(
    (item) => item.categorySlug === article.categorySlug,
  );

  return (
    <main className="help-article-page">
      <header className="site-header">
        <div className="container header-content">
          <Link href="/" className="brand">
            <span className="brand-symbol">◉</span>

            <span>
              <strong>Canvas Espiritual</strong>
              <small>Central de Ajuda</small>
            </span>
          </Link>

          <div className="header-actions">
            <Link href="/ajuda" className="login-link">
              Todos os artigos
            </Link>

            <Link href="/" className="button button-small">
              Voltar ao site
            </Link>
          </div>
        </div>
      </header>

      <div className="container help-documentation-layout">
        <aside className="help-sidebar">
          <Link href="/ajuda" className="help-sidebar-home">
            ← Central de Ajuda
          </Link>

          <div className="help-sidebar-category">
            <span>{category?.title ?? article.category}</span>

            <nav aria-label={`Artigos de ${article.category}`}>
              {categoryArticles.map((item) => (
                <Link
                  key={item.slug}
                  href={`/ajuda/${item.slug}`}
                  className={
                    item.slug === article.slug
                      ? "help-sidebar-active"
                      : undefined
                  }
                >
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        <article className="help-document">
          <nav className="help-breadcrumb" aria-label="Navegação estrutural">
            <Link href="/ajuda">Ajuda</Link>
            <span>/</span>
            <span>{article.category}</span>
          </nav>

          <header className="help-document-header">
            <span className="eyebrow">{article.category}</span>
            <h1>{article.title}</h1>
            <p>{article.description}</p>

            {article.updatedAt && (
              <small>Atualizado em {article.updatedAt}</small>
            )}
          </header>

          <div className="help-markdown">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ href, children }) => {
                  const isExternal =
                    typeof href === "string" &&
                    /^https?:\/\//.test(href);

                  return (
                    <a
                      href={href}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noreferrer" : undefined}
                    >
                      {children}
                    </a>
                  );
                },
              }}
            >
              {article.content}
            </ReactMarkdown>
          </div>

          <div className="help-article-support">
            <div>
              <strong>Sua dúvida não foi resolvida?</strong>
              <p>
                Fale com o suporte e informe seu nome e o e-mail usado no
                cadastro ou na compra.
              </p>
            </div>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="button"
            >
              Falar com o suporte
            </a>
          </div>
        </article>
      </div>
    </main>
  );
}