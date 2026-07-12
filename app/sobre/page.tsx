import Link from "next/link";

const CHECKUP_URL = "https://api.canvaspiritual.com/quiz-geral.html";
const PARTNERS_URL = "/parceiros";
const PRODUCTS_URL = "/produtos";
const LOGIN_URL = "https://api.canvaspiritual.com/afiliado/login.html";

export default function AboutPage() {
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

          <nav className="desktop-nav" aria-label="Navegação principal">
            <Link href="/">Início</Link>
            <Link href={PRODUCTS_URL}>Produtos</Link>
            <Link href={PARTNERS_URL}>Seja um parceiro</Link>
            <Link href="/ajuda">Ajuda</Link>
          </nav>

          <div className="header-actions">
            <a
              href={LOGIN_URL}
              className="login-link"
              target="_blank"
              rel="noreferrer"
            >
              Entrar
            </a>

            <a
              href={CHECKUP_URL}
              className="button button-small"
              target="_blank"
              rel="noreferrer"
            >
              Fazer meu check-up
            </a>
          </div>
        </div>
      </header>

      <section className="about-hero">
        <div className="container about-hero-content">
          <span className="eyebrow">Sobre o Canvas Espiritual</span>

          <h1>
            Tornar o autoconhecimento mais simples, acessível e presente na
            vida das pessoas.
          </h1>

          <p>
            Criamos experiências que ajudam pessoas a observar emoções,
            reconhecer padrões e compreender com mais clareza o momento que
            estão vivendo.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container about-intro-grid">
          <div>
            <span className="eyebrow">Por que existimos</span>

            <h2>Às vezes, o primeiro passo é apenas conseguir enxergar.</h2>
          </div>

          <div className="about-copy">
            <p>
              Muitas pessoas percebem que algo precisa mudar, mas não conseguem
              organizar o que sentem ou identificar quais áreas da vida pedem
              mais atenção.
            </p>

            <p>
              O Canvas Espiritual nasceu para criar pontos de partida.
              Experiências simples, organizadas e acessíveis que auxiliam cada
              pessoa a olhar para dentro com mais consciência.
            </p>

            <p>
              Não buscamos entregar respostas prontas sobre a vida de alguém.
              Buscamos oferecer perguntas, leituras e caminhos que favoreçam uma
              reflexão mais honesta e consciente.
            </p>
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Nossa forma de construir</span>

            <h2>Consciência transformada em experiências práticas</h2>

            <p>
              Cada produto é pensado para ajudar a pessoa a compreender melhor
              a própria experiência e escolher seus próximos passos.
            </p>
          </div>

          <div className="about-values-grid">
            <article className="about-value-card">
              <span className="step-number">01</span>
              <h3>Clareza</h3>
              <p>
                Tornamos reflexões complexas mais simples, organizadas e fáceis
                de compreender.
              </p>
            </article>

            <article className="about-value-card">
              <span className="step-number">02</span>
              <h3>Acessibilidade</h3>
              <p>
                Criamos experiências que podem chegar a pessoas de diferentes
                lugares, realidades e momentos de vida.
              </p>
            </article>

            <article className="about-value-card">
              <span className="step-number">03</span>
              <h3>Responsabilidade</h3>
              <p>
                Tratamos o autoconhecimento como um apoio à reflexão, sem
                substituir acompanhamento médico ou psicológico.
              </p>
            </article>

            <article className="about-value-card">
              <span className="step-number">04</span>
              <h3>Transformação</h3>
              <p>
                Acreditamos que perceber um padrão com clareza pode ser o início
                de uma nova escolha.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container about-ecosystem">
          <div>
            <span className="eyebrow">Um ecossistema em crescimento</span>

            <h2>Autoconhecimento que pode chegar a qualquer lugar</h2>

            <p>
              Além das experiências digitais, construímos uma rede de
              afiliados, distribuidores, profissionais e estabelecimentos que
              ajudam a apresentar essas ferramentas a novas pessoas.
            </p>

            <p>
              Dessa forma, o autoconhecimento deixa de depender apenas de
              anúncios ou redes sociais e passa a estar presente também em
              comunidades, empresas, estabelecimentos e relações cotidianas.
            </p>
          </div>

          <div className="about-ecosystem-card">
            <span>Canvas Espiritual</span>

            <div>
              <strong>Experiências</strong>
              <small>Check-ups, relatórios, livros e cursos</small>
            </div>

            <div>
              <strong>Pessoas</strong>
              <small>Reflexão, consciência e novos caminhos</small>
            </div>

            <div>
              <strong>Parceiros</strong>
              <small>Distribuição com propósito e remuneração</small>
            </div>
          </div>
        </div>
      </section>

      <section className="about-cta">
        <div className="container about-cta-grid">
          <div>
            <span className="eyebrow eyebrow-light">
              Comece pelo seu momento atual
            </span>

            <h2>Uma nova percepção pode começar com algumas perguntas.</h2>
          </div>

          <div className="about-cta-actions">
            <a
              href={CHECKUP_URL}
              target="_blank"
              rel="noreferrer"
              className="button button-light"
            >
              Fazer Check-up Emocional
            </a>

            <Link href={PRODUCTS_URL} className="about-light-link">
              Conhecer nossos produtos →
            </Link>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-grid">
          <div className="footer-brand">
            <strong>Canvas Espiritual</strong>

            <p>
              Experiências de autoconhecimento para uma vida mais consciente.
            </p>
          </div>

          <div>
            <h3>Experiências</h3>
            <a href={CHECKUP_URL} target="_blank" rel="noreferrer">
              Check-up Emocional
            </a>
            <Link href="/produtos">Cursos e produtos</Link>
            <Link href="/parceiros">Seja um parceiro</Link>
          </div>

          <div>
            <h3>Suporte</h3>
            <Link href="/ajuda">Central de ajuda</Link>

            <a
              href="https://api.canvaspiritual.com/segunda-via.html"
              target="_blank"
              rel="noreferrer"
            >
              Segunda via
            </a>

            <a
              href={LOGIN_URL}
              target="_blank"
              rel="noreferrer"
            >
              Área do parceiro
            </a>
          </div>

          <div>
            <h3>Institucional</h3>
            <Link href="/sobre">Sobre nós</Link>

            <a
              href="https://api.canvaspiritual.com/afiliado/privacidade.html"
              target="_blank"
              rel="noreferrer"
            >
              Política de privacidade
            </a>

            <a
              href="https://api.canvaspiritual.com/afiliado/termos.html"
              target="_blank"
              rel="noreferrer"
            >
              Termos de uso
            </a>
          </div>
        </div>

        <div className="container footer-bottom">
          <span>
            © {new Date().getFullYear()} Canvas Espiritual. Todos os direitos
            reservados.
          </span>

          <span>
            Autoconhecimento não substitui acompanhamento profissional.
          </span>
        </div>
      </footer>
    </main>
  );
}