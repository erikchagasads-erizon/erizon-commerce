import { NextResponse } from "next/server";

import { getAppContext } from "@/lib/auth";
import { syncStorefrontIntegration } from "@/lib/integrations/storefront";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST() {
  const context = await getAppContext();

  if (!context.session?.user || !context.workspace?.workspaceId) {
    return NextResponse.json({ error: "Acesse sua conta para sincronizar." }, { status: 401 });
  }

  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("ecommerce_integrations")
    .select("id")
    .eq("workspace_id", context.workspace.workspaceId)
    .eq("provider", "storefront")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const integrationId = (data as { id: string } | null)?.id;

  if (!integrationId) {
    return NextResponse.json({ error: "Conecte o site proprio antes de sincronizar." }, { status: 404 });
  }

  try {
    const result = await syncStorefrontIntegration(integrationId, context.workspace.workspaceId);
    return NextResponse.json({ message: "Dados importados com sucesso.", result });
  } catch {
    return NextResponse.json({ error: "Nao conseguimos sincronizar agora. Tente novamente." }, { status: 500 });
  }
}

