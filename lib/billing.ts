import { hasSupabaseEnv } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type PlanCode = "starter" | "growth" | "scale" | "enterprise";

export interface PlanDefinition {
  code: PlanCode;
  description: string;
  features: string[];
  limits: {
    aiMessagesPerMonth: number | null;
    marketPlaces: number | null;
    maxOrdersPerMonth: number | null;
    maxProducts: number | null;
    maxUsers: number | null;
  };
  name: string;
  priceLabel: string;
}

export interface WorkspaceSubscriptionSummary {
  cancelAtPeriodEnd: boolean;
  currentPeriodEndsAt: string | null;
  planCode: PlanCode;
  status: "trialing" | "active" | "past_due" | "canceled" | "incomplete";
  trialEndsAt: string | null;
}

export const planDefinitions: PlanDefinition[] = [
  {
    code: "starter",
    description: "Para começar a unificar catálogo, pedidos e IA com disciplina.",
    features: ["1 empresa", "Até 500 produtos", "Até 1.000 pedidos/mês", "1 marketplace", "Perguntas para IA limitadas"],
    limits: {
      aiMessagesPerMonth: 40,
      marketPlaces: 1,
      maxOrdersPerMonth: 1000,
      maxProducts: 500,
      maxUsers: 1,
    },
    name: "Starter",
    priceLabel: "Trial + entrada comercial",
  },
  {
    code: "growth",
    description: "Para times que já operam múltiplos canais e precisam de IA mais frequente.",
    features: ["Até 5 usuários", "Até 5.000 produtos", "Até 10.000 pedidos/mês", "Marketplaces ilimitados", "Supplier Network", "Agentes de IA"],
    limits: {
      aiMessagesPerMonth: 400,
      marketPlaces: null,
      maxOrdersPerMonth: 10000,
      maxProducts: 5000,
      maxUsers: 5,
    },
    name: "Growth",
    priceLabel: "Plano recomendado",
  },
  {
    code: "scale",
    description: "Para operações multiempresa com marca própria, rotinas inteligentes e IA avançada.",
    features: ["Multiempresa", "Marca própria", "Integrações avançadas", "Rotinas inteligentes", "IA avançada"],
    limits: {
      aiMessagesPerMonth: 2000,
      marketPlaces: null,
      maxOrdersPerMonth: null,
      maxProducts: null,
      maxUsers: 25,
    },
    name: "Scale",
    priceLabel: "Sob consulta comercial",
  },
  {
    code: "enterprise",
    description: "Para clientes com SLA, integrações dedicadas e requisitos avançados de segurança.",
    features: ["Customização", "SLA", "Suporte prioritário", "Integrações dedicadas", "Segurança avançada"],
    limits: {
      aiMessagesPerMonth: null,
      marketPlaces: null,
      maxOrdersPerMonth: null,
      maxProducts: null,
      maxUsers: null,
    },
    name: "Enterprise",
    priceLabel: "Customizado",
  },
];

export function getPlanDefinition(planCode: PlanCode) {
  return planDefinitions.find((plan) => plan.code === planCode) ?? planDefinitions[0];
}

export async function getWorkspaceSubscription(workspaceId: string | null): Promise<WorkspaceSubscriptionSummary> {
  if (!hasSupabaseEnv || !workspaceId) {
    return {
      cancelAtPeriodEnd: false,
      currentPeriodEndsAt: null,
      planCode: "starter",
      status: "trialing",
      trialEndsAt: null,
    };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase
      .from("workspace_subscriptions")
      .select("plan_code, status, trial_ends_at, current_period_ends_at, cancel_at_period_end")
      .eq("workspace_id", workspaceId)
      .maybeSingle();

    const row = data as
      | {
          cancel_at_period_end: boolean;
          current_period_ends_at: string | null;
          plan_code: PlanCode;
          status: WorkspaceSubscriptionSummary["status"];
          trial_ends_at: string | null;
        }
      | null;

    if (!row) {
      return {
        cancelAtPeriodEnd: false,
        currentPeriodEndsAt: null,
        planCode: "starter",
        status: "trialing",
        trialEndsAt: null,
      };
    }

    return {
      cancelAtPeriodEnd: row.cancel_at_period_end,
      currentPeriodEndsAt: row.current_period_ends_at,
      planCode: row.plan_code,
      status: row.status,
      trialEndsAt: row.trial_ends_at,
    };
  } catch {
    return {
      cancelAtPeriodEnd: false,
      currentPeriodEndsAt: null,
      planCode: "starter",
      status: "trialing",
      trialEndsAt: null,
    };
  }
}

export async function getWorkspaceUsage(workspaceId: string | null) {
  if (!hasSupabaseEnv || !workspaceId) {
    return {
      aiMessagesThisMonth: 0,
      connectedMarketplaces: 0,
      ordersThisMonth: 0,
      products: 0,
      workspaceMembers: 0,
    };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const periodStart = new Date();
    periodStart.setUTCDate(1);
    periodStart.setUTCHours(0, 0, 0, 0);

    const countRows = async (table: string, extra?: { column: string; value: string }) => {
      let query = supabase
        .from(table)
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("workspace_id", workspaceId);

      if (extra) {
        query = query.gte(extra.column, extra.value);
      }

      const { count } = await query;
      return count ?? 0;
    };

    const [products, connectedMarketplaces, ordersThisMonth, aiMessagesThisMonth, workspaceMembers] = await Promise.all([
      countRows("products"),
      countRows("marketplace_accounts"),
      countRows("orders", { column: "created_at", value: periodStart.toISOString() }),
      countRows("ai_messages", { column: "created_at", value: periodStart.toISOString() }),
      countRows("workspace_members"),
    ]);

    return {
      aiMessagesThisMonth,
      connectedMarketplaces,
      ordersThisMonth,
      products,
      workspaceMembers,
    };
  } catch {
    return {
      aiMessagesThisMonth: 0,
      connectedMarketplaces: 0,
      ordersThisMonth: 0,
      products: 0,
      workspaceMembers: 0,
    };
  }
}

export function isUsageLimited(
  planCode: PlanCode,
  metric: keyof Awaited<ReturnType<typeof getWorkspaceUsage>>,
  value: number,
) {
  const plan = getPlanDefinition(planCode);
  const limitMap = {
    aiMessagesThisMonth: plan.limits.aiMessagesPerMonth,
    connectedMarketplaces: plan.limits.marketPlaces,
    ordersThisMonth: plan.limits.maxOrdersPerMonth,
    products: plan.limits.maxProducts,
    workspaceMembers: plan.limits.maxUsers,
  } as const;

  const limit = limitMap[metric];

  if (limit === null) {
    return false;
  }

  return value >= limit;
}
