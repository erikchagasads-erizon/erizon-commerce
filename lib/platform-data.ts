import { hasSupabaseEnv } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type AppSupabaseClient = Awaited<ReturnType<typeof createServerSupabaseClient>>;
type CountFilter =
  | { column: string; kind: "eq"; value: unknown }
  | { column: string; kind: "in"; values: unknown[] };

interface SourceCoverageRecord {
  count: number;
  description: string;
  label: string;
}

export interface DataCloudMetricRecord {
  metricKey: string;
  metricLabel: string;
  observedAt: string;
  sourceSystems: string[];
  trendDirection: string | null;
  valueNumeric: number | null;
}

export interface PredictiveModelRecord {
  confidence: number | null;
  horizon: string | null;
  lastScoredAt: string | null;
  modelKey: string;
  modelName: string;
  status: string;
}

export interface DataCloudSnapshot {
  executiveIndicatorCount: number;
  latestMetrics: DataCloudMetricRecord[];
  metricCount: number;
  predictiveModelCount: number;
  predictiveModels: PredictiveModelRecord[];
  sourceCoverage: SourceCoverageRecord[];
}

export interface EventRecord {
  aggregateType: string;
  eventName: string;
  occurredAt: string;
  sourceModule: string;
  status: string;
}

export interface EventSubscriptionRecord {
  endpointUrl: string | null;
  lastDeliveryAt: string | null;
  status: string;
  subscribedEvents: string[];
  targetType: string;
}

export interface EventTriggerRecord {
  eventName: string;
  name: string;
  status: string;
  targetType: string;
}

export interface EventBusSnapshot {
  eventCount: number;
  failedDeliveryCount: number;
  queuedDeliveryCount: number;
  recentEvents: EventRecord[];
  subscriptions: EventSubscriptionRecord[];
  subscriptionCount: number;
  triggerCount: number;
  triggers: EventTriggerRecord[];
}

export interface AutomationRuleRecord {
  enabled: boolean;
  name: string;
  sourceModule: string | null;
  triggerType: string;
  updatedAt: string;
}

export interface AutomationRunRecord {
  completedAt: string | null;
  ruleName: string;
  startedAt: string;
  status: string;
}

export interface AutomationSnapshot {
  enabledRuleCount: number;
  failedRunCount: number;
  recentRuns: AutomationRunRecord[];
  rules: AutomationRuleRecord[];
  runCount: number;
  ruleCount: number;
}

export interface MarketSignalRecord {
  direction: string;
  observedAt: string;
  productName: string | null;
  score: number | null;
  signalType: string;
  source: string;
  summary: string | null;
}

export interface MarketRecommendationRecord {
  confidence: number | null;
  priority: string;
  status: string;
  summary: string;
  title: string;
}

export interface MarketCompetitorRecord {
  category: string | null;
  competitorName: string;
  source: string;
  threatLevel: string;
}

export interface MarketIntelligenceSnapshot {
  competitorCount: number;
  competitors: MarketCompetitorRecord[];
  recommendationCount: number;
  recommendations: MarketRecommendationRecord[];
  signalCount: number;
  signals: MarketSignalRecord[];
  sourceCount: number;
}

export interface MobileDeviceRecord {
  appVersion: string | null;
  lastSeenAt: string;
  platform: string;
  pushEnabled: boolean;
}

export interface ApprovalRequestRecord {
  requestType: string;
  requestedAt: string;
  status: string;
  title: string;
}

export interface MobileReadinessSnapshot {
  apiKeyCount: number;
  approvalRequests: ApprovalRequestRecord[];
  deviceCount: number;
  devices: MobileDeviceRecord[];
  pendingApprovalCount: number;
  pushEnabledCount: number;
}

async function safeCount(
  supabase: AppSupabaseClient,
  table: string,
  workspaceId: string,
  filter?: CountFilter,
) {
  let query = supabase.from(table).select("*", { count: "exact", head: true }).eq("workspace_id", workspaceId);

  if (filter?.kind === "eq") {
    query = query.eq(filter.column, filter.value);
  }

  if (filter?.kind === "in") {
    query = query.in(filter.column, filter.values);
  }

  const { count, error } = await query;
  return error ? 0 : count ?? 0;
}

