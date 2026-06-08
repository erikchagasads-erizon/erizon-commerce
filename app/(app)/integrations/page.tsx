import Link from "next/link";
import { AlertCircle, ArrowRight, CheckCircle2, Clock3, Globe, MessageCircle, RefreshCw, ShoppingBag, Store } from "lucide-react";

import { connectStorefrontAction, syncIntegrationAction } from "@/app/(app)/integrations/actions";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getIntegrationHealth } from "@/lib/admin-data";
import { requireAppContext } from "@/lib/auth";
import { hasMercadoLivreEnv, hasShopeeEnv } from "@/lib/env";
import { formatDateTime } from "@/lib/utils";

const cards = [
  {
    connectHref: "/api/integrations/mercadolivre/connect",
    configured: hasMercadoLivreEnv,
    description: "Importe anuncios, vendas e estoque do marketplace com autorizacao da propria conta.",
    imported: ["Produtos", "Pedidos", "Estoque"],
    key: "mercado_livre",
    name: "Mercado Livre",
    priority: "Passo 1",
    syncProvider: "mercado_livre",
    type: "marketplace",
    icon: Store,
  },
  {
    connectHref: "/api/integrations/shopee/connect",
    configured: hasShopeeEnv,
    description: "Centralize catalogo, pedidos e disponibilidade da sua loja Shopee.",
    imported: ["Produtos", "Pedidos", "Estoque"],
    key: "shopee",
    name: "Shopee",
    priority: "Passo 2",
    syncProvider: "shopee",
    type: "marketplace",
    icon: ShoppingBag,
  },
] as const;

function normalizeProvider(value: string) {
  return value.toLowerCase().replaceAll(" ", "_").replaceAll("-", "_");
}

function statusLabel(status?: string | null) {
  if (status === "connected") return "Conectado";
  if (status === "error") return "Erro";
  if (status === "connecting") return "Conectando";
  return "Nao conectado";
}

function StatusPill({ status }: { status?: string | null }) {
  const label = statusLabel(status);
  const tone =
    status === "connected"
      ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-200"
      : status === "error"
        ? "border-red-400/25 bg-red-500/10 text-red-200"
        : "border-amber-400/25 bg-amber-500/10 text-amber-200";

  return <span className={`rounded-full border px-3 py-1 text-xs ${tone}`}>{label}</span>;
}

