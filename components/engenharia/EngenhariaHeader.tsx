import Link from "next/link";

export default function EngenhariaHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#ddd8cf]/70 bg-[#fbfaf7]/95 backdrop-blur-xl">
      <div className="mx-auto flex min-h-[68px] max-w-[1160px] items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-3"
          aria-label="Canvas Espiritual"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#332b24] text-sm text-white">
            ◉
          </span>

          <div className="leading-tight">
            <strong className="block text-sm text-[#24211d]">
              Canvas Espiritual
            </strong>

            <span className="hidden text-[10px] text-[#6f6961] sm:block">
              Consciência, clareza e transformação
            </span>
          </div>
        </Link>

        <a
          href="#oferta"
          className="rounded-full border border-[#332b24] px-4 py-2 text-xs font-bold text-[#332b24] transition hover:bg-[#332b24] hover:text-white"
        >
          Conhecer o curso
        </a>
      </div>
    </header>
  );
}