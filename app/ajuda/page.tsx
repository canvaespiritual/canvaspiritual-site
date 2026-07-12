import Link from "next/link";
import HelpSearch from "@/components/help/HelpSearch";
import {
  getAllHelpArticles,
  HELP_CATEGORIES,
} from "@/lib/help";

const WHATSAPP_URL =
  "https://wa.me/5562986530000?text=Ol%C3%A1%2C%20preciso%20de%20ajuda%20com%20o%20Canvas%20Espiritual.";

const LOGIN_URL =
  "https://api.canvaspiritual.com/afiliado/login.html";

export const metadata = {
  title: "Central de Ajuda | Canvas Espiritual",
  description:
    "Encontre orientações sobre relatórios, cadastros, comissões, Asaas, reembolsos e suporte.",
};

export default function HelpPage() {
  const articles = getAllHelpArticles();

  const searchArticles = articles.map((article) => ({
    slug: article.slug,
    title: article.title,
    description: article.description,
    category: article.category,
    searchText: article.searchText,
  }));

  const featuredArticles = articles.filter((article) => article.featured);

  return (
    <main>
      <header className="site-header">
        <div className="container header-content">
          <Link href="/" className="brand" aria-label="Canvas Espiritual">
            <span className="brand-symbol">◉</span>

            <span>
              <strong>Canvas Espiritual</strong>
              <small>Central de Ajuda</small>
            </span>
          </Link>

          <div className="header-actions">
            <a
              href={LOGIN_URL}
              target="_blank"
              rel="noreferrer"
              className="login-link"
            >
              Entrar no painel
            </a>

            <Link href="/" className="button button-small">
              Voltar ao site
            </Link>
          </div>
        </div>
      </header>

      <section className="help-hero">
        <div className="container help-hero-content">
          <span className="eyebrow">Central de Ajuda</span>

          <h1>Como podemos ajudar?</h1>

          <p>
            Encontre orientações sobre o Check-up Emocional, relatórios,
            cadastros, comissões, conta Asaas e reembolsos.
          </p>

          <HelpSearch articles={searchArticles} />
        </div>
      </section>

      {featuredArticles.length > 0 && (
        <section className="help-featured-section">
          <div className="container">
            <div className="help-section-heading">
              <div>
                <span className="eyebrow">Mais procurados</span>
                <h2>Respostas rápidas</h2>
              </div>
            </div>

            <div className="help-featured-grid">
              {featuredArticles.map((article) => (
                <Link
                  key={article.slug}
                  href={`/ajuda/${article.slug}`}
                  className="help-featured-card"
                >
                  <span>{article.category}</span>
                  <h3>{article.title}</h3>
                  <p>{article.description}</p>
                  <strong>Ler orientação →</strong>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section help-categories-section">
        <div className="container">
          <div className="help-section-heading">
            <div>
              <span className="eyebrow">Navegue por assunto</span>
              <h2>Encontre a categoria certa</h2>
            </div>
          </div>

          <div className="help-categories-grid">
            {HELP_CATEGORIES.map((category) => {
              const categoryArticles = articles.filter(
                (article) => article.categorySlug === category.slug,
              );

              if (categoryArticles.length === 0) {
                return null;
              }

              return (
                <section
                  key={category.slug}
                  className="help-category-card"
                >
                  <div className="help-category-header">
                    <span className="help-category-icon">
                      {category.icon}
                    </span>

                    <div>
                      <h3>{category.title}</h3>
                      <p>{category.description}</p>
                    </div>
                  </div>

                  <div className="help-category-links">
                    {categoryArticles.slice(0, 5).map((article) => (
                      <Link
                        key={article.slug}
                        href={`/ajuda/${article.slug}`}
                      >
                        <span>{article.title}</span>
                        <strong>→</strong>
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </section>

      <section className="help-contact-section">
        <div className="container help-contact-grid">
          <div>
            <span className="eyebrow eyebrow-light">
              Ainda precisa de ajuda?
            </span>

            <h2>Fale com nosso suporte</h2>

            <p>
              Consulte primeiro os artigos acima. Caso sua dúvida continue,
              envie uma mensagem com seu nome e o e-mail usado no cadastro ou
              na compra.
            </p>
          </div>

          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="button button-light"
          >
            Abrir atendimento no WhatsApp
          </a>
        </div>
      </section>

      <footer className="footer compact-footer">
        <div className="container footer-bottom partners-footer-bottom">
          <span>
            © {new Date().getFullYear()} Canvas Espiritual.
          </span>

          <Link href="/">Voltar ao site principal</Link>
        </div>
      </footer>
    </main>
  );
}