async function safeSelect<T>(queryPromise: PromiseLike<{ data: T[] | null; error: { message: string } | null }>) {
  const { data, error } = await queryPromise;
  return error ? ([] as T[]) : (data ?? []);
}

export async function getDataCloudSnapshot(workspaceId: string | null): Promise<DataCloudSnapshot> {
  const executiveIndicatorCount = 11;

  if (!hasSupabaseEnv || !workspaceId) {
    return {
      executiveIndicatorCount,
      latestMetrics: [],
      metricCount: 0,
      predictiveModelCount: 0,
      predictiveModels: [],
      sourceCoverage: [
        {
          count: 0,
          description: "Pedidos, catalogo e operacao comercial.",
          label: "Commerce AI",
        },
        {
          count: 0,
          description: "Contatos, pipeline e relacionamento.",
          label: "CRM AI",
        },
        {
          count: 0,
          description: "Campanhas, investimento e retorno.",
          label: "Marketing AI",
        },
        {
          count: 0,
          description: "Catalogos e recomendacoes de compra.",
          label: "Supplier Network",
        },
        {
          count: 0,
          description: "Receitas, despesas e rentabilidade.",
          label: "Financeiro",
        },
        {
          count: 0,
          description: "Perfis, regras e exposicao tributaria.",
          label: "Fiscal",
        },
        {
          count: 0,
          description: "Contas, anuncios e sinais de canal.",
          label: "Marketplaces",
        },
        {
          count: 0,
          description: "Lojas proprias e jornadas do canal direto.",
          label: "E-commerce",
        },
        {
          count: 0,
          description: "Vendas fisicas e frente de caixa.",
          label: "PDV",
        },
      ],
    };
  }

  try {
    const supabase = await createServerSupabaseClient();

    const [
      commerceCount,
      crmCount,
      marketingCount,
      supplierCount,
      financeCount,
      fiscalCount,
      marketplaceCount,
      ecommerceCount,
      posCount,
      metricCount,
      predictiveModelCount,
      latestMetrics,
      predictiveModels,
    ] = await Promise.all([
      safeCount(supabase, "orders", workspaceId),
      safeCount(supabase, "crm_contacts", workspaceId),
      safeCount(supabase, "marketing_campaigns", workspaceId),
      safeCount(supabase, "suppliers", workspaceId),
      safeCount(supabase, "financial_transactions", workspaceId),
      safeCount(supabase, "tax_profiles", workspaceId),
      safeCount(supabase, "marketplace_accounts", workspaceId),
      safeCount(supabase, "ecommerce_integrations", workspaceId),
      safeCount(supabase, "pos_sales", workspaceId),
      safeCount(supabase, "data_cloud_metric_snapshots", workspaceId),
      safeCount(supabase, "predictive_models", workspaceId),
      safeSelect(
        supabase
          .from("data_cloud_metric_snapshots")
          .select("metric_key, metric_label, value_numeric, trend_direction, observed_at, source_systems")
          .eq("workspace_id", workspaceId)
          .order("observed_at", { ascending: false })
          .limit(6),
      ),
      safeSelect(
        supabase
          .from("predictive_models")
          .select("model_key, model_name, status, horizon, confidence, last_scored_at")
          .eq("workspace_id", workspaceId)
          .order("updated_at", { ascending: false })
          .limit(4),
      ),
    ]);

    return {
      executiveIndicatorCount,
      latestMetrics: (
        latestMetrics as Array<{
          metric_key: string;
          metric_label: string;
          observed_at: string;
          source_systems: string[] | null;
          trend_direction: string | null;
          value_numeric: number | null;
        }>
      ).map((metric) => ({
        metricKey: metric.metric_key,
        metricLabel: metric.metric_label,
        observedAt: metric.observed_at,
        sourceSystems: metric.source_systems ?? [],
        trendDirection: metric.trend_direction,
        valueNumeric: metric.value_numeric,
      })),
      metricCount,
      predictiveModelCount,
      predictiveModels: (
        predictiveModels as Array<{
          confidence: number | null;
          horizon: string | null;
          last_scored_at: string | null;
          model_key: string;
          model_name: string;
          status: string;
        }>
      ).map((model) => ({
        confidence: model.confidence,
        horizon: model.horizon,
        lastScoredAt: model.last_scored_at,
        modelKey: model.model_key,
        modelName: model.model_name,
        status: model.status,
      })),
      sourceCoverage: [
        {
          count: commerceCount,
          description: "Pedidos, catalogo e operacao comercial.",
          label: "Commerce AI",
        },
        {
          count: crmCount,
          description: "Contatos, pipeline e relacionamento.",
          label: "CRM AI",
        },
        {
          count: marketingCount,
          description: "Campanhas, investimento e retorno.",
          label: "Marketing AI",
        },
        {
          count: supplierCount,
          description: "Catalogos e recomendacoes de compra.",
          label: "Supplier Network",
        },
        {
          count: financeCount,
          description: "Receitas, despesas e rentabilidade.",
          label: "Financeiro",
        },
        {
          count: fiscalCount,
          description: "Perfis, regras e exposicao tributaria.",
          label: "Fiscal",
        },
        {
          count: marketplaceCount,
          description: "Contas, anuncios e sinais de canal.",
          label: "Marketplaces",
        },
        {
          count: ecommerceCount,
          description: "Lojas proprias e jornadas do canal direto.",
          label: "E-commerce",
        },
        {
          count: posCount,
          description: "Vendas fisicas e frente de caixa.",
          label: "PDV",
        },
      ],
    };
  } catch {
    return {
      executiveIndicatorCount,
      latestMetrics: [],
      metricCount: 0,
      predictiveModelCount: 0,
      predictiveModels: [],
      sourceCoverage: [],
    };
  }
}

