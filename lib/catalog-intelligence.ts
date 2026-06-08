import "server-only";

import { decryptSecret } from "@/lib/security/encryption";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServiceSupabaseClient } from "@/lib/supabase/service";

const mercadoLivreApi = "https://api.mercadolibre.com";

type RecommendationAction = "baixar" | "manter" | "subir" | "sair_da_disputa";

interface ProductCost {
  commissionCost: number;
  desiredMarginPercent: number;
  freightCost: number;
  marketplaceFeePercent: number;
  operationalCost: number;
  purchaseCost: number;
  taxPercent: number;
}

interface CatalogSellerInput {
  estimatedDelivery?: string | null;
  freeShipping: boolean;
  isFlex: boolean;
  isFull: boolean;
  itemId: string;
  logisticType?: string | null;
  metadata: Record<string, unknown>;
  permalink?: string | null;
  position: number;
  price: number;
  reputation?: string | null;
  reputationScore?: number | null;
  sellerId: string;
  sellerName?: string | null;
  shippingMode?: string | null;
  soldQuantity?: number | null;
}

interface MarginBreakdown {
  amount: number;
  percent: number;
}

interface MercadoLivreItem {
  id?: string;
  seller_id?: number;
  title?: string;
  price?: number;
  sold_quantity?: number;
  catalog_product_id?: string;
  catalog_listing?: boolean;
  permalink?: string;
  shipping?: {
    free_shipping?: boolean;
    logistic_type?: string;
    mode?: string;
    tags?: string[];
  };
}

interface MercadoLivreSearchResult {
  id?: string;
  seller?: { id?: number; nickname?: string };
  seller_id?: number;
  title?: string;
  price?: number;
  sold_quantity?: number;
  permalink?: string;
  shipping?: MercadoLivreItem["shipping"];
}

interface MercadoLivreUser {
  id?: number;
  nickname?: string;
  seller_reputation?: {
    level_id?: string;
    power_seller_status?: string;
    transactions?: {
      completed?: number;
      total?: number;
    };
  };
}

export interface CatalogProductOption {
  catalogProductId: string | null;
  id: string;
  name: string;
  price: number;
  sku: string | null;
}

export interface CatalogAnalysisSummary {
  averagePrice: number | null;
  canBeLowestPrice: boolean;
  confidence: number;
  createdAt: string;
  currentMarginAmount: number | null;
  currentMarginPercent: number | null;
  highestPrice: number | null;
  id: string;
  idealPrice: number | null;
  leadingSellerName: string | null;
  leadingSellerSales: number | null;
  lowestPrice: number | null;
  lowestPriceMarginAmount: number | null;
  lowestPriceMarginPercent: number | null;
  myPrice: number;
  productId: string | null;
  productName: string;
  purchaseCost: number;
  recommendation: string;
  recommendationSummary: string;
  riskLevel: string;
  sellers: Array<{
    freeShipping: boolean;
    isFlex: boolean;
    isFull: boolean;
    itemId: string | null;
    position: number | null;
    price: number;
    reputation: string | null;
    sellerName: string | null;
    soldQuantity: number | null;
  }>;
  undercutMarginAmount: number | null;
  undercutMarginPercent: number | null;
}

function toNumber(value: unknown, fallback = 0) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function marginForPrice(price: number, cost: ProductCost): MarginBreakdown {
  const variableFees = price * ((cost.marketplaceFeePercent + cost.taxPercent) / 100);
  const expenses = cost.purchaseCost + variableFees + cost.freightCost + cost.commissionCost + cost.operationalCost;
  const amount = roundMoney(price - expenses);

  return {
    amount,
    percent: price > 0 ? roundMoney((amount / price) * 100) : 0,
  };
}

function minimumProfitablePrice(cost: ProductCost, marginPercent: number) {
  const variableRate = (cost.marketplaceFeePercent + cost.taxPercent + marginPercent) / 100;
  const fixedCosts = cost.purchaseCost + cost.freightCost + cost.commissionCost + cost.operationalCost;
  const denominator = Math.max(1 - variableRate, 0.01);

  return roundMoney(fixedCosts / denominator);
}

