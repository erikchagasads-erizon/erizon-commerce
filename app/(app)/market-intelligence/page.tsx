import { ModulePage } from "@/components/modules/module-page";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAppContext } from "@/lib/auth";
import { moduleDefinitions } from "@/lib/modules";
import { getMarketIntelligenceSnapshot } from "@/lib/platform-data";
import { formatDateTime } from "@/lib/utils";

export default async function MarketIntelligencePage() {
  const context = await requireAppContext();
  const snapshot = await getMarketIntelligenceSnapshot(context.workspace?.workspaceId ?? null);

  return (
    <div className="space-y-6">
      <ModulePage module={moduleDefinitions["market-intelligence"]} />

      <section className="grid gap-4 lg:grid-cols-4">
        {[
          { hint: "Fontes estrategicas monitoradas pelo modulo.", label: "Fontes alvo", value: String(snapshot.sourceCount) },
          { hint: "Sinais de crescimento, queda ou nicho.", label: "Sinais", value: String(snapshot.signalCount) },
          { hint: "Acoes sugeridas para mix, canal e investimento.", label: "Recomendacoes", value: String(snapshot.recommendationCount) },
          { hint: "Concorrentes relevantes em observacao.", label: "Concorrentes", value: String(snapshot.competitorCount) },
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
            <CardTitle>Sinais recentes de mercado</CardTitle>
            <CardDescription>Use estes sinais para cruzar tendencia externa com margem, capacidade e estoque interno.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {snapshot.signals.length > 0 ? (
              snapshot.signals.map((signal) => (
                <div key={`${signal.source}-${signal.signalType}-${signal.observedAt}`} className="rounded-[24px] border border-white/8 bg-slate-950/40 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-white">{signal.productName ?? signal.signalType}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">
                        {signal.source} • {signal.direction}
                      </p>
                    </div>
                    <span className="text-sm text-white">{signal.score !== null ? signal.score.toFixed(1) : "sem score"}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[var(--text-soft)]">{signal.summary ?? "Sem resumo detalhado."}</p>
                  <p className="mt-2 text-xs text-slate-500">{formatDateTime(signal.observedAt)}</p>
                </div>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-white/12 bg-slate-950/40 p-6 text-sm leading-6 text-[var(--text-soft)]">
                Nenhum sinal consolidado ainda. Aplique a migracao e comece a registrar tendencias por fonte, categoria e produto.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recomendacoes acionaveis</CardTitle>
            <CardDescription>Leve os sinais mais fortes para decisões de crescimento, preço e compra.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {snapshot.recommendations.length > 0 ? (
              snapshot.recommendations.map((recommendation) => (
                <div key={recommendation.title} className="rounded-[24px] border border-white/8 bg-slate-950/40 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-white">{recommendation.title}</p>
                    <span className="text-xs uppercase tracking-[0.16em] text-slate-300">{recommendation.priority}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[var(--text-soft)]">{recommendation.summary}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    {recommendation.status} •{" "}
                    {recommendation.confidence !== null ? `${Math.round(Number(recommendation.confidence) * 100)}% de confianca` : "confianca nao calculada"}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-white/12 bg-slate-950/40 p-6 text-sm leading-6 text-[var(--text-soft)]">
                Nenhuma recomendacao publicada ainda. Assim que os sinais entrarem, esta area passa a priorizar oportunidades e riscos por marketplace, produto e nicho.
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Watchlist competitiva</CardTitle>
          <CardDescription>Concorrentes relevantes merecem monitoramento explicito, nao apenas observacao difusa.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {snapshot.competitors.length > 0 ? (
            snapshot.competitors.map((competitor) => (
              <div key={`${competitor.competitorName}-${competitor.source}`} className="rounded-[24px] border border-white/8 bg-slate-950/40 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-white">{competitor.competitorName}</p>
                  <span className="text-xs uppercase tracking-[0.16em] text-slate-300">{competitor.threatLevel}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-[var(--text-soft)]">
                  {competitor.source} • {competitor.category ?? "categoria nao informada"}
                </p>
              </div>
            ))
          ) : (
            <div className="rounded-[24px] border border-dashed border-white/12 bg-slate-950/40 p-6 text-sm leading-6 text-[var(--text-soft)]">
              Nenhum concorrente salvo ainda. Monte uma watchlist enxuta dos players que realmente impactam mix, margem e share de canal.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