export async function getEventBusSnapshot(workspaceId: string | null): Promise<EventBusSnapshot> {
  if (!hasSupabaseEnv || !workspaceId) {
    return {
      eventCount: 0,
      failedDeliveryCount: 0,
      queuedDeliveryCount: 0,
      recentEvents: [],
      subscriptionCount: 0,
      subscriptions: [],
      triggerCount: 0,
      triggers: [],
    };
  }

  try {
    const supabase = await createServerSupabaseClient();

    const [
      eventCount,
      subscriptionCount,
      triggerCount,
      failedDeliveryCount,
      queuedDeliveryCount,
      recentEvents,
      subscriptions,
      triggers,
    ] = await Promise.all([
      safeCount(supabase, "event_bus_events", workspaceId),
      safeCount(supabase, "event_bus_subscriptions", workspaceId),
      safeCount(supabase, "event_bus_triggers", workspaceId),
      safeCount(supabase, "event_bus_deliveries", workspaceId, { column: "status", kind: "eq", value: "failed" }),
      safeCount(supabase, "event_bus_deliveries", workspaceId, { column: "status", kind: "in", values: ["queued", "retrying"] }),
      safeSelect(
        supabase
          .from("event_bus_events")
          .select("event_name, source_module, aggregate_type, status, occurred_at")
          .eq("workspace_id", workspaceId)
          .order("occurred_at", { ascending: false })
          .limit(8),
      ),
      safeSelect(
        supabase
          .from("event_bus_subscriptions")
          .select("endpoint_url, target_type, status, last_delivery_at, subscribed_events")
          .eq("workspace_id", workspaceId)
          .order("updated_at", { ascending: false })
          .limit(6),
      ),
      safeSelect(
        supabase
          .from("event_bus_triggers")
          .select("name, event_name, target_type, status")
          .eq("workspace_id", workspaceId)
          .order("updated_at", { ascending: false })
          .limit(6),
      ),
    ]);

    return {
      eventCount,
      failedDeliveryCount,
      queuedDeliveryCount,
      recentEvents: (
        recentEvents as Array<{
          aggregate_type: string;
          event_name: string;
          occurred_at: string;
          source_module: string;
          status: string;
        }>
      ).map((event) => ({
        aggregateType: event.aggregate_type,
        eventName: event.event_name,
        occurredAt: event.occurred_at,
        sourceModule: event.source_module,
        status: event.status,
      })),
      subscriptionCount,
      subscriptions: (
        subscriptions as Array<{
          endpoint_url: string | null;
          last_delivery_at: string | null;
          status: string;
          subscribed_events: string[] | null;
          target_type: string;
        }>
      ).map((subscription) => ({
        endpointUrl: subscription.endpoint_url,
        lastDeliveryAt: subscription.last_delivery_at,
        status: subscription.status,
        subscribedEvents: subscription.subscribed_events ?? [],
        targetType: subscription.target_type,
      })),
      triggerCount,
      triggers: (
        triggers as Array<{
          event_name: string;
          name: string;
          status: string;
          target_type: string;
        }>
      ).map((trigger) => ({
        eventName: trigger.event_name,
        name: trigger.name,
        status: trigger.status,
        targetType: trigger.target_type,
      })),
    };
  } catch {
    return {
      eventCount: 0,
      failedDeliveryCount: 0,
      queuedDeliveryCount: 0,
      recentEvents: [],
      subscriptionCount: 0,
      subscriptions: [],
      triggerCount: 0,
      triggers: [],
    };
  }
}

