import "server-only";

import { encryptSecret, decryptSecret } from "@/lib/security/encryption";
import { createServiceSupabaseClient } from "@/lib/supabase/service";
import {
  generateAutomaticInsights,
  getOrCreateChannel,
  markSyncFinished,
  markSyncStarted,
  saveOrders,
  saveProducts,
  type NormalizedOrder,
  type NormalizedProduct,
} from "@/lib/integrations/sync";

const provider = "storefront";

export type StorefrontPlatform = "woocommerce" | "shopify" | "custom";

function cleanBaseUrl(value: string) {
  const url = new URL(value);
  return url.origin;
}

export async function saveStorefrontConnection({
  platform,
  publicKey,
  secretKey,
  storeName,
  storeUrl,
  workspaceId,
}: {
  platform: StorefrontPlatform;
  publicKey: string;
  secretKey: string;
  storeName: string;
  storeUrl: string;
  workspaceId: string;
}) {
  const supabase = createServiceSupabaseClient();
  const channelId = await getOrCreateChannel({
    code: "site_proprio",
    name: "Site proprio",
    type: "ecommerce",
    workspaceId,
  });
  const normalizedUrl = cleanBaseUrl(storeUrl);
  const { data: existing } = await supabase
    .from("ecommerce_integrations")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("provider", provider)
    .eq("store_url", normalizedUrl)
    .maybeSingle();
  const payload = {
    channel_id: channelId,
    connected_at: new Date().toISOString(),
    encrypted_access_token: publicKey ? encryptSecret(publicKey) : null,
    encrypted_refresh_token: secretKey ? encryptSecret(secretKey) : null,
    external_store_id: normalizedUrl,
    metadata: {
      platform,
    },
    provider,
    status: "connected",
    store_name: storeName || normalizedUrl,
    store_url: normalizedUrl,
    workspace_id: workspaceId,
  };

  if ((existing as { id: string } | null)?.id) {
    const id = (existing as { id: string }).id;
    const { error } = await supabase.from("ecommerce_integrations").update(payload).eq("id", id).eq("workspace_id", workspaceId);
    if (error) throw error;
    return id;
  }

  const { data, error } = await supabase.from("ecommerce_integrations").insert(payload).select("id").single();
  if (error) throw error;

  return (data as { id: string }).id;
}

async function fetchWooCommerceProducts(storeUrl: string, publicKey: string, secretKey: string, channelId: string | null) {
  const url = new URL(`${storeUrl}/wp-json/wc/v3/products`);
  url.searchParams.set("per_page", "50");
  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Basic ${Buffer.from(`${publicKey}:${secretKey}`).toString("base64")}`,
    },
  });

  if (!response.ok) {
    throw new Error("Nao conseguimos importar produtos da loja.");
  }

  const products = (await response.json()) as Array<Record<string, unknown>>;

  return products.map((product) => ({
    channelId,
    description: String(product.short_description ?? product.description ?? ""),
    externalId: String(product.id),
    metadata: {
      platform: "woocommerce",
      stock: product.stock_quantity ?? 0,
    },
    name: String(product.name ?? "Produto da loja"),
    price: Number(product.price ?? product.regular_price ?? 0),
    provider,
    sku: product.sku ? String(product.sku) : null,
    status: String(product.status ?? "active"),
    stock: Number(product.stock_quantity ?? 0),
  })) satisfies NormalizedProduct[];
}

async function fetchWooCommerceOrders(storeUrl: string, publicKey: string, secretKey: string, channelId: string | null) {
  const url = new URL(`${storeUrl}/wp-json/wc/v3/orders`);
  url.searchParams.set("per_page", "50");
  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Basic ${Buffer.from(`${publicKey}:${secretKey}`).toString("base64")}`,
    },
  });

  if (!response.ok) {
    throw new Error("Nao conseguimos importar pedidos da loja.");
  }

  const orders = (await response.json()) as Array<Record<string, unknown>>;

  return orders.map((order) => {
    const billing = (order.billing as { email?: string; first_name?: string; last_name?: string } | undefined) ?? {};
    const items =
      (order.line_items as
        | Array<{ name?: string; quantity?: number; sku?: string; total?: string; price?: number }>
        | undefined) ?? [];

    return {
      channelId,
      customerEmail: billing.email ?? null,
      customerName: [billing.first_name, billing.last_name].filter(Boolean).join(" ") || null,
      externalId: String(order.id),
      items: items.map((item) => ({
        name: item.name ?? "Item vendido",
        quantity: Number(item.quantity ?? 1),
        sku: item.sku ?? null,
        totalPrice: Number(item.total ?? 0),
        unitPrice: Number(item.price ?? 0),
      })),
      metadata: {
        platform: "woocommerce",
        provider,
      },
      number: String(order.number ?? order.id),
      orderedAt: order.date_created ? String(order.date_created) : null,
      provider,
      status: String(order.status ?? "pending") as NormalizedOrder["status"],
      totalAmount: Number(order.total ?? 0),
    };
  }) satisfies NormalizedOrder[];
}

