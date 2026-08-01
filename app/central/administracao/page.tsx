import Link from "next/link";

import CentralHeader from "@/components/central/CentralHeader";
import MessageTemplatesSettings from "@/components/central/MessageTemplatesSettings";
import TrackingSettings from "@/components/central/TrackingSettings";

export const dynamic = "force-dynamic";

interface AdministrationPageProps {
  searchParams: Promise<{
    tab?: string;
  }>;
}

export default async function AdministrationPage({
  searchParams,
}: AdministrationPageProps) {
  const params = await searchParams;

  const activeTab =
    params.tab === "templates"
      ? "templates"
      : "tracking";

  return (
    <>
      <CentralHeader />

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
            Administração
          </p>

          <h2 className="mt-2 text-2xl font-bold text-white">
            Configurações da Central
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-400">
            Gerencie identificações de tracking e
            mensagens utilizadas no atendimento.
          </p>
        </div>

        <nav className="mb-6 flex flex-wrap gap-2">
          <TabLink
            href="/central/administracao?tab=tracking"
            active={activeTab === "tracking"}
          >
            Tracking
          </TabLink>

          <TabLink
            href="/central/administracao?tab=templates"
            active={activeTab === "templates"}
          >
            Templates
          </TabLink>
        </nav>

        {activeTab === "templates" ? (
          <MessageTemplatesSettings />
        ) : (
          <TrackingSettings />
        )}
      </section>
    </>
  );
}

interface TabLinkProps {
  href: string;
  active: boolean;
  children: React.ReactNode;
}

function TabLink({
  href,
  active,
  children,
}: TabLinkProps) {
  return (
    <Link
      href={href}
      className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
        active
          ? "border-emerald-700 bg-emerald-950 text-emerald-300"
          : "border-neutral-700 bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-white"
      }`}
    >
      {children}
    </Link>
  );
}