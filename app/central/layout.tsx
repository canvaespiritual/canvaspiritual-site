import type {
  Metadata,
} from "next";

import type {
  ReactNode,
} from "react";

export const metadata: Metadata = {
  title: {
    default: "Central Operacional",
    template: "%s | Central Canva",
  },

  description:
    "Central de acompanhamento de checkouts.",

  manifest: "/central.webmanifest",

  robots: {
    index: false,
    follow: false,
    nocache: true,
  },

  themeColor: "#0a0a0a",
};

export default function CentralLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      {children}
    </main>
  );
}