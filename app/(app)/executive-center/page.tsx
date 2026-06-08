import Link from "next/link";
import { ArrowRight, Package2, ShoppingBag, Sparkles, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAppContext } from "@/lib/auth";
import { getWorkspaceSnapshot } from "@/lib/workspace-data";

export default async function ExecutiveCenterPage() {
  const context = await requireAppContext();
  const snapshot = await getWorkspaceSnapshot(context.workspace?.workspaceId ?? null);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/7 bg-[#100e0a] p-6 sm:p-8">
        <Badge>Erizon AI</Badge>
        <h1 className="mt-5 text-3xl font-semibold leading-tight sm:text-5xl">
          Decida o próximo passo do comércio com ajuda da IA.
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-[var(--text-soft)]">
          A Erizon AI analisa vendas, produtos, estoque e financeiro para apontar riscos, oportunidades e ações práticas.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link className={buttonStyles({})} href="/integrations">
            Conectar canais
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link className={buttonStyles({ variant: "secondary" })} href="/dashboard">
            Ver resultados
          </Link>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        {[
          { icon: ShoppingBag, label: "Pedidos", value: snapshot.counts.orders, text: "Vendas importadas dos canais." },
          { icon: Package2, label: "Produtos", value: snapshot.counts.products, text: "Itens prontos para análise." },
          { icon: Wallet, label: "Financeiro", value: snapshot.counts.finance, text: "Movimentos para leitura de caixa." },
          { icon: Sparkles, label: "Alertas", value: snapshot.counts.insights, text: "Sinais gerados pela inteligência." },
        ].map((item) => (
          <Card key={item.label} className="bg-white/3">
            <CardContent className="p-5">
              <item.icon className="h-5 w-5 text-orange-400" />
              <p className="mt-4 text-xs uppercase tracking-[0.16em] text-stone-500">{item.label}</p>
              <p className="mt-2 text-3xl font-semibold text-white">{item.value}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--text-soft)]">{item.text}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr,1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Perguntas que a Erizon responde</CardTitle>
            <CardDescription>Use a inteligência para priorizar o que mexe no resultado.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              "Onde estou perdendo dinheiro?",
              "Quais produtos devo comprar agora?",
              "Qual canal está mais rentável?",
              "Quais produtos merecem atenção esta semana?",
            ].map((question) => (
              <div key={question} className="rounded-xl border border-white/7 bg-white/3 p-4 text-sm leading-6 text-[var(--text-soft)]">
                {question}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximas ações recomendadas</CardTitle>
            <CardDescription>O melhor começo é alimentar a plataforma com dados reais.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              "Conectar Mercado Livre e Shopee.",
              "Importar catálogo com preço, custo e estoque.",
              "Revisar produtos sem margem confiável.",
              "Voltar ao painel de resultados para acompanhar evolução.",
            ].map((action) => (
              <div key={action} className="rounded-xl border border-white/7 bg-white/3 p-4 text-sm leading-6 text-[var(--text-soft)]">
                {action}
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
