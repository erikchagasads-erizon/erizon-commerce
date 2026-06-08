import { ArrowRight, Package2, ShoppingBag, Sparkles, Wallet } from "lucide-react";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth/auth-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAppContext } from "@/lib/auth";

export default async function LoginPage() {
  const context = await getAppContext();

  if (context.isSupabaseConfigured && context.session) {
    redirect("/integrations");
  }

  return (
    <main className="min-h-screen bg-[#0c0a09]">
      <div className="erizon-grid absolute inset-0" />

      <div className="relative border-b border-white/6 px-8 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-orange-500">
              <span className="text-xs font-bold text-white">E</span>
            </div>
            <span className="text-sm font-semibold text-white">Erizon</span>
          </div>
          <Badge>Commerce OS</Badge>
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-[1.1fr,0.9fr]">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-orange-500">
              O sistema operacional do comércio
            </p>
            <h1 className="mt-4 text-5xl font-bold leading-[1.1] tracking-tight text-white sm:text-6xl">
              Conecte seus canais. Controle sua operação. Cresça com inteligência.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-7 text-stone-400">
              A Erizon reúne produtos, pedidos, estoque, marketplaces, financeiro e IA em uma experiência premium para o dono do negócio.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {[
                {
                  icon: ShoppingBag,
                  title: "Pedidos em um só lugar",
                  text: "Veja Mercado Livre, Shopee e site próprio na mesma visão.",
                },
                {
                  icon: Package2,
                  title: "Produtos e estoque conectados",
                  text: "Evite vender sem saldo e encontre itens parados.",
                },
                {
                  icon: Wallet,
                  title: "Resultado financeiro claro",
                  text: "Acompanhe caixa, margem e recebimentos sem planilhas soltas.",
                },
                {
                  icon: Sparkles,
                  title: "Erizon AI",
                  text: "Receba alertas e próximos passos para vender melhor.",
                },
              ].map((item) => (
                <div key={item.title} className="rounded-xl border border-white/7 bg-white/3 p-5">
                  <item.icon className="mb-3 h-5 w-5 text-orange-500" />
                  <h2 className="text-sm font-semibold text-white">{item.title}</h2>
                  <p className="mt-1.5 text-xs leading-5 text-stone-500">{item.text}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 rounded-2xl border border-orange-500/15 bg-orange-500/5 p-5">
              <div className="flex items-start gap-3">
                <ArrowRight className="mt-1 h-5 w-5 text-orange-400" />
                <div>
                  <p className="font-medium text-white">O primeiro passo é conectar seus canais de venda.</p>
                  <p className="mt-1 text-sm leading-6 text-stone-400">
                    Depois disso, a Erizon começa a importar pedidos, produtos e sinais para transformar dados em decisão.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <AuthForm />
            {!context.isSupabaseConfigured ? (
              <Card className="border-amber-500/15 bg-amber-500/5">
                <CardHeader>
                  <CardTitle>Acesso de demonstração</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-6 text-amber-200/80">
                  A plataforma pode ser explorada, mas os dados reais entram quando a conta da empresa estiver ativa.
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
