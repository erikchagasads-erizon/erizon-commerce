import "server-only";

import { hasSupabaseEnv } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface CommerceDashboard {
  connectedChannels: number;
  dailyOrders: number;
  dailyRevenue: number;
  estimatedProfit: number;
  latestSyncs: Array<{ createdAt: string; message: string; provider: string; status: string }>;
  lowStockProducts: Array<{ name: string; sku: string | null; stock: number }>;
  outOfStockProducts: Array<{ name: string; sku: string | null }>;
  recentInsights: Array<{ createdAt: string; summary: string; title: string }>;
  topProducts: Array<{ name: string; quantity: number; revenue: number; sku: string | null }>;
}

export interface ProductRow {
  channel: string;
  id: string;
  name: string;
  price: number;
  sales: number;
  sku: string | null;
  status: string;
  stock: number;
}

export interface OrderRow {
  channel: string;
  customer: string | null;
  date: string;
  id: string;
  number: string;
  status: string;
  value: number;
}

export interface StockRow {
  id: string;
  name: string;
  sku: string | null;
  stock: number;
  updatedAt: string;
}

export interface StockMovementRow {
  createdAt: string;
  id: string;
  notes: string | null;
  productName: string;
  quantity: number;
  type: string;
}

function startOfTodayIso() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

function providerLabel(value?: unknown) {
  if (value === "mercado_livre") return "Mercado Livre";
  if (value === "shopee") return "Shopee";
  if (value === "storefront") return "Site proprio";
  return "Canal conectado";
}

