import type { ProspectStatus } from "@/types/prospect";

interface StatusBadgeProps {
  status: ProspectStatus;
}

const statusConfig: Record<
  ProspectStatus,
  {
    label: string;
    className: string;
  }
> = {
  novo: {
    label: "Novo",
    className: "bg-zinc-100 text-zinc-700",
  },

  mensagem_enviada: {
    label: "Mensagem enviada",
    className: "bg-amber-100 text-amber-800",
  },

  respondeu: {
    label: "Respondeu",
    className: "bg-blue-100 text-blue-800",
  },

  cadastrado: {
    label: "Cadastrado",
    className: "bg-violet-100 text-violet-800",
  },

  ativado: {
    label: "Ativado",
    className: "bg-emerald-100 text-emerald-800",
  },

  ignorar: {
    label: "Ignorar",
    className: "bg-red-100 text-red-700",
  },
};

export default function StatusBadge({
  status,
}: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}