export async function getAutomationSnapshot(workspaceId: string | null): Promise<AutomationSnapshot> {
  if (!hasSupabaseEnv || !workspaceId) {
    return {
      enabledRuleCount: 0,
      failedRunCount: 0,
      recentRuns: [],
      rules: [],
      runCount: 0,
      ruleCount: 0,
    };
  }

  try {
    const supabase = await createServerSupabaseClient();

    const [ruleCount, enabledRuleCount, runCount, failedRunCount, rules, recentRuns] = await Promise.all([
      safeCount(supabase, "automation_rules", workspaceId),
      safeCount(supabase, "automation_rules", workspaceId, { column: "enabled", kind: "eq", value: true }),
      safeCount(supabase, "automation_runs", workspaceId),
      safeCount(supabase, "automation_runs", workspaceId, { column: "status", kind: "eq", value: "failed" }),
      safeSelect(
        supabase
          .from("automation_rules")
          .select("name, trigger_type, source_module, enabled, updated_at")
          .eq("workspace_id", workspaceId)
          .order("updated_at", { ascending: false })
          .limit(6),
      ),
      safeSelect(
        supabase
          .from("automation_runs")
          .select("rule_name, status, started_at, completed_at")
          .eq("workspace_id", workspaceId)
          .order("started_at", { ascending: false })
          .limit(8),
      ),
    ]);

    return {
      enabledRuleCount,
      failedRunCount,
      recentRuns: (
        recentRuns as Array<{
          completed_at: string | null;
          rule_name: string;
          started_at: string;
          status: string;
        }>
      ).map((run) => ({
        completedAt: run.completed_at,
        ruleName: run.rule_name,
        startedAt: run.started_at,
        status: run.status,
      })),
      rules: (
        rules as Array<{
          enabled: boolean;
          name: string;
          source_module: string | null;
          trigger_type: string;
          updated_at: string;
        }>
      ).map((rule) => ({
        enabled: rule.enabled,
        name: rule.name,
        sourceModule: rule.source_module,
        triggerType: rule.trigger_type,
        updatedAt: rule.updated_at,
      })),
      runCount,
      ruleCount,
    };
  } catch {
    return {
      enabledRuleCount: 0,
      failedRunCount: 0,
      recentRuns: [],
      rules: [],
      runCount: 0,
      ruleCount: 0,
    };
  }
}

