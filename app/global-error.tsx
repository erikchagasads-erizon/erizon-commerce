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
        <div className="border border-white/7 bg-[#100e0a] max-w-xl rounded-2xl p-8 text-center">
          <p className="text-xs uppercase tracking-[0.16em] text-orange-400">Erro crítico</p>
          <h1 className="mt-4 text-3xl font-semibold text-white">A aplicação encontrou uma falha global.</h1>
          <p className="mt-4 text-sm leading-7 text-[var(--text-soft)]">
            Recarregue a página. Se o problema persistir, revise logs, health check e ambiente do Supabase.
          </p>
        </div>
      </body>
    </html>
  );
}