export default async function IntegrationsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const context = await requireAppContext();
  const params = (await searchParams) ?? {};
  const integrations = await getIntegrationHealth(context.workspace?.workspaceId ?? null);
  const byProvider = new Map<string, (typeof integrations)[number]>();

  for (const integration of integrations) {
    const key = normalizeProvider(integration.provider);
    const current = byProvider.get(key);

    if (!current || current.status === "connecting" || integration.status === "connected") {
      byProvider.set(key, integration);
    }
  }
  const storefront = byProvider.get("storefront") ?? byProvider.get("site_proprio");
  const connectedCount = [byProvider.get("mercado_livre"), byProvider.get("shopee"), storefront].filter(
    (item) => item?.status === "connected",
  ).length;
  const status = typeof params.status === "string" ? params.status : null;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/7 bg-[#100e0a] p-6 sm:p-8">
        <Badge>Central de Integracoes</Badge>
        <div className="mt-5 grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
          <div>
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
              Conecte seus canais e importe dados reais para a Erizon.
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--text-soft)]">
              Comece por Mercado Livre, Shopee e site proprio. Depois da conexao, produtos, pedidos e estoque aparecem no painel.
            </p>
          </div>

          <Card className="border-orange-500/15 bg-orange-500/8">
            <CardContent className="p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-orange-300">Canais ativos</p>
              <p className="mt-3 text-4xl font-semibold text-white">{connectedCount}/3</p>
              <p className="mt-2 text-sm leading-6 text-[var(--text-soft)]">
                canais conectados com importacao real de dados comerciais.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {status === "missing_config" ? (
        <div className="flex items-start gap-3 rounded-xl border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-100">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Esta conexao ainda precisa ser ativada pelo administrador. Depois da ativacao, o botao conectara sua conta
            diretamente ao canal escolhido.
          </p>
        </div>
      ) : null}

      {status === "connect_error" ? (
        <div className="flex items-start gap-3 rounded-xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-100">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>Nao conseguimos conectar agora. Tente novamente ou peca ao administrador para revisar a ativacao do canal.</p>
        </div>
      ) : null}

      {status === "connected" ? (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <p>Conta conectada. A Erizon iniciou a importacao de produtos, pedidos e estoque.</p>
        </div>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-3">
        {cards.map((card) => {
          const integration = byProvider.get(card.key);
          const Icon = card.icon;
          const connected = integration?.status === "connected";

          return (
            <Card key={card.key} className={connected ? "border-emerald-400/20 bg-emerald-500/5" : "bg-white/3"}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl border border-white/10 bg-white/4 p-3">
                      <Icon className="h-5 w-5 text-orange-400" />
                    </div>
                    <div>
                      <CardTitle>{card.name}</CardTitle>
                      <CardDescription>{card.priority}</CardDescription>
                    </div>
                  </div>
                  <StatusPill status={integration?.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-6 text-[var(--text-soft)]">{card.description}</p>

                {!card.configured ? (
                  <div className="rounded-xl border border-amber-400/20 bg-amber-500/10 p-3 text-sm leading-6 text-amber-100">
                    Canal aguardando ativacao pelo administrador.
                  </div>
                ) : null}

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/7 bg-white/3 p-3">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-stone-500">
                      <RefreshCw className="h-3.5 w-3.5 text-orange-400" />
                      Importacao
                    </div>
                    <p className="mt-2 text-sm text-white">
                      {integration?.lastSyncAt ? formatDateTime(integration.lastSyncAt) : "Ainda nao importou"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/7 bg-white/3 p-3">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-stone-500">
                      {connected ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Clock3 className="h-3.5 w-3.5 text-amber-400" />
                      )}
                      Conta
                    </div>
                    <p className="mt-2 text-sm text-white">{integration?.name ?? "Aguardando conexao"}</p>
                  </div>
                </div>

                {integration?.lastError ? (
                  <p className="rounded-lg border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-100">
                    Nao conseguimos importar os dados. Tente novamente.
                  </p>
                ) : null}

                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-stone-500">Dados importados</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {card.imported.map((item) => (
                      <span key={item} className="rounded-md border border-white/7 bg-white/3 px-2.5 py-1 text-xs text-stone-300">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {connected && integration ? (
                    <form action={syncIntegrationAction}>
                      <input name="provider" type="hidden" value={card.syncProvider} />
                      <input name="id" type="hidden" value={integration.id} />
                      <button className={buttonStyles({ size: "sm", variant: "secondary" })} type="submit">
                        Sincronizar
                      </button>
                    </form>
                  ) : (
                    <Link
                      aria-disabled={!card.configured}
                      className={buttonStyles({
                        className: !card.configured ? "pointer-events-none opacity-50" : "",
                        size: "sm",
                      })}
                      href={card.configured ? card.connectHref : "/integrations?status=missing_config"}
                    >
                      Conectar conta
                    </Link>
                  )}
                  <Link className={buttonStyles({ size: "sm", variant: "ghost" })} href={connected ? "/dashboard" : "/onboarding"}>
                    {connected ? "Ver resultados" : "Ver primeiros passos"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}

        <Card className={storefront?.status === "connected" ? "border-emerald-400/20 bg-emerald-500/5" : "bg-white/3"}>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-white/10 bg-white/4 p-3">
                  <Globe className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <CardTitle>Site proprio</CardTitle>
                  <CardDescription>Passo 3</CardDescription>
                </div>
              </div>
              <StatusPill status={storefront?.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-6 text-[var(--text-soft)]">
              Conecte WooCommerce ou uma loja com endpoints de produtos e pedidos para importar dados comerciais.
            </p>

            {storefront?.status === "connected" ? (
              <form action={syncIntegrationAction} className="space-y-3">
                <input name="provider" type="hidden" value="storefront" />
                <input name="id" type="hidden" value={storefront.id} />
                <div className="rounded-xl border border-white/7 bg-white/3 p-3 text-sm text-white">
                  {storefront.name} conectado. Ultima importacao:{" "}
                  {storefront.lastSyncAt ? formatDateTime(storefront.lastSyncAt) : "ainda nao importou"}
                </div>
                <button className={buttonStyles({ size: "sm", variant: "secondary" })} type="submit">
                  Sincronizar
                </button>
              </form>
            ) : (
              <form action={connectStorefrontAction} className="space-y-3">
                <Input name="storeName" placeholder="Nome da loja" />
                <Input name="storeUrl" placeholder="https://sualoja.com.br" required type="url" />
                <select
                  className="h-10 w-full rounded-lg border border-white/7 bg-[#16130f] px-3.5 text-sm text-white outline-none"
                  name="platform"
                >
                  <option value="woocommerce">WooCommerce</option>
                  <option value="custom">Loja personalizada</option>
                  <option value="shopify">Shopify</option>
                </select>
                <Input name="publicKey" placeholder="Chave de acesso" required />
                <Input name="secretKey" placeholder="Chave secreta" required type="password" />
                <button className={buttonStyles({ size: "sm" })} type="submit">
                  Conectar loja
                </button>
              </form>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/3">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-white/10 bg-white/4 p-3">
                  <MessageCircle className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <CardTitle>WhatsApp</CardTitle>
                  <CardDescription>Atendimento</CardDescription>
                </div>
              </div>
              <StatusPill />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-6 text-[var(--text-soft)]">
              Canal reservado para atendimento e notificacoes comerciais. A ativacao fica com o administrador.
            </p>
            <button className={buttonStyles({ className: "opacity-50", size: "sm", variant: "secondary" })} disabled type="button">
              Aguardando ativacao
            </button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
