import Link from "next/link";
import { AlertTriangle, ArrowRight, BadgeDollarSign, PackageX, ShoppingBag, Sparkles, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAppContext } from "@/lib/auth";
import { getCommerceDashboard } from "@/lib/commerce-data";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export default async function DashboardPage() {
  const context = await requireAppContext();
  const dashboard = await getCommerceDashboard(context.workspace?.workspaceId ?? null);
  const hasData = dashboard.connectedChannels > 0 || dashboard.dailyOrders > 0 || dashboard.topProducts.length > 0;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/7 bg-[#100e0a] p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge>Resultados do comercio</Badge>
            <h1 className="mt-5 text-3xl font-semibold leading-tight sm:text-4xl">
              Visao real das vendas, estoque e oportunidades.
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--text-soft)]">
              O painel mostra somente dados importados dos canais conectados e alertas gerados pela Erizon AI.
            </p>
          </div>
          <Link className={buttonStyles({})} href="/integrations">
            Conectar canais
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>

      {!hasData ? (
        <Card className="border-dashed bg-white/3">
          <CardContent className="p-8">
            <h2 className="text-xl font-semibold">Conecte um canal de venda para comecar.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-soft)]">
              Assim que Mercado Livre, Shopee ou seu site estiverem conectados, seus produtos, pedidos e alertas aparecem aqui.
            </p>
            <Link className={buttonStyles({ className: "mt-5" })} href="/integrations">
              Ir para Integracoes
            </Link>
          </CardContent>
        </Card>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-4">
        {[
          {
            icon: BadgeDollarSign,
            label: "Faturamento de hoje",
            value: formatCurrency(dashboard.dailyRevenue),
          },
          {
            icon: ShoppingBag,
            label: "Pedidos de hoje",
            value: String(dashboard.dailyOrders),
          },
          {
            icon: TrendingUp,
            label: "Lucro estimado",
            value: formatCurrency(dashboard.estimatedProfit),
          },
          {
            icon: Sparkles,
            label: "Canais conectados",
            value: String(dashboard.connectedChannels),
          },
        ].map((metric) => (
          <Card key={metric.label} className="bg-white/3">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.16em] text-stone-500">{metric.label}</p>
                <metric.icon className="h-5 w-5 text-orange-400" />
              </div>
              <p className="mt-4 text-3xl font-semibold">{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Produtos mais vendidos</CardTitle>
            <CardDescription>Ranking calculado a partir dos pedidos importados.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboard.topProducts.length ? (
              dashboard.topProducts.map((product) => (
                <div key={`${product.name}-${product.sku}`} className="flex items-center justify-between rounded-xl border border-white/7 bg-white/3 p-4">
                  <div>
                    <p className="text-sm font-medium">{product.name}</p>
                    <p className="mt-1 text-xs text-stone-500">{product.sku ?? "Sem SKU"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{product.quantity} vendidos</p>
                    <p className="mt-1 text-xs text-stone-500">{formatCurrency(product.revenue)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-white/10 bg-white/3 p-6 text-sm text-[var(--text-soft)]">
                Sem pedidos importados para calcular produtos vendidos.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alertas de estoque</CardTitle>
            <CardDescription>Produtos sem estoque ou perto de acabar.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[...dashboard.outOfStockProducts, ...dashboard.lowStockProducts].length ? (
              <>
                {dashboard.outOfStockProducts.map((product) => (
                  <div key={`out-${product.name}-${product.sku}`} className="flex items-start gap-3 rounded-xl border border-red-400/20 bg-red-500/10 p-4">
                    <PackageX className="mt-0.5 h-4 w-4 text-red-300" />
                    <div>
                      <p className="text-sm font-medium text-red-100">{product.name}</p>
                      <p className="mt-1 text-xs text-red-200/80">Sem estoque</p>
                    </div>
                  </div>
                ))}
                {dashboard.lowStockProducts.map((product) => (
                  <div key={`low-${product.name}-${product.sku}`} className="flex items-start gap-3 rounded-xl border border-amber-400/20 bg-amber-500/10 p-4">
                    <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-300" />
                    <div>
                      <p className="text-sm font-medium text-amber-100">{product.name}</p>
                      <p className="mt-1 text-xs text-amber-200/80">Restam {product.stock}</p>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <p className="rounded-xl border border-dashed border-white/10 bg-white/3 p-6 text-sm text-[var(--text-soft)]">
                Nenhum alerta de estoque com os dados atuais.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ultimas importacoes</CardTitle>
            <CardDescription>Historico dos canais conectados.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboard.latestSyncs.length ? (
              dashboard.latestSyncs.map((sync) => (
                <div key={`${sync.provider}-${sync.createdAt}`} className="rounded-xl border border-white/7 bg-white/3 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">{sync.provider}</p>
                    <p className="text-xs text-stone-500">{formatDateTime(sync.createdAt)}</p>
                  </div>
                  <p className="mt-2 text-sm text-[var(--text-soft)]">{sync.message}</p>
                </div>
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-white/10 bg-white/3 p-6 text-sm text-[var(--text-soft)]">
                Nenhuma importacao registrada ainda.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Erizon AI</CardTitle>
            <CardDescription>Insights gerados com dados reais da operacao.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboard.recentInsights.length ? (
              dashboard.recentInsights.map((insight) => (
                <div key={`${insight.title}-${insight.createdAt}`} className="rounded-xl border border-white/7 bg-white/3 p-4">
                  <p className="text-sm font-medium">{insight.title}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-soft)]">{insight.summary}</p>
                </div>
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-white/10 bg-white/3 p-6 text-sm text-[var(--text-soft)]">
                A Erizon AI vai gerar alertas depois que houver produtos e pedidos importados.
              </p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
