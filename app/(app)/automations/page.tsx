import { ModulePage } from "@/components/modules/module-page";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAppContext } from "@/lib/auth";
import { moduleDefinitions } from "@/lib/modules";
import { getAutomationSnapshot } from "@/lib/platform-data";
import { formatDateTime } from "@/lib/utils";

const starterPlaybooks = [
  "SE estoque menor que 10 ENTAO notificar usuario, gerar cotacao e sugerir compra.",
  "SE margem menor que 15% ENTAO acionar Pricing Agent com contexto do SKU e do canal.",
  "SE faturamento cair 20% ENTAO acionar Growth Agent e abrir plano de investigacao.",
];

export default async function AutomationsPage() {
  const context = await requireAppContext();
  const snapshot = await getAutomationSnapshot(context.workspace?.workspaceId ?? null);

  return (
    <div className="space-y-6">
      <ModulePage module={moduleDefinitions.automations} />

      <section className="grid gap-4 lg:grid-cols-4">
        {[
          { hint: "Regras persistidas no workspace.", label: "Regras", value: String(snapshot.ruleCount) },
          { hint: "Automacoes prontas para disparo.", label: "Regras ativas", value: String(snapshot.enabledRuleCount) },
          { hint: "Historico executado com payload e status.", label: "Execucoes", value: String(snapshot.runCount) },
          { hint: "Falhas que merecem revisao de condicao ou acao.", label: "Falhas", value: String(snapshot.failedRunCount) },
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
            <CardTitle>Regras do workspace</CardTitle>
            <CardDescription>Back-end pronto para um editor visual de automacao, sem prender a logica na interface.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {snapshot.rules.length > 0 ? (
              snapshot.rules.map((rule) => (
                <div key={`${rule.name}-${rule.updatedAt}`} className="rounded-[24px] border border-white/8 bg-slate-950/40 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-white">{rule.name}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">
                        {rule.triggerType} • {rule.sourceModule ?? "sem modulo"}
                      </p>
                    </div>
                    <span className="text-xs uppercase tracking-[0.16em] text-slate-300">
                      {rule.enabled ? "ativa" : "pausada"}
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-slate-500">Atualizada em {formatDateTime(rule.updatedAt)}</p>
                </div>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-white/12 bg-slate-950/40 p-6 text-sm leading-6 text-[var(--text-soft)]">
                Nenhuma regra criada ainda. Use os playbooks ao lado como ponto de partida para colocar o motor de automacao em producao.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Playbooks iniciais</CardTitle>
            <CardDescription>Trilhas recomendadas para iniciar com impacto real e baixo risco.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {starterPlaybooks.map((playbook) => (
              <div key={playbook} className="rounded-2xl border border-white/8 bg-slate-950/40 px-4 py-3 text-sm leading-6 text-[var(--text-soft)]">
                {playbook}
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Ultimas execucoes</CardTitle>
          <CardDescription>Cada disparo fica auditavel para que o time entenda o gatilho, a acao e o resultado.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {snapshot.recentRuns.length > 0 ? (
            snapshot.recentRuns.map((run) => (
              <div key={`${run.ruleName}-${run.startedAt}`} className="rounded-[24px] border border-white/8 bg-slate-950/40 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-white">{run.ruleName}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">{run.status}</p>
                  </div>
                  <p className="text-xs text-slate-500">Inicio {formatDateTime(run.startedAt)}</p>
                </div>
                <p className="mt-3 text-sm leading-6 text-[var(--text-soft)]">
                  {run.completedAt ? `Concluida em ${formatDateTime(run.completedAt)}` : "Execucao ainda aberta ou aguardando confirmacao humana."}
                </p>
              </div>
            ))
          ) : (
            <div className="rounded-[24px] border border-dashed border-white/12 bg-slate-950/40 p-6 text-sm leading-6 text-[var(--text-soft)]">
              Nenhuma execucao registrada ainda. Assim que as regras passarem a reagir ao Event Bus, o historico comecara a aparecer aqui.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