export async function getMarketIntelligenceSnapshot(workspaceId: string | null): Promise<MarketIntelligenceSnapshot> {
  if (!hasSupabaseEnv || !workspaceId) {
    return {
      competitorCount: 0,
      competitors: [],
      recommendationCount: 0,
      recommendations: [],
      signalCount: 0,
      signals: [],
      sourceCount: 5,
    };
  }

  try {
    const supabase = await createServerSupabaseClient();

    const [signalCount, recommendationCount, competitorCount, signals, recommendations, competitors] = await Promise.all([
      safeCount(supabase, "market_intelligence_signals", workspaceId),
      safeCount(supabase, "market_intelligence_recommendations", workspaceId),
      safeCount(supabase, "market_competitors", workspaceId),
      safeSelect(
        supabase
          .from("market_intelligence_signals")
          .select("source, signal_type, direction, product_name, score, summary, observed_at")
          .eq("workspace_id", workspaceId)
          .order("observed_at", { ascending: false })
          .limit(8),
      ),
      safeSelect(
        supabase
          .from("market_intelligence_recommendations")
          .select("title, summary, priority, confidence, status")
          .eq("workspace_id", workspaceId)
          .order("created_at", { ascending: false })
          .limit(6),
      ),
      safeSelect(
        supabase
          .from("market_competitors")
          .select("source, competitor_name, category, threat_level")
          .eq("workspace_id", workspaceId)
          .order("updated_at", { ascending: false })
          .limit(6),
      ),
    ]);

    return {
      competitorCount,
      competitors: (
        competitors as Array<{
          category: string | null;
          competitor_name: string;
          source: string;
          threat_level: string;
        }>
      ).map((competitor) => ({
        category: competitor.category,
        competitorName: competitor.competitor_name,
        source: competitor.source,
        threatLevel: competitor.threat_level,
      })),
      recommendationCount,
      recommendations: (
        recommendations as Array<{
          confidence: number | null;
          priority: string;
          status: string;
          summary: string;
          title: string;
        }>
      ).map((recommendation) => ({
        confidence: recommendation.confidence,
        priority: recommendation.priority,
        status: recommendation.status,
        summary: recommendation.summary,
        title: recommendation.title,
      })),
      signalCount,
      signals: (
        signals as Array<{
          direction: string;
          observed_at: string;
          product_name: string | null;
          score: number | null;
          signal_type: string;
          source: string;
          summary: string | null;
        }>
      ).map((signal) => ({
        direction: signal.direction,
        observedAt: signal.observed_at,
        productName: signal.product_name,
        score: signal.score,
        signalType: signal.signal_type,
        source: signal.source,
        summary: signal.summary,
      })),
      sourceCount: 5,
    };
  } catch {
    return {
      competitorCount: 0,
      competitors: [],
      recommendationCount: 0,
      recommendations: [],
      signalCount: 0,
      signals: [],
      sourceCount: 5,
    };
  }
}

export async function getMobileReadinessSnapshot(workspaceId: string | null): Promise<MobileReadinessSnapshot> {
  if (!hasSupabaseEnv || !workspaceId) {
    return {
      apiKeyCount: 0,
      approvalRequests: [],
      deviceCount: 0,
      devices: [],
      pendingApprovalCount: 0,
      pushEnabledCount: 0,
    };
  }

  try {
    const supabase = await createServerSupabaseClient();

    const [deviceCount, pushEnabledCount, pendingApprovalCount, apiKeyCount, devices, approvalRequests] = await Promise.all([
      safeCount(supabase, "mobile_devices", workspaceId),
      safeCount(supabase, "mobile_devices", workspaceId, { column: "push_enabled", kind: "eq", value: true }),
      safeCount(supabase, "approval_requests", workspaceId, { column: "status", kind: "eq", value: "pending" }),
      safeCount(supabase, "workspace_api_keys", workspaceId, { column: "status", kind: "eq", value: "active" }),
      safeSelect(
        supabase
          .from("mobile_devices")
          .select("platform, app_version, last_seen_at, push_enabled")
          .eq("workspace_id", workspaceId)
          .order("last_seen_at", { ascending: false })
          .limit(6),
      ),
      safeSelect(
        supabase
          .from("approval_requests")
          .select("title, request_type, status, requested_at")
          .eq("workspace_id", workspaceId)
          .order("requested_at", { ascending: false })
          .limit(6),
      ),
    ]);

    return {
      apiKeyCount,
      approvalRequests: (
        approvalRequests as Array<{
          request_type: string;
          requested_at: string;
          status: string;
          title: string;
        }>
      ).map((request) => ({
        requestType: request.request_type,
        requestedAt: request.requested_at,
        status: request.status,
        title: request.title,
      })),
      deviceCount,
      devices: (
        devices as Array<{
          app_version: string | null;
          last_seen_at: string;
          platform: string;
          push_enabled: boolean;
        }>
      ).map((device) => ({
        appVersion: device.app_version,
        lastSeenAt: device.last_seen_at,
        platform: device.platform,
        pushEnabled: device.push_enabled,
      })),
      pendingApprovalCount,
      pushEnabledCount,
    };
  } catch {
    return {
      apiKeyCount: 0,
      approvalRequests: [],
      deviceCount: 0,
      devices: [],
      pendingApprovalCount: 0,
      pushEnabledCount: 0,
    };
  }
}
