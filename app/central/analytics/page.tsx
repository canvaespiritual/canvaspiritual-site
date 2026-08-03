import CentralHeader from "@/components/central/CentralHeader";
import { AnalyticsDashboard } from "@/components/central/analytics/AnalyticsDashboard";

export const dynamic = "force-dynamic";

export default function AnalyticsPage() {
  return (
    <>
      <CentralHeader />

      <section className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Analytics da VSL
          </h1>

          <p className="mt-1 text-sm text-neutral-500">
            Compare retenção, campanhas, anúncios,
            chegada ao pitch e abertura do checkout.
          </p>
        </div>

        <AnalyticsDashboard />
      </section>
    </>
  );
}