import { hasSupabaseEnv } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function appendAuditLog({
  action,
  actorUserId,
  entityId,
  entityType,
  payload,
  workspaceId,
}: {
  action: string;
  actorUserId?: string | null;
  entityId?: string | null;
  entityType: string;
  payload?: Record<string, unknown>;
  workspaceId?: string | null;
}) {
  if (!hasSupabaseEnv || !workspaceId) {
    return;
  }

  try {
    const supabase = await createServerSupabaseClient();
    await supabase.from("audit_logs").insert({
      action,
      actor_user_id: actorUserId ?? null,
      entity_id: entityId ?? null,
      entity_type: entityType,
      payload: payload ?? {},
      workspace_id: workspaceId,
    });
  } catch {
    // O audit log não deve quebrar o fluxo principal.
  }
}

