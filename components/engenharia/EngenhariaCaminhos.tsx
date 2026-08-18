const caminhos = [
  {
    numero: "01",
    titulo: "Medicação e “analgésicos” emocionais",
    vantagem: "Alívio rápido. Parece funcionar na hora.",
    limite:
      "Não trata a causa. Quando o efeito passa, o ciclo recomeça.",
    custo:
      "Custo médio estimado: cerca de R$ 70–150 por ano em medicação.",
    fechamento:
      "Seu corpo paga o preço; sua alma continua sem ser ouvida.",
  },
  {
    numero: "02",
    titulo: "Terapias, clínicas e especialistas",
    vantagem:
      "Apoio para casos específicos, traumas e crises.",
    limite:
      "Exige tempo, dinheiro e constância. Não é um treino diário de autogoverno.",
    custo:
      "Custo médio: de R$ 50 a R$ 200 por sessão.",
    fechamento:
      "Muita gente não consegue sustentar o tratamento por tempo suficiente.",
  },
  {
    numero: "03",
    titulo: "Religião e espiritualidade tradicionais",
    vantagem:
      "Oferece fé, consolo e direção espiritual.",
    limite:
      "Nem sempre entrega um método simples para lidar com as emoções no dia a dia.",
    custo: null,
    fechamento:
      "Você se sente bem no culto… mas cai de novo na segunda-feira.",
  },
  {
    numero: "04",
    titulo: "Alfabetização Emocional Simples e Estruturada",
    vantagem:
      "Treina você a ler suas emoções, reconhecer quedas, romper gatilhos e regular o próprio estado.",
    limite:
      "Um método leve, diário e cumulativo: 3–8 minutos por bloco, com exercícios práticos e mapas claros.",
    custo:
      "Uma estrutura criada para transformar autoconhecimento em prática diária.",
    fechamento:
      "Aqui você não terceiriza a cura: aprende a cuidar da própria alma.",
    destaque: true,
  },
];

export default function EngenhariaCaminhos() {
  return (
    <section className="bg-[#f1eee8] py-16 sm:py-20">
      <div className="mx-auto max-w-[1080px] px-4 sm:px-6">
        <div className="mx-auto max-w-[780px] text-center">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#6d5a48]">
            Caminhos possíveis
          </span>

          <h2 className="mt-3 text-[29px] font-bold leading-tight tracking-[-0.035em] text-[#24211d] sm:text-[40px]">
            Os 4 caminhos para cuidar da sua saúde mental e espiritual — lado a
            lado.
          </h2>

          <p className="mt-4 text-[15px] leading-7 text-[#6f6961]">
            Todo mundo acaba escolhendo um desses caminhos. Mas só um trata a
            raiz das emoções — não apenas o sintoma.
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-4">
          {caminhos.map((caminho) => (
            <article
              key={caminho.numero}
              className={`rounded-[22px] border p-6 ${
                caminho.destaque
                  ? "border-[#6d5a48] bg-[#332b24] text-white"
                  : "border-[#ddd8cf] bg-white text-[#24211d]"
              }`}
            >
              <span
                className={`text-[10px] font-extrabold uppercase tracking-[0.16em] ${
                  caminho.destaque
                    ? "text-[#d7c2a8]"
                    : "text-[#9a8b7c]"
                }`}
              >
                Opção {caminho.numero}
              </span>

              <h3 className="mt-5 text-lg font-bold leading-6">
                {caminho.titulo}
              </h3>

              <div className="mt-6 space-y-5 text-sm leading-6">
                <div>
                  <strong className="block text-[10px] uppercase tracking-wider opacity-60">
                    Vantagem
                  </strong>
                  <p className="mb-0 mt-1 opacity-80">
                    {caminho.vantagem}
                  </p>
                </div>

                <div>
                  <strong className="block text-[10px] uppercase tracking-wider opacity-60">
                    {caminho.destaque ? "Como funciona" : "Problema / limite"}
                  </strong>
                  <p className="mb-0 mt-1 opacity-80">
                    {caminho.limite}
                  </p>
                </div>

                {caminho.custo && (
                  <p className="mb-0 border-t border-current/10 pt-4 text-xs font-semibold opacity-75">
                    {caminho.custo}
                  </p>
                )}

                <p className="mb-0 text-xs italic opacity-70">
                  {caminho.fechamento}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}