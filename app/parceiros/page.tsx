import Link from "next/link";

const AFFILIATE_SIGNUP_URL =
  "https://api.canvaspiritual.com/afiliado/cadastro.html";

const DISTRIBUTOR_SIGNUP_URL =
  "https://api.canvaspiritual.com/vendedor/cadastro.html";

const LOGIN_URL =
  "https://api.canvaspiritual.com/afiliado/login.html";

/*
  Quando a VSL estiver pronta, substitua o valor abaixo
  pelo endereço real da apresentação do distribuidor.
*/
const DISTRIBUTOR_PRESENTATION_URL = "https://api.canvaspiritual.com/distribuicao/apresentacao.html";

export default function PartnersPage() {
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
              Já sou cadastrado
            </a>

            <Link href="/" className="button button-small">
              Voltar ao início
            </Link>
          </div>
        </div>
      </header>

      <section className="partners-hero">
        <div className="container partners-hero-content">
          <span className="eyebrow">Programa de parceiros</span>

          <h1>Escolha como você deseja participar</h1>

          <p>
            Você pode indicar o Check-up Emocional pela internet, construir uma
            rede de divulgação ou conhecer primeiro toda a apresentação do
            modelo de distribuição.
          </p>
        </div>
      </section>

      <section className="section partners-options-section">
        <div className="container">
          <div className="partner-options-grid">
            <article className="partner-option-card">
              <span className="option-number">01</span>

              <span className="product-tag">Afiliado</span>

              <h2>Divulgue através dos seus próprios canais</h2>

              <p>
                Ideal para quem deseja compartilhar o Check-up Emocional pelas
                redes sociais, WhatsApp, conteúdos ou indicações pessoais.
              </p>

              <ul className="partner-benefits">
                <li>Link pessoal de divulgação</li>
                <li>Acompanhamento das vendas</li>
                <li>Comissões pelas indicações</li>
                <li>Acesso ao painel do parceiro</li>
              </ul>

              <a
                href={AFFILIATE_SIGNUP_URL}
                className="button partner-option-button"
                target="_blank"
                rel="noreferrer"
              >
                Quero ser afiliado
              </a>
            </article>

            <article className="partner-option-card highlighted-option">
              <span className="option-number">02</span>

              <span className="product-tag">Distribuidor</span>

              <h2>Crie uma rede de pontos e parceiros</h2>

              <p>
                Para quem deseja apresentar o Check-up Emocional a
                estabelecimentos, profissionais, vendedores e locais com fluxo
                de pessoas.
              </p>

              <ul className="partner-benefits">
                <li>Cadastro de afiliados vinculados</li>
                <li>Links e materiais de divulgação</li>
                <li>Gestão de vendas e comissões</li>
                <li>Estrutura para distribuição local</li>
              </ul>

              <a
                href={DISTRIBUTOR_SIGNUP_URL}
                className="button button-light partner-option-button"
                target="_blank"
                rel="noreferrer"
              >
                Fazer cadastro direto
              </a>
            </article>

            <article className="partner-option-card presentation-option">
              <span className="option-number">03</span>

              <span className="product-tag">Apresentação completa</span>

              <h2>Conheça o modelo antes de se cadastrar</h2>

              <p>
                Veja como funciona o produto, a distribuição, as formas de
                remuneração e o processo para começar suas primeiras
                divulgações.
              </p>

              <ul className="partner-benefits">
                <li>Como funciona o Check-up Emocional</li>
                <li>Como apresentar para pessoas e empresas</li>
                <li>Explicação sobre comissões</li>
                <li>Orientação até o cadastro</li>
              </ul>

              {DISTRIBUTOR_PRESENTATION_URL ? (
                <a
                  href={DISTRIBUTOR_PRESENTATION_URL}
                  className="button partner-option-button"
                  target="_blank"
                  rel="noreferrer"
                >
                  Assistir à apresentação
                </a>
              ) : (
                <span className="button disabled-button partner-option-button">
                  Apresentação em breve
                </span>
              )}
            </article>
          </div>

          <div className="partner-login-box">
            <div>
              <span className="eyebrow">Já possui cadastro?</span>
              <h2>Acesse seu painel</h2>
              <p>
                Afiliados e distribuidores utilizam a mesma página de acesso.
              </p>
            </div>

            <a
              href={LOGIN_URL}
              className="button"
              target="_blank"
              rel="noreferrer"
            >
              Entrar no painel
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