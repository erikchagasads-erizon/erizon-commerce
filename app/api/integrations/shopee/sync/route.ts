import { NextResponse } from "next/server";

import { getAppContext } from "@/lib/auth";
import { syncShopeeAccount } from "@/lib/integrations/shopee";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST() {
  const context = await getAppContext();

  if (!context.session?.user || !context.workspace?.workspaceId) {
    return NextResponse.json({ error: "Acesse sua conta para sincronizar." }, { status: 401 });
  }

  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("marketplace_accounts")
    .select("id")
    .eq("workspace_id", context.workspace.workspaceId)
    .eq("provider", "shopee")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const accountId = (data as { id: string } | null)?.id;

  if (!accountId) {
    return NextResponse.json({ error: "Conecte a Shopee antes de sincronizar." }, { status: 404 });
  }

  try {
    const result = await syncShopeeAccount(accountId, context.workspace.workspaceId);
    return NextResponse.json({ message: "Dados importados com sucesso.", result });
  } catch {
    return NextResponse.json({ error: "Nao conseguimos sincronizar agora. Tente novamente." }, { status: 500 });
  }
}

