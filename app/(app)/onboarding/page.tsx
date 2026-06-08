import Link from "next/link";
import { CheckCircle2, Circle, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getIntegrationHealth } from "@/lib/admin-data";
import { requireAppContext } from "@/lib/auth";
import { getWorkspaceSnapshot } from "@/lib/workspace-data";

function hasProvider(providers: Set<string>, provider: string) {
  return providers.has(provider) || providers.has(provider.replaceAll("_", "-"));
}

export default async function OnboardingPage() {
  const context = await requireAppContext();
  const [snapshot, integrations] = await Promise.all([
    getWorkspaceSnapshot(context.workspace?.workspaceId ?? null),
    getIntegrationHealth(context.workspace?.workspaceId ?? null),
  ]);
  const providers = new Set(integrations.map((item) => item.provider.toLowerCase().replaceAll(" ", "_")));

  const steps = [
    {
      done: hasProvider(providers, "mercado_livre"),
      href: "/integrations",
      label: "Conectar Mercado Livre",
      text: "Importe pedidos, anúncios, produtos e estoque do canal que costuma concentrar mais vendas.",
    },
    {
      done: hasProvider(providers, "shopee"),
      href: "/integrations",
      label: "Conectar Shopee",
      text: "Traga pedidos e catálogo da Shopee para comparar desempenho entre canais.",
    },
    {
      done: hasProvider(providers, "site_proprio") || hasProvider(providers, "shopify"),
      href: "/integrations",
      label: "Conectar site",
      text: "Una sua loja online aos marketplaces para enxergar o canal direto com a mesma clareza.",
    },
    {
      done: snapshot.counts.products > 0,
      href: "/products",
      label: "Importar catálogo",
      text: "Centralize produtos, preços, custos e estoque para vender com mais controle.",
    },
    {
      done: snapshot.counts.insights > 0 || snapshot.counts.memories > 0,
      href: "/executive-center",
      label: "Ativar IA",
      text: "Use a Erizon AI para receber alertas de margem, falta de estoque e oportunidades de crescimento.",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/7 bg-[#100e0a] p-6 sm:p-8">
        <Badge>Primeiros passos</Badge>
        <h1 className="mt-5 text-3xl font-semibold sm:text-4xl">
          Ative a Erizon na ordem certa e comece a ver resultado.
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--text-soft)]">
          Em cinco passos, sua operação sai do zero e passa a enxergar vendas, produtos, estoque e inteligência em um só lugar.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Roteiro de ativação</CardTitle>
          <CardDescription>Conecte canais primeiro, importe catálogo depois e só então ative a inteligência.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {steps.map((step, index) => {
            const Icon = step.done ? CheckCircle2 : Circle;

            return (
              <div
                key={step.label}
                className="flex flex-col gap-4 rounded-xl border border-white/7 bg-white/3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-4">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/4 text-sm font-medium text-white">
                    {index + 1}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Icon className={step.done ? "h-4 w-4 text-emerald-400" : "h-4 w-4 text-stone-500"} />
                      <p className="text-sm font-medium text-white">{step.label}</p>
                    </div>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-soft)]">{step.text}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-stone-500">
                      {step.done ? "Concluído" : "Pendente"}
                    </p>
                  </div>
                </div>
                <Link className={buttonStyles({ variant: step.done ? "secondary" : "primary", size: "sm" })} href={step.href}>
                  {step.done ? "Revisar" : "Abrir passo"}
                </Link>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="border-orange-500/15 bg-orange-500/5">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-1 h-5 w-5 text-orange-400" />
            <div>
              <p className="font-medium text-white">A Erizon fica melhor a cada canal conectado.</p>
              <p className="mt-1 text-sm leading-6 text-[var(--text-soft)]">
                Quanto mais pedidos e produtos entram, mais precisos ficam os alertas de margem, estoque e crescimento.
              </p>
            </div>
          </div>
          <Link className={buttonStyles({})} href="/integrations">
            Ir para integrações
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
