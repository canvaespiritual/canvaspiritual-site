import { getEngenhariaDepoimento } from "@/lib/engenharia/depoimentos";

interface EngenhariaProvaSocialProps {
  id: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  variant?: "compact" | "regular" | "story";
  background?: "white" | "cream";
}

export default function EngenhariaProvaSocial({
  id,
  eyebrow = "Relato real",
  title,
  description,
  variant = "regular",
  background = "white",
}: EngenhariaProvaSocialProps) {
  const depoimento = getEngenhariaDepoimento(id);

  if (!depoimento) {
    return null;
  }

  const widthClass =
    variant === "compact"
      ? "max-w-[660px]"
      : variant === "story"
        ? "max-w-[590px]"
        : "max-w-[760px]";

  return (
    <section
      className={
        background === "cream"
          ? "bg-[#fbfaf7] py-10 sm:py-14"
          : "bg-white py-10 sm:py-14"
      }
    >
      <div className="mx-auto max-w-[1000px] px-4 sm:px-6">
        {(title || description) && (
          <div className="mx-auto mb-7 max-w-[680px] text-center">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#7b6857]">
              {eyebrow}
            </span>

            {title && (
              <h2 className="mt-2 text-[24px] font-bold leading-[1.15] tracking-[-0.03em] text-[#24211d] sm:text-[31px]">
                {title}
              </h2>
            )}

            {description && (
              <p className="mx-auto mb-0 mt-3 max-w-[600px] text-sm leading-6 text-[#746d65]">
                {description}
              </p>
            )}
          </div>
        )}

        {!title && !description && (
          <div className="mb-4 text-center">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#8a7968]">
              {eyebrow}
            </span>
          </div>
        )}

        <figure
          className={`mx-auto ${widthClass}`}
        >
          <div className="overflow-hidden rounded-[20px] border border-[#ded8cf] bg-white p-1.5 shadow-[0_16px_50px_rgba(47,38,29,.08)] sm:p-2">
            {/* Mantemos o print original sem recortar ou reconstruir */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={depoimento.src}
              alt={depoimento.alt}
              loading="lazy"
              className="block h-auto w-full rounded-[15px]"
            />
          </div>

          {variant === "story" && (
            <figcaption className="mx-auto mt-4 max-w-[520px] text-center text-xs leading-5 text-[#8b837b]">
              Print original de um relato espontâneo de aluna.
            </figcaption>
          )}
        </figure>
      </div>
    </section>
  );
}