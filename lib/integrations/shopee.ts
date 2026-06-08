import "server-only";

import crypto from "node:crypto";

import { env } from "@/lib/env";
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

const provider = "shopee";
const shopeeBaseUrl = "https://partner.shopeemobile.com";

function timestamp() {
  return Math.floor(Date.now() / 1000);
}

function sign(path: string, ts: number, accessToken?: string | null, shopId?: string | number | null) {
  const base = `${env.SHOPEE_PARTNER_ID}${path}${ts}${accessToken ?? ""}${shopId ?? ""}`;
  return crypto.createHmac("sha256", env.SHOPEE_PARTNER_KEY).update(base).digest("hex");
}

function signedUrl(path: string, accessToken?: string | null, shopId?: string | number | null) {
  const ts = timestamp();
  const url = new URL(`${shopeeBaseUrl}${path}`);
  url.searchParams.set("partner_id", env.SHOPEE_PARTNER_ID);
  url.searchParams.set("timestamp", String(ts));
  url.searchParams.set("sign", sign(path, ts, accessToken, shopId));

  if (accessToken) url.searchParams.set("access_token", accessToken);
  if (shopId) url.searchParams.set("shop_id", String(shopId));

  return url;
}

export function buildShopeeAuthUrl(state: string) {
  const path = "/api/v2/shop/auth_partner";
  const url = signedUrl(path);
  url.searchParams.set("redirect", `${env.SHOPEE_REDIRECT_URI}?state=${encodeURIComponent(state)}`);

  return url.toString();
}

