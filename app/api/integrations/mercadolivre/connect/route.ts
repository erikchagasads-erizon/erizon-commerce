import { NextResponse } from "next/server";

import { getAppContext } from "@/lib/auth";
import { hasEncryptionKey, hasMercadoLivreEnv, hasServiceRoleEnv, missingMercadoLivreEnv } from "@/lib/env";
import { createConnectionState } from "@/lib/integrations/config";
import { buildMercadoLivreAuthUrl } from "@/lib/integrations/mercadolivre";
import { markIntegrationConnecting } from "@/lib/integrations/sync";

export async function GET() {
  const context = await getAppContext();

  if (!context.session?.user || !context.workspace?.workspaceId) {
    return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"));
  }

  if (!hasMercadoLivreEnv || !hasEncryptionKey || !hasServiceRoleEnv) {
    const url = new URL("/integrations", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000");
    url.searchParams.set("status", "missing_config");
    url.searchParams.set("provider", "mercado_livre");
    url.searchParams.set("items", missingMercadoLivreEnv.join(","));
    return NextResponse.redirect(url);
  }

  const state = createConnectionState(context.workspace.workspaceId, context.session.user.id, "mercado_livre");
  await markIntegrationConnecting({
    provider: "mercado_livre",
    userId: context.session.user.id,
    workspaceId: context.workspace.workspaceId,
  });

  return NextResponse.redirect(buildMercadoLivreAuthUrl(state));
}
