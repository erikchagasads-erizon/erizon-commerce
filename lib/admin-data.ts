import { hasSupabaseEnv, hasGroqEnv, hasServiceRoleEnv, missingProductionEnv, missingSupabaseEnv } from "@/lib/env";
import type { WorkspaceRole } from "@/lib/permissions";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface TeamMemberRecord {
  createdAt: string;
  email: string | null;
  fullName: string | null;
  id: string;
  role: WorkspaceRole;
}

export interface InviteRecord {
  createdAt: string;
  email: string;
  expiresAt: string;
  id: string;
  role: WorkspaceRole;
  status: string;
}

export interface BrandingRecord {
  accentColor: string;
  brandName: string;
  customDomain: string | null;
  domainStatus: string;
  faviconUrl: string | null;
  loginHeadline: string | null;
  logoUrl: string | null;
  primaryColor: string;
  previewEnabled: boolean;
  subdomain: string | null;
  supportEmail: string | null;
}

export interface PaymentRecord {
  amount: number;
  createdAt: string;
  currency: string;
  externalReference: string | null;
  id: string;
  provider: string;
  status: string;
}

export interface ApiKeyRecord {
  createdAt: string;
  id: string;
  keyPrefix: string;
  label: string;
  lastUsedAt: string | null;
  permissions: string[];
  status: string;
}

export interface IntegrationHealthRecord {
  connectedAt: string | null;
  id: string;
  lastError: string | null;
  lastSyncAt: string | null;
  metadata: Record<string, unknown>;
  name: string;
  provider: string;
  status: string;
  type: "marketplace" | "ecommerce";
}

export interface SystemHealthSnapshot {
  aiStatus: "ready" | "fallback";
  databaseStatus: "ready" | "not_configured";
  encryptionStatus: "ready" | "missing";
  integrationCount: number;
  jobCount: number;
  missingEnv: string[];
  recentErrors: Array<{
    action: string;
    createdAt: string;
    entityType: string;
  }>;
  recentSyncJobs: Array<{
    createdAt: string;
    id: string;
    jobType: string;
    provider: string;
    status: string;
  }>;
  serviceRoleStatus: "ready" | "missing";
}

export async function getWorkspaceTeam(workspaceId: string | null) {
  if (!hasSupabaseEnv || !workspaceId) {
    return {
      invites: [] as InviteRecord[],
      members: [] as TeamMemberRecord[],
    };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const [{ data: membersData }, { data: invitesData }] = await Promise.all([
      supabase
        .from("workspace_members")
        .select("id, role, created_at, user_id")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: true }),
      supabase
        .from("workspace_invitations")
        .select("id, email, role, status, created_at, expires_at")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false }),
    ]);

    const memberRows =
      (membersData as
        | Array<{
            created_at: string;
            id: string;
            role: WorkspaceRole;
            user_id: string;
          }>
        | null
        | undefined) ?? [];

    const userIds = memberRows.map((member) => member.user_id);
    const { data: profilesData } = userIds.length
      ? await supabase.from("profiles").select("id, email, full_name").in("id", userIds)
      : { data: [] };

    const profilesById = new Map(
      ((profilesData as Array<{ email: string | null; full_name: string | null; id: string }> | null | undefined) ?? []).map(
        (profile) => [profile.id, profile],
      ),
    );

    const members =
      memberRows.map((member) => {
        const profile = profilesById.get(member.user_id);
        return {
          createdAt: member.created_at,
          email: profile?.email ?? null,
          fullName: profile?.full_name ?? null,
          id: member.id,
          role: member.role,
        };
      });

    const invites =
      (invitesData as
        | Array<{
            created_at: string;
            email: string;
            expires_at: string;
            id: string;
            role: WorkspaceRole;
            status: string;
          }>
        | null
        | undefined)?.map((invite) => ({
        createdAt: invite.created_at,
        email: invite.email,
        expiresAt: invite.expires_at,
        id: invite.id,
        role: invite.role,
        status: invite.status,
      })) ?? [];

    return {
      invites,
      members,
    };
  } catch {
    return {
      invites: [] as InviteRecord[],
      members: [] as TeamMemberRecord[],
    };
  }
}

