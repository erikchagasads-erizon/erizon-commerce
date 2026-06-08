import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getWorkspaceBilling } from "@/lib/admin-data";
import { getPlanDefinition, getWorkspaceSubscription, getWorkspaceUsage } from "@/lib/billing";
import { requireAppContext } from "@/lib/auth";
import { requireWorkspaceRoles } from "@/lib/permissions";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export default async function BillingPage() {
  const context = await requireAppContext();
  requireWorkspaceRoles(context, ["owner", "admin", "finance"]);

  const [subscription, usage, payments] = await Promise.all([
    getWorkspaceSubscription(context.workspace?.workspaceId ?? null),
    getWorkspaceUsage(context.workspace?.workspaceId ?? null),
    getWorkspaceBilling(context.workspace?.workspaceId ?? null),
  ]);
  const plan = getPlanDefinition(subscription.planCode);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/7 bg-[#100e0a] p-6 sm:p-8">
        <Badge>Assinatura</Badge>
        <h1 className="mt-5 text-3xl font-semibold sm:text-4xl">Plano, uso e pagamentos da empresa.</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--text-soft)]">
          Acompanhe o plano atual, o volume de uso e o histórico financeiro de forma simples.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle>Plano atual</CardTitle>
            <CardDescription>Status da assinatura e benefícios ativos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-white/7 bg-white/3 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-orange-400">{plan.name}</p>
              <p className="mt-3 text-2xl font-semibold text-white">{subscription.status}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--text-soft)]">{plan.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {plan.features.map((feature) => (
                  <span key={feature} className="rounded-md border border-white/7 bg-white/3 px-2.5 py-1 text-xs text-stone-400">
                    {feature}
                  </span>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link className={buttonStyles({})} href="/upgrade">
                  Ver upgrades
                </Link>
                <Link className={buttonStyles({ variant: "secondary" })} href="/integrations">
                  Ver integrações
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Uso da empresa</CardTitle>
            <CardDescription>Leitura real para orientar upgrade antes de limitar a operação.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {[
              { label: "Produtos", value: String(usage.products), limit: plan.limits.maxProducts },
              { label: "Pedidos no mês", value: String(usage.ordersThisMonth), limit: plan.limits.maxOrdersPerMonth },
              { label: "Marketplaces conectados", value: String(usage.connectedMarketplaces), limit: plan.limits.marketPlaces },
              { label: "Perguntas para IA", value: String(usage.aiMessagesThisMonth), limit: plan.limits.aiMessagesPerMonth },
            ].map((metric) => (
              <div key={metric.label} className="rounded-xl border border-white/7 bg-white/3 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-stone-500">{metric.label}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{metric.value}</p>
                <p className="mt-2 text-sm text-[var(--text-soft)]">
                  Limite atual: {metric.limit === null ? "ilimitado" : metric.limit}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de pagamentos</CardTitle>
          <CardDescription>Quando houver cobranças, elas aparecem aqui.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {payments.length > 0 ? (
            payments.map((payment) => (
              <div key={payment.id} className="flex flex-col gap-3 rounded-xl border border-white/7 bg-white/3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{payment.provider}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-stone-500">{payment.status}</p>
                </div>
                <div className="text-sm text-[var(--text-soft)]">{formatDateTime(payment.createdAt)}</div>
                <div className="text-base font-medium text-white">{formatCurrency(payment.amount)}</div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-white/8 bg-white/3 p-6 text-sm leading-6 text-[var(--text-soft)]">
              Nenhum pagamento registrado ainda.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
