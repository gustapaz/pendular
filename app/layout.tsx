import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "PENDULAR — O caos deixa um traço.",
  description:
    "Um observatório de movimento e sensibilidade às condições iniciais.",
  metadataBase: new URL("https://pendular-gustapaz.starrylinen.chatgpt.site"),
  alternates: { canonical: "/" },
  openGraph: {
    title: "PENDULAR",
    description:
      "Um observatório de movimento e sensibilidade às condições iniciais.",
    type: "website",
    locale: "pt_BR",
  },
  icons: { icon: "/favicon.svg" },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
