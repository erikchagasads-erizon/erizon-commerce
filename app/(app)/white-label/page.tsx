import { Eye, Globe2, Palette } from "lucide-react";

import { WhiteLabelForm } from "@/components/admin/white-label-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getWorkspaceBranding } from "@/lib/admin-data";
import { env } from "@/lib/env";
import { requireAppContext } from "@/lib/auth";
import { requireWorkspaceRoles } from "@/lib/permissions";

export default async function WhiteLabelPage() {
  const context = await requireAppContext();
  requireWorkspaceRoles(context, ["owner", "admin"]);

  const branding = await getWorkspaceBranding(context.workspace?.workspaceId ?? null, context.workspace?.slug ?? null);
  const previewHost = branding.customDomain || `${branding.subdomain || context.workspace?.slug || "preview"}.${env.NEXT_PUBLIC_ROOT_DOMAIN}`;

  return (
    <div className="space-y-6">
      <section className="border border-white/7 bg-[#100e0a] rounded-2xl p-6 sm:p-8">
        <Badge>White Label</Badge>
        <h1 className="mt-5 text-3xl font-semibold sm:text-4xl">Personalize marca, preview e domínio sem travar a operação.</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--text-soft)]">
          Se o domínio ainda não estiver validado, o preview interno continua disponível. Quando o domínio próprio entrar,
          a identidade completa pode assumir login, favicon, nome e comunicação visual.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr,1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-orange-400" />
              Configuração da identidade
            </CardTitle>
            <CardDescription>White label com preview interno, sem bloquear o workspace enquanto o domínio amadurece.</CardDescription>
          </CardHeader>
          <CardContent>
            <WhiteLabelForm branding={branding} />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-orange-400" />
                Preview do ambiente
              </CardTitle>
              <CardDescription>Visualização interna para validar como o cliente verá a marca.</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="rounded-2xl border border-white/7 p-6"
                style={{
                  background: `linear-gradient(135deg, ${branding.primaryColor}22, ${branding.accentColor}12)`,
                }}
              >
                <p className="text-xs uppercase tracking-[0.16em]" style={{ color: branding.accentColor }}>
                  {branding.brandName}
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-white">{branding.loginHeadline}</h2>
                <p className="mt-3 text-sm leading-6 text-[var(--text-soft)]">
                  Preview ativo em <span className="text-white">{previewHost}</span>
                </p>
                <div className="mt-5 flex gap-3">
                  <span className="rounded-full px-4 py-2 text-sm font-medium text-slate-950" style={{ backgroundColor: branding.primaryColor }}>
                    Primária
                  </span>
                  <span className="rounded-full px-4 py-2 text-sm font-medium text-slate-950" style={{ backgroundColor: branding.accentColor }}>
                    Destaque
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe2 className="h-5 w-5 text-orange-400" />
                Status do domínio
              </CardTitle>
              <CardDescription>O ambiente nunca trava se o domínio ainda não estiver pronto.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-[var(--text-soft)]">
              <div className="rounded-2xl border border-white/7 bg-white/3 px-4 py-3">
                Domínio atual: <span className="text-white">{branding.customDomain || "somente preview interno"}</span>
              </div>
              <div className="rounded-2xl border border-white/7 bg-white/3 px-4 py-3">
                Status: <span className="text-white">{branding.domainStatus}</span>
              </div>
              <div className="rounded-2xl border border-white/7 bg-white/3 px-4 py-3">
                Subdomínio de preview: <span className="text-white">{previewHost}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

