import type {
  CheckoutSummary,
} from "@/lib/checkouts/queries";

interface DashboardCardsProps {
  summary: CheckoutSummary;
}

interface DashboardCardProps {
  label: string;
  value: number;
  description: string;
  variant?: "default" | "success" | "warning";
}

export default function DashboardCards({
  summary,
}: DashboardCardsProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <DashboardCard
        label="Total de checkouts"
        value={summary.total}
        description="Leads registrados"
      />

      <DashboardCard
        label="Pagos"
        value={summary.paid}
        description="Pagamentos identificados"
        variant="success"
      />

      <DashboardCard
        label="Pendentes"
        value={summary.pending}
        description="Ainda não convertidos"
        variant="warning"
      />

      <DashboardCard
        label="Recebidos hoje"
        value={summary.today}
        description="Horário de Brasília"
      />
    </section>
  );
}

function DashboardCard({
  label,
  value,
  description,
  variant = "default",
}: DashboardCardProps) {
  const valueClassName = {
    default: "text-white",
    success: "text-emerald-400",
    warning: "text-amber-400",
  }[variant];

  return (
    <article className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
        {label}
      </p>

      <strong
        className={`mt-3 block text-3xl font-bold tracking-tight ${valueClassName}`}
      >
        {value.toLocaleString("pt-BR")}
      </strong>

      <p className="mt-2 text-sm text-neutral-500">
        {description}
      </p>
    </article>
  );
}