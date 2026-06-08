import Link from "next/link";
import { Package2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAppContext } from "@/lib/auth";
import { getProducts } from "@/lib/commerce-data";
import { formatCurrency } from "@/lib/utils";

export default async function ProductsPage() {
  const context = await requireAppContext();
  const products = await getProducts(context.workspace?.workspaceId ?? null);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/7 bg-[#100e0a] p-6 sm:p-8">
        <Badge>Produtos</Badge>
        <h1 className="mt-5 text-3xl font-semibold leading-tight sm:text-4xl">Catalogo importado dos canais conectados.</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--text-soft)]">
          Veja nome, SKU, canal, preco, estoque, vendas e status usando dados reais.
        </p>
      </section>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle>Lista de produtos</CardTitle>
            <CardDescription>{products.length} produtos encontrados.</CardDescription>
          </div>
          <Link className={buttonStyles({ size: "sm" })} href="/integrations">
            Conectar canal
          </Link>
        </CardHeader>
        <CardContent>
          {products.length ? (
            <div className="overflow-x-auto rounded-xl border border-white/7">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-white/4 text-xs uppercase tracking-[0.16em] text-stone-500">
                  <tr>
                    <th className="px-4 py-3">Nome</th>
                    <th className="px-4 py-3">SKU</th>
                    <th className="px-4 py-3">Canal</th>
                    <th className="px-4 py-3">Preco</th>
                    <th className="px-4 py-3">Estoque</th>
                    <th className="px-4 py-3">Vendas</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-t border-white/7">
                      <td className="px-4 py-3 font-medium">{product.name}</td>
                      <td className="px-4 py-3 text-stone-400">{product.sku ?? "Sem SKU"}</td>
                      <td className="px-4 py-3 text-stone-300">{product.channel}</td>
                      <td className="px-4 py-3">{formatCurrency(product.price)}</td>
                      <td className="px-4 py-3">{product.stock}</td>
                      <td className="px-4 py-3">{product.sales}</td>
                      <td className="px-4 py-3">{product.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-white/10 bg-white/3 p-8">
              <Package2 className="h-8 w-8 text-orange-400" />
              <h2 className="mt-4 text-lg font-medium">Conecte um canal para importar produtos.</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--text-soft)]">
                Mercado Livre, Shopee ou site proprio enviarao o catalogo para esta tela.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

