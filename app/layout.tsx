import type { Metadata } from "next";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Erizon — Commerce OS",
  description: "O sistema operacional de comércio para operar, crescer e decidir com inteligência.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