export async function getCommerceDashboard(workspaceId: string | null): Promise<CommerceDashboard> {
  if (!hasSupabaseEnv || !workspaceId) {
    return {
      connectedChannels: 0,
      dailyOrders: 0,
      dailyRevenue: 0,
      estimatedProfit: 0,
      latestSyncs: [],
      lowStockProducts: [],
      outOfStockProducts: [],
      recentInsights: [],
      topProducts: [],
    };
  }

  const supabase = await createServerSupabaseClient();
  const today = startOfTodayIso();
  const [
    { data: orderData },
    { data: itemData },
    { data: productData },
    { data: insightData },
    { data: marketData },
    { data: ecommerceData },
    { data: logsData },
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("id, total_amount, created_at")
      .eq("workspace_id", workspaceId)
      .gte("created_at", today),
    supabase
      .from("order_items")
      .select("name, sku, quantity, total_price")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(200),
    supabase
      .from("products")
      .select("name, sku, cost, price, metadata")
      .eq("workspace_id", workspaceId)
      .limit(200),
    supabase
      .from("ai_insights")
      .select("title, summary, created_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("marketplace_accounts").select("id").eq("workspace_id", workspaceId).eq("status", "connected"),
    supabase.from("ecommerce_integrations").select("id").eq("workspace_id", workspaceId).eq("status", "connected"),
    supabase
      .from("integration_logs")
      .select("provider, status, message, created_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const orders = (orderData as Array<{ total_amount: number }> | null) ?? [];
  const products =
    (productData as Array<{ cost: number; metadata: Record<string, unknown> | null; name: string; price: number; sku: string | null }> | null) ??
    [];
  const items = (itemData as Array<{ name: string; quantity: number; sku: string | null; total_price: number }> | null) ?? [];
  const bySku = new Map<string, { name: string; quantity: number; revenue: number; sku: string | null }>();

  for (const item of items) {
    const key = item.sku ?? item.name;
    const current = bySku.get(key) ?? { name: item.name, quantity: 0, revenue: 0, sku: item.sku };
    current.quantity += Number(item.quantity ?? 0);
    current.revenue += Number(item.total_price ?? 0);
    bySku.set(key, current);
  }

  const lowStock = products
    .map((product) => ({ name: product.name, sku: product.sku, stock: Number(product.metadata?.stock ?? 0) }))
    .filter((product) => product.stock > 0 && product.stock <= 3)
    .slice(0, 6);
  const outOfStock = products
    .map((product) => ({ name: product.name, sku: product.sku, stock: Number(product.metadata?.stock ?? 0) }))
    .filter((product) => product.stock <= 0)
    .slice(0, 6);
  const revenue = orders.reduce((total, order) => total + Number(order.total_amount ?? 0), 0);
  const productMargin = products.reduce((total, product) => total + Math.max(Number(product.price ?? 0) - Number(product.cost ?? 0), 0), 0);

  return {
    connectedChannels: ((marketData as unknown[] | null) ?? []).length + ((ecommerceData as unknown[] | null) ?? []).length,
    dailyOrders: orders.length,
    dailyRevenue: revenue,
    estimatedProfit: productMargin > 0 ? Math.round(revenue * 0.22) : Math.round(revenue * 0.15),
    latestSyncs:
      (logsData as Array<{ created_at: string; message: string; provider: string; status: string }> | null)?.map((log) => ({
        createdAt: log.created_at,
        message: log.message,
        provider: providerLabel(log.provider),
        status: log.status,
      })) ?? [],
    lowStockProducts: lowStock,
    outOfStockProducts: outOfStock.map((product) => ({ name: product.name, sku: product.sku })),
    recentInsights:
      (insightData as Array<{ created_at: string; summary: string; title: string }> | null)?.map((insight) => ({
        createdAt: insight.created_at,
        summary: insight.summary,
        title: insight.title,
      })) ?? [],
    topProducts: [...bySku.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 5),
  };
}

export async function getProducts(workspaceId: string | null): Promise<ProductRow[]> {
  if (!hasSupabaseEnv || !workspaceId) return [];

  const supabase = await createServerSupabaseClient();
  const [{ data: productData }, { data: itemData }] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, sku, price, status, metadata, updated_at")
      .eq("workspace_id", workspaceId)
      .order("updated_at", { ascending: false })
      .limit(100),
    supabase.from("order_items").select("sku, quantity").eq("workspace_id", workspaceId).limit(500),
  ]);
  const sales = new Map<string, number>();

  for (const item of (itemData as Array<{ quantity: number; sku: string | null }> | null) ?? []) {
    if (item.sku) sales.set(item.sku, (sales.get(item.sku) ?? 0) + Number(item.quantity ?? 0));
  }

  return (
    (productData as
      | Array<{ id: string; metadata: Record<string, unknown> | null; name: string; price: number; sku: string | null; status: string }>
      | null)?.map((product) => ({
      channel: providerLabel(product.metadata?.provider),
      id: product.id,
      name: product.name,
      price: Number(product.price ?? 0),
      sales: product.sku ? sales.get(product.sku) ?? 0 : 0,
      sku: product.sku,
      status: product.status,
      stock: Number(product.metadata?.stock ?? 0),
    })) ?? []
  );
}

export async function getOrders(workspaceId: string | null): Promise<OrderRow[]> {
  if (!hasSupabaseEnv || !workspaceId) return [];

  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("orders")
    .select("id, order_number, customer_name, total_amount, status, ordered_at, created_at, metadata")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    (data as
      | Array<{
          created_at: string;
          customer_name: string | null;
          id: string;
          metadata: Record<string, unknown> | null;
          order_number: string;
          ordered_at: string | null;
          status: string;
          total_amount: number;
        }>
      | null)?.map((order) => ({
      channel: providerLabel(order.metadata?.provider),
      customer: order.customer_name,
      date: order.ordered_at ?? order.created_at,
      id: order.id,
      number: order.order_number,
      status: order.status,
      value: Number(order.total_amount ?? 0),
    })) ?? []
  );
}

export async function getStock(workspaceId: string | null) {
  if (!hasSupabaseEnv || !workspaceId) {
    return { movements: [] as StockMovementRow[], products: [] as StockRow[] };
  }

  const supabase = await createServerSupabaseClient();
  const [{ data: productData }, { data: movementData }] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, sku, metadata, updated_at")
      .eq("workspace_id", workspaceId)
      .order("updated_at", { ascending: false })
      .limit(100),
    supabase
      .from("stock_movements")
      .select("id, movement_type, quantity, notes, created_at, products(name)")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  return {
    movements:
      (movementData as
        | Array<{ created_at: string; id: string; movement_type: string; notes: string | null; products: { name: string } | null; quantity: number }>
        | null)?.map((movement) => ({
        createdAt: movement.created_at,
        id: movement.id,
        notes: movement.notes,
        productName: movement.products?.name ?? "Produto",
        quantity: Number(movement.quantity ?? 0),
        type: movement.movement_type,
      })) ?? [],
    products:
      (productData as
        | Array<{ id: string; metadata: Record<string, unknown> | null; name: string; sku: string | null; updated_at: string }>
        | null)?.map((product) => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        stock: Number(product.metadata?.stock ?? 0),
        updatedAt: product.updated_at,
      })) ?? [],
  };
}

