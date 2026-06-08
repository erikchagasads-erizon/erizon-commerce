import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ModuleIcon } from "@/components/ui/module-icon";
import type { ModuleDefinition } from "@/lib/modules";

export function ModulePage({ module }: { module: ModuleDefinition }) {
  return (
    <div className="space-y-6">
      <section className="border border-white/7 bg-[#100e0a] rounded-2xl p-6 sm:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
          <div>
            <Badge>{module.label}</Badge>
            <div className="mt-5 flex items-start gap-4">
              <div className="rounded-xl border border-white/10 bg-white/4 p-3">
                <ModuleIcon className="h-7 w-7 text-orange-400" name={module.icon} />
              </div>
              <div className="space-y-4">
                <div>
                  <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">{module.title}</h1>
                  <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--text-soft)]">{module.subtitle}</p>
                </div>
                <p className="max-w-3xl text-sm leading-7 text-stone-400">{module.description}</p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {module.quickActions.map((action) => (
                <span
                  key={action}
                  className="rounded-full border border-white/10 bg-white/3 px-4 py-2 text-sm text-stone-300"
                >
                  {action}
                </span>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/3 p-5">
              <div className="flex items-center gap-2 text-sm text-orange-400">
                <Sparkles className="h-4 w-4" />
                Copiloto sugerido para este módulo
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {module.aiPrompts.map((prompt) => (
                  <div key={prompt} className="rounded-2xl border border-white/7 bg-white/3 p-4 text-sm leading-6">
                    {prompt}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {module.kpis.map((kpi) => (
              <Card key={kpi.label} className="h-full bg-white/3">
                <CardContent className="p-5">
                  <p className="text-xs uppercase tracking-[0.16em] text-stone-500">{kpi.label}</p>
                  <p className="mt-3 text-2xl font-semibold">{kpi.value}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-soft)]">{kpi.hint}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr,0.65fr]">
        <Card>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CardTitle>Painel operacional</CardTitle>
              <CardDescription>
                Esta visão já nasce com estrutura de filtros, tabela e estados vazios preparados para dados reais.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              {module.filters.map((filter) => (
                <span
                  key={filter}
                  className="rounded-full border border-white/7 bg-white/3 px-3 py-1 text-xs uppercase tracking-[0.18em] text-stone-400"
                >
                  {filter}
                </span>
              ))}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-white/7 bg-white/3">
              <div className="grid grid-cols-2 gap-px border-b border-white/6 bg-white/4 lg:grid-cols-7">
                {module.columns.map((column) => (
                  <div key={column} className="bg-white/3 px-4 py-3 text-xs uppercase tracking-[0.18em] text-stone-500">
                    {column}
                  </div>
                ))}
              </div>

              <div className="rounded-b-[24px] border-t border-dashed border-white/10 bg-white/3 p-8">
                <h3 className="text-lg font-medium">{module.emptyStateTitle}</h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-soft)]">
                  {module.emptyStateDescription}
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link className={buttonStyles({})} href="/integrations">
                    Conectar canais
                  </Link>
                  <Link className={buttonStyles({ variant: "secondary" })} href="/executive-center">
                    Ver Erizon AI
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Integrações previstas</CardTitle>
              <CardDescription>
                O produto já está desenhado para encaixar integrações oficiais sem reescrever o core.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {module.integrations.map((integration) => (
                <div key={integration} className="rounded-2xl border border-white/7 bg-white/3 px-4 py-3 text-sm">
                  {integration}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cuidados importantes</CardTitle>
              <CardDescription>Princípios para operar com dados reais e decisões confiáveis.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {module.guardrails.map((item) => (
                <div key={item} className="rounded-2xl border border-white/7 bg-white/3 px-4 py-3 text-sm leading-6">
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
