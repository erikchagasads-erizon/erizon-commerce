import { Eye, Palette } from "lucide-react";

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
      <section className="rounded-2xl border border-white/7 bg-[#100e0a] p-6 sm:p-8">
        <Badge>Marca</Badge>
        <h1 className="mt-5 text-3xl font-semibold sm:text-4xl">Personalize a presença da sua empresa.</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--text-soft)]">
          Ajuste nome, cores, logo e comunicação para que a Erizon pareça parte natural da sua operação.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr,1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-orange-400" />
              Identidade da empresa
            </CardTitle>
            <CardDescription>Use sua marca para deixar a experiência mais familiar ao time.</CardDescription>
          </CardHeader>
          <CardContent>
            <WhiteLabelForm branding={branding} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-orange-400" />
              Prévia visual
            </CardTitle>
            <CardDescription>Veja como sua marca aparece na plataforma.</CardDescription>
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
                Endereço de acesso: <span className="text-white">{previewHost}</span>
              </p>
              <div className="mt-5 flex gap-3">
                <span className="rounded-full px-4 py-2 text-sm font-medium text-slate-950" style={{ backgroundColor: branding.primaryColor }}>
                  Principal
                </span>
                <span className="rounded-full px-4 py-2 text-sm font-medium text-slate-950" style={{ backgroundColor: branding.accentColor }}>
                  Destaque
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
