import Link from "next/link";
import { ArrowRight, BadgeDollarSign, LineChart, Package2, ShoppingBag, Sparkles, Truck, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDateTime } from "@/lib/utils";

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

const resultCards = [
  {
    title: "Receita protegida",
    text: "Acompanhe pedidos, pagamentos e canais para agir antes que venda vire problema.",
    icon: BadgeDollarSign,
  },
  {
    title: "Estoque sob controle",
    text: "Veja produtos parados, risco de falta e oportunidades de reposição com clareza.",
    icon: Package2,
  },
  {
    title: "Decisão com IA",
    text: "A Erizon AI prioriza alertas e recomenda próximos passos para crescer com margem.",
    icon: Sparkles,
  },
];

export function DashboardView({
  metrics,
  recentInsights,
  recentOrders,
}: {
  metrics: DashboardMetric[];
  recentInsights: DashboardInsight[];
  recentOrders: DashboardOrder[];
}) {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/7 bg-[#100e0a] p-6 sm:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
          <div>
            <Badge>Resultados do comércio</Badge>
            <h1 className="mt-5 text-3xl font-semibold leading-tight sm:text-4xl">
              Tudo que importa para vender mais, perder menos e decidir melhor.
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--text-soft)]">
              Acompanhe vendas, catálogo, estoque, caixa e alertas inteligentes em uma visão simples para o dono do negócio.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link className={buttonStyles({})} href="/integrations">
                Conectar canais
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link className={buttonStyles({ variant: "secondary" })} href="/executive-center">
                Perguntar à Erizon AI
              </Link>
            </div>
          </div>

          <div className="grid gap-3">
            {resultCards.map((item) => (
              <div key={item.title} className="rounded-xl border border-white/7 bg-white/3 p-4">
                <div className="flex items-start gap-3">
                  <item.icon className="mt-0.5 h-5 w-5 text-orange-400" />
                  <div>
                    <h2 className="text-sm font-semibold text-white">{item.title}</h2>
                    <p className="mt-1 text-sm leading-6 text-[var(--text-soft)]">{item.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
            <CardTitle>Pedidos recentes</CardTitle>
            <CardDescription>As últimas vendas importadas dos seus canais aparecem aqui.</CardDescription>
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
                <h3 className="text-lg font-medium">Conecte um canal para ver pedidos</h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-soft)]">
                  Comece por Mercado Livre, Shopee ou site próprio. Depois disso, suas vendas entram automaticamente nesta visão.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alertas inteligentes</CardTitle>
            <CardDescription>A Erizon AI mostra riscos e oportunidades quando há dados suficientes.</CardDescription>
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
                <h3 className="text-lg font-medium">Nenhum alerta por enquanto</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--text-soft)]">
                  Assim que produtos e pedidos entrarem, a Erizon AI poderá indicar falta de estoque, queda de margem e oportunidades de compra.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle>Prioridades recomendadas</CardTitle>
            <CardDescription>O caminho mais curto para transformar a Erizon no centro da operação.</CardDescription>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/3 px-3 py-1 text-xs uppercase tracking-[0.18em] text-stone-400">
            <LineChart className="h-4 w-4 text-orange-400" />
            Foco em resultado
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {[
            "Conecte Mercado Livre e Shopee para importar vendas e catálogo.",
            "Revise produtos sem preço, custo ou estoque confiável.",
            "Ative a Erizon AI para receber alertas de margem, ruptura e crescimento.",
          ].map((item) => (
            <div key={item} className="rounded-xl border border-white/7 bg-white/3 p-4 text-sm leading-6 text-[var(--text-soft)]">
              {item}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
