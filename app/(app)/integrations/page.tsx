import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, Globe, RefreshCw, ShoppingBag, Store } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAppContext } from "@/lib/auth";
import { getIntegrationHealth } from "@/lib/admin-data";

const integrationCatalog = [
  {
    key: "mercado-livre",
    name: "Mercado Livre",
    description: "Traga anúncios, pedidos, estoque e desempenho do seu principal marketplace.",
    provider: "mercado_livre",
    icon: Store,
    imported: ["Pedidos", "Produtos", "Anúncios", "Estoque"],
    href: "/marketplaces",
    priority: "Passo 1",
  },
  {
    key: "shopee",
    name: "Shopee",
    description: "Centralize vendas, catálogo e acompanhamento de pedidos da Shopee.",
    provider: "shopee",
    icon: ShoppingBag,
    imported: ["Pedidos", "Produtos", "Preços", "Estoque"],
    href: "/marketplaces",
    priority: "Passo 2",
  },
  {
    key: "site-proprio",
    name: "Site próprio",
    description: "Conecte sua loja online para enxergar o canal direto junto com os marketplaces.",
    provider: "site_proprio",
    icon: Globe,
    imported: ["Pedidos", "Clientes", "Produtos", "Pagamentos"],
    href: "/ecommerce",
    priority: "Passo 3",
  },
  {
    key: "amazon",
    name: "Amazon",
    description: "Prepare o crescimento em novos canais sem perder controle de estoque e margem.",
    provider: "amazon",
    icon: Store,
    imported: ["Pedidos", "Produtos", "Anúncios", "Estoque"],
    href: "/marketplaces",
    priority: "Canal extra",
  },
  {
    key: "magalu",
    name: "Magalu",
    description: "Acompanhe vendas e catálogo em mais um canal estratégico para o varejo.",
    provider: "magalu",
    icon: Store,
    imported: ["Pedidos", "Produtos", "Anúncios", "Estoque"],
    href: "/marketplaces",
    priority: "Canal extra",
  },
  {
    key: "shopify",
    name: "Shopify",
    description: "Conecte a loja própria quando seu canal direto estiver pronto para escalar.",
    provider: "shopify",
    icon: Globe,
    imported: ["Pedidos", "Clientes", "Produtos", "Pagamentos"],
    href: "/ecommerce",
    priority: "Loja online",
  },
];

function normalizeProvider(value: string) {
  return value.toLowerCase().replaceAll(" ", "_").replaceAll("-", "_");
}

export default async function IntegrationsPage() {
  const context = await requireAppContext();
  const integrations = await getIntegrationHealth(context.workspace?.workspaceId ?? null);
  const connectedProviders = new Map(integrations.map((item) => [normalizeProvider(item.provider), item]));
  const connectedCount = integrationCatalog.filter((item) => connectedProviders.has(item.provider)).length;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/7 bg-[#100e0a] p-6 sm:p-8">
        <Badge>Central de Integrações</Badge>
        <div className="mt-5 grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
          <div>
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
              Conecte seus canais e comece a vender com visão total.
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--text-soft)]">
              Este é o ponto de partida da Erizon: conecte marketplaces e loja online para importar produtos, pedidos,
              estoque e pagamentos em um só lugar.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link className={buttonStyles({})} href="/onboarding">
                Ver primeiros passos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link className={buttonStyles({ variant: "secondary" })} href="/dashboard">
                Ver resultados
              </Link>
            </div>
          </div>

          <Card className="border-orange-500/15 bg-orange-500/8">
            <CardContent className="p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-orange-300">Progresso comercial</p>
              <p className="mt-3 text-4xl font-semibold text-white">
                {connectedCount}/{integrationCatalog.length}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--text-soft)]">
                canais conectados ou prontos para ativação. Comece por Mercado Livre, Shopee e site próprio.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {integrationCatalog.map((integration) => {
          const connected = connectedProviders.get(integration.provider);
          const Icon = integration.icon;
          const isConnected = Boolean(connected);

          return (
            <Card key={integration.key} className={isConnected ? "border-emerald-400/20 bg-emerald-500/5" : "bg-white/3"}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl border border-white/10 bg-white/4 p-3">
                      <Icon className="h-5 w-5 text-orange-400" />
                    </div>
                    <div>
                      <CardTitle>{integration.name}</CardTitle>
                      <CardDescription>{integration.priority}</CardDescription>
                    </div>
                  </div>
                  <span
                    className={
                      isConnected
                        ? "rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200"
                        : "rounded-full border border-amber-400/25 bg-amber-500/10 px-3 py-1 text-xs text-amber-200"
                    }
                  >
                    {isConnected ? "Conectado" : "Pendente"}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-6 text-[var(--text-soft)]">{integration.description}</p>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/7 bg-white/3 p-3">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-stone-500">
                      <RefreshCw className="h-3.5 w-3.5 text-orange-400" />
                      Sincronização
                    </div>
                    <p className="mt-2 text-sm text-white">
                      {connected?.connectedAt ? "Ativa" : "Aguardando conexão"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/7 bg-white/3 p-3">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-stone-500">
                      {isConnected ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Clock3 className="h-3.5 w-3.5 text-amber-400" />
                      )}
                      Status
                    </div>
                    <p className="mt-2 text-sm text-white">{connected?.status ?? "Pronto para conectar"}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-stone-500">Dados importados</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {integration.imported.map((item) => (
                      <span key={item} className="rounded-md border border-white/7 bg-white/3 px-2.5 py-1 text-xs text-stone-300">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <Link className={buttonStyles({ variant: isConnected ? "secondary" : "primary", size: "sm" })} href={integration.href}>
                  {isConnected ? "Gerenciar" : "Conectar"}
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