export async function getWorkspaceBranding(workspaceId: string | null, workspaceSlug: string | null) {
  if (!hasSupabaseEnv || !workspaceId) {
    return {
      accentColor: "#2FFFCB",
      brandName: "Erizon",
      customDomain: null,
      domainStatus: "preview",
      faviconUrl: null,
      loginHeadline: "Seu sistema operacional de comércio inteligente.",
      logoUrl: null,
      previewEnabled: true,
      primaryColor: "#6C4BFF",
      subdomain: workspaceSlug,
      supportEmail: null,
    } satisfies BrandingRecord;
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase
      .from("workspace_branding")
      .select(
        "brand_name, login_headline, logo_url, favicon_url, primary_color, accent_color, custom_domain, domain_status, preview_enabled, subdomain, support_email",
      )
      .eq("workspace_id", workspaceId)
      .maybeSingle();

    const row = data as
      | {
          accent_color: string | null;
          brand_name: string | null;
          custom_domain: string | null;
          domain_status: string | null;
          favicon_url: string | null;
          login_headline: string | null;
          logo_url: string | null;
          preview_enabled: boolean | null;
          primary_color: string | null;
          subdomain: string | null;
          support_email: string | null;
        }
      | null;

    return {
      accentColor: row?.accent_color ?? "#2FFFCB",
      brandName: row?.brand_name ?? "Erizon",
      customDomain: row?.custom_domain ?? null,
      domainStatus: row?.domain_status ?? "preview",
      faviconUrl: row?.favicon_url ?? null,
      loginHeadline: row?.login_headline ?? "Seu sistema operacional de comércio inteligente.",
      logoUrl: row?.logo_url ?? null,
      previewEnabled: row?.preview_enabled ?? true,
      primaryColor: row?.primary_color ?? "#6C4BFF",
      subdomain: row?.subdomain ?? workspaceSlug,
      supportEmail: row?.support_email ?? null,
    } satisfies BrandingRecord;
  } catch {
    return {
      accentColor: "#2FFFCB",
      brandName: "Erizon",
      customDomain: null,
      domainStatus: "preview",
      faviconUrl: null,
      loginHeadline: "Seu sistema operacional de comércio inteligente.",
      logoUrl: null,
      previewEnabled: true,
      primaryColor: "#6C4BFF",
      subdomain: workspaceSlug,
      supportEmail: null,
    } satisfies BrandingRecord;
  }
}

export async function getWorkspaceBilling(workspaceId: string | null) {
  if (!hasSupabaseEnv || !workspaceId) {
    return [] as PaymentRecord[];
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase
      .from("billing_payments")
      .select("id, amount, currency, provider, status, external_reference, created_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(12);

    return (
      (data as
        | Array<{
            amount: number;
            created_at: string;
            currency: string;
            external_reference: string | null;
            id: string;
            provider: string;
            status: string;
          }>
        | null
        | undefined)?.map((payment) => ({
        amount: Number(payment.amount ?? 0),
        createdAt: payment.created_at,
        currency: payment.currency,
        externalReference: payment.external_reference,
        id: payment.id,
        provider: payment.provider,
        status: payment.status,
      })) ?? []
    );
  } catch {
    return [] as PaymentRecord[];
  }
}

export async function getWorkspaceApiKeys(workspaceId: string | null) {
  if (!hasSupabaseEnv || !workspaceId) {
    return [] as ApiKeyRecord[];
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase
      .from("workspace_api_keys")
      .select("id, label, key_prefix, permissions, status, last_used_at, created_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });

    return (
      (data as
        | Array<{
            created_at: string;
            id: string;
            key_prefix: string;
            label: string;
            last_used_at: string | null;
            permissions: string[] | null;
            status: string;
          }>
        | null
        | undefined)?.map((item) => ({
        createdAt: item.created_at,
        id: item.id,
        keyPrefix: item.key_prefix,
        label: item.label,
        lastUsedAt: item.last_used_at,
        permissions: item.permissions ?? [],
        status: item.status,
      })) ?? []
    );
  } catch {
    return [] as ApiKeyRecord[];
  }
}

export async function getIntegrationHealth(workspaceId: string | null) {
  if (!hasSupabaseEnv || !workspaceId) {
    return [] as IntegrationHealthRecord[];
  }

  try {
    const supabase = await createServerSupabaseClient();
    const [{ data: marketData }, { data: ecommerceData }] = await Promise.all([
      supabase
        .from("marketplace_accounts")
        .select("id, provider, account_name, status, connected_at, last_sync_at, last_error, metadata")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false }),
      supabase
        .from("ecommerce_integrations")
        .select("id, provider, store_name, status, connected_at, last_sync_at, last_error, metadata")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false }),
    ]);

    const marketplaces =
      (marketData as
        | Array<{
            account_name: string;
            connected_at: string | null;
            id: string;
            last_error: string | null;
            last_sync_at: string | null;
            metadata: Record<string, unknown> | null;
            provider: string;
            status: string;
          }>
        | null
        | undefined)?.map((item) => ({
        connectedAt: item.connected_at,
        id: item.id,
        lastError: item.last_error,
        lastSyncAt: item.last_sync_at,
        metadata: item.metadata ?? {},
        name: item.account_name,
        provider: item.provider,
        status: item.status,
        type: "marketplace" as const,
      })) ?? [];

    const ecommerce =
      (ecommerceData as
        | Array<{
            connected_at: string | null;
            id: string;
            last_error: string | null;
            last_sync_at: string | null;
            metadata: Record<string, unknown> | null;
            provider: string;
            status: string;
            store_name: string;
          }>
        | null
        | undefined)?.map((item) => ({
        connectedAt: item.connected_at,
        id: item.id,
        lastError: item.last_error,
        lastSyncAt: item.last_sync_at,
        metadata: item.metadata ?? {},
        name: item.store_name,
        provider: item.provider,
        status: item.status,
        type: "ecommerce" as const,
      })) ?? [];

    return [...marketplaces, ...ecommerce];
  } catch {
    return [] as IntegrationHealthRecord[];
  }
}

