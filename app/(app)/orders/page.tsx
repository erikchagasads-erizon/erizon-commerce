import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAppContext } from "@/lib/auth";
import { getOrders } from "@/lib/commerce-data";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export default async function OrdersPage() {
  const context = await requireAppContext();
  const orders = await getOrders(context.workspace?.workspaceId ?? null);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/7 bg-[#100e0a] p-6 sm:p-8">
        <Badge>Pedidos</Badge>
        <h1 className="mt-5 text-3xl font-semibold leading-tight sm:text-4xl">Vendas importadas dos seus canais.</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--text-soft)]">
          Acompanhe numero, cliente, canal, valor, status e data dos pedidos reais.
        </p>
      </section>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle>Lista de pedidos</CardTitle>
            <CardDescription>{orders.length} pedidos encontrados.</CardDescription>
          </div>
          <Link className={buttonStyles({ size: "sm" })} href="/integrations">
            Conectar canal
          </Link>
        </CardHeader>
        <CardContent>
          {orders.length ? (
            <div className="overflow-x-auto rounded-xl border border-white/7">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-white/4 text-xs uppercase tracking-[0.16em] text-stone-500">
                  <tr>
                    <th className="px-4 py-3">Numero</th>
                    <th className="px-4 py-3">Cliente</th>
                    <th className="px-4 py-3">Canal</th>
                    <th className="px-4 py-3">Valor</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-t border-white/7">
                      <td className="px-4 py-3 font-medium">{order.number}</td>
                      <td className="px-4 py-3 text-stone-300">{order.customer ?? "Cliente nao informado"}</td>
                      <td className="px-4 py-3 text-stone-300">{order.channel}</td>
                      <td className="px-4 py-3">{formatCurrency(order.value)}</td>
                      <td className="px-4 py-3">{order.status}</td>
                      <td className="px-4 py-3 text-stone-400">{formatDateTime(order.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-white/10 bg-white/3 p-8">
              <ShoppingBag className="h-8 w-8 text-orange-400" />
              <h2 className="mt-4 text-lg font-medium">Conecte um canal para importar pedidos.</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--text-soft)]">
                Assim que uma conta for conectada, os pedidos reais aparecem aqui.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

