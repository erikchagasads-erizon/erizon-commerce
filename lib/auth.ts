import type { Session, SupabaseClient, User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import { hasSupabaseEnv } from "@/lib/env";
import type { WorkspaceRole } from "@/lib/permissions";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface ProfileSummary {
  id: string;
  email: string | null;
  fullName: string | null;
  avatarUrl: string | null;
}

export interface WorkspaceSummary {
  workspaceId: string;
  role: WorkspaceRole;
  name: string;
  slug: string | null;
}

export interface AppContext {
  isSupabaseConfigured: boolean;
  session: Session | null;
  user: User | null;
  profile: ProfileSummary | null;
  workspace: WorkspaceSummary | null;
}

async function fetchWorkspace(
  supabase: SupabaseClient,
  userId: string,
): Promise<WorkspaceSummary | null> {
  const selectClause = "workspace_id, role, workspaces(id, name, slug)";

  const attemptRead = async () => {
    const { data } = await supabase
      .from("workspace_members")
      .select(selectClause)
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    const row = data as
      | {
          workspace_id: string;
          role: WorkspaceRole;
          workspaces: {
            id: string;
            name: string;
            slug: string | null;
          } | null;
        }
      | null;

    if (!row) {
      return null;
    }

    return {
      workspaceId: row.workspace_id,
      role: row.role,
      name: row.workspaces?.name ?? "Workspace principal",
      slug: row.workspaces?.slug ?? null,
    };
  };

  const existingWorkspace = await attemptRead();

  if (existingWorkspace) {
    return existingWorkspace;
  }

  await supabase.rpc("ensure_workspace_for_user");

  return attemptRead();
}

export async function getAppContext(): Promise<AppContext> {
  if (!hasSupabaseEnv) {
    return {
      isSupabaseConfigured: false,
      session: null,
      user: null,
      profile: null,
      workspace: null,
    };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return {
      isSupabaseConfigured: true,
      session: null,
      user: null,
      profile: null,
      workspace: null,
    };
  }

  const user = session.user;

  const [{ data: profileData }, workspace] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, email, full_name, avatar_url")
      .eq("id", user.id)
      .maybeSingle(),
    fetchWorkspace(supabase, user.id),
  ]);

  const profile = (profileData as
    | {
        id: string;
        email: string | null;
        full_name: string | null;
        avatar_url: string | null;
      }
    | null) ?? {
    id: user.id,
    email: user.email ?? null,
    full_name: (user.user_metadata?.full_name as string | undefined) ?? null,
    avatar_url: null,
  };

  return {
    isSupabaseConfigured: true,
    session,
    user,
    profile: {
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name,
      avatarUrl: profile.avatar_url,
    },
    workspace,
  };
}

export async function requireAppContext() {
  const context = await getAppContext();

  if (context.isSupabaseConfigured && !context.session) {
    redirect("/login");
  }

  return context;
}
