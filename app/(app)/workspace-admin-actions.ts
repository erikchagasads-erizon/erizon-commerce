"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";

import { appendAuditLog } from "@/lib/audit";
import { requireAppContext } from "@/lib/auth";
import { generateApiKey } from "@/lib/security";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  apiKeyCreateSchema,
  inviteMemberSchema,
  whiteLabelSchema,
} from "@/lib/validation";
import { requireWorkspaceRoles } from "@/lib/permissions";

export interface AdminActionState {
  error?: string;
  generatedKey?: string;
  success?: string;
}

export async function createInviteAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const context = await requireAppContext();
  requireWorkspaceRoles(context, ["owner", "admin", "manager"]);

  if (!context.workspace?.workspaceId || !context.session?.user.id) {
    return {
      error: "Empresa indisponível para criar convites.",
    };
  }

  const parsed = inviteMemberSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Não foi possível validar o convite.",
    };
  }

  const supabase = await createServerSupabaseClient();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();
  const inviteToken = randomUUID();

  const { error } = await supabase.from("workspace_invitations").insert({
    email: parsed.data.email,
    expires_at: expiresAt,
    invited_by: context.session.user.id,
    invitation_token: inviteToken,
    role: parsed.data.role,
    status: "pending",
    workspace_id: context.workspace.workspaceId,
  });

  if (error) {
    return {
      error: error.message,
    };
  }

  await appendAuditLog({
    action: "invite_created",
    actorUserId: context.session.user.id,
    entityType: "workspace_invitation",
    payload: {
      email: parsed.data.email,
      role: parsed.data.role,
    },
    workspaceId: context.workspace.workspaceId,
  });

  revalidatePath("/team");

  return {
    success: `Convite preparado para ${parsed.data.email} com expiração em 7 dias.`,
  };
}

export async function saveWhiteLabelAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const context = await requireAppContext();
  requireWorkspaceRoles(context, ["owner", "admin"]);

  if (!context.workspace?.workspaceId || !context.session?.user.id) {
    return {
      error: "Empresa indisponível para salvar a identidade visual.",
    };
  }

  const parsed = whiteLabelSchema.safeParse({
    accentColor: formData.get("accentColor"),
    brandName: formData.get("brandName"),
    customDomain: formData.get("customDomain"),
    faviconUrl: formData.get("faviconUrl"),
    loginHeadline: formData.get("loginHeadline"),
    logoUrl: formData.get("logoUrl"),
    primaryColor: formData.get("primaryColor"),
    subdomain: formData.get("subdomain"),
    supportEmail: formData.get("supportEmail"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Não foi possível validar o white label.",
    };
  }

  const supabase = await createServerSupabaseClient();
  const payload = {
    accent_color: parsed.data.accentColor,
    brand_name: parsed.data.brandName,
    custom_domain: parsed.data.customDomain || null,
    domain_status: parsed.data.customDomain ? "pending_validation" : "preview",
    favicon_url: parsed.data.faviconUrl || null,
    login_headline: parsed.data.loginHeadline,
    logo_url: parsed.data.logoUrl || null,
    preview_enabled: true,
    primary_color: parsed.data.primaryColor,
    subdomain: parsed.data.subdomain || context.workspace.slug || null,
    support_email: parsed.data.supportEmail || null,
    workspace_id: context.workspace.workspaceId,
  };

  const { error } = await supabase
    .from("workspace_branding")
    .upsert(payload, {
      onConflict: "workspace_id",
    });

  if (error) {
    return {
      error: error.message,
    };
  }

  await appendAuditLog({
    action: "white_label_updated",
    actorUserId: context.session.user.id,
    entityType: "workspace_branding",
    payload: {
      brandName: parsed.data.brandName,
      customDomain: parsed.data.customDomain,
      subdomain: parsed.data.subdomain,
    },
    workspaceId: context.workspace.workspaceId,
  });

  revalidatePath("/white-label");
  revalidatePath("/settings");

  return {
    success: "Identidade visual salva. O preview interno já pode refletir essas mudanças.",
  };
}

export async function createApiKeyAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const context = await requireAppContext();
  requireWorkspaceRoles(context, ["owner", "admin"]);

  if (!context.workspace?.workspaceId || !context.session?.user.id) {
    return {
      error: "Empresa indisponível para concluir esta ação.",
    };
  }

  const permissions = formData.getAll("permissions").map((value) => String(value));
  const parsed = apiKeyCreateSchema.safeParse({
    label: formData.get("label"),
    permissions,
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Não foi possível validar a chave.",
    };
  }

  const generated = generateApiKey();
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.from("workspace_api_keys").insert({
    created_by: context.session.user.id,
    key_hash: generated.hash,
    key_prefix: generated.displayPrefix,
    label: parsed.data.label,
    permissions: parsed.data.permissions,
    status: "active",
    workspace_id: context.workspace.workspaceId,
  });

  if (error) {
    return {
      error: error.message,
    };
  }

  await appendAuditLog({
    action: "api_key_created",
    actorUserId: context.session.user.id,
    entityType: "workspace_api_key",
    payload: {
      label: parsed.data.label,
      permissions: parsed.data.permissions,
      prefix: generated.displayPrefix,
    },
    workspaceId: context.workspace.workspaceId,
  });

  revalidatePath("/developer-api");

  return {
    generatedKey: generated.fullKey,
    success: "Chave emitida. Guarde este valor agora: ele não poderá ser exibido novamente.",
  };
}

export async function revokeApiKeyAction(formData: FormData) {
  const context = await requireAppContext();
  requireWorkspaceRoles(context, ["owner", "admin"]);

  const apiKeyId = String(formData.get("apiKeyId") ?? "");

  if (!apiKeyId || !context.workspace?.workspaceId || !context.session?.user.id) {
    return;
  }

  const supabase = await createServerSupabaseClient();
  await supabase
    .from("workspace_api_keys")
    .update({
      revoked_at: new Date().toISOString(),
      status: "revoked",
    })
    .eq("id", apiKeyId)
    .eq("workspace_id", context.workspace.workspaceId);

  await appendAuditLog({
    action: "api_key_revoked",
    actorUserId: context.session.user.id,
    entityId: apiKeyId,
    entityType: "workspace_api_key",
    workspaceId: context.workspace.workspaceId,
  });

  revalidatePath("/developer-api");
}
