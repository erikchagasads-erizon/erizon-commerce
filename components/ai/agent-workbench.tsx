import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, BrainCircuit, Wrench } from "lucide-react";

import { ConversationExperience } from "@/components/ai/conversation-experience";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buildFallbackReply, getAgentDefinition } from "@/lib/ai";
import type { AppContext } from "@/lib/auth";
import type { WorkspaceSnapshot } from "@/lib/workspace-data";

export function AgentWorkbench({
  context,
  slug,
  snapshot,
}: {
  context: AppContext;
  slug: string;
  snapshot: WorkspaceSnapshot;
}) {
  const agent = getAgentDefinition(slug);

  if (!agent) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <section className="border border-white/7 bg-[#100e0a] rounded-2xl p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <Badge>{agent.badge}</Badge>
          <span className="rounded-full border border-white/10 bg-white/4 px-3 py-1 text-xs uppercase tracking-[0.18em] text-stone-400">
            Chat próprio
          </span>
          <span className="rounded-full border border-white/10 bg-white/4 px-3 py-1 text-xs uppercase tracking-[0.18em] text-stone-400">
            Memória compartilhada
          </span>
        </div>
        <h1 className="mt-5 text-3xl font-semibold sm:text-4xl">{agent.name}</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--text-soft)]">{agent.summary}</p>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-400">{agent.mission}</p>

        <div className="mt-8 flex flex-wrap gap-2">
          {agent.specialty.map((item) => (
            <span
              key={item}
              className="rounded-full border border-white/10 bg-white/3 px-4 py-2 text-xs uppercase tracking-[0.16em] text-stone-400"
            >
              {item}
            </span>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>Workspace de conversa</CardTitle>
            <CardDescription>Histórico, contexto, prompts rápidos e respostas estruturadas por especialidade.</CardDescription>
          </CardHeader>
          <CardContent>
            <ConversationExperience
              agentSlug={agent.slug}
              contextSnapshot={{
                financeCount: snapshot.counts.finance,
                insightCount: snapshot.counts.insights,
                memoryCount: snapshot.counts.memories,
                orderCount: snapshot.counts.orders,
                productCount: snapshot.counts.products,
                supplierCount: snapshot.counts.suppliers,
              }}
              initialReply={buildFallbackReply({
                agentSlug: agent.slug,
                contextSnapshot: {
                  financeCount: snapshot.counts.finance,
                  insightCount: snapshot.counts.insights,
                  memoryCount: snapshot.counts.memories,
                  orderCount: snapshot.counts.orders,
                  productCount: snapshot.counts.products,
                  supplierCount: snapshot.counts.suppliers,
                },
                message: agent.quickQuestions[0],
                routeContext: `/agents/${agent.slug}`,
                scope: "agent",
                workspaceName: context.workspace?.name,
              })}
              intro={`Este especialista foca em ${agent.specialty.join(", ")} e opera com a mesma memória empresarial do workspace.`}
              quickPrompts={agent.quickQuestions}
              routeContext={`/agents/${agent.slug}`}
              scope="agent"
              workspaceName={context.workspace?.name}
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-orange-400" />
                Ferramentas do agente
              </CardTitle>
              <CardDescription>Este agente foi pensado para agir sobre superfícies específicas do produto.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {agent.tools.map((tool) => (
                <div key={tool} className="rounded-2xl border border-white/7 bg-white/3 px-4 py-3 text-sm">
                  {tool}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-orange-400" />
                Missão operacional
              </CardTitle>
              <CardDescription>Como esse especialista deve pensar e agir dentro do sistema.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-[var(--text-soft)]">
              <div className="rounded-2xl border border-white/7 bg-white/3 px-4 py-3">{agent.systemFocus}</div>
              {agent.quickActions.map((action) => (
                <div key={action} className="rounded-2xl border border-white/7 bg-white/3 px-4 py-3">
                  {action}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Levar para outro módulo</CardTitle>
              <CardDescription>Conecte a análise do agente com os módulos onde a execução acontece.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Link className={buttonStyles({ variant: "secondary", size: "sm" })} href="/executive-center">
                Central executiva
              </Link>
              <Link className={buttonStyles({ variant: "secondary", size: "sm" })} href="/memory">
                Memória
              </Link>
              <Link className={buttonStyles({ variant: "ghost", size: "sm" })} href="/agents">
                Voltar para agentes
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

