import { NextResponse } from "next/server";

import { getAppContext } from "@/lib/auth";
import { readConnectionState } from "@/lib/integrations/config";
import { exchangeShopeeCode, saveShopeeConnection, syncShopeeAccount } from "@/lib/integrations/shopee";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const shopId = url.searchParams.get("shop_id") ?? url.searchParams.get("shopid");
  const state = url.searchParams.get("state");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const redirectUrl = new URL("/integrations", appUrl);

  try {
    const context = await getAppContext();
    const parsedState = state ? readConnectionState(state, "shopee") : null;

    if (!context.session?.user || !context.workspace?.workspaceId || !parsedState || !code || !shopId) {
      redirectUrl.searchParams.set("status", "connect_error");
      redirectUrl.searchParams.set("provider", "shopee");
      return NextResponse.redirect(redirectUrl);
    }

    if (
      parsedState.workspaceId !== context.workspace.workspaceId ||
      parsedState.userId !== context.session.user.id
    ) {
      redirectUrl.searchParams.set("status", "connect_error");
      redirectUrl.searchParams.set("provider", "shopee");
      return NextResponse.redirect(redirectUrl);
    }

    const token = await exchangeShopeeCode(code, shopId);
    const accountId = await saveShopeeConnection({
      shopId,
      token,
      workspaceId: context.workspace.workspaceId,
    });
    await syncShopeeAccount(accountId, context.workspace.workspaceId);

    redirectUrl.searchParams.set("status", "connected");
    redirectUrl.searchParams.set("provider", "shopee");
    return NextResponse.redirect(redirectUrl);
  } catch {
    redirectUrl.searchParams.set("status", "connect_error");
    redirectUrl.searchParams.set("provider", "shopee");
    return NextResponse.redirect(redirectUrl);
  }
}

