import Link from "next/link";

import PwaManager from "@/components/central/PwaManager";

export default function CentralHeader() {
  return (
    <header className="border-b border-neutral-800 bg-neutral-900">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-neutral-400">
              Canva Espiritual
            </p>

            <h1 className="mt-1 text-2xl font-bold text-white">
              Central Operacional
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <PwaManager />

            <div className="rounded-full border border-emerald-700 bg-emerald-950 px-4 py-2 text-sm text-emerald-300">
              ● Online
            </div>
          </div>
        </div>

        <nav className="mt-5 flex flex-wrap gap-2">
          <Link
            href="/central/checkouts"
            className="rounded-lg border border-neutral-700 px-4 py-2 text-sm font-semibold text-neutral-300 transition hover:bg-neutral-800 hover:text-white"
          >
            Checkouts
          </Link>

          <Link
            href="/central/administracao"
            className="rounded-lg border border-neutral-700 px-4 py-2 text-sm font-semibold text-neutral-300 transition hover:bg-neutral-800 hover:text-white"
          >
            Administração
          </Link>
        </nav>
      </div>
    </header>
  );
}