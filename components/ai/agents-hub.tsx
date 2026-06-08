import Link from "next/link";
import { ArrowRight, Bot, BrainCircuit, FolderCog, MessageSquareText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { agentDefinitions } from "@/lib/ai";
import type { AppContext } from "@/lib/auth";
import type { WorkspaceSnapshot } from "@/lib/workspace-data";

export function AgentsHub({
  context,
  snapshot,
}: {
  context: AppContext;
  snapshot: WorkspaceSnapshot;
}) {
  return (
    <div className="space-y-6">
      <section className="border border-white/7 bg-[#100e0a] rounded-2xl p-6 sm:p-8">
        <Badge>Agentes Especializados</Badge>
        <h1 className="mt-5 text-3xl font-semibold sm:text-4xl">Cada área crítica do comércio com seu próprio especialista.</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--text-soft)]">
          Aqui a IA não é monolítica. Cada agente ganha chat próprio, missão específica, ferramentas do domínio e acesso
          à mesma memória empresarial do workspace.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            {
              icon: MessageSquareText,
              title: "Chat por agente",
              text: "Conversa dedicada por especialidade para manter foco, clareza e histórico por assunto.",
            },
            {
              icon: BrainCircuit,
              title: "Memória compartilhada",
              text: "Todos aprendem com o contexto do workspace, sem virar silos de conversa desconectados.",
            },
            {
              icon: FolderCog,
              title: "Ferramentas próprias",
              text: "Cada agente foi pensado para agir sobre os módulos e decisões que realmente domina.",
            },
          ].map((item) => (
            <Card key={item.title} className="bg-white/3">
              <CardContent className="p-5">
                <item.icon className="mb-4 h-6 w-6 text-orange-400" />
                <h2 className="text-lg font-medium text-white">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--text-soft)]">{item.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>Catálogo de agentes</CardTitle>
            <CardDescription>Escolha o especialista com base na decisão que você precisa tomar agora.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-2">
            {agentDefinitions.map((agent) => (
              <Link
                key={agent.slug}
                className="rounded-2xl border border-white/7 bg-white/3 p-5 transition hover:border-white/10 hover:bg-white/4"
                href={`/agents/${agent.slug}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-orange-400">{agent.badge}</p>
                    <h3 className="mt-2 text-lg font-medium text-white">{agent.name}</h3>
                  </div>
                  <Bot className="h-5 w-5 text-stone-500" />
                </div>
                <p className="mt-3 text-sm leading-6 text-[var(--text-soft)]">{agent.summary}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {agent.specialty.slice(0, 3).map((item) => (
                    <span
                      key={item}
                      className="rounded-md border border-white/7 bg-white/3 px-2.5 py-1 text-xs text-stone-400"
                    >
                      {item}
                    </span>
                  ))}
                </div>
                <span className={buttonStyles({ variant: "ghost", size: "sm", className: "mt-4" })}>
                  Abrir chat do agente
                  <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contexto compartilhado</CardTitle>
              <CardDescription>O mesmo tecido de memória sustenta todos os especialistas.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-[var(--text-soft)]">
              <div className="rounded-2xl border border-white/7 bg-white/3 px-4 py-3">
                Workspace ativo: <span className="text-white">{context.workspace?.name ?? "preview do produto"}</span>
              </div>
              <div className="rounded-2xl border border-white/7 bg-white/3 px-4 py-3">
                Memórias registradas: <span className="text-white">{snapshot.counts.memories}</span>
              </div>
              <div className="rounded-2xl border border-white/7 bg-white/3 px-4 py-3">
                Insights disponíveis: <span className="text-white">{snapshot.counts.insights}</span>
              </div>
              <div className="rounded-2xl border border-white/7 bg-white/3 px-4 py-3">
                Cada conversa pode virar ação, insight persistido ou aprendizado de memória.
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ordem natural de uso</CardTitle>
              <CardDescription>Como esta área se encaixa na operação real do dia a dia.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-[var(--text-soft)]">
              {[
                "Executive Agent para leitura do negócio.",
                "Finance e Stock para proteger caixa e disponibilidade.",
                "Pricing e Catalog para corrigir competitividade.",
                "Supply, Tax, Growth e Channel Performance para decisões de expansão e eficiência.",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-white/7 bg-white/3 px-4 py-3">
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

