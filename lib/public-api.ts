import { createServiceSupabaseClient } from "@/lib/supabase/service";
import { enforceRateLimit, hashApiKey, RateLimitError } from "@/lib/security";

const resourceConfig = {
  finance: {
    defaultSelect: "id, category, description, amount, status, due_date, paid_at, created_at",
    permission: "finance:read",
    table: "financial_transactions",
  },
  insights: {
    defaultSelect: "id, agent_name, title, summary, priority, created_at",
    permission: "insights:read",
    table: "ai_insights",
  },
  orders: {
    defaultSelect: "id, order_number, status, payment_status, fulfillment_status, total_amount, created_at",
    permission: "orders:read",
    table: "orders",
  },
  products: {
    defaultSelect: "id, name, sku, barcode, price, cost, margin, status, created_at",
    permission: "products:read",
    table: "products",
  },
  stock: {
    defaultSelect:
      "id, movement_type, quantity, unit_cost, product_id, product_variant_id, stock_location_id, created_at",
    permission: "stock:read",
    table: "stock_movements",
  },
  suppliers: {
    defaultSelect: "id, name, supplier_type, contact_name, contact_email, lead_time_days, created_at",
    permission: "suppliers:read",
    table: "suppliers",
  },
} as const;

export type PublicResource = keyof typeof resourceConfig;

export async function authenticateWorkspaceApiKey(authorizationHeader: string | null) {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    return null;
  }

  const rawKey = authorizationHeader.replace("Bearer ", "").trim();
  const parts = rawKey.split("_");

  if (parts.length < 3 || parts[0] !== "erz") {
    return null;
  }

  const prefix = parts[1];
  const secret = parts.slice(2).join("_");
  const keyHash = hashApiKey(secret);
  const supabase = createServiceSupabaseClient();

  const { data } = await supabase
    .from("workspace_api_keys")
    .select("id, workspace_id, permissions, status")
    .eq("key_prefix", prefix)
    .eq("key_hash", keyHash)
    .eq("status", "active")
    .maybeSingle();

  const row = data as
    | {
        id: string;
        permissions: string[] | null;
        status: string;
        workspace_id: string;
      }
    | null;

  if (!row) {
    return null;
  }

  await supabase
    .from("workspace_api_keys")
    .update({ last_used_at: new Date().toISOString() } as never)
    .eq("id", row.id);

  return {
    apiKeyId: row.id,
    permissions: row.permissions ?? [],
    workspaceId: row.workspace_id,
  };
}

export async function queryPublicResource({
  limit,
  resource,
  workspaceId,
}: {
  limit: number;
  resource: PublicResource;
  workspaceId: string;
}) {
  const config = resourceConfig[resource];
  const supabase = createServiceSupabaseClient();

  const { data } = await supabase
    .from(config.table)
    .select(config.defaultSelect)
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return data ?? [];
}

export function getResourcePermission(resource: PublicResource) {
  return resourceConfig[resource].permission;
}

export function parseLimit(raw: string | null) {
  const parsed = Number(raw ?? 20);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 20;
  }

  return Math.min(parsed, 100);
}

export function protectPublicApiRateLimit(identity: string) {
  enforceRateLimit(`public-api:${identity}`, 60, 60_000);
}

export { RateLimitError };
