import { ModulePage } from "@/components/modules/module-page";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAppContext } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";
import { moduleDefinitions } from "@/lib/modules";
import { getDataCloudSnapshot } from "@/lib/platform-data";

export default async function DataCloudPage() {
  const context = await requireAppContext();
  const snapshot = await getDataCloudSnapshot(context.workspace?.workspaceId ?? null);
  const activeSourceCount = snapshot.sourceCoverage.filter((source) => source.count > 0).length;

  return (
    <div className="space-y-6">
      <ModulePage module={moduleDefinitions["data-cloud"]} />

      <section className="grid gap-4 lg:grid-cols-4">
        {[
          { hint: "Fontes com sinais reais no workspace.", label: "Fontes ativas", value: `${activeSourceCount}/${snapshot.sourceCoverage.length || 9}` },
          { hint: "Snapshots publicados no warehouse operacional.", label: "Metricas unificadas", value: String(snapshot.metricCount) },
          { hint: "Core executivo padrao do ERIZON.", label: "Indicadores executivos", value: String(snapshot.executiveIndicatorCount) },
          { hint: "Modelos com training/scoring persistido.", label: "Modelos preditivos", value: String(snapshot.predictiveModelCount) },
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
            <CardTitle>Fontes priorizadas do Data Cloud</CardTitle>
            <CardDescription>Centralize primeiro as trilhas que alimentam decisao, automacao e agentes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {snapshot.sourceCoverage.map((source) => (
              <div key={source.label} className="rounded-[24px] border border-white/8 bg-slate-950/40 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-white">{source.label}</p>
                  <span className="text-xs uppercase tracking-[0.16em] text-slate-400">{source.count} registros</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--text-soft)]">{source.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Metricas recentes</CardTitle>
            <CardDescription>As metricas unificadas passam a virar o contexto principal do Executive Center e dos agentes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {snapshot.latestMetrics.length > 0 ? (
              snapshot.latestMetrics.map((metric) => (
                <div key={`${metric.metricKey}-${metric.observedAt}`} className="rounded-[24px] border border-white/8 bg-slate-950/40 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-white">{metric.metricLabel}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">{metric.metricKey}</p>
                    </div>
                    <span className="text-sm text-white">
                      {metric.valueNumeric !== null ? Number(metric.valueNumeric).toLocaleString("pt-BR") : "sem valor"}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[var(--text-soft)]">
                    Fontes: {metric.sourceSystems.length > 0 ? metric.sourceSystems.join(", ") : "nao informado"}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    {metric.trendDirection ?? "sem tendencia"} • {formatDateTime(metric.observedAt)}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-white/12 bg-slate-950/40 p-6 text-sm leading-6 text-[var(--text-soft)]">
                Nenhum snapshot metrico consolidado ainda. Aplique a nova migracao e comece a publicar snapshots por fonte.
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Modelos preditivos priorizados</CardTitle>
          <CardDescription>Use o Data Cloud para antecipar ruptura, queda de faturamento, risco de churn e oportunidades de canal.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {snapshot.predictiveModels.length > 0 ? (
            snapshot.predictiveModels.map((model) => (
              <div key={model.modelKey} className="rounded-[24px] border border-white/8 bg-slate-950/40 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-white">{model.modelName}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">{model.modelKey}</p>
                  </div>
                  <span className="text-xs uppercase tracking-[0.16em] text-slate-300">{model.status}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-[var(--text-soft)]">
                  Horizonte: {model.horizon ?? "nao definido"} • Confianca:{" "}
                  {model.confidence !== null ? `${Math.round(Number(model.confidence) * 100)}%` : "nao calculada"}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  {model.lastScoredAt ? `Ultimo scoring ${formatDateTime(model.lastScoredAt)}` : "Ainda sem scoring registrado"}
                </p>
              </div>
            ))
          ) : (
            <div className="rounded-[24px] border border-dashed border-white/12 bg-slate-950/40 p-6 text-sm leading-6 text-[var(--text-soft)]">
              Nenhum modelo salvo ainda. A estrutura ja esta pronta para registrar versoes, horizonte e confianca de previsao.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
