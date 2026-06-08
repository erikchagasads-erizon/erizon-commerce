import { NextResponse } from "next/server";

import { getAppContext } from "@/lib/auth";
import { readConnectionState } from "@/lib/integrations/config";
import {
  exchangeMercadoLivreCode,
  saveMercadoLivreConnection,
  syncMercadoLivreAccount,
} from "@/lib/integrations/mercadolivre";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const redirectUrl = new URL("/integrations", appUrl);

  try {
    const context = await getAppContext();
    const parsedState = state ? readConnectionState(state, "mercado_livre") : null;

    if (!context.session?.user || !context.workspace?.workspaceId || !parsedState || !code) {
      redirectUrl.searchParams.set("status", "connect_error");
      redirectUrl.searchParams.set("provider", "mercado_livre");
      return NextResponse.redirect(redirectUrl);
    }

    if (
      parsedState.workspaceId !== context.workspace.workspaceId ||
      parsedState.userId !== context.session.user.id
    ) {
      redirectUrl.searchParams.set("status", "connect_error");
      redirectUrl.searchParams.set("provider", "mercado_livre");
      return NextResponse.redirect(redirectUrl);
    }

    const token = await exchangeMercadoLivreCode(code);
    const accountId = await saveMercadoLivreConnection({
      token,
      workspaceId: context.workspace.workspaceId,
    });
    await syncMercadoLivreAccount(accountId, context.workspace.workspaceId);

    redirectUrl.searchParams.set("status", "connected");
    redirectUrl.searchParams.set("provider", "mercado_livre");
    return NextResponse.redirect(redirectUrl);
  } catch {
    redirectUrl.searchParams.set("status", "connect_error");
    redirectUrl.searchParams.set("provider", "mercado_livre");
    return NextResponse.redirect(redirectUrl);
  }
}

