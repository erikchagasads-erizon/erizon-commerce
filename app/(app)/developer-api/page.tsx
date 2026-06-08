import { KeyRound } from "lucide-react";

import { ApiKeyForm } from "@/components/admin/api-key-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { revokeApiKeyAction } from "@/app/(app)/workspace-admin-actions";
import { getWorkspaceApiKeys } from "@/lib/admin-data";
import { requireAppContext } from "@/lib/auth";
import { requireWorkspaceRoles } from "@/lib/permissions";
import { formatDateTime } from "@/lib/utils";

export default async function DeveloperApiPage() {
  const context = await requireAppContext();
  requireWorkspaceRoles(context, ["owner", "admin"]);

  const apiKeys = await getWorkspaceApiKeys(context.workspace?.workspaceId ?? null);

  return (
    <div className="space-y-6">
      <section className="border border-white/7 bg-[#100e0a] rounded-2xl p-6 sm:p-8">
        <Badge>Public API</Badge>
        <h1 className="mt-5 text-3xl font-semibold sm:text-4xl">API pública preparada por workspace, chave e permissão.</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--text-soft)]">
          A base já suporta API keys isoladas por workspace, permissões por recurso, rate limit, logs de uso e endpoints
          iniciais para produtos, pedidos, estoque, financeiro, fornecedores e insights de IA.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr,1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-orange-400" />
              Emitir nova chave
            </CardTitle>
            <CardDescription>A chave aparece uma única vez e o valor persistido fica hashado no backend.</CardDescription>
          </CardHeader>
          <CardContent>
            <ApiKeyForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Princípios de segurança</CardTitle>
            <CardDescription>O desenho já nasce com isolamento e governança.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              "Hash da API key armazenado no banco, nunca o valor completo.",
              "Rate limit por chave para proteger a superfície pública.",
              "Permissões explícitas por recurso para reduzir blast radius.",
              "Workspace sempre validado no backend antes da consulta.",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/7 bg-white/3 px-4 py-3 text-sm leading-6 text-[var(--text-soft)]">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Chaves emitidas</CardTitle>
            <CardDescription>Gerencie o ciclo de vida das chaves do workspace.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {apiKeys.length > 0 ? (
              apiKeys.map((apiKey) => (
                <div key={apiKey.id} className="rounded-xl border border-white/7 bg-white/3 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-white">{apiKey.label}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-stone-500">
                        Prefixo {apiKey.keyPrefix} • {apiKey.status}
                      </p>
                    </div>
                    <form action={revokeApiKeyAction}>
                      <input name="apiKeyId" type="hidden" value={apiKey.id} />
                      <Button size="sm" variant="secondary" type="submit">
                        Revogar
                      </Button>
                    </form>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {apiKey.permissions.map((permission) => (
                      <span key={permission} className="rounded-md border border-white/7 bg-white/3 px-2.5 py-1 text-xs text-stone-400">
                        {permission}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-stone-600">
                    Criada em {formatDateTime(apiKey.createdAt)}
                    {apiKey.lastUsedAt ? ` • Último uso ${formatDateTime(apiKey.lastUsedAt)}` : " • Ainda não utilizada"}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-white/8 bg-white/3 p-6 text-sm leading-6 text-[var(--text-soft)]">
                Nenhuma chave emitida ainda. Gere a primeira API key para parceiros, BI ou integrações proprietárias.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Endpoints iniciais</CardTitle>
            <CardDescription>Estrutura já preparada na primeira versão da API pública.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              "GET /api/public/v1/products",
              "GET /api/public/v1/orders",
              "GET /api/public/v1/stock",
              "GET /api/public/v1/finance",
              "GET /api/public/v1/suppliers",
              "GET /api/public/v1/insights",
            ].map((endpoint) => (
              <div key={endpoint} className="rounded-2xl border border-white/7 bg-white/3 px-4 py-3 font-mono text-sm text-stone-300">
                {endpoint}
              </div>
            ))}
            <div className="rounded-2xl border border-white/7 bg-white/3 px-4 py-3 text-sm leading-6 text-[var(--text-soft)]">
              Use <code>Authorization: Bearer &lt;API_KEY&gt;</code> para autenticar cada chamada.
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