function recommendationFor({
  currentMargin,
  lowestMargin,
  lowestPrice,
  myPrice,
  targetPrice,
}: {
  currentMargin: MarginBreakdown;
  lowestMargin: MarginBreakdown | null;
  lowestPrice: number | null;
  myPrice: number;
  targetPrice: number;
}): { action: RecommendationAction; risk: string; summary: string } {
  if (!lowestPrice) {
    return {
      action: currentMargin.percent < 8 ? "subir" : "manter",
      risk: "medium",
      summary: "Nao encontramos ofertas suficientes no catalogo. Preserve margem ate uma nova leitura competitiva.",
    };
  }

  if (lowestMargin && lowestMargin.amount <= 0) {
    return {
      action: "sair_da_disputa",
      risk: "high",
      summary: "Igualar o menor preco destruiria a margem. Dispute por qualidade, prazo ou saia da briga de preco.",
    };
  }

  if (myPrice > lowestPrice && lowestMargin && lowestMargin.percent >= 8) {
    return {
      action: "baixar",
      risk: lowestMargin.percent < 12 ? "medium" : "low",
      summary: "Ha margem para aproximar o menor preco, mas acompanhe frete, prazo e giro antes de automatizar queda.",
    };
  }

  if (myPrice < targetPrice && currentMargin.percent < 12) {
    return {
      action: "subir",
      risk: "medium",
      summary: "Seu preco esta competitivo, mas a margem esta apertada. Subir ate o preco ideal protege lucro.",
    };
  }

  return {
    action: "manter",
    risk: currentMargin.percent < 12 ? "medium" : "low",
    summary: "O preco atual preserva margem. Monitore o lider do catalogo antes de entrar em disputa agressiva.",
  };
}

async function mercadoLivreFetch<T>(path: string, accessToken?: string | null) {
  const response = await fetch(`${mercadoLivreApi}${path}`, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
  });

  if (!response.ok) {
    throw new Error(`Mercado Livre respondeu com falha ${response.status}.`);
  }

  return (await response.json()) as T;
}

async function getMercadoLivreAccess(workspaceId: string) {
  const supabase = createServiceSupabaseClient();
  const { data } = await supabase
    .from("marketplace_accounts")
    .select("id, encrypted_access_token")
    .eq("workspace_id", workspaceId)
    .eq("provider", "mercado_livre")
    .eq("status", "connected")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const account = data as { encrypted_access_token?: string | null; id: string } | null;

  if (!account?.encrypted_access_token) {
    throw new Error("Conecte o Mercado Livre antes de analisar catalogos.");
  }

  return {
    accessToken: decryptSecret(account.encrypted_access_token),
    accountId: account.id,
  };
}

async function getProductAndCost(workspaceId: string, productId: string) {
  const supabase = createServiceSupabaseClient();
  const [{ data: productData }, { data: costData }] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, sku, cost, price, metadata")
      .eq("workspace_id", workspaceId)
      .eq("id", productId)
      .maybeSingle(),
    supabase
      .from("product_costs")
      .select("purchase_cost, marketplace_fee_percent, tax_percent, freight_cost, commission_cost, operational_cost, desired_margin_percent")
      .eq("workspace_id", workspaceId)
      .eq("product_id", productId)
      .maybeSingle(),
  ]);
  const product = productData as
    | { cost: number; id: string; metadata: Record<string, unknown> | null; name: string; price: number; sku: string | null }
    | null;

  if (!product) {
    throw new Error("Produto nao encontrado.");
  }

  const costRow = costData as Partial<{
    commission_cost: number;
    desired_margin_percent: number;
    freight_cost: number;
    marketplace_fee_percent: number;
    operational_cost: number;
    purchase_cost: number;
    tax_percent: number;
  }> | null;

  return {
    cost: {
      commissionCost: toNumber(costRow?.commission_cost, 0),
      desiredMarginPercent: toNumber(costRow?.desired_margin_percent, 18),
      freightCost: toNumber(costRow?.freight_cost, 0),
      marketplaceFeePercent: toNumber(costRow?.marketplace_fee_percent, 16),
      operationalCost: toNumber(costRow?.operational_cost, 0),
      purchaseCost: toNumber(costRow?.purchase_cost, toNumber(product.cost, 0)),
      taxPercent: toNumber(costRow?.tax_percent, 8),
    } satisfies ProductCost,
    product,
  };
}

