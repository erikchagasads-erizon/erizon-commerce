"use client";

import { useEffect } from "react";

export default function RootGlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body className="flex min-h-screen items-center justify-center bg-[var(--background)] px-6">
        <div className="max-w-xl rounded-2xl border border-white/7 bg-[#100e0a] p-8 text-center">
          <p className="text-xs uppercase tracking-[0.16em] text-orange-400">Falha inesperada</p>
          <h1 className="mt-4 text-3xl font-semibold text-white">A Erizon encontrou um problema.</h1>
          <p className="mt-4 text-sm leading-7 text-[var(--text-soft)]">
            Recarregue a página. Se o problema persistir, fale com o responsável pela conta.
          </p>
        </div>
      </body>
    </html>
  );
}
