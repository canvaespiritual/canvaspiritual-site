import Link from "next/link";

const CHECKUP_URL = "https://api.canvaspiritual.com/quiz-geral.html";
const PARTNERS_URL = "/parceiros";
const LOGIN_URL = "https://api.canvaspiritual.com/afiliado/login.html";
const WHATSAPP_URL =
  "https://wa.me/5562986530000?text=Ol%C3%A1%2C%20preciso%20de%20ajuda%20com%20o%20Canvas%20Espiritual.";

export default function Home() {
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
  <a href="#como-funciona">Como funciona</a>
  <a href="#produtos">Produtos</a>
  <Link href={PARTNERS_URL}>Seja um parceiro</Link>
  <a href="#ajuda">Ajuda</a>
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

      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-content">
            <span className="eyebrow">Autoconhecimento que começa agora</span>

            <h1>
              Um encontro mais claro e verdadeiro com suas emoções.
            </h1>

            <p className="hero-description">
              Responda ao Check-up Emocional e receba uma leitura organizada
              sobre os padrões, sentimentos e áreas da vida que merecem sua
              atenção neste momento.
            </p>

            <div className="hero-actions">
              <a
                href={CHECKUP_URL}
                className="button"
                target="_blank"
                rel="noreferrer"
              >
                Fazer Check-up Emocional
              </a>

              <a href="#como-funciona" className="button button-secondary">
                Entender como funciona
              </a>
            </div>

            <p className="hero-note">
              Uma experiência simples, acolhedora e feita no seu próprio ritmo.
            </p>
          </div>

          <div className="report-preview" aria-label="Prévia do relatório">
            <div className="preview-top">
              <span>Seu mapa emocional</span>
              <span className="preview-status">Relatório pessoal</span>
            </div>

            <div className="preview-content">
              <div className="preview-circle">
                <span>Clareza</span>
                <strong>começa dentro</strong>
              </div>

              <div className="preview-lines">
                <div>
                  <span>Consciência emocional</span>
                  <strong>Em observação</strong>
                </div>

                <div>
                  <span>Relações e vínculos</span>
                  <strong>Área importante</strong>
                </div>

                <div>
                  <span>Vida interior</span>
                  <strong>Potencial de evolução</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="trust-strip">
        <div className="container trust-grid">
          <div>
            <strong>Rápido</strong>
            <span>Perguntas simples e objetivas</span>
          </div>

          <div>
            <strong>Pessoal</strong>
            <span>Uma leitura construída a partir das suas respostas</span>
          </div>

          <div>
            <strong>Reservado</strong>
            <span>Uma experiência individual de reflexão</span>
          </div>
        </div>
      </section>

      <section id="como-funciona" className="section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Como funciona</span>
            <h2>Três passos para olhar para dentro com mais clareza</h2>
            <p>
              O processo foi criado para transformar respostas simples em um
              ponto de partida organizado para o seu autoconhecimento.
            </p>
          </div>

          <div className="steps-grid">
            <article className="step-card">
              <span className="step-number">01</span>
              <h3>Responda às perguntas</h3>
              <p>
                Reflita sobre emoções, relações, pensamentos e experiências do
                seu momento atual.
              </p>
            </article>

            <article className="step-card">
              <span className="step-number">02</span>
              <h3>Receba seu relatório</h3>
              <p>
                Suas respostas são organizadas em uma leitura clara, pessoal e
                fácil de compreender.
              </p>
            </article>

            <article className="step-card">
              <span className="step-number">03</span>
              <h3>Escolha o próximo passo</h3>
              <p>
                Use os resultados para refletir e conhecer conteúdos que podem
                aprofundar sua jornada.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container feature-grid">
          <div>
            <span className="eyebrow">Mais do que um resultado</span>
            <h2>Um retrato do seu momento emocional</h2>
          </div>

          <div className="feature-copy">
            <p>
              Às vezes sentimos muita coisa ao mesmo tempo, mas não conseguimos
              organizar o que está acontecendo por dentro.
            </p>

            <p>
              O Check-up Emocional ajuda você a observar esse momento com uma
              nova perspectiva e perceber quais aspectos merecem mais
              consciência.
            </p>

            <a
              href={CHECKUP_URL}
              className="text-link"
              target="_blank"
              rel="noreferrer"
            >
              Começar meu check-up →
            </a>
          </div>
        </div>
      </section>

      <section id="produtos" className="section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Continue sua jornada</span>
            <h2>Experiências para aprofundar o autoconhecimento</h2>
            <p>
              O Canvas Espiritual reúne avaliações, conteúdos e jornadas para
              diferentes momentos da sua vida.
            </p>
          </div>

          <div className="products-grid">
            <article className="product-card featured-product">
              <span className="product-tag">Experiência principal</span>
              <h3>Check-up Emocional</h3>
              <p>
                Um panorama organizado sobre suas emoções, seus padrões e as
                áreas que pedem atenção.
              </p>
              <a
                href={CHECKUP_URL}
                target="_blank"
                rel="noreferrer"
                className="text-link"
              >
                Fazer agora →
              </a>
            </article>

            <article className="product-card">
              <span className="product-tag">Em breve</span>
              <h3>Mapa da Alma</h3>
              <p>
                Uma jornada de reflexão para aprofundar sua visão sobre si
                mesmo, seus valores e sua direção interior.
              </p>
              <span className="disabled-link">Conhecer em breve</span>
            </article>

            <article className="product-card">
              <span className="product-tag">Curso</span>
              <h3>Engenharia da Consciência</h3>
              <p>
                Conteúdos estruturados para compreender padrões internos e
                desenvolver uma relação mais consciente com a vida.
              </p>
              <Link href="/cursos" className="text-link">
                Ver cursos →
              </Link>
            </article>
          </div>
        </div>
      </section>

      <section id="parceiros" className="partner-section">
        <div className="container partner-grid">
          <div>
            <span className="eyebrow eyebrow-light">
              Programa de parceiros
            </span>

            <h2>Leve autoconhecimento para mais pessoas</h2>

            <p>
              Apresente o Check-up Emocional para pessoas, estabelecimentos e
              comunidades e receba comissões pelas experiências realizadas por
              meio dos seus links.
            </p>
          </div>

          <div className="partner-action">
            <Link href={PARTNERS_URL} className="button button-light">
  Conhecer as formas de parceria
</Link>

            <span>Cadastro, treinamento e materiais em um só lugar.</span>
          </div>
        </div>
      </section>

      <section id="ajuda" className="section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Estamos aqui para ajudar</span>
            <h2>Encontre rapidamente o que você precisa</h2>
          </div>

          <div className="help-grid">
            <Link href="/segunda-via" className="help-card">
              <span className="help-icon">↻</span>
              <div>
                <h3>Segunda via do relatório</h3>
                <p>Recupere o acesso a um relatório já adquirido.</p>
              </div>
            </Link>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="help-card"
            >
              <span className="help-icon">◌</span>
              <div>
                <h3>Atendimento pelo WhatsApp</h3>
                <p>Converse com nossa equipe de suporte.</p>
              </div>
            </a>

            <Link href="/ajuda" className="help-card">
              <span className="help-icon">?</span>
              <div>
                <h3>Central de ajuda</h3>
                <p>Veja respostas e orientações passo a passo.</p>
              </div>
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
            <Link href="/cursos">Cursos e produtos</Link>
            <Link href={PARTNERS_URL}>Seja um parceiro</Link>
          </div>

          <div>
            <h3>Suporte</h3>
            <Link href="/ajuda">Central de ajuda</Link>
            <Link href="/segunda-via">Segunda via</Link>
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">
              WhatsApp
            </a>
            <a href={LOGIN_URL} target="_blank" rel="noreferrer">
  Área do parceiro
</a>
          </div>

          <div>
            <h3>Institucional</h3>
            <Link href="/sobre">Sobre nós</Link>
            <Link href="/privacidade">Privacidade</Link>
            <Link href="/termos">Termos de uso</Link>
            <Link href="/reembolso" className="refund-link">
              Solicitar reembolso
            </Link>
          </div>
        </div>

        <div className="container footer-bottom">
          <span>
            © {new Date().getFullYear()} Canvas Espiritual. Todos os direitos
            reservados.
          </span>

          <span>Autoconhecimento não substitui acompanhamento profissional.</span>
        </div>
      </footer>
    </main>
  );
}