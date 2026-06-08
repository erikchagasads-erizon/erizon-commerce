import Link from "next/link";
import { ArrowRight, Bot, BrainCircuit, ChartNoAxesCombined, ShieldCheck } from "lucide-react";

import { ConversationExperience } from "@/components/ai/conversation-experience";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AIReply } from "@/lib/ai";
import { executiveActionExamples, executiveCenterPrompts, orchestrationLayers } from "@/lib/ai";
import type { AppContext } from "@/lib/auth";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { WorkspaceSnapshot } from "@/lib/workspace-data";

export function ExecutiveCenterView({
  context,
  initialReply,
  snapshot,
}: {
  context: AppContext;
  initialReply: AIReply;
  snapshot: WorkspaceSnapshot;
}) {
  return (
    <div className="space-y-6">
      <section className="border border-white/7 bg-[#100e0a] rounded-2xl p-6 sm:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
          <div>
            <Badge>Executive Center</Badge>
            <h1 className="mt-5 text-3xl font-semibold leading-tight sm:text-5xl">
              Seu <span className="erizon-gradient-text">CEO digital</span> para operar, decidir e crescer.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-[var(--text-soft)]">
              A IA não entra como add-on. Aqui ela é a camada operacional principal, conectando pedidos, catálogo,
              estoque, financeiro, fiscal, fornecedores e memória empresarial em uma mesma conversa.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                {
                  icon: ChartNoAxesCombined,
                  title: "Resumo diário",
                  text: "Receita, lucro, pedidos, risco, oportunidade e recomendação em linguagem natural.",
                },
                {
                  icon: BrainCircuit,
                  title: "Memória compartilhada",
                  text: "Agentes aprendem com decisões, histórico, sazonalidade e preferências do workspace.",
                },
                {
                  icon: ShieldCheck,
                  title: "Ações com governança",
                  text: "Cada resposta pode sugerir ação operacional sem perder rastreabilidade e contexto.",
                },
              ].map((item) => (
                <Card key={item.title} className="bg-white/3">
                  <CardContent className="p-5">
                    <item.icon className="mb-4 h-7 w-7 text-orange-400" />
                    <h2 className="text-lg font-medium text-white">{item.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-[var(--text-soft)]">{item.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card className="bg-orange-500/8 border-orange-500/15">
            <CardHeader>
              <CardTitle>Pulso executivo do workspace</CardTitle>
              <CardDescription>
                {context.workspace
                  ? `Workspace ativo: ${context.workspace.name}`
                  : "Assim que o workspace receber dados reais, a camada executiva passa a responder em profundidade."}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {[
                { label: "Pedidos", value: String(snapshot.counts.orders) },
                { label: "SKUs", value: String(snapshot.counts.products) },
                { label: "Transações", value: String(snapshot.counts.finance) },
                { label: "Memórias", value: String(snapshot.counts.memories) },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/3 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-stone-400">{item.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
                </div>
              ))}

              <Link className={buttonStyles({})} href="/agents/executive">
                Abrir Executive Agent
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Chat executivo</CardTitle>
            <CardDescription>
              Converse com a operação inteira em linguagem natural e transforme respostas em próximos passos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ConversationExperience
              contextSnapshot={{
                financeCount: snapshot.counts.finance,
                insightCount: snapshot.counts.insights,
                memoryCount: snapshot.counts.memories,
                orderCount: snapshot.counts.orders,
                productCount: snapshot.counts.products,
                supplierCount: snapshot.counts.suppliers,
              }}
              initialReply={initialReply}
              intro="Esta experiência foi desenhada para parecer um cockpit executivo, não um chat genérico."
              quickPrompts={executiveCenterPrompts}
              routeContext="/executive-center"
              scope="executive"
              workspaceName={context.workspace?.name}
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Arquitetura de IA</CardTitle>
              <CardDescription>Orquestração pensada para Groq, memória compartilhada e agentes especializados.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {orchestrationLayers.map((layer) => (
                <div key={layer.title} className="rounded-xl border border-white/7 bg-white/3 p-4">
                  <p className="text-sm font-medium text-white">{layer.title}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-soft)]">{layer.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ações autônomas sugeridas</CardTitle>
              <CardDescription>Cada diagnóstico da IA pode nascer com ações executáveis dentro do sistema.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {executiveActionExamples.map((example) => (
                <div key={example.title} className="rounded-xl border border-white/7 bg-white/3 p-4">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-orange-400" />
                    <p className="text-sm font-medium text-white">{example.title}</p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-soft)]">{example.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {example.actions.map((action) => (
                      <span
                        key={action}
                        className="rounded-md border border-white/7 bg-white/3 px-2.5 py-1 text-xs text-stone-400"
                      >
                        {action}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle>Insights recentes</CardTitle>
            <CardDescription>Últimos sinais gerados ou registrados para o workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            {snapshot.recentInsights.length > 0 ? (
              <div className="space-y-3">
                {snapshot.recentInsights.map((insight) => (
                  <div key={`${insight.title}-${insight.createdAt}`} className="rounded-xl border border-white/7 bg-white/3 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-white">{insight.title}</p>
                      <span className="text-xs uppercase tracking-[0.18em] text-orange-400">{insight.agentName}</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[var(--text-soft)]">{insight.summary}</p>
                    <p className="mt-3 text-xs text-stone-600">{formatDateTime(insight.createdAt)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/8 bg-white/3 p-6">
                <p className="text-base font-medium text-white">Nenhum insight automático ainda</p>
                <p className="mt-2 text-sm leading-6 text-[var(--text-soft)]">
                  Assim que pedidos, catálogo, financeiro e memória começarem a alimentar o workspace, os agentes passam a
                  registrar sinais úteis aqui.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pedidos recentes e sinal operacional</CardTitle>
            <CardDescription>Últimos movimentos que podem alimentar resposta executiva e ações rápidas.</CardDescription>
          </CardHeader>
          <CardContent>
            {snapshot.recentOrders.length > 0 ? (
              <div className="space-y-3">
                {snapshot.recentOrders.map((order) => (
                  <div
                    key={`${order.orderNumber}-${order.createdAt}`}
                    className="flex flex-col gap-3 rounded-xl border border-white/7 bg-white/3 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{order.orderNumber}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-stone-500">{order.status}</p>
                    </div>
                    <div className="text-sm text-[var(--text-soft)]">{formatDateTime(order.createdAt)}</div>
                    <div className="text-base font-medium text-white">{formatCurrency(order.totalAmount)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/8 bg-white/3 p-6">
                <p className="text-base font-medium text-white">Ainda não há pedidos sincronizados</p>
                <p className="mt-2 text-sm leading-6 text-[var(--text-soft)]">
                  O Executive Center permanece útil mesmo sem números fictícios. Quando os canais entrarem, a leitura passa
                  a ser automática e orientada a ação.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
