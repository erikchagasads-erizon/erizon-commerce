import { ModulePage } from "@/components/modules/module-page";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAppContext } from "@/lib/auth";
import { moduleDefinitions } from "@/lib/modules";
import { getEventBusSnapshot } from "@/lib/platform-data";
import { formatDateTime } from "@/lib/utils";

export default async function EventBusPage() {
  const context = await requireAppContext();
  const snapshot = await getEventBusSnapshot(context.workspace?.workspaceId ?? null);

  return (
    <div className="space-y-6">
      <ModulePage module={moduleDefinitions["event-bus"]} />

      <section className="grid gap-4 lg:grid-cols-4">
        {[
          { hint: "Historico bruto de eventos operacionais.", label: "Eventos", value: String(snapshot.eventCount) },
          { hint: "Destinos ativos para distribuicao.", label: "Webhooks", value: String(snapshot.subscriptionCount) },
          { hint: "Reacoes conectadas ao barramento.", label: "Triggers", value: String(snapshot.triggerCount) },
          { hint: "Entregas pendentes ou em retry.", label: "Fila de entrega", value: String(snapshot.queuedDeliveryCount) },
        ].map((item) => (
          <Card key={item.label} className="bg-white/5">
            <CardContent className="p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
              <p className="mt-3 text-2xl font-semibold text-white">{item.value}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--text-soft)]">{item.hint}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle>Event log recente</CardTitle>
            <CardDescription>Monitore o que o negocio esta emitindo em tempo real e quais modulos ainda estao silenciosos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {snapshot.recentEvents.length > 0 ? (
              snapshot.recentEvents.map((event) => (
                <div key={`${event.eventName}-${event.occurredAt}`} className="rounded-[24px] border border-white/8 bg-slate-950/40 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-white">{event.eventName}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">
                        {event.sourceModule} • {event.aggregateType}
                      </p>
                    </div>
                    <span className="text-xs uppercase tracking-[0.16em] text-slate-300">{event.status}</span>
                  </div>
                  <p className="mt-3 text-xs text-slate-500">{formatDateTime(event.occurredAt)}</p>
                </div>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-white/12 bg-slate-950/40 p-6 text-sm leading-6 text-[var(--text-soft)]">
                Nenhum evento registrado ainda. Assim que os modulos comecarem a publicar sinais, este log vira a trilha principal de auditoria e reacao.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Webhooks e destinos</CardTitle>
            <CardDescription>Todo evento pode alimentar sistemas externos, notificacoes internas ou automacoes do proprio ERIZON.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {snapshot.subscriptions.length > 0 ? (
              snapshot.subscriptions.map((subscription, index) => (
                <div key={`${subscription.targetType}-${index}`} className="rounded-[24px] border border-white/8 bg-slate-950/40 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-white">{subscription.endpointUrl ?? subscription.targetType}</p>
                    <span className="text-xs uppercase tracking-[0.16em] text-slate-300">{subscription.status}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[var(--text-soft)]">
                    Eventos: {subscription.subscribedEvents.length > 0 ? subscription.subscribedEvents.join(", ") : "todos"}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    {subscription.lastDeliveryAt ? `Ultima entrega ${formatDateTime(subscription.lastDeliveryAt)}` : "Sem entregas registradas"}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-white/12 bg-slate-950/40 p-6 text-sm leading-6 text-[var(--text-soft)]">
                Nenhum destino configurado ainda. Cadastre webhooks para integrar parceiros, mobile e ferramentas de monitoramento.
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle>Triggers ativos</CardTitle>
            <CardDescription>Regras de reacao imediata para agentes, automacoes, alertas e aprovacoes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {snapshot.triggers.length > 0 ? (
              snapshot.triggers.map((trigger) => (
                <div key={`${trigger.name}-${trigger.eventName}`} className="rounded-[24px] border border-white/8 bg-slate-950/40 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-white">{trigger.name}</p>
                    <span className="text-xs uppercase tracking-[0.16em] text-slate-300">{trigger.status}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[var(--text-soft)]">
                    Evento: {trigger.eventName} • Destino: {trigger.targetType}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-white/12 bg-slate-950/40 p-6 text-sm leading-6 text-[var(--text-soft)]">
                Nenhum trigger salvo ainda. Comece por estoque baixo, margem comprimida e queda de faturamento.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Confiabilidade do barramento</CardTitle>
            <CardDescription>Um evento nunca deve sumir. Se a entrega falha, ele continua audivel, rastreavel e reprocessavel.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              `Falhas de entrega registradas: ${snapshot.failedDeliveryCount}`,
              `Itens em fila ou retry: ${snapshot.queuedDeliveryCount}`,
              "Webhooks, notificacoes e triggers compartilham o mesmo event store.",
              "Agentes podem reagir a eventos sem depender apenas de consultas sob demanda.",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/8 bg-slate-950/40 px-4 py-3 text-sm leading-6 text-[var(--text-soft)]">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
