import { NextResponse } from "next/server";

import { getAppContext } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  const context = await getAppContext();

  if (!context.session?.user || !context.workspace?.workspaceId) {
    return NextResponse.json({ status: "not_connected" }, { status: 401 });
  }

  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("marketplace_accounts")
    .select("status, connected_at, last_sync_at, last_error")
    .eq("workspace_id", context.workspace.workspaceId)
    .eq("provider", "mercado_livre")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json({
    status: data ? (data as { status: string }).status : "not_connected",
    connectedAt: (data as { connected_at?: string | null } | null)?.connected_at ?? null,
    lastSyncAt: (data as { last_sync_at?: string | null } | null)?.last_sync_at ?? null,
    message: (data as { last_error?: string | null } | null)?.last_error ?? null,
  });
}

