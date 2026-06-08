"use server";

import { redirect } from "next/navigation";

import { appendAuditLog } from "@/lib/audit";
import { getAppContext } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function signOutAction() {
  if (hasSupabaseEnv) {
    const context = await getAppContext();

    if (context.session?.user.id) {
      await appendAuditLog({
        action: "logout",
        actorUserId: context.session.user.id,
        entityType: "auth_session",
        workspaceId: context.workspace?.workspaceId ?? null,
      });
    }

    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
  }

  redirect("/login");
}
