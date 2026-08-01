import type {
  Metadata,
  Viewport,
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

  icons: {
    icon: [
      {
        url: "/icons/central-192.png",
        type: "image/png",
        sizes: "192x192",
      },
      {
        url: "/icons/central-512.png",
        type: "image/png",
        sizes: "512x512",
      },
    ],

    apple: [
      {
        url: "/icons/apple-touch-icon.png",
        type: "image/png",
        sizes: "180x180",
      },
    ],
  },

  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export const viewport: Viewport = {
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