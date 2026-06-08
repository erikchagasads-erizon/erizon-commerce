import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { createServiceSupabaseClient } from "@/lib/supabase/service";

export type IntegrationProvider = "mercado_livre" | "shopee" | "storefront";
export type IntegrationKind = "marketplace" | "ecommerce";

export interface NormalizedProduct {
  channelId?: string | null;
  cost?: number;
  description?: string | null;
  externalId: string;
  metadata?: Record<string, unknown>;
  name: string;
  price?: number;
  provider: string;
  sku?: string | null;
  status?: string;
  stock?: number;
}

export interface NormalizedOrder {
  channelId?: string | null;
  customerEmail?: string | null;
  customerName?: string | null;
  externalId: string;
  items?: Array<{
    externalProductId?: string | null;
    name: string;
    quantity: number;
    sku?: string | null;
    totalPrice: number;
    unitPrice: number;
  }>;
  metadata?: Record<string, unknown>;
  number: string;
  orderedAt?: string | null;
  provider: string;
  status?: "pending" | "paid" | "fulfilled" | "cancelled" | "refunded";
  totalAmount?: number;
}

export async function createIntegrationLog({
  error,
  integrationType,
  message,
  provider,
  status,
  workspaceId,
}: {
  error?: string | null;
  integrationType: IntegrationKind;
  message: string;
  provider: string;
  status: "success" | "error" | "running";
  workspaceId: string;
}) {
  const supabase = createServiceSupabaseClient();

  const payload = {
    error_message: error ?? null,
    integration_type: integrationType,
    message,
    provider,
    status,
    workspace_id: workspaceId,
  };

  await Promise.all([
    supabase.from("integration_logs").insert(payload),
    supabase.from("integration_sync_logs").insert(payload),
  ]);
}

export async function markIntegrationConnecting({
  provider,
  workspaceId,
  userId,
}: {
  provider: IntegrationProvider;
  userId: string;
  workspaceId: string;
}) {
  const supabase = createServiceSupabaseClient();
  const name = provider === "mercado_livre" ? "Mercado Livre" : provider === "shopee" ? "Shopee" : "Site proprio";
  const channelId = await getOrCreateChannel({
    code: provider === "storefront" ? "site_proprio" : provider,
    name,
    type: provider === "storefront" ? "ecommerce" : "marketplace",
    workspaceId,
  });

  if (provider === "storefront") {
    await supabase.from("ecommerce_integrations").insert({
      channel_id: channelId,
      metadata: { user_id: userId },
      provider,
      status: "connecting",
      store_name: name,
      workspace_id: workspaceId,
    });
  } else {
    await supabase.from("marketplace_accounts").insert({
      account_name: name,
      channel_id: channelId,
      metadata: { user_id: userId },
      provider,
      status: "connecting",
      workspace_id: workspaceId,
    });
  }
  await createIntegrationLog({
    integrationType: provider === "storefront" ? "ecommerce" : "marketplace",
    message: "Conexao iniciada.",
    provider,
    status: "running",
    workspaceId,
  });
}

