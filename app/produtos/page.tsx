import Link from "next/link";

const CHECKUP_URL = "https://api.canvaspiritual.com/quiz-geral.html";
const PRISOES_URL =
  "https://api.canvaspiritual.com/landing-48-prisoes.html";
const EBOOK_URL =
  "https://api.canvaspiritual.com/ebookcanvaespiritual.html";
const CURSO_URL =
  "https://api.canvaspiritual.com/codigodaharmonia.html";
const LOGIN_URL =
  "https://api.canvaspiritual.com/afiliado/login.html";

const products = [
  {
    tag: "Avaliação",
    title: "Check-up Emocional",
    description:
      "Responda a perguntas simples e receba um relatório organizado sobre seu momento emocional, seus padrões e áreas que merecem atenção.",
    url: CHECKUP_URL,
    button: "Fazer meu check-up",
    featured: true,
  },
  {
    tag: "Jornada de consciência",
    title: "48 Prisões Emocionais",
    description:
      "Conheça padrões emocionais que podem limitar decisões, relações e escolhas, e comece a enxergá-los com mais clareza.",
    url: PRISOES_URL,
    button: "Conhecer as 48 prisões",
    featured: false,
  },
  {
    tag: "Ebook",
    title: "Canvas Espiritual",
    description:
      "Uma leitura para aprofundar o autoconhecimento e compreender melhor os movimentos internos que influenciam sua vida.",
    url: EBOOK_URL,
    button: "Conhecer o ebook",
    featured: false,
  },
  {
    tag: "Curso",
    title: "Código da Harmonia",
    description:
      "Um caminho estruturado para desenvolver mais consciência, equilíbrio e clareza na forma como você se relaciona com a vida.",
    url: CURSO_URL,
    button: "Conhecer o curso",
    featured: false,
  },
];

export default function ProductsPage() {
  return (
    <main>
      <header className="site-header">
        <div className="container header-content">
          <Link href="/" className="brand" aria-label="Canvas Espiritual">
            <span className="brand-symbol">◉</span>

            <span>
              <strong>Canvas Espiritual</strong>
              <small>Consciência, clareza e transformação</small>
            </span>
          </Link>

          <div className="header-actions">
            <a
              href={LOGIN_URL}
              className="login-link"
              target="_blank"
              rel="noreferrer"
            >
              Área do parceiro
            </a>

            <Link href="/" className="button button-small">
              Voltar ao início
            </Link>
          </div>
        </div>
      </header>

      <section className="products-page-hero">
        <div className="container products-page-hero-content">
          <span className="eyebrow">Experiências Canvas Espiritual</span>

          <h1>Escolha o próximo passo da sua jornada</h1>

          <p>
            Avaliações, leituras e cursos para diferentes momentos do seu
            processo de autoconhecimento.
          </p>
        </div>
      </section>

      <section className="section products-page-section">
        <div className="container">
          <div className="products-page-grid">
            {products.map((product) => (
              <article
                key={product.title}
                className={`product-page-card ${
                  product.featured ? "product-page-card-featured" : ""
                }`}
              >
                <span className="product-tag">{product.tag}</span>

                <h2>{product.title}</h2>

                <p>{product.description}</p>

                <a
                  href={product.url}
                  target="_blank"
                  rel="noreferrer"
                  className={`button product-page-button ${
                    product.featured ? "button-light" : ""
                  }`}
                >
                  {product.button}
                </a>
              </article>
            ))}
          </div>

          <div className="products-page-bottom">
            <div>
              <span className="eyebrow">Não sabe por onde começar?</span>
              <h2>Comece pelo Check-up Emocional</h2>
              <p>
                Ele ajuda você a observar seu momento atual e identificar quais
                áreas podem merecer mais atenção agora.
              </p>
            </div>

            <a
              href={CHECKUP_URL}
              target="_blank"
              rel="noreferrer"
              className="button"
            >
              Fazer Check-up Emocional
            </a>
          </div>
        </div>
      </section>

      <footer className="footer compact-footer">
        <div className="container footer-bottom partners-footer-bottom">
          <span>
            © {new Date().getFullYear()} Canvas Espiritual. Todos os direitos
            reservados.
          </span>

          <Link href="/">Voltar ao site principal</Link>
        </div>
      </footer>
    </main>
  );
}