async function discoverCatalogProductId(product: { metadata: Record<string, unknown> | null }, accessToken: string) {
  const metadata = product.metadata ?? {};
  const direct = metadata.catalog_product_id ?? metadata.catalogProductId;

  if (direct) {
    return String(direct);
  }

  const itemId = metadata.external_id;

  if (!itemId) {
    return null;
  }

  const item = await mercadoLivreFetch<MercadoLivreItem>(`/items/${itemId}`, accessToken);

  return item.catalog_product_id ?? null;
}

async function fetchSellerDetails(sellerIds: string[], accessToken: string) {
  const uniqueIds = [...new Set(sellerIds)].filter(Boolean).slice(0, 25);
  const entries = await Promise.all(
    uniqueIds.map(async (sellerId) => {
      try {
        const user = await mercadoLivreFetch<MercadoLivreUser>(`/users/${sellerId}`, accessToken);
        return [sellerId, user] as const;
      } catch {
        return [sellerId, null] as const;
      }
    }),
  );

  return new Map(entries);
}

async function fetchCatalogOffers(catalogProductId: string, accessToken: string) {
  try {
    const response = await mercadoLivreFetch<{ results?: Array<Record<string, unknown>> }>(
      `/products/${catalogProductId}/items?status=active&limit=50`,
      accessToken,
    );
    const raw = response.results ?? [];

    return raw.map((item, index) => ({
      freeShipping: Boolean((item.shipping as MercadoLivreItem["shipping"] | undefined)?.free_shipping),
      isFlex: String((item.shipping as MercadoLivreItem["shipping"] | undefined)?.logistic_type ?? "").includes("self_service"),
      isFull: String((item.shipping as MercadoLivreItem["shipping"] | undefined)?.logistic_type ?? "").includes("fulfillment"),
      itemId: String(item.item_id ?? item.id ?? ""),
      logisticType: (item.shipping as MercadoLivreItem["shipping"] | undefined)?.logistic_type ?? null,
      metadata: item,
      permalink: item.permalink ? String(item.permalink) : null,
      position: index + 1,
      price: toNumber(item.price),
      sellerId: String(item.seller_id ?? ""),
      shippingMode: (item.shipping as MercadoLivreItem["shipping"] | undefined)?.mode ?? null,
      soldQuantity: item.sold_quantity === undefined ? null : toNumber(item.sold_quantity),
    })) satisfies CatalogSellerInput[];
  } catch {
    const search = await mercadoLivreFetch<{ results?: MercadoLivreSearchResult[] }>(
      `/sites/MLB/search?catalog_product_id=${encodeURIComponent(catalogProductId)}&limit=50`,
      accessToken,
    );

    return (search.results ?? []).map((item, index) => ({
      freeShipping: Boolean(item.shipping?.free_shipping),
      isFlex: String(item.shipping?.logistic_type ?? "").includes("self_service"),
      isFull: String(item.shipping?.logistic_type ?? "").includes("fulfillment"),
      itemId: String(item.id ?? ""),
      logisticType: item.shipping?.logistic_type ?? null,
      metadata: item as unknown as Record<string, unknown>,
      permalink: item.permalink ?? null,
      position: index + 1,
      price: toNumber(item.price),
      sellerId: String(item.seller?.id ?? item.seller_id ?? ""),
      sellerName: item.seller?.nickname ?? null,
      shippingMode: item.shipping?.mode ?? null,
      soldQuantity: item.sold_quantity === undefined ? null : toNumber(item.sold_quantity),
    })) satisfies CatalogSellerInput[];
  }
}

function enrichSellers(sellers: CatalogSellerInput[], users: Map<string, MercadoLivreUser | null>) {
  return sellers
    .filter((seller) => seller.itemId && seller.sellerId && seller.price > 0)
    .map((seller) => {
      const user = users.get(seller.sellerId);
      const completed = user?.seller_reputation?.transactions?.completed ?? null;

      return {
        ...seller,
        reputation: user?.seller_reputation?.power_seller_status ?? user?.seller_reputation?.level_id ?? seller.reputation ?? null,
        reputationScore: completed ? Math.min(completed / 1000, 100) : null,
        salesEstimate: seller.soldQuantity ?? completed ?? null,
        sellerName: seller.sellerName ?? user?.nickname ?? `Vendedor ${seller.sellerId}`,
      };
    });
}