export async function exchangeShopeeCode(code: string, shopId: string) {
  const path = "/api/v2/auth/token/get";
  const url = signedUrl(path);
  const response = await fetch(url.toString(), {
    body: JSON.stringify({
      code,
      partner_id: Number(env.SHOPEE_PARTNER_ID),
      shop_id: Number(shopId),
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  const payload = (await response.json()) as {
    access_token?: string;
    error?: string;
    expire_in?: number;
    refresh_token?: string;
    shop_id?: number;
  };

  if (!response.ok || payload.error || !payload.access_token) {
    throw new Error("Nao conseguimos concluir a autorizacao da Shopee.");
  }

  return {
    access_token: payload.access_token,
    expire_in: payload.expire_in,
    refresh_token: payload.refresh_token,
    shop_id: payload.shop_id,
  };
}

export async function saveShopeeConnection({
  shopId,
  token,
  workspaceId,
}: {
  shopId: string;
  token: { access_token: string; expire_in?: number; refresh_token?: string; shop_id?: number };
  workspaceId: string;
}) {
  const supabase = createServiceSupabaseClient();
  const channelId = await getOrCreateChannel({
    code: provider,
    name: "Shopee",
    type: "marketplace",
    workspaceId,
  });
  const externalId = String(token.shop_id ?? shopId);
  const { data: existing } = await supabase
    .from("marketplace_accounts")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("provider", provider)
    .eq("external_account_id", externalId)
    .maybeSingle();
  const payload = {
    account_name: `Loja Shopee ${externalId}`,
    channel_id: channelId,
    connected_at: new Date().toISOString(),
    encrypted_access_token: encryptSecret(token.access_token),
    encrypted_refresh_token: token.refresh_token ? encryptSecret(token.refresh_token) : null,
    external_account_id: externalId,
    metadata: {
      shop_id: externalId,
    },
    provider,
    status: "connected",
    token_expires_at: token.expire_in ? new Date(Date.now() + token.expire_in * 1000).toISOString() : null,
    workspace_id: workspaceId,
  };

  if ((existing as { id: string } | null)?.id) {
    const id = (existing as { id: string }).id;
    const { error } = await supabase.from("marketplace_accounts").update(payload).eq("id", id).eq("workspace_id", workspaceId);
    if (error) throw error;
    return id;
  }

  const { data, error } = await supabase.from("marketplace_accounts").insert(payload).select("id").single();
  if (error) throw error;

  return (data as { id: string }).id;
}

async function refreshShopeeToken(account: {
  encrypted_refresh_token: string | null;
  external_account_id: string | null;
  id: string;
  workspace_id: string;
}) {
  if (!account.encrypted_refresh_token || !account.external_account_id) {
    throw new Error("Conta sem permissao renovavel.");
  }

  const path = "/api/v2/auth/access_token/get";
  const url = signedUrl(path);
  const response = await fetch(url.toString(), {
    body: JSON.stringify({
      partner_id: Number(env.SHOPEE_PARTNER_ID),
      refresh_token: decryptSecret(account.encrypted_refresh_token),
      shop_id: Number(account.external_account_id),
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  const payload = (await response.json()) as {
    access_token?: string;
    error?: string;
    expire_in?: number;
    refresh_token?: string;
  };

  if (!response.ok || payload.error || !payload.access_token) {
    throw new Error("Nao conseguimos renovar a conexao da Shopee.");
  }

  const supabase = createServiceSupabaseClient();
  await supabase
    .from("marketplace_accounts")
    .update({
      encrypted_access_token: encryptSecret(payload.access_token),
      encrypted_refresh_token: payload.refresh_token ? encryptSecret(payload.refresh_token) : account.encrypted_refresh_token,
      token_expires_at: payload.expire_in ? new Date(Date.now() + payload.expire_in * 1000).toISOString() : null,
    })
    .eq("id", account.id)
    .eq("workspace_id", account.workspace_id);

  return payload.access_token;
}

async function shopeeGet<T>(path: string, accessToken: string, shopId: string, params?: Record<string, string>) {
  const url = signedUrl(path, accessToken, shopId);
  Object.entries(params ?? {}).forEach(([key, value]) => url.searchParams.set(key, value));
  const response = await fetch(url.toString());
  const payload = (await response.json()) as T & { error?: string };

  if (!response.ok || payload.error) {
    throw new Error("A Shopee nao retornou os dados solicitados.");
  }

  return payload;
}

async function fetchShopeeProducts(accessToken: string, shopId: string, channelId: string | null) {
  const list = await shopeeGet<{ response?: { item?: Array<{ item_id: number; item_status?: string }> } }>(
    "/api/v2/product/get_item_list",
    accessToken,
    shopId,
    {
      item_status: "NORMAL",
      offset: "0",
      page_size: "50",
    },
  );
  const ids = (list.response?.item ?? []).map((item) => item.item_id).slice(0, 50);

  if (ids.length === 0) {
    return [] as NormalizedProduct[];
  }

  const details = await shopeeGet<{
    response?: {
      item_list?: Array<{
        item_id: number;
        item_name?: string;
        item_sku?: string;
        price_info?: Array<{ current_price?: number }>;
        stock_info_v2?: { seller_stock?: Array<{ stock?: number }> };
      }>;
    };
  }>("/api/v2/product/get_item_base_info", accessToken, shopId, {
    item_id_list: ids.join(","),
  });

  return (details.response?.item_list ?? []).map((item) => ({
    channelId,
    externalId: String(item.item_id),
    metadata: {
      shop_id: shopId,
    },
    name: item.item_name ?? "Produto Shopee",
    price: Number(item.price_info?.[0]?.current_price ?? 0),
    provider,
    sku: item.item_sku ?? null,
    status: "active",
    stock: Number(item.stock_info_v2?.seller_stock?.[0]?.stock ?? 0),
  }));
}

async function fetchShopeeOrders(accessToken: string, shopId: string, channelId: string | null) {
  const now = Math.floor(Date.now() / 1000);
  const start = now - 30 * 24 * 60 * 60;
  const list = await shopeeGet<{ response?: { order_list?: Array<{ order_sn: string }> } }>(
    "/api/v2/order/get_order_list",
    accessToken,
    shopId,
    {
      page_size: "50",
      response_optional_fields: "order_status,total_amount,buyer_user_id,create_time,item_list",
      time_from: String(start),
      time_range_field: "create_time",
      time_to: String(now),
    },
  );
  const orderIds = (list.response?.order_list ?? []).map((order) => order.order_sn);

  if (orderIds.length === 0) {
    return [] as NormalizedOrder[];
  }

  const details = await shopeeGet<{
    response?: {
      order_list?: Array<{
        create_time?: number;
        item_list?: Array<{ item_name?: string; item_sku?: string; model_quantity_purchased?: number; model_discounted_price?: number }>;
        order_sn: string;
        order_status?: string;
        total_amount?: number;
      }>;
    };
  }>("/api/v2/order/get_order_detail", accessToken, shopId, {
    order_sn_list: orderIds.join(","),
    response_optional_fields: "order_status,total_amount,buyer_user_id,create_time,item_list",
  });

  return (details.response?.order_list ?? []).map((order) => ({
    channelId,
    externalId: order.order_sn,
    items: (order.item_list ?? []).map((item) => ({
      name: item.item_name ?? "Item vendido",
      quantity: Number(item.model_quantity_purchased ?? 1),
      sku: item.item_sku ?? null,
      totalPrice: Number(item.model_discounted_price ?? 0) * Number(item.model_quantity_purchased ?? 1),
      unitPrice: Number(item.model_discounted_price ?? 0),
    })),
    metadata: {
      provider,
      shop_id: shopId,
    },
    number: order.order_sn,
    orderedAt: order.create_time ? new Date(order.create_time * 1000).toISOString() : null,
    provider,
    status: (order.order_status === "COMPLETED" ? "fulfilled" : order.order_status === "CANCELLED" ? "cancelled" : "paid") as NormalizedOrder["status"],
    totalAmount: Number(order.total_amount ?? 0),
  }));
}

export async function syncShopeeAccount(accountId: string, workspaceId: string) {
  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase
    .from("marketplace_accounts")
    .select("id, workspace_id, channel_id, external_account_id, encrypted_access_token, encrypted_refresh_token, token_expires_at")
    .eq("id", accountId)
    .eq("workspace_id", workspaceId)
    .eq("provider", provider)
    .maybeSingle();

  if (error || !data) {
    throw new Error("Conta da Shopee nao encontrada.");
  }

  const account = data as {
    channel_id: string | null;
    encrypted_access_token: string | null;
    encrypted_refresh_token: string | null;
    external_account_id: string | null;
    id: string;
    token_expires_at: string | null;
    workspace_id: string;
  };

  try {
    await markSyncStarted({
      kind: "marketplace",
      provider,
      workspaceId,
    });

    let accessToken = account.encrypted_access_token ? decryptSecret(account.encrypted_access_token) : "";

    if (!accessToken || (account.token_expires_at && new Date(account.token_expires_at).getTime() < Date.now() + 60_000)) {
      accessToken = await refreshShopeeToken(account);
    }

    if (!account.external_account_id) {
      throw new Error("Conta sem identificacao da loja.");
    }

    const [products, orders] = await Promise.all([
      fetchShopeeProducts(accessToken, account.external_account_id, account.channel_id),
      fetchShopeeOrders(accessToken, account.external_account_id, account.channel_id),
    ]);
    const [productCount, orderCount] = await Promise.all([
      saveProducts(workspaceId, products),
      saveOrders(workspaceId, orders),
    ]);
    const insightCount = await generateAutomaticInsights(workspaceId);

    await markSyncFinished({
      accountId,
      kind: "marketplace",
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
      accountId,
      error: syncError instanceof Error ? syncError.message : "Falha na importacao.",
      kind: "marketplace",
      provider,
      status: "error",
      workspaceId,
    });
    throw syncError;
  }
}
