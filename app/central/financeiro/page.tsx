import CentralHeader from "@/components/central/CentralHeader";
import FinanceiroDashboard from "@/components/central/financeiro/FinanceiroDashboard";

export const dynamic = "force-dynamic";

export default function FinanceiroPage() {
  return (
    <>
      <CentralHeader />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <FinanceiroDashboard />
      </main>
    </>
  );
}