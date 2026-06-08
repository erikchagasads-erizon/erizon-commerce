import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSystemHealth } from "@/lib/admin-data";
import { requireAppContext } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";

export default async function SystemHealthPage() {
  const context = await requireAppContext();
  const health = await getSystemHealth(context.workspace?.workspaceId ?? null);

  return (
    <div className="space-y-6">
      <section className="border border-white/7 bg-[#100e0a] rounded-2xl p-6 sm:p-8">
        <Badge>System Health</Badge>
        <h1 className="mt-5 text-3xl font-semibold sm:text-4xl">Saúde do banco, IA, integrações e jobs em um só painel.</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--text-soft)]">
          Esta visão amarra observabilidade, erros recentes e readiness de infraestrutura para reduzir surpresas em
          produção.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        {[
          { label: "Banco", value: health.databaseStatus },
          { label: "IA", value: health.aiStatus },
          { label: "Service role", value: health.serviceRoleStatus },
          { label: "Criptografia", value: health.encryptionStatus },
        ].map((item) => (
          <Card key={item.label} className="bg-white/3">
            <CardContent className="p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-500">{item.label}</p>
              <p className="mt-3 text-2xl font-semibold text-white">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr,1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Ambiente e integrações</CardTitle>
            <CardDescription>Resumo operacional das dependências críticas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl border border-white/7 bg-white/3 px-4 py-3 text-sm text-[var(--text-soft)]">
              Integrações registradas: <span className="text-white">{health.integrationCount}</span>
            </div>
            <div className="rounded-2xl border border-white/7 bg-white/3 px-4 py-3 text-sm text-[var(--text-soft)]">
              Jobs recentes: <span className="text-white">{health.jobCount}</span>
            </div>
            <div className="rounded-2xl border border-white/7 bg-white/3 px-4 py-3 text-sm text-[var(--text-soft)]">
              Variáveis críticas pendentes:{" "}
              <span className="text-white">{health.missingEnv.length > 0 ? health.missingEnv.join(", ") : "nenhuma"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Últimas sincronizações</CardTitle>
            <CardDescription>Jobs assíncronos relevantes para integrações e reconciliação.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {health.recentSyncJobs.length > 0 ? (
              health.recentSyncJobs.map((job) => (
                <div key={job.id} className="rounded-xl border border-white/7 bg-white/3 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-medium text-white">{job.provider}</p>
                    <span className="text-xs uppercase tracking-[0.16em] text-stone-500">{job.status}</span>
                  </div>
                  <p className="mt-2 text-sm text-[var(--text-soft)]">{job.jobType}</p>
                  <p className="mt-3 text-xs text-stone-600">{formatDateTime(job.createdAt)}</p>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-white/8 bg-white/3 p-6 text-sm leading-6 text-[var(--text-soft)]">
                Nenhum job de sincronização registrado ainda.
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Erros e alertas recentes</CardTitle>
          <CardDescription>Eventos auditáveis que merecem atenção do time.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {health.recentErrors.length > 0 ? (
            health.recentErrors.map((item) => (
              <div key={`${item.action}-${item.createdAt}`} className="rounded-xl border border-white/7 bg-white/3 p-4">
                <p className="text-sm font-medium text-white">{item.action}</p>
                <p className="mt-1 text-sm text-[var(--text-soft)]">{item.entityType}</p>
                <p className="mt-3 text-xs text-stone-600">{formatDateTime(item.createdAt)}</p>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-white/8 bg-white/3 p-6 text-sm leading-6 text-[var(--text-soft)]">
              Nenhum erro crítico auditado recentemente para este workspace.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

