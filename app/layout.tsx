import "./globals.css"; // <-- ESSA É A LINHA MÁGICA
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ortopratika",
  description: "Catálogo Inteligente",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}