import Link from "next/link";
import { ArrowRight, LineChart, Package2, ShoppingBag, Sparkles, Truck, Wallet } from "lucide-react";

import type { AppContext } from "@/lib/auth";
import { executiveQuestions, moduleDefinitions } from "@/lib/modules";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardMetric {
  label: string;
  value: string;
  hint: string;
  icon: "orders" | "products" | "finance" | "suppliers";
}

interface DashboardOrder {
  createdAt: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
}

interface DashboardInsight {
  agentName: string;
  title: string;
  summary: string;
  createdAt: string;
}

const metricIcons = {
  finance: Wallet,
  orders: ShoppingBag,
  products: Package2,
  suppliers: Truck,
};

export function DashboardView({
  context,
  metrics,
  recentInsights,
  recentOrders,
}: {
  context: AppContext;
  metrics: DashboardMetric[];
  recentInsights: DashboardInsight[];
  recentOrders: DashboardOrder[];
}) {
  return (
    <div className="space-y-6">
      <section className="border border-white/7 bg-[#100e0a] rounded-2xl p-6 sm:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
          <div>
            <Badge>Central Executiva Erizon</Badge>
            <h1 className="mt-5 text-3xl font-semibold leading-tight sm:text-4xl">
              Leia o negócio por inteiro antes de agir em cada módulo.
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--text-soft)]">
              Esta central foi montada para sintetizar pedidos, catálogo, estoque, financeiro, fiscal, fornecedores e
              sinais dos agentes em uma visão de decisão executiva.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link className={buttonStyles({})} href="/executive-center">
                Abrir Executive Center
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link className={buttonStyles({ variant: "secondary" })} href="/agents/executive">
                Conversar com o Executive Agent
              </Link>
            </div>

            <div className="mt-8 grid gap-3 md:grid-cols-3">
              {executiveQuestions.map((question) => (
                <div key={question} className="rounded-xl border border-white/7 bg-white/3 p-4 text-sm leading-6">
                  {question}
                </div>
              ))}
            </div>
          </div>

          <Card className="bg-orange-500/8 border-orange-500/15">
            <CardHeader>
              <CardTitle>Pulso do workspace</CardTitle>
              <CardDescription>
                {context.workspace
                  ? `Workspace ativo: ${context.workspace.name}`
                  : "Quando o primeiro workspace estiver provisionado, a operação passa a consolidar dados aqui."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-stone-200">
              <div className="rounded-2xl border border-white/10 bg-white/3 p-4">
                O dashboard não força dados fictícios. Ele já está pronto para refletir o que vier da sua operação real.
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/3 p-4">
                A criação automática de workspace e o RLS por workspace garantem isolamento desde o primeiro login.
              </div>
              <Link className={buttonStyles({})} href="/settings">
                Revisar configuração crítica
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metricIcons[metric.icon];

          return (
            <Card key={metric.label} className="bg-white/3">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.16em] text-stone-500">{metric.label}</p>
                  <Icon className="h-5 w-5 text-orange-400" />
                </div>
                <p className="mt-4 text-3xl font-semibold">{metric.value}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--text-soft)]">{metric.hint}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>Visão operacional recente</CardTitle>
            <CardDescription>Pedidos mais recentes capturados pelo OMS do workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div
                    key={`${order.orderNumber}-${order.createdAt}`}
                    className="flex flex-col gap-3 rounded-xl border border-white/7 bg-white/3 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium">{order.orderNumber}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-stone-500">{order.status}</p>
                    </div>
                    <div className="text-sm text-[var(--text-soft)]">{formatDateTime(order.createdAt)}</div>
                    <div className="text-base font-medium">{formatCurrency(order.totalAmount)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/8 bg-white/3 p-8">
                <h3 className="text-lg font-medium">Ainda não há pedidos recentes</h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-soft)]">
                  Quando canais, e-commerce ou PDV começarem a enviar pedidos, este painel passa a refletir a operação em
                  tempo real.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Insights dos agentes</CardTitle>
            <CardDescription>Sinais estratégicos e operacionais gerados para o workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentInsights.length > 0 ? (
              <div className="space-y-3">
                {recentInsights.map((insight) => (
                  <div key={`${insight.agentName}-${insight.createdAt}`} className="rounded-xl border border-white/7 bg-white/3 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-medium">{insight.title}</p>
                      <span className="text-xs uppercase tracking-[0.18em] text-orange-400">{insight.agentName}</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[var(--text-soft)]">{insight.summary}</p>
                    <p className="mt-3 text-xs text-stone-600">{formatDateTime(insight.createdAt)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/8 bg-white/3 p-8">
                <h3 className="text-lg font-medium">Nenhum insight gerado ainda</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--text-soft)]">
                  Assim que dados reais começarem a entrar, os agentes poderão responder sobre margem, ruptura, compra,
                  fiscal e crescimento.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.8fr,1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Leituras executivas sugeridas</CardTitle>
            <CardDescription>Use estas frentes para priorizar o rollout do sistema.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              "Catálogo e estoque são a fundação para OMS, marketplace, e-commerce e PDV.",
              "Financeiro e fiscal ganham valor exponencial quando alimentados por dados de pedidos reais.",
              "Fornecedores e agentes destravam decisões de reposição e rentabilidade.",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/7 bg-white/3 px-4 py-3 text-sm leading-6">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CardTitle>Mapa dos módulos</CardTitle>
              <CardDescription>
                Cada área já existe como rota e estrutura de produto, pronta para receber dados e integrações.
              </CardDescription>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/3 px-3 py-1 text-xs uppercase tracking-[0.18em] text-stone-400">
              <LineChart className="h-4 w-4 text-orange-400" />
              Rollout prioritário
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {Object.values(moduleDefinitions).map((module) => (
              <Link
                key={module.slug}
                className="rounded-xl border border-white/7 bg-white/3 p-4 transition hover:border-white/10 hover:bg-white/4"
                href={`/${module.slug}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-orange-400">{module.label}</p>
                    <h3 className="mt-2 text-base font-medium">{module.title}</h3>
                  </div>
                  <Sparkles className="h-5 w-5 text-stone-500" />
                </div>
                <p className="mt-3 text-sm leading-6 text-[var(--text-soft)]">{module.stage}</p>
              </Link>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
