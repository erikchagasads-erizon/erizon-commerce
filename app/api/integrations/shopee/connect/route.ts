import { NextResponse } from "next/server";

import { getAppContext } from "@/lib/auth";
import { hasEncryptionKey, hasServiceRoleEnv, hasShopeeEnv, missingShopeeEnv } from "@/lib/env";
import { createConnectionState } from "@/lib/integrations/config";
import { buildShopeeAuthUrl } from "@/lib/integrations/shopee";
import { markIntegrationConnecting } from "@/lib/integrations/sync";

export async function GET() {
  const context = await getAppContext();

  if (!context.session?.user || !context.workspace?.workspaceId) {
    return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"));
  }

  if (!hasShopeeEnv || !hasEncryptionKey || !hasServiceRoleEnv) {
    const url = new URL("/integrations", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000");
    url.searchParams.set("status", "missing_config");
    url.searchParams.set("provider", "shopee");
    url.searchParams.set("items", missingShopeeEnv.join(","));
    return NextResponse.redirect(url);
  }

  const state = createConnectionState(context.workspace.workspaceId, context.session.user.id, "shopee");
  await markIntegrationConnecting({
    provider: "shopee",
    userId: context.session.user.id,
    workspaceId: context.workspace.workspaceId,
  });

  return NextResponse.redirect(buildShopeeAuthUrl(state));
}
