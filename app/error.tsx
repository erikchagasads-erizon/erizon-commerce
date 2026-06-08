"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function GlobalSegmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-6">
      <div className="border border-white/7 bg-[#100e0a] max-w-xl rounded-2xl p-8 text-center">
        <p className="text-xs uppercase tracking-[0.16em] text-orange-400">Erro recuperável</p>
        <h1 className="mt-4 text-3xl font-semibold text-white">Algo saiu do fluxo esperado.</h1>
        <p className="mt-4 text-sm leading-7 text-[var(--text-soft)]">
          A interface interceptou a falha sem deixar a aplicação entrar em estado quebrado. Você pode tentar novamente agora.
        </p>
        <div className="mt-6 flex justify-center">
          <Button onClick={() => reset()}>Tentar novamente</Button>
        </div>
      </div>
    </div>
  );
}
