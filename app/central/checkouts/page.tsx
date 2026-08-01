import CentralHeader from "@/components/central/CentralHeader";
import CheckoutTable from "@/components/central/CheckoutTable";
import DashboardCards from "@/components/central/DashboardCards";
import CheckoutListClient
from "@/components/central/CheckoutListClient";
import CheckoutEventWatcher from "@/components/central/CheckoutEventWatcher";

import { listCheckoutLeads } from "@/lib/checkouts/queries";

export const dynamic = "force-dynamic";

export default async function CheckoutsPage() {
  const result = await listCheckoutLeads({
    limit: 100,
  });

  return (
    <>
      <CentralHeader />
      <CheckoutEventWatcher />

      <section className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <DashboardCards
          summary={result.summary}
        />

        <div>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-white">
              Checkouts recentes
            </h2>

            <p className="mt-1 text-sm text-neutral-500">
              Exibindo os últimos{" "}
              {result.checkouts.length.toLocaleString(
                "pt-BR",
              )}{" "}
              registros.
            </p>
          </div>

          <CheckoutListClient
    checkouts={result.checkouts}
/>
        </div>
      </section>
    </>
  );
}