export async function getSystemHealth(workspaceId: string | null): Promise<SystemHealthSnapshot> {
  if (!hasSupabaseEnv || !workspaceId) {
    return {
      aiStatus: hasGroqEnv ? "ready" : "fallback",
      databaseStatus: hasSupabaseEnv ? "ready" : "not_configured",
      encryptionStatus: missingProductionEnv.includes("APP_ENCRYPTION_KEY") ? "missing" : "ready",
      integrationCount: 0,
      jobCount: 0,
      missingEnv: [...missingSupabaseEnv, ...missingProductionEnv],
      recentErrors: [],
      recentSyncJobs: [],
      serviceRoleStatus: hasServiceRoleEnv ? "ready" : "missing",
    };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const [integrations, { data: jobsData }, { data: errorsData }] = await Promise.all([
      getIntegrationHealth(workspaceId),
      supabase
        .from("sync_jobs")
        .select("id, provider, job_type, status, created_at")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .limit(8),
      supabase
        .from("audit_logs")
        .select("id, action, entity_type, created_at")
        .eq("workspace_id", workspaceId)
        .in("action", ["integration_error", "billing_error", "copilot_guardrail_blocked", "api_rate_limited"])
        .order("created_at", { ascending: false })
        .limit(8),
    ]);

    return {
      aiStatus: hasGroqEnv ? "ready" : "fallback",
      databaseStatus: "ready",
      encryptionStatus: missingProductionEnv.includes("APP_ENCRYPTION_KEY") ? "missing" : "ready",
      integrationCount: integrations.length,
      jobCount: (jobsData ?? []).length,
      missingEnv: missingProductionEnv,
      recentErrors:
        (errorsData as
          | Array<{ action: string; created_at: string; entity_type: string }>
          | null
          | undefined)?.map((item) => ({
          action: item.action,
          createdAt: item.created_at,
          entityType: item.entity_type,
        })) ?? [],
      recentSyncJobs:
        (jobsData as
          | Array<{ created_at: string; id: string; job_type: string; provider: string; status: string }>
          | null
          | undefined)?.map((item) => ({
          createdAt: item.created_at,
          id: item.id,
          jobType: item.job_type,
          provider: item.provider,
          status: item.status,
        })) ?? [],
      serviceRoleStatus: hasServiceRoleEnv ? "ready" : "missing",
    };
  } catch {
    return {
      aiStatus: hasGroqEnv ? "ready" : "fallback",
      databaseStatus: "ready",
      encryptionStatus: missingProductionEnv.includes("APP_ENCRYPTION_KEY") ? "missing" : "ready",
      integrationCount: 0,
      jobCount: 0,
      missingEnv: missingProductionEnv,
      recentErrors: [],
      recentSyncJobs: [],
      serviceRoleStatus: hasServiceRoleEnv ? "ready" : "missing",
    };
  }
}
