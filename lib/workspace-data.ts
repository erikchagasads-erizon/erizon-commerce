import { hasSupabaseEnv } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface WorkspaceSnapshot {
  counts: {
    finance: number;
    insights: number;
    memories: number;
    orders: number;
    products: number;
    suppliers: number;
  };
  recentInsights: Array<{
    agentName: string;
    createdAt: string;
    summary: string;
    title: string;
  }>;
  recentOrders: Array<{
    createdAt: string;
    orderNumber: string;
    status: string;
    totalAmount: number;
  }>;
}

export async function getWorkspaceSnapshot(workspaceId: string | null): Promise<WorkspaceSnapshot> {
  if (!hasSupabaseEnv || !workspaceId) {
    return {
      recentInsights: [],
      recentOrders: [],
      counts: {
        finance: 0,
        insights: 0,
        memories: 0,
        orders: 0,
        products: 0,
        suppliers: 0,
      },
    };
  }

  const supabase = await createServerSupabaseClient();

  const countRows = async (
    table: "products" | "orders" | "financial_transactions" | "suppliers" | "ai_insights" | "ai_memories",
  ) => {
    const { count } = await supabase
      .from(table)
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("workspace_id", workspaceId);

    return count ?? 0;
  };

  const [
    { data: recentOrdersData },
    { data: recentInsightsData },
    productCount,
    orderCount,
    financeCount,
    supplierCount,
    insightCount,
    memoryCount,
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("order_number, status, total_amount, created_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("ai_insights")
      .select("agent_name, title, summary, created_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(4),
    countRows("products"),
    countRows("orders"),
    countRows("financial_transactions"),
    countRows("suppliers"),
    countRows("ai_insights"),
    countRows("ai_memories"),
  ]);

  return {
    recentInsights:
      (recentInsightsData as
        | Array<{
            agent_name: string;
            title: string;
            summary: string;
            created_at: string;
          }>
        | null
        | undefined)?.map((item) => ({
        agentName: item.agent_name,
        createdAt: item.created_at,
        summary: item.summary,
        title: item.title,
      })) ?? [],
    recentOrders:
      (recentOrdersData as
        | Array<{
            created_at: string;
            order_number: string;
            status: string;
            total_amount: number;
          }>
        | null
        | undefined)?.map((item) => ({
        createdAt: item.created_at,
        orderNumber: item.order_number,
        status: item.status,
        totalAmount: Number(item.total_amount ?? 0),
      })) ?? [],
    counts: {
      finance: financeCount,
      insights: insightCount,
      memories: memoryCount,
      orders: orderCount,
      products: productCount,
      suppliers: supplierCount,
    },
  };
}

