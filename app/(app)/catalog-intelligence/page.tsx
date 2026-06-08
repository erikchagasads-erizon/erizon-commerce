import Link from "next/link";
import { AlertTriangle, BadgeDollarSign, Bot, LineChart, Search, ShieldCheck, Store, TrendingDown, Trophy } from "lucide-react";

import { analyzeCatalogAction } from "@/app/(app)/catalog-intelligence/actions";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { requireAppContext } from "@/lib/auth";
import { getCatalogProducts, getLatestCatalogAnalyses } from "@/lib/catalog-intelligence";
import { formatCurrency, formatDateTime } from "@/lib/utils";

function actionLabel(value: string) {
  if (value === "baixar") return "Baixar";
  if (value === "subir") return "Subir";
  if (value === "sair_da_disputa") return "Sair da disputa";
  return "Manter";
}

function percent(value: number | null) {
  return value === null ? "Sem dado" : `${value.toFixed(2)}%`;
}

export default async function CatalogIntelligencePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const context = await requireAppContext();
  const params = (await searchParams) ?? {};
  const [products, analyses] = await Promise.all([
    getCatalogProducts(context.workspace?.workspaceId ?? null),
    getLatestCatalogAnalyses(context.workspace?.workspaceId ?? null),
  ]);
  const selectedId = typeof params.analysis === "string" ? params.analysis : null;
  const selected = analyses.find((analysis) => analysis.id === selectedId) ?? analyses[0] ?? null;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/7 bg-[#100e0a] p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge>Catalog Intelligence Agent</Badge>
            <h1 className="mt-5 text-3xl font-semibold leading-tight sm:text-4xl">
              Especialista de catalogos com analise competitiva real.
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--text-soft)]">
              Compare vendedores, preco, reputacao, frete, Full/Flex, volume aproximado e margem antes de decidir disputar preco.
            </p>
          </div>
          <Link className={buttonStyles({ variant: "secondary" })} href="/agents/catalog-intelligence">
            Conversar com o agente
          </Link>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr,1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Nova analise</CardTitle>
            <CardDescription>Selecione um produto importado do Mercado Livre e informe os custos reais.</CardDescription>
          </CardHeader>
          <CardContent>
            {products.length ? (
              <form action={analyzeCatalogAction} className="space-y-3">
                <select
                  className="h-10 w-full rounded-lg border border-white/7 bg-[#16130f] px-3.5 text-sm text-white outline-none"
                  name="productId"
                  required
                >
                  <option value="">Selecione o produto</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} {product.sku ? `- ${product.sku}` : ""}
                    </option>
                  ))}
                </select>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input min="0" name="purchaseCost" placeholder="Custo de compra" required step="0.01" type="number" />
                  <Input min="0" name="freightCost" placeholder="Custo de frete" step="0.01" type="number" />
                  <Input min="0" name="marketplaceFeePercent" placeholder="Taxa do canal %" step="0.01" type="number" />
                  <Input min="0" name="taxPercent" placeholder="Impostos %" step="0.01" type="number" />
                  <Input min="0" name="commissionCost" placeholder="Comissao fixa" step="0.01" type="number" />
                  <Input min="0" name="operationalCost" placeholder="Custo operacional" step="0.01" type="number" />
                </div>
                <Input min="0" name="desiredMarginPercent" placeholder="Margem desejada %" step="0.01" type="number" />
                <button className={buttonStyles({ className: "w-full sm:w-auto" })} type="submit">
                  <Search className="mr-2 h-4 w-4" />
                  Analisar catalogo
                </button>
              </form>
            ) : (
              <div className="rounded-xl border border-dashed border-white/10 bg-white/3 p-6">
                <Store className="h-8 w-8 text-orange-400" />
                <h2 className="mt-4 text-lg font-medium">Importe produtos antes de analisar catalogos.</h2>
                <p className="mt-3 text-sm leading-7 text-[var(--text-soft)]">
                  Conecte Mercado Livre e sincronize produtos para o agente localizar o catalogo competitivo.
                </p>
                <Link className={buttonStyles({ className: "mt-4", size: "sm" })} href="/integrations">
                  Conectar Mercado Livre
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resultado esperado</CardTitle>
            <CardDescription>O agente decide com base em custo, concorrencia e margem.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {[
              { icon: BadgeDollarSign, text: "Minha margem atual e no menor preco" },
              { icon: Trophy, text: "Vendedor com menor preco e lider em vendas" },
              { icon: LineChart, text: "Historico de precos e concorrentes" },
              { icon: ShieldCheck, text: "Recomendacao: baixar, manter, subir ou sair" },
            ].map((item) => (
              <div key={item.text} className="rounded-xl border border-white/7 bg-white/3 p-4 text-sm text-[var(--text-soft)]">
                <item.icon className="mb-3 h-5 w-5 text-orange-400" />
                {item.text}
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {selected ? (
        <>
          <section className="grid gap-4 lg:grid-cols-4">
            {[
              { label: "Meu preco atual", value: formatCurrency(selected.myPrice), icon: BadgeDollarSign },
              { label: "Custo de compra", value: formatCurrency(selected.purchaseCost), icon: ShieldCheck },
              { label: "Menor preco", value: selected.lowestPrice === null ? "Sem dado" : formatCurrency(selected.lowestPrice), icon: TrendingDown },
              { label: "Preco ideal", value: selected.idealPrice === null ? "Sem dado" : formatCurrency(selected.idealPrice), icon: Bot },
            ].map((metric) => (
              <Card key={metric.label} className="bg-white/3">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-stone-500">{metric.label}</p>
                    <metric.icon className="h-5 w-5 text-orange-400" />
                  </div>
                  <p className="mt-4 text-2xl font-semibold">{metric.value}</p>
                </CardContent>
              </Card>
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1fr,0.9fr]">
            <Card>
              <CardHeader>
                <CardTitle>{selected.productName}</CardTitle>
                <CardDescription>Analise criada em {formatDateTime(selected.createdAt)}.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-white/7 bg-white/3 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-stone-500">Maior preco</p>
                    <p className="mt-2 text-lg font-semibold">{selected.highestPrice === null ? "Sem dado" : formatCurrency(selected.highestPrice)}</p>
                  </div>
                  <div className="rounded-xl border border-white/7 bg-white/3 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-stone-500">Preco medio</p>
                    <p className="mt-2 text-lg font-semibold">{selected.averagePrice === null ? "Sem dado" : formatCurrency(selected.averagePrice)}</p>
                  </div>
                  <div className="rounded-xl border border-white/7 bg-white/3 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-stone-500">Confianca</p>
                    <p className="mt-2 text-lg font-semibold">{selected.confidence.toFixed(0)}%</p>
                  </div>
                </div>

                <div className="rounded-xl border border-white/7 bg-white/3 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-stone-500">Recomendacao final</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <span className="rounded-full border border-orange-400/20 bg-orange-500/10 px-3 py-1 text-sm text-orange-100">
                      {actionLabel(selected.recommendation)}
                    </span>
                    <span className="text-sm text-stone-400">Risco {selected.riskLevel}</span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-soft)]">{selected.recommendationSummary}</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-white/7 bg-white/3 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-stone-500">Margem atual</p>
                    <p className="mt-2 text-lg font-semibold">{percent(selected.currentMarginPercent)}</p>
                    <p className="text-xs text-stone-500">{selected.currentMarginAmount === null ? "Sem dado" : formatCurrency(selected.currentMarginAmount)}</p>
                  </div>
                  <div className="rounded-xl border border-white/7 bg-white/3 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-stone-500">No menor preco</p>
                    <p className="mt-2 text-lg font-semibold">{percent(selected.lowestPriceMarginPercent)}</p>
                    <p className="text-xs text-stone-500">{selected.lowestPriceMarginAmount === null ? "Sem dado" : formatCurrency(selected.lowestPriceMarginAmount)}</p>
                  </div>
                  <div className="rounded-xl border border-white/7 bg-white/3 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-stone-500">R$ 0,01 abaixo</p>
                    <p className="mt-2 text-lg font-semibold">{percent(selected.undercutMarginPercent)}</p>
                    <p className="text-xs text-stone-500">{selected.undercutMarginAmount === null ? "Sem dado" : formatCurrency(selected.undercutMarginAmount)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Vendedor lider</CardTitle>
                  <CardDescription>Volume aproximado quando o canal permite leitura.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">{selected.leadingSellerName ?? "Nao identificado"}</p>
                  <p className="mt-2 text-sm text-[var(--text-soft)]">
                    {selected.leadingSellerSales === null ? "Sem estimativa de vendas disponivel." : `${selected.leadingSellerSales} vendas/indicadores aproximados.`}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Memoria do agente</CardTitle>
                  <CardDescription>Historico preservado para aprender com decisoes futuras.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-[var(--text-soft)]">
                  <div className="rounded-xl border border-white/7 bg-white/3 p-3">Historico de precos salvo.</div>
                  <div className="rounded-xl border border-white/7 bg-white/3 p-3">Historico de concorrentes salvo.</div>
                  <div className="rounded-xl border border-white/7 bg-white/3 p-3">Recomendacao executiva salva.</div>
                </CardContent>
              </Card>
            </div>
          </section>

          <Card>
            <CardHeader>
              <CardTitle>Principais vendedores do catalogo</CardTitle>
              <CardDescription>Comparativo de preco, vendas, reputacao, frete, Full/Flex e posicao.</CardDescription>
            </CardHeader>
            <CardContent>
              {selected.sellers.length ? (
                <div className="overflow-x-auto rounded-xl border border-white/7">
                  <table className="w-full min-w-[860px] text-left text-sm">
                    <thead className="bg-white/4 text-xs uppercase tracking-[0.16em] text-stone-500">
                      <tr>
                        <th className="px-4 py-3">Posicao</th>
                        <th className="px-4 py-3">Vendedor</th>
                        <th className="px-4 py-3">Preco</th>
                        <th className="px-4 py-3">Vendas</th>
                        <th className="px-4 py-3">Reputacao</th>
                        <th className="px-4 py-3">Frete</th>
                        <th className="px-4 py-3">Entrega</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selected.sellers.map((seller) => (
                        <tr key={`${seller.itemId}-${seller.position}`} className="border-t border-white/7">
                          <td className="px-4 py-3">{seller.position ?? "-"}</td>
                          <td className="px-4 py-3 font-medium">{seller.sellerName ?? "Vendedor"}</td>
                          <td className="px-4 py-3">{formatCurrency(seller.price)}</td>
                          <td className="px-4 py-3">{seller.soldQuantity ?? "Sem dado"}</td>
                          <td className="px-4 py-3">{seller.reputation ?? "Sem dado"}</td>
                          <td className="px-4 py-3">{seller.freeShipping ? "Gratis" : "Pago"}</td>
                          <td className="px-4 py-3">{seller.isFull ? "Full" : seller.isFlex ? "Flex" : "Normal"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex items-start gap-3 rounded-xl border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-100">
                  <AlertTriangle className="mt-0.5 h-4 w-4" />
                  <p>Nao encontramos vendedores suficientes nessa leitura. Tente novamente depois ou revise o produto selecionado.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="border-dashed bg-white/3">
          <CardContent className="p-8">
            <h2 className="text-xl font-semibold">Nenhuma analise competitiva ainda.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-soft)]">
              Rode a primeira analise para ativar historico de precos, concorrentes, vendas aproximadas e recomendacoes.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
