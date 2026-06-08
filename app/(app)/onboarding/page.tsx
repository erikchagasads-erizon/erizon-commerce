import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getWorkspaceSnapshot } from "@/lib/workspace-data";
import { requireAppContext } from "@/lib/auth";

export default async function OnboardingPage() {
  const context = await requireAppContext();
  const snapshot = await getWorkspaceSnapshot(context.workspace?.workspaceId ?? null);

  const steps = [
    {
      done: !!context.workspace,
      href: "/settings",
      label: "Criar empresa e validar workspace",
    },
    {
      done: snapshot.counts.products > 0,
      href: "/products",
      label: "Cadastrar produtos",
    },
    {
      done: false,
      href: "/marketplaces",
      label: "Conectar canal de venda",
    },
    {
      done: snapshot.counts.orders > 0 || snapshot.counts.products > 0,
      href: "/stock",
      label: "Configurar estoque",
    },
    {
      done: snapshot.counts.finance > 0,
      href: "/finance",
      label: "Configurar financeiro",
    },
    {
      done: snapshot.counts.insights > 0 || snapshot.counts.memories > 0,
      href: "/executive-center",
      label: "Ativar IA",
    },
    {
      done: snapshot.counts.insights > 0,
      href: "/executive-center",
      label: "Ver primeira análise",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="border border-white/7 bg-[#100e0a] rounded-2xl p-6 sm:p-8">
        <Badge>Guided Onboarding</Badge>
        <h1 className="mt-5 text-3xl font-semibold sm:text-4xl">Primeiros passos guiados para sair do setup e entrar em operação.</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--text-soft)]">
          O onboarding usa sinais reais do workspace. Nada é marcado como concluído sem que o dado correspondente exista
          no ambiente.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Checklist inicial</CardTitle>
          <CardDescription>Sequência recomendada para ativar a plataforma sem retrabalho.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {steps.map((step, index) => (
            <div key={step.label} className="flex flex-col gap-3 rounded-xl border border-white/7 bg-white/3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/4 text-sm font-medium text-white">
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-medium text-white">{step.label}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-stone-500">
                    {step.done ? "Concluído" : "Pendente"}
                  </p>
                </div>
              </div>
              <Link className={buttonStyles({ variant: step.done ? "secondary" : "primary", size: "sm" })} href={step.href}>
                {step.done ? "Revisar" : "Abrir passo"}
              </Link>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

