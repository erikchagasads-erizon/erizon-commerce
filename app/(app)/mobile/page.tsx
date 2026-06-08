import { ModulePage } from "@/components/modules/module-page";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAppContext } from "@/lib/auth";
import { moduleDefinitions } from "@/lib/modules";
import { getMobileReadinessSnapshot } from "@/lib/platform-data";
import { formatDateTime } from "@/lib/utils";

const mobileSurfaceMap = [
  "Dashboard executivo com leitura de receita, lucro, CAC, ROI e alertas prioritarios.",
  "Aprovacoes para compra, preco, campanha e automacoes com necessidade de confirmacao humana.",
  "Pedidos, estoque e financeiro com foco em consulta rapida e acao imediata.",
  "ERIZON Copilot e chat IA aproveitando o mesmo contexto do workspace e do Data Cloud.",
];

export default async function MobilePage() {
  const context = await requireAppContext();
  const snapshot = await getMobileReadinessSnapshot(context.workspace?.workspaceId ?? null);

  return (
    <div className="space-y-6">
      <ModulePage module={moduleDefinitions.mobile} />

      <section className="grid gap-4 lg:grid-cols-4">
        {[
          { hint: "Dispositivos registrados para o workspace.", label: "Dispositivos", value: String(snapshot.deviceCount) },
          { hint: "Dispositivos habilitados para receber alertas.", label: "Push ativo", value: String(snapshot.pushEnabledCount) },
          { hint: "Itens aguardando resposta em mobilidade.", label: "Aprovacoes pendentes", value: String(snapshot.pendingApprovalCount) },
          { hint: "Chaves ativas para apps, parceiros ou middleware mobile.", label: "API keys ativas", value: String(snapshot.apiKeyCount) },
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

      <section className="grid gap-6 xl:grid-cols-[1fr,1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Readiness para React Native</CardTitle>
            <CardDescription>Os contratos certos ja existem no core para evitar um backend paralelo so para mobile.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {mobileSurfaceMap.map((item) => (
              <div key={item} className="rounded-2xl border border-white/8 bg-slate-950/40 px-4 py-3 text-sm leading-6 text-[var(--text-soft)]">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dispositivos recentes</CardTitle>
            <CardDescription>Visibilidade inicial sobre plataforma, versao e atividade mobile do workspace.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {snapshot.devices.length > 0 ? (
              snapshot.devices.map((device) => (
                <div key={`${device.platform}-${device.lastSeenAt}`} className="rounded-[24px] border border-white/8 bg-slate-950/40 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-white">{device.platform}</p>
                    <span className="text-xs uppercase tracking-[0.16em] text-slate-300">
                      {device.pushEnabled ? "push ativo" : "push desativado"}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[var(--text-soft)]">Versao do app: {device.appVersion ?? "nao informada"}</p>
                  <p className="mt-2 text-xs text-slate-500">Ultimo acesso {formatDateTime(device.lastSeenAt)}</p>
                </div>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-white/12 bg-slate-950/40 p-6 text-sm leading-6 text-[var(--text-soft)]">
                Nenhum dispositivo registrado ainda. Aplique a nova migracao para acompanhar presenca mobile, push e health de versoes.
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Fila de aprovacoes</CardTitle>
          <CardDescription>Fluxos mobile relevantes devem priorizar poucas decisoes de alto impacto, com contexto suficiente para aprovar rapido.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {snapshot.approvalRequests.length > 0 ? (
            snapshot.approvalRequests.map((request) => (
              <div key={`${request.title}-${request.requestedAt}`} className="rounded-[24px] border border-white/8 bg-slate-950/40 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-white">{request.title}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">{request.requestType}</p>
                  </div>
                  <span className="text-xs uppercase tracking-[0.16em] text-slate-300">{request.status}</span>
                </div>
                <p className="mt-3 text-xs text-slate-500">Solicitada em {formatDateTime(request.requestedAt)}</p>
              </div>
            ))
          ) : (
            <div className="rounded-[24px] border border-dashed border-white/12 bg-slate-950/40 p-6 text-sm leading-6 text-[var(--text-soft)]">
              Nenhuma aprovacao registrada ainda. O fluxo ja esta preparado para compras, mudancas de preco, campanhas e automacoes sensiveis.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
