"use server";

import { redirect } from "next/navigation";

import { appendAuditLog } from "@/lib/audit";
import { env, hasSupabaseEnv } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { signInSchema, signUpSchema } from "@/lib/validation";

export interface AuthActionState {
  error?: string;
  success?: string;
}

export async function signInAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!hasSupabaseEnv) {
    return {
      error: "O acesso ainda não está ativo para esta instalação.",
    };
  }

  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Preencha email e senha para continuar.",
    };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return {
      error: "Não foi possível autenticar. Revise suas credenciais e tente novamente.",
    };
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.user.id) {
    const { data: membership } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    await appendAuditLog({
      action: "login",
      actorUserId: session.user.id,
      entityType: "auth_session",
      workspaceId: (membership as { workspace_id: string } | null)?.workspace_id ?? null,
    });
  }

  redirect("/executive-center");
}

export async function signUpAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!hasSupabaseEnv) {
    return {
      error: "A criação de contas ainda não está ativa para esta instalação.",
    };
  }

  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    fullName: formData.get("fullName"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Preencha nome, email e senha para criar sua conta.",
    };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${env.NEXT_PUBLIC_APP_URL}/executive-center`,
      data: {
        full_name: parsed.data.fullName,
      },
    },
  });

  if (error) {
    return {
      error: error.message,
    };
  }

  return {
    success: "Conta criada. Se sua instância exigir confirmação por email, valide o link antes de entrar.",
  };
}