export async function analyzeCatalogProduct({
  createdBy,
  productId,
  workspaceId,
}: {
  createdBy?: string | null;
  productId: string;
  workspaceId: string;
}) {
  const supabase = createServiceSupabaseClient();
  const [{ product, cost }, mercadoLivre] = await Promise.all([
    getProductAndCost(workspaceId, productId),
    getMercadoLivreAccess(workspaceId),
  ]);
  const catalogProductId = await discoverCatalogProductId(product, mercadoLivre.accessToken);

  if (!catalogProductId) {
    throw new Error("Este produto ainda nao tem identificacao de catalogo do Mercado Livre.");
  }

  const sellers = await fetchCatalogOffers(catalogProductId, mercadoLivre.accessToken);
  const enrichedSellers = enrichSellers(sellers, await fetchSellerDetails(sellers.map((seller) => seller.sellerId), mercadoLivre.accessToken));
  const prices = enrichedSellers.map((seller) => seller.price).sort((a, b) => a - b);
  const lowestPrice = prices[0] ?? null;
  const highestPrice = prices.at(-1) ?? null;
  const averagePrice = prices.length ? roundMoney(prices.reduce((total, price) => total + price, 0) / prices.length) : null;
  const lowestSeller = enrichedSellers.sort((a, b) => a.price - b.price)[0] ?? null;
  const leadingSeller =
    enrichedSellers
      .filter((seller) => seller.salesEstimate !== null && seller.salesEstimate !== undefined)
      .sort((a, b) => toNumber(b.salesEstimate) - toNumber(a.salesEstimate))[0] ?? null;
  const myPrice = toNumber(product.price);
  const currentMargin = marginForPrice(myPrice, cost);
  const lowestMargin = lowestPrice ? marginForPrice(lowestPrice, cost) : null;
  const undercutPrice = lowestPrice ? Math.max(lowestPrice - 0.01, 0) : null;
  const undercutMargin = undercutPrice ? marginForPrice(undercutPrice, cost) : null;
  const idealPrice = Math.max(minimumProfitablePrice(cost, cost.desiredMarginPercent), lowestPrice ?? 0);
  const recommendation = recommendationFor({
    currentMargin,
    lowestMargin,
    lowestPrice,
    myPrice,
    targetPrice: idealPrice,
  });
  const confidence = roundMoney(
    Math.min(95, 45 + Math.min(enrichedSellers.length, 20) * 2 + (leadingSeller?.salesEstimate ? 10 : 0) + (lowestPrice ? 10 : 0)),
  );

  const { data: analysisData, error } = await supabase
    .from("catalog_analyses")
    .insert({
      average_price: averagePrice,
      can_be_lowest_price: Boolean(undercutMargin && undercutMargin.amount > 0),
      catalog_product_id: catalogProductId,
      commission_cost: cost.commissionCost,
      confidence,
      created_by: createdBy ?? null,
      current_margin_amount: currentMargin.amount,
      current_margin_percent: currentMargin.percent,
      freight_cost: cost.freightCost,
      highest_price: highestPrice,
      ideal_price: idealPrice,
      item_id: product.metadata?.external_id ? String(product.metadata.external_id) : null,
      leading_seller_id: leadingSeller?.sellerId ?? null,
      leading_seller_name: leadingSeller?.sellerName ?? null,
      leading_seller_sales: leadingSeller?.salesEstimate ?? null,
      lowest_price: lowestPrice,
      lowest_price_margin_amount: lowestMargin?.amount ?? null,
      lowest_price_margin_percent: lowestMargin?.percent ?? null,
      lowest_price_seller_id: lowestSeller?.sellerId ?? null,
      lowest_price_seller_name: lowestSeller?.sellerName ?? null,
      marketplace_account_id: mercadoLivre.accountId,
      marketplace_fee_percent: cost.marketplaceFeePercent,
      my_price: myPrice,
      operational_cost: cost.operationalCost,
      product_id: product.id,
      product_name: product.name,
      provider: "mercado_livre",
      purchase_cost: cost.purchaseCost,
      recommendation: recommendation.action,
      recommendation_summary: recommendation.summary,
      risk_level: recommendation.risk,
      signals: {
        seller_count: enrichedSellers.length,
        undercut_price: undercutPrice,
      },
      tax_percent: cost.taxPercent,
      undercut_margin_amount: undercutMargin?.amount ?? null,
      undercut_margin_percent: undercutMargin?.percent ?? null,
      workspace_id: workspaceId,
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  const analysisId = (analysisData as { id: string }).id;

  if (enrichedSellers.length) {
    await supabase.from("catalog_sellers").insert(
      enrichedSellers.map((seller) => ({
        analysis_id: analysisId,
        catalog_position: seller.position,
        estimated_delivery: seller.estimatedDelivery ?? null,
        free_shipping: seller.freeShipping,
        is_flex: seller.isFlex,
        is_full: seller.isFull,
        item_id: seller.itemId,
        logistic_type: seller.logisticType ?? null,
        metadata: seller.metadata as never,
        permalink: seller.permalink ?? null,
        price: seller.price,
        provider: "mercado_livre",
        reputation: seller.reputation ?? null,
        reputation_score: seller.reputationScore ?? null,
        sales_estimate: seller.salesEstimate ?? null,
        seller_id: seller.sellerId,
        seller_name: seller.sellerName ?? null,
        shipping_mode: seller.shippingMode ?? null,
        sold_quantity: seller.soldQuantity ?? null,
        workspace_id: workspaceId,
      })),
    );
    await supabase.from("catalog_price_history").insert(
      enrichedSellers.map((seller) => ({
        analysis_id: analysisId,
        catalog_position: seller.position,
        item_id: seller.itemId,
        price: seller.price,
        product_id: product.id,
        provider: "mercado_livre",
        seller_id: seller.sellerId,
        workspace_id: workspaceId,
      })),
    );
    await supabase.from("catalog_sales_estimates").insert(
      enrichedSellers.map((seller) => ({
        analysis_id: analysisId,
        confidence: seller.soldQuantity !== null && seller.soldQuantity !== undefined ? 80 : 45,
        item_id: seller.itemId,
        product_id: product.id,
        provider: "mercado_livre",
        sales_estimate: seller.salesEstimate ?? null,
        seller_id: seller.sellerId,
        sold_quantity: seller.soldQuantity ?? null,
        source: seller.soldQuantity !== null && seller.soldQuantity !== undefined ? "marketplace_item" : "seller_reputation",
        workspace_id: workspaceId,
      })),
    );
  }

  const expectedMargin = marginForPrice(idealPrice, cost);

  await Promise.all([
    supabase.from("price_recommendations").insert({
      action: recommendation.action,
      analysis_id: analysisId,
      created_by: createdBy ?? null,
      current_price: myPrice,
      expected_margin_amount: expectedMargin.amount,
      expected_margin_percent: expectedMargin.percent,
      metadata: {
        catalog_product_id: catalogProductId,
        can_be_lowest_price: Boolean(undercutMargin && undercutMargin.amount > 0),
        lowest_price: lowestPrice,
      },
      minimum_profitable_price: minimumProfitablePrice(cost, 0),
      product_id: product.id,
      provider: "mercado_livre",
      rationale: recommendation.summary,
      recommended_price: idealPrice,
      target_margin_percent: cost.desiredMarginPercent,
      workspace_id: workspaceId,
    }),
    supabase.from("ai_insights").insert({
      agent_name: "Catalog Intelligence Agent",
      payload: {
        analysis_id: analysisId,
        product_id: product.id,
        recommendation: recommendation.action,
      },
      priority: recommendation.risk === "high" ? "high" : "medium",
      summary: recommendation.summary,
      title: `Catalogo: ${product.name}`,
      workspace_id: workspaceId,
    }),
  ]);

  return getCatalogAnalysis(workspaceId, analysisId);
}

export async function getCatalogProducts(workspaceId: string | null): Promise<CatalogProductOption[]> {
  if (!workspaceId) return [];

  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("products")
    .select("id, name, sku, price, metadata")
    .eq("workspace_id", workspaceId)
    .order("updated_at", { ascending: false })
    .limit(100);

  return (
    (data as Array<{ id: string; metadata: Record<string, unknown> | null; name: string; price: number; sku: string | null }> | null)?.map(
      (product) => ({
        catalogProductId: product.metadata?.catalog_product_id ? String(product.metadata.catalog_product_id) : null,
        id: product.id,
        name: product.name,
        price: toNumber(product.price),
        sku: product.sku,
      }),
    ) ?? []
  );
}

export async function getLatestCatalogAnalyses(workspaceId: string | null): Promise<CatalogAnalysisSummary[]> {
  if (!workspaceId) return [];

  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("catalog_analyses")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(8);
  const analyses = (data as Array<Record<string, unknown>> | null) ?? [];
  const sellerRows = analyses.length
    ? await supabase
        .from("catalog_sellers")
        .select("analysis_id, seller_name, item_id, price, sold_quantity, free_shipping, is_full, is_flex, reputation, catalog_position")
        .eq("workspace_id", workspaceId)
        .in(
          "analysis_id",
          analyses.map((analysis) => String(analysis.id)),
        )
        .order("catalog_position", { ascending: true })
    : { data: [] };
  const sellersByAnalysis = new Map<string, CatalogAnalysisSummary["sellers"]>();

  for (const seller of (sellerRows.data as Array<Record<string, unknown>> | null) ?? []) {
    const analysisId = String(seller.analysis_id);
    const current = sellersByAnalysis.get(analysisId) ?? [];
    current.push({
      freeShipping: Boolean(seller.free_shipping),
      isFlex: Boolean(seller.is_flex),
      isFull: Boolean(seller.is_full),
      itemId: seller.item_id ? String(seller.item_id) : null,
      position: seller.catalog_position === null ? null : toNumber(seller.catalog_position),
      price: toNumber(seller.price),
      reputation: seller.reputation ? String(seller.reputation) : null,
      sellerName: seller.seller_name ? String(seller.seller_name) : null,
      soldQuantity: seller.sold_quantity === null ? null : toNumber(seller.sold_quantity),
    });
    sellersByAnalysis.set(analysisId, current.slice(0, 10));
  }

  return analyses.map((analysis) => mapAnalysisSummary(analysis, sellersByAnalysis.get(String(analysis.id)) ?? []));
}

export async function getCatalogAnalysis(workspaceId: string, analysisId: string): Promise<CatalogAnalysisSummary> {
  const supabase = createServiceSupabaseClient();
  const [{ data: analysisData }, { data: sellersData }] = await Promise.all([
    supabase.from("catalog_analyses").select("*").eq("workspace_id", workspaceId).eq("id", analysisId).maybeSingle(),
    supabase
      .from("catalog_sellers")
      .select("seller_name, item_id, price, sold_quantity, free_shipping, is_full, is_flex, reputation, catalog_position")
      .eq("workspace_id", workspaceId)
      .eq("analysis_id", analysisId)
      .order("catalog_position", { ascending: true })
      .limit(10),
  ]);

  if (!analysisData) {
    throw new Error("Analise nao encontrada.");
  }

  return mapAnalysisSummary(analysisData as Record<string, unknown>, ((sellersData as Array<Record<string, unknown>> | null) ?? []).map((seller) => ({
    freeShipping: Boolean(seller.free_shipping),
    isFlex: Boolean(seller.is_flex),
    isFull: Boolean(seller.is_full),
    itemId: seller.item_id ? String(seller.item_id) : null,
    position: seller.catalog_position === null ? null : toNumber(seller.catalog_position),
    price: toNumber(seller.price),
    reputation: seller.reputation ? String(seller.reputation) : null,
    sellerName: seller.seller_name ? String(seller.seller_name) : null,
    soldQuantity: seller.sold_quantity === null ? null : toNumber(seller.sold_quantity),
  })));
}

function mapAnalysisSummary(
  analysis: Record<string, unknown>,
  sellers: CatalogAnalysisSummary["sellers"],
): CatalogAnalysisSummary {
  return {
    averagePrice: analysis.average_price === null ? null : toNumber(analysis.average_price),
    canBeLowestPrice: Boolean(analysis.can_be_lowest_price),
    confidence: toNumber(analysis.confidence),
    createdAt: String(analysis.created_at),
    currentMarginAmount: analysis.current_margin_amount === null ? null : toNumber(analysis.current_margin_amount),
    currentMarginPercent: analysis.current_margin_percent === null ? null : toNumber(analysis.current_margin_percent),
    highestPrice: analysis.highest_price === null ? null : toNumber(analysis.highest_price),
    id: String(analysis.id),
    idealPrice: analysis.ideal_price === null ? null : toNumber(analysis.ideal_price),
    leadingSellerName: analysis.leading_seller_name ? String(analysis.leading_seller_name) : null,
    leadingSellerSales: analysis.leading_seller_sales === null ? null : toNumber(analysis.leading_seller_sales),
    lowestPrice: analysis.lowest_price === null ? null : toNumber(analysis.lowest_price),
    lowestPriceMarginAmount: analysis.lowest_price_margin_amount === null ? null : toNumber(analysis.lowest_price_margin_amount),
    lowestPriceMarginPercent: analysis.lowest_price_margin_percent === null ? null : toNumber(analysis.lowest_price_margin_percent),
    myPrice: toNumber(analysis.my_price),
    productId: analysis.product_id ? String(analysis.product_id) : null,
    productName: String(analysis.product_name),
    purchaseCost: toNumber(analysis.purchase_cost),
    recommendation: String(analysis.recommendation),
    recommendationSummary: String(analysis.recommendation_summary),
    riskLevel: String(analysis.risk_level),
    sellers,
    undercutMarginAmount: analysis.undercut_margin_amount === null ? null : toNumber(analysis.undercut_margin_amount),
    undercutMarginPercent: analysis.undercut_margin_percent === null ? null : toNumber(analysis.undercut_margin_percent),
  };
}

export async function updateProductCost({
  productId,
  values,
  workspaceId,
}: {
  productId: string;
  values: ProductCost;
  workspaceId: string;
}) {
  const supabase = createServiceSupabaseClient();

  await supabase.from("product_costs").upsert(
    {
      commission_cost: values.commissionCost,
      desired_margin_percent: values.desiredMarginPercent,
      freight_cost: values.freightCost,
      marketplace_fee_percent: values.marketplaceFeePercent,
      operational_cost: values.operationalCost,
      product_id: productId,
      purchase_cost: values.purchaseCost,
      tax_percent: values.taxPercent,
      workspace_id: workspaceId,
    },
    { onConflict: "workspace_id,product_id" },
  );
}

export async function answerCatalogQuestion({
  analysisId,
  createdBy,
  question,
  workspaceId,
}: {
  analysisId: string;
  createdBy?: string | null;
  question: string;
  workspaceId: string;
}) {
  const analysis = await getCatalogAnalysis(workspaceId, analysisId);
  const lower = question.toLowerCase();
  let answer = analysis.recommendationSummary;

  if (lower.includes("menor") || lower.includes("baixar") || lower.includes("preco") || lower.includes("preço")) {
    answer = analysis.canBeLowestPrice
      ? `Voce pode disputar menor preco com margem positiva. No preco R$ ${analysis.lowestPrice?.toFixed(2)}, sua margem estimada fica em ${analysis.lowestPriceMarginPercent?.toFixed(2)}%.`
      : `Nao recomendo disputar menor preco agora. No menor preco do catalogo, a margem estimada fica em ${analysis.lowestPriceMarginPercent?.toFixed(2) ?? "0"}%.`;
  }

  if (lower.includes("lidera") || lower.includes("lídera") || lower.includes("quem")) {
    answer = `${analysis.leadingSellerName ?? "Nao identificado"} lidera por volume aproximado, com ${analysis.leadingSellerSales ?? 0} vendas/indicadores quando a API permitiu ler esse sinal.`;
  }

  if (lower.includes("margem")) {
    answer = `Sua margem atual estimada e ${analysis.currentMarginPercent?.toFixed(2) ?? "0"}%. A margem no menor preco seria ${analysis.lowestPriceMarginPercent?.toFixed(2) ?? "0"}%.`;
  }

  if (lower.includes("comprar")) {
    answer = "Use esta analise junto do giro real de pedidos e estoque. Se a recomendacao for baixar com margem positiva e houver estoque baixo, priorize compra moderada; se for sair da disputa, compre apenas reposicao defensiva.";
  }

  const supabase = createServiceSupabaseClient();
  await supabase.from("price_recommendations").insert({
    action: analysis.recommendation,
    analysis_id: analysis.id,
    answer,
    created_by: createdBy ?? null,
    current_price: analysis.myPrice,
    expected_margin_amount: analysis.currentMarginAmount ?? 0,
    expected_margin_percent: analysis.currentMarginPercent ?? 0,
    minimum_profitable_price: analysis.purchaseCost,
    product_id: analysis.productId,
    provider: "mercado_livre",
    question,
    rationale: analysis.recommendationSummary,
    recommended_price: analysis.idealPrice ?? analysis.myPrice,
    target_margin_percent: 0,
    workspace_id: workspaceId,
  });

  return {
    answer,
    analysis,
  };
}
