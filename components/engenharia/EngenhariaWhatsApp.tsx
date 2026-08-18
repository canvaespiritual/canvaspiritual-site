interface EngenhariaWhatsAppProps {
  phone?: string;
}

export default function EngenhariaWhatsApp({
  phone,
}: EngenhariaWhatsAppProps) {
  if (!phone) {
    return null;
  }

  const message =
    "Olá! Vim pela página da Engenharia da Consciência e gostaria de tirar uma dúvida sobre o curso.";

  const href = `https://wa.me/${phone}?text=${encodeURIComponent(
    message,
  )}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Falar pelo WhatsApp"
      className="group fixed bottom-5 right-4 z-50 flex items-center gap-3 rounded-full !bg-[#25D366] p-3 !text-white shadow-[0_12px_35px_rgba(0,0,0,.20)] transition hover:-translate-y-0.5 hover:!bg-[#20bd5a] hover:shadow-[0_16px_40px_rgba(0,0,0,.25)] sm:bottom-6 sm:right-6 sm:px-4"
    >
      <span className="grid h-6 w-6 place-items-center rounded-full bg-white/10">
        ↗
      </span>

      <span className="hidden sm:inline">
        Tirar uma dúvida
      </span>

      <span className="sm:hidden">
        WhatsApp
      </span>
    </a>
  );
}