async function fetchCustomProducts(storeUrl: string, publicKey: string, secretKey: string, channelId: string | null) {
  const response = await fetch(`${storeUrl}/products`, {
    headers: {
      "X-Erizon-Key": publicKey,
      "X-Erizon-Secret": secretKey,
    },
  });

  if (!response.ok) {
    throw new Error("Nao conseguimos importar produtos da loja.");
  }

  const products = (await response.json()) as Array<Record<string, unknown>>;

  return products.map((product) => ({
    channelId,
    externalId: String(product.id ?? product.sku),
    metadata: {
      platform: "custom",
    },
    name: String(product.name ?? "Produto da loja"),
    price: Number(product.price ?? 0),
    provider,
    sku: product.sku ? String(product.sku) : null,
    status: String(product.status ?? "active"),
    stock: Number(product.stock ?? 0),
  })) satisfies NormalizedProduct[];
}

async function fetchCustomOrders(storeUrl: string, publicKey: string, secretKey: string, channelId: string | null) {
  const response = await fetch(`${storeUrl}/orders`, {
    headers: {
      "X-Erizon-Key": publicKey,
      "X-Erizon-Secret": secretKey,
    },
  });

  if (!response.ok) {
    throw new Error("Nao conseguimos importar pedidos da loja.");
  }

  const orders = (await response.json()) as Array<Record<string, unknown>>;

  return orders.map((order) => ({
    channelId,
    customerEmail: order.customer_email ? String(order.customer_email) : null,
    customerName: order.customer_name ? String(order.customer_name) : null,
    externalId: String(order.id ?? order.number),
    metadata: {
      platform: "custom",
      provider,
    },
    number: String(order.number ?? order.id),
    orderedAt: order.created_at ? String(order.created_at) : null,
    provider,
    status: String(order.status ?? "pending") as NormalizedOrder["status"],
    totalAmount: Number(order.total_amount ?? order.total ?? 0),
  })) satisfies NormalizedOrder[];
}

async function fetchShopifyProducts(storeUrl: string, accessToken: string, channelId: string | null) {
  const response = await fetch(`${storeUrl}/admin/api/2024-10/products.json?limit=50`, {
    headers: {
      "X-Shopify-Access-Token": accessToken,
    },
  });

  if (!response.ok) {
    throw new Error("Nao conseguimos importar produtos da Shopify.");
  }

  const payload = (await response.json()) as {
    products?: Array<{
      id: number;
      status?: string;
      title?: string;
      variants?: Array<{ inventory_quantity?: number; price?: string; sku?: string }>;
    }>;
  };

  return (payload.products ?? []).map((product) => {
    const variant = product.variants?.[0];

    return {
      channelId,
      externalId: String(product.id),
      metadata: {
        platform: "shopify",
      },
      name: product.title ?? "Produto Shopify",
      price: Number(variant?.price ?? 0),
      provider,
      sku: variant?.sku ?? null,
      status: product.status ?? "active",
      stock: Number(variant?.inventory_quantity ?? 0),
    };
  }) satisfies NormalizedProduct[];
}

async function fetchShopifyOrders(storeUrl: string, accessToken: string, channelId: string | null) {
  const response = await fetch(`${storeUrl}/admin/api/2024-10/orders.json?status=any&limit=50`, {
    headers: {
      "X-Shopify-Access-Token": accessToken,
    },
  });

  if (!response.ok) {
    throw new Error("Nao conseguimos importar pedidos da Shopify.");
  }

  const payload = (await response.json()) as {
    orders?: Array<{
      created_at?: string;
      customer?: { email?: string; first_name?: string; last_name?: string };
      financial_status?: string;
      id: number;
      line_items?: Array<{ name?: string; price?: string; quantity?: number; sku?: string }>;
      name?: string;
      total_price?: string;
    }>;
  };

  return (payload.orders ?? []).map((order) => ({
    channelId,
    customerEmail: order.customer?.email ?? null,
    customerName: [order.customer?.first_name, order.customer?.last_name].filter(Boolean).join(" ") || null,
    externalId: String(order.id),
    items: (order.line_items ?? []).map((item) => ({
      name: item.name ?? "Item vendido",
      quantity: Number(item.quantity ?? 1),
      sku: item.sku ?? null,
      totalPrice: Number(item.price ?? 0) * Number(item.quantity ?? 1),
      unitPrice: Number(item.price ?? 0),
    })),
    metadata: {
      platform: "shopify",
      provider,
    },
    number: order.name ?? String(order.id),
    orderedAt: order.created_at ?? null,
    provider,
    status: order.financial_status === "paid" ? "paid" : "pending",
    totalAmount: Number(order.total_price ?? 0),
  })) satisfies NormalizedOrder[];
}

export async function syncStorefrontIntegration(integrationId: string, workspaceId: string) {
  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase
    .from("ecommerce_integrations")
    .select("id, workspace_id, channel_id, store_url, metadata, encrypted_access_token, encrypted_refresh_token")
    .eq("id", integrationId)
    .eq("workspace_id", workspaceId)
    .eq("provider", provider)
    .maybeSingle();

  if (error || !data) {
    throw new Error("Loja nao encontrada.");
  }

  const integration = data as {
    channel_id: string | null;
    encrypted_access_token: string | null;
    encrypted_refresh_token: string | null;
    id: string;
    metadata: { platform?: StorefrontPlatform } | null;
    store_url: string | null;
  };

  try {
    await markSyncStarted({
      kind: "ecommerce",
      provider,
      workspaceId,
    });

    if (!integration.store_url || !integration.encrypted_access_token || !integration.encrypted_refresh_token) {
      throw new Error("Dados da loja incompletos.");
    }

    const platform = integration.metadata?.platform ?? "custom";
    const publicKey = decryptSecret(integration.encrypted_access_token);
    const secretKey = decryptSecret(integration.encrypted_refresh_token);
    const [products, orders] =
      platform === "woocommerce"
        ? await Promise.all([
            fetchWooCommerceProducts(integration.store_url, publicKey, secretKey, integration.channel_id),
            fetchWooCommerceOrders(integration.store_url, publicKey, secretKey, integration.channel_id),
          ])
        : platform === "shopify"
          ? await Promise.all([
              fetchShopifyProducts(integration.store_url, publicKey, integration.channel_id),
              fetchShopifyOrders(integration.store_url, publicKey, integration.channel_id),
            ])
          : await Promise.all([
              fetchCustomProducts(integration.store_url, publicKey, secretKey, integration.channel_id),
              fetchCustomOrders(integration.store_url, publicKey, secretKey, integration.channel_id),
            ]);
    const [productCount, orderCount] = await Promise.all([
      saveProducts(workspaceId, products),
      saveOrders(workspaceId, orders),
    ]);
    const insightCount = await generateAutomaticInsights(workspaceId);

    await markSyncFinished({
      accountId: integration.id,
      kind: "ecommerce",
      provider,
      status: "connected",
      workspaceId,
    });

    return {
      insightCount,
      orderCount,
      productCount,
    };
  } catch (syncError) {
    await markSyncFinished({
      accountId: integration.id,
      error: syncError instanceof Error ? syncError.message : "Falha na importacao.",
      kind: "ecommerce",
      provider,
      status: "error",
      workspaceId,
    });
    throw syncError;
  }
}
