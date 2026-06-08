import "server-only";

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

const provider = "mercado_livre";
const apiBaseUrl = "https://api.mercadolibre.com";

interface MercadoLivreTokenResponse {
  access_token: string;
  expires_in?: number;
  refresh_token?: string;
  user_id?: number;
}

interface MercadoLivreUser {
  id: number;
  nickname?: string;
  first_name?: string;
  last_name?: string;
}

async function mercadoLivreFetch<T>(path: string, accessToken: string, init?: RequestInit) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Mercado Livre respondeu com falha ${response.status}.`);
  }

  return (await response.json()) as T;
}

export function buildMercadoLivreAuthUrl(state: string) {
  const url = new URL("https://auth.mercadolivre.com.br/authorization");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", env.MERCADO_LIVRE_CLIENT_ID);
  url.searchParams.set("redirect_uri", env.MERCADO_LIVRE_REDIRECT_URI);
  url.searchParams.set("state", state);

  return url.toString();
}

export async function exchangeMercadoLivreCode(code: string) {
  const body = new URLSearchParams({
    client_id: env.MERCADO_LIVRE_CLIENT_ID,
    client_secret: env.MERCADO_LIVRE_CLIENT_SECRET,
    code,
    grant_type: "authorization_code",
    redirect_uri: env.MERCADO_LIVRE_REDIRECT_URI,
  });
  const response = await fetch(`${apiBaseUrl}/oauth/token`, {
    body,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Nao conseguimos concluir a autorizacao do Mercado Livre.");
  }

  return (await response.json()) as MercadoLivreTokenResponse;
}

async function refreshMercadoLivreToken(account: {
  encrypted_refresh_token: string | null;
  id: string;
  workspace_id: string;
}) {
  if (!account.encrypted_refresh_token) {
    throw new Error("Conta sem permissao renovavel.");
  }

  const refreshToken = decryptSecret(account.encrypted_refresh_token);
  const body = new URLSearchParams({
    client_id: env.MERCADO_LIVRE_CLIENT_ID,
    client_secret: env.MERCADO_LIVRE_CLIENT_SECRET,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
  const response = await fetch(`${apiBaseUrl}/oauth/token`, {
    body,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Nao conseguimos renovar a conexao do Mercado Livre.");
  }

  const token = (await response.json()) as MercadoLivreTokenResponse;
  const supabase = createServiceSupabaseClient();

  await supabase
    .from("marketplace_accounts")
    .update({
      encrypted_access_token: encryptSecret(token.access_token),
      encrypted_refresh_token: token.refresh_token ? encryptSecret(token.refresh_token) : account.encrypted_refresh_token,
      token_expires_at: token.expires_in ? new Date(Date.now() + token.expires_in * 1000).toISOString() : null,
    })
    .eq("id", account.id)
    .eq("workspace_id", account.workspace_id);

  return token.access_token;
}

export async function saveMercadoLivreConnection({
  token,
  workspaceId,
}: {
  token: MercadoLivreTokenResponse;
  workspaceId: string;
}) {
  const supabase = createServiceSupabaseClient();
  const user = await mercadoLivreFetch<MercadoLivreUser>("/users/me", token.access_token);
  const channelId = await getOrCreateChannel({
    code: provider,
    name: "Mercado Livre",
    type: "marketplace",
    workspaceId,
  });
  const accountName = user.nickname ?? ([user.first_name, user.last_name].filter(Boolean).join(" ") || "Mercado Livre");
  const { data: existing } = await supabase
    .from("marketplace_accounts")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("provider", provider)
    .eq("external_account_id", String(user.id))
    .maybeSingle();
  const payload = {
    account_name: accountName,
    channel_id: channelId,
    connected_at: new Date().toISOString(),
    encrypted_access_token: encryptSecret(token.access_token),
    encrypted_refresh_token: token.refresh_token ? encryptSecret(token.refresh_token) : null,
    external_account_id: String(user.id),
    metadata: {
      nickname: user.nickname ?? null,
      seller_id: user.id,
    },
    provider,
    status: "connected",
    token_expires_at: token.expires_in ? new Date(Date.now() + token.expires_in * 1000).toISOString() : null,
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

function sellerSku(item: Record<string, unknown>) {
  const attributes = (item.attributes as Array<{ id?: string; value_name?: string }> | undefined) ?? [];
  return (
    String(item.seller_custom_field ?? "") ||
    attributes.find((attribute) => attribute.id === "SELLER_SKU")?.value_name ||
    null
  );
}

async function fetchMercadoLivreProducts(accessToken: string, sellerId: string, channelId: string | null) {
  const search = await mercadoLivreFetch<{ results?: string[] }>(
    `/users/${sellerId}/items/search?limit=50&status=active`,
    accessToken,
  );
  const ids = (search.results ?? []).slice(0, 50);

  if (ids.length === 0) {
    return [] as NormalizedProduct[];
  }

  const details = await mercadoLivreFetch<Array<{ body?: Record<string, unknown> }>>(
    `/items?ids=${ids.join(",")}`,
    accessToken,
  );

  return details
    .map((entry) => entry.body)
    .filter(Boolean)
    .map((item) => ({
      channelId,
      description: String(item?.subtitle ?? ""),
      externalId: String(item?.id),
      metadata: {
        listing_type_id: item?.listing_type_id ?? null,
        permalink: item?.permalink ?? null,
        thumbnail: item?.thumbnail ?? null,
      },
      name: String(item?.title ?? "Produto Mercado Livre"),
      price: Number(item?.price ?? 0),
      provider,
      sku: sellerSku(item ?? {}),
      status: String(item?.status ?? "active"),
      stock: Number(item?.available_quantity ?? 0),
    }));
}

async function fetchMercadoLivreOrders(accessToken: string, sellerId: string, channelId: string | null) {
  const response = await mercadoLivreFetch<{ results?: Array<Record<string, unknown>> }>(
    `/orders/search?seller=${sellerId}&sort=date_desc&limit=50`,
    accessToken,
  );

  return (response.results ?? []).map((order) => {
    const buyer = (order.buyer as { nickname?: string; email?: string } | undefined) ?? {};
    const items =
      (order.order_items as
        | Array<{
            item?: { id?: string; seller_sku?: string; title?: string };
            quantity?: number;
            unit_price?: number;
          }>
        | undefined) ?? [];

    return {
      channelId,
      customerEmail: buyer.email ?? null,
      customerName: buyer.nickname ?? null,
      externalId: String(order.id),
      items: items.map((item) => ({
        externalProductId: item.item?.id ?? null,
        name: item.item?.title ?? "Item vendido",
        quantity: Number(item.quantity ?? 1),
        sku: item.item?.seller_sku ?? null,
        totalPrice: Number(item.quantity ?? 1) * Number(item.unit_price ?? 0),
        unitPrice: Number(item.unit_price ?? 0),
      })),
      metadata: {
        provider,
      },
      number: String(order.id),
      orderedAt: String(order.date_created ?? ""),
      provider,
      status: String(order.status ?? "pending") as NormalizedOrder["status"],
      totalAmount: Number(order.total_amount ?? 0),
    };
  });
}

export async function syncMercadoLivreAccount(accountId: string, workspaceId: string) {
  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase
    .from("marketplace_accounts")
    .select("id, workspace_id, channel_id, external_account_id, encrypted_access_token, encrypted_refresh_token, token_expires_at")
    .eq("id", accountId)
    .eq("workspace_id", workspaceId)
    .eq("provider", provider)
    .maybeSingle();

  if (error || !data) {
    throw new Error("Conta do Mercado Livre nao encontrada.");
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
      accessToken = await refreshMercadoLivreToken(account);
    }

    const sellerId = account.external_account_id;

    if (!sellerId) {
      throw new Error("Conta sem identificacao de vendedor.");
    }

    const [products, orders] = await Promise.all([
      fetchMercadoLivreProducts(accessToken, sellerId, account.channel_id),
      fetchMercadoLivreOrders(accessToken, sellerId, account.channel_id),
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