export async function getOrCreateChannel({
  code,
  name,
  type,
  workspaceId,
}: {
  code: string;
  name: string;
  type: string;
  workspaceId: string;
}) {
  const supabase = createServiceSupabaseClient();
  const { data: existing } = await supabase
    .from("channels")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("code", code)
    .maybeSingle();

  if ((existing as { id: string } | null)?.id) {
    return (existing as { id: string }).id;
  }

  const { data, error } = await supabase
    .from("channels")
    .insert({
      channel_type: type,
      code,
      name,
      workspace_id: workspaceId,
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return (data as { id: string }).id;
}

async function findProduct(supabase: SupabaseClient, workspaceId: string, provider: string, product: NormalizedProduct) {
  const externalMatch = await supabase
    .from("products")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("metadata->>provider", provider)
    .eq("metadata->>external_id", product.externalId)
    .maybeSingle();

  if ((externalMatch.data as { id: string } | null)?.id) {
    return (externalMatch.data as { id: string }).id;
  }

  if (!product.sku) {
    return null;
  }

  const skuMatch = await supabase
    .from("products")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("sku", product.sku)
    .maybeSingle();

  return (skuMatch.data as { id: string } | null)?.id ?? null;
}

export async function saveProducts(workspaceId: string, products: NormalizedProduct[]) {
  const supabase = createServiceSupabaseClient();
  let saved = 0;

  for (const product of products) {
    const id = await findProduct(supabase, workspaceId, product.provider, product);
    const payload = {
      description: product.description ?? null,
      metadata: {
        ...(product.metadata ?? {}),
        external_id: product.externalId,
        provider: product.provider,
        stock: product.stock ?? 0,
      },
      name: product.name,
      price: product.price ?? 0,
      sku: product.sku ?? null,
      status: product.status ?? "active",
      workspace_id: workspaceId,
    };

    let productId = id;

    if (id) {
      const { error } = await supabase.from("products").update(payload).eq("id", id).eq("workspace_id", workspaceId);
      if (!error) saved += 1;
    } else {
      const { data, error } = await supabase.from("products").insert(payload).select("id").single();
      productId = (data as { id: string } | null)?.id ?? null;
      if (!error) saved += 1;
    }

    if (productId) {
      await supabase.from("stock_snapshots").insert({
        product_id: productId,
        provider: product.provider,
        quantity: product.stock ?? 0,
        workspace_id: workspaceId,
      });
    }
  }

  return saved;
}

function mapOrderStatus(value?: string | null): NormalizedOrder["status"] {
  if (value === "paid" || value === "confirmed") return "paid";
  if (value === "fulfilled" || value === "delivered" || value === "completed") return "fulfilled";
  if (value === "cancelled" || value === "canceled") return "cancelled";
  if (value === "refunded") return "refunded";
  return "pending";
}

export async function saveOrders(workspaceId: string, orders: NormalizedOrder[]) {
  const supabase = createServiceSupabaseClient();
  let saved = 0;

  for (const order of orders) {
    const { data: existingByExternalId } = await supabase
      .from("orders")
      .select("id")
      .eq("workspace_id", workspaceId)
      .eq("external_order_id", order.externalId)
      .maybeSingle();
    const { data: existingByNumber } = existingByExternalId
      ? { data: null }
      : await supabase
      .from("orders")
      .select("id")
      .eq("workspace_id", workspaceId)
      .eq("order_number", order.number)
      .maybeSingle();
    const existingId =
      (existingByExternalId as { id: string } | null)?.id ??
      (existingByNumber as { id: string } | null)?.id ??
      null;
    const payload = {
      channel_id: order.channelId ?? null,
      customer_email: order.customerEmail ?? null,
      customer_name: order.customerName ?? null,
      external_order_id: order.externalId,
      metadata: {
        ...(order.metadata ?? {}),
        provider: order.provider,
      },
      order_number: order.number,
      ordered_at: order.orderedAt ?? null,
      status: mapOrderStatus(order.status),
      total_amount: order.totalAmount ?? 0,
      workspace_id: workspaceId,
    };

    const orderId = existingId
      ? await supabase
          .from("orders")
          .update(payload)
          .eq("id", existingId)
          .eq("workspace_id", workspaceId)
          .select("id")
          .single()
      : await supabase.from("orders").insert(payload).select("id").single();

    const id = (orderId.data as { id: string } | null)?.id;
    if (!id || orderId.error) {
      continue;
    }

    if (order.items?.length) {
      await supabase.from("order_items").delete().eq("workspace_id", workspaceId).eq("order_id", id);
      await supabase.from("order_items").insert(
        order.items.map((item) => ({
          name: item.name,
          order_id: id,
          quantity: item.quantity,
          sku: item.sku ?? null,
          total_price: item.totalPrice,
          unit_price: item.unitPrice,
          workspace_id: workspaceId,
        })),
      );
    }

    saved += 1;
  }

  return saved;
}

export async function generateAutomaticInsights(workspaceId: string) {
  const supabase = createServiceSupabaseClient();
  const [{ data: products }, { data: orders }] = await Promise.all([
    supabase.from("products").select("id, name, sku, price, metadata").eq("workspace_id", workspaceId).limit(200),
    supabase.from("orders").select("id, total_amount, status, metadata, created_at").eq("workspace_id", workspaceId).limit(200),
  ]);

  const productRows =
    (products as Array<{ id: string; metadata: Record<string, unknown> | null; name: string; price: number; sku: string | null }> | null) ??
    [];
  const orderRows =
    (orders as Array<{ created_at: string; metadata: Record<string, unknown> | null; status: string; total_amount: number }> | null) ??
    [];

  const lowStock = productRows.find((product) => Number(product.metadata?.stock ?? 0) <= 2);
  const revenueByProvider = new Map<string, number>();

  for (const order of orderRows) {
    const provider = String(order.metadata?.provider ?? "canal conectado");
    revenueByProvider.set(provider, (revenueByProvider.get(provider) ?? 0) + Number(order.total_amount ?? 0));
  }

  const topChannel = [...revenueByProvider.entries()].sort((a, b) => b[1] - a[1])[0];
  const insights = [];

  if (lowStock) {
    insights.push({
      agent_name: "Erizon AI",
      payload: { product_id: lowStock.id, sku: lowStock.sku },
      priority: "high",
      summary: `${lowStock.name} esta perto de acabar. Revise a reposicao para nao perder vendas.`,
      title: "Estoque acabando",
      workspace_id: workspaceId,
    });
  }

  if (topChannel) {
    insights.push({
      agent_name: "Erizon AI",
      payload: { provider: topChannel[0], revenue: topChannel[1] },
      priority: "medium",
      summary: `${topChannel[0]} lidera o faturamento importado. Priorize revisao de anuncios, estoque e margem nesse canal.`,
      title: "Canal com maior faturamento",
      workspace_id: workspaceId,
    });
  }

  if (productRows.length && orderRows.length === 0) {
    insights.push({
      agent_name: "Erizon AI",
      payload: { products: productRows.length },
      priority: "medium",
      summary: "Ha produtos importados, mas ainda nao ha pedidos no periodo. Verifique precos, anuncios e disponibilidade.",
      title: "Produto parado",
      workspace_id: workspaceId,
    });
  }

  if (insights.length > 0) {
    await supabase.from("ai_insights").insert(insights);
  }

  return insights.length;
}

export async function markSyncFinished({
  accountId,
  kind,
  provider,
  status,
  workspaceId,
  error,
}: {
  accountId: string;
  error?: string | null;
  kind: IntegrationKind;
  provider: string;
  status: "connected" | "error";
  workspaceId: string;
}) {
  const supabase = createServiceSupabaseClient();
  const table = kind === "marketplace" ? "marketplace_accounts" : "ecommerce_integrations";

  await supabase
    .from(table)
    .update({
      last_error: error ?? null,
      last_sync_at: new Date().toISOString(),
      status,
    })
    .eq("id", accountId)
    .eq("workspace_id", workspaceId);

  await createIntegrationLog({
    error,
    integrationType: kind,
    message: status === "connected" ? "Dados importados com sucesso." : "Nao conseguimos importar os dados.",
    provider,
    status: status === "connected" ? "success" : "error",
    workspaceId,
  });
}

export async function markSyncStarted({
  kind,
  provider,
  workspaceId,
}: {
  kind: IntegrationKind;
  provider: string;
  workspaceId: string;
}) {
  await createIntegrationLog({
    integrationType: kind,
    message: "Importacao iniciada.",
    provider,
    status: "running",
    workspaceId,
  });
}
