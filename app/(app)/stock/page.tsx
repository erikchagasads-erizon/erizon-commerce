import { Boxes } from "lucide-react";

import { createStockMovementAction } from "@/app/(app)/stock/actions";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { requireAppContext } from "@/lib/auth";
import { getStock } from "@/lib/commerce-data";
import { formatDateTime } from "@/lib/utils";

export default async function StockPage() {
  const context = await requireAppContext();
  const stock = await getStock(context.workspace?.workspaceId ?? null);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/7 bg-[#100e0a] p-6 sm:p-8">
        <Badge>Estoque</Badge>
        <h1 className="mt-5 text-3xl font-semibold leading-tight sm:text-4xl">Controle de estoque com dados reais.</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--text-soft)]">
          Veja disponibilidade importada e registre entradas, saidas ou ajustes manuais.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Produtos em estoque</CardTitle>
            <CardDescription>{stock.products.length} produtos encontrados.</CardDescription>
          </CardHeader>
          <CardContent>
            {stock.products.length ? (
              <div className="space-y-3">
                {stock.products.map((product) => (
                  <div key={product.id} className="flex items-center justify-between rounded-xl border border-white/7 bg-white/3 p-4">
                    <div>
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="mt-1 text-xs text-stone-500">{product.sku ?? "Sem SKU"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">{product.stock}</p>
                      <p className="text-xs text-stone-500">Atualizado {formatDateTime(product.updatedAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/10 bg-white/3 p-8">
                <Boxes className="h-8 w-8 text-orange-400" />
                <h2 className="mt-4 text-lg font-medium">Conecte um canal para importar estoque.</h2>
                <p className="mt-3 text-sm leading-7 text-[var(--text-soft)]">
                  Depois da importacao, voce podera ajustar quantidades manualmente.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ajuste manual</CardTitle>
              <CardDescription>Registre entrada, saida ou ajuste de quantidade.</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={createStockMovementAction} className="space-y-3">
                <select
                  className="h-10 w-full rounded-lg border border-white/7 bg-[#16130f] px-3.5 text-sm text-white outline-none"
                  name="productId"
                  required
                >
                  <option value="">Selecione um produto</option>
                  {stock.products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
                <select
                  className="h-10 w-full rounded-lg border border-white/7 bg-[#16130f] px-3.5 text-sm text-white outline-none"
                  name="movementType"
                >
                  <option value="entry">Entrada</option>
                  <option value="exit">Saida</option>
                  <option value="adjustment">Ajuste</option>
                </select>
                <Input min="0" name="quantity" placeholder="Quantidade" required step="1" type="number" />
                <Input name="notes" placeholder="Observacao" />
                <button className={buttonStyles({ size: "sm" })} disabled={!stock.products.length} type="submit">
                  Registrar movimento
                </button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Historico</CardTitle>
              <CardDescription>Ultimos movimentos registrados.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {stock.movements.length ? (
                stock.movements.map((movement) => (
                  <div key={movement.id} className="rounded-xl border border-white/7 bg-white/3 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium">{movement.productName}</p>
                      <p className="text-xs text-stone-500">{formatDateTime(movement.createdAt)}</p>
                    </div>
                    <p className="mt-2 text-sm text-[var(--text-soft)]">
                      {movement.type}: {movement.quantity}
                    </p>
                    {movement.notes ? <p className="mt-1 text-xs text-stone-500">{movement.notes}</p> : null}
                  </div>
                ))
              ) : (
                <p className="rounded-xl border border-dashed border-white/10 bg-white/3 p-6 text-sm text-[var(--text-soft)]">
                  Nenhum movimento registrado ainda.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

