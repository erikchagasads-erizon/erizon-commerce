create table if not exists public.crm_contacts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  full_name text not null,
  email text,
  phone text,
  status text not null default 'lead',
  source text,
  tags text[] not null default array[]::text[],
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.marketing_campaigns (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  channel text not null,
  status text not null default 'draft',
  budget numeric(14, 2) not null default 0,
  spend numeric(14, 2) not null default 0,
  revenue numeric(14, 2) not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.data_cloud_metric_snapshots (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  metric_key text not null,
  metric_label text not null,
  scope_key text not null default 'workspace',
  dimension_key text,
  dimension_value text,
  value_numeric numeric(18, 4),
  value_text text,
  currency text not null default 'BRL',
  trend_direction text,
  source_systems text[] not null default array[]::text[],
  metadata jsonb not null default '{}'::jsonb,
  observed_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.predictive_models (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  model_key text not null,
  model_name text not null,
  status text not null default 'draft',
  horizon text,
  confidence numeric(5, 4),
  input_sources text[] not null default array[]::text[],
  training_notes text,
  last_trained_at timestamptz,
  last_scored_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (workspace_id, model_key)
);

create table if not exists public.event_bus_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  event_name text not null,
  aggregate_type text not null,
  aggregate_id text,
  source_module text not null,
  status text not null default 'recorded',
  payload jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.event_bus_subscriptions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  target_type text not null default 'webhook',
  endpoint_url text,
  secret_hash text,
  subscribed_events text[] not null default array[]::text[],
  status text not null default 'active',
  last_delivery_at timestamptz,
  last_error_at timestamptz,
  last_error_message text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.event_bus_triggers (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  event_name text not null,
  target_type text not null,
  target_ref text,
  status text not null default 'active',
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (workspace_id, name)
);

create table if not exists public.event_bus_deliveries (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  event_id uuid references public.event_bus_events(id) on delete cascade,
  subscription_id uuid references public.event_bus_subscriptions(id) on delete set null,
  delivery_type text not null default 'webhook',
  status text not null default 'queued',
  response_code integer,
  response_body text,
  attempt_count integer not null default 0,
  attempted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.automation_rules (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  name text not null,
  description text,
  enabled boolean not null default true,
  trigger_type text not null,
  source_module text,
  trigger_expression text,
  conditions_json jsonb not null default '[]'::jsonb,
  actions_json jsonb not null default '[]'::jsonb,
  requires_approval boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (workspace_id, name)
);

create table if not exists public.automation_runs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  rule_id uuid references public.automation_rules(id) on delete set null,
  rule_name text not null,
  event_id uuid references public.event_bus_events(id) on delete set null,
  status text not null default 'queued',
  trigger_payload jsonb not null default '{}'::jsonb,
  actions_executed jsonb not null default '[]'::jsonb,
  started_at timestamptz not null default timezone('utc', now()),
  completed_at timestamptz,
  error_message text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.market_intelligence_signals (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  source text not null,
  category text,
  product_name text,
  signal_type text not null,
  direction text not null default 'emerging',
  score numeric(8, 2),
  summary text,
  metadata jsonb not null default '{}'::jsonb,
  observed_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.market_intelligence_recommendations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null,
  summary text not null,
  recommendation_type text,
  priority text not null default 'medium',
  confidence numeric(5, 4),
  source_references text[] not null default array[]::text[],
  status text not null default 'open',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.market_competitors (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  source text not null,
  competitor_name text not null,
  category text,
  threat_level text not null default 'medium',
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (workspace_id, source, competitor_name)
);

create table if not exists public.mobile_devices (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  platform text not null,
  device_identifier text not null,
  app_version text,
  push_enabled boolean not null default false,
  last_seen_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (workspace_id, device_identifier)
);

create table if not exists public.approval_requests (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  request_type text not null,
  title text not null,
  summary text,
  entity_type text,
  entity_id text,
  status text not null default 'pending',
  requested_by uuid references auth.users(id) on delete set null,
  approved_by uuid references auth.users(id) on delete set null,
  requested_at timestamptz not null default timezone('utc', now()),
  decided_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'crm_contacts',
    'marketing_campaigns',
    'data_cloud_metric_snapshots',
    'predictive_models',
    'event_bus_events',
    'event_bus_subscriptions',
    'event_bus_triggers',
    'event_bus_deliveries',
    'automation_rules',
    'automation_runs',
    'market_intelligence_signals',
    'market_intelligence_recommendations',
    'market_competitors',
    'mobile_devices',
    'approval_requests'
  ] loop
    execute format('drop trigger if exists set_%1$s_updated_at on public.%1$s', table_name);
    execute format(
      'create trigger set_%1$s_updated_at before update on public.%1$s for each row execute function public.set_updated_at()',
      table_name
    );
  end loop;
end $$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'crm_contacts',
    'marketing_campaigns',
    'data_cloud_metric_snapshots',
    'predictive_models',
    'event_bus_events',
    'event_bus_subscriptions',
    'event_bus_triggers',
    'event_bus_deliveries',
    'automation_rules',
    'automation_runs',
    'market_intelligence_signals',
    'market_intelligence_recommendations',
    'market_competitors',
    'mobile_devices',
    'approval_requests'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('drop policy if exists %I_select on public.%I', table_name, table_name);
    execute format('drop policy if exists %I_insert on public.%I', table_name, table_name);
    execute format('drop policy if exists %I_update on public.%I', table_name, table_name);
    execute format('drop policy if exists %I_delete on public.%I', table_name, table_name);
    execute format('create policy %I_select on public.%I for select using (public.user_has_workspace_access(workspace_id))', table_name, table_name);
    execute format('create policy %I_insert on public.%I for insert with check (public.user_has_workspace_access(workspace_id))', table_name, table_name);
    execute format('create policy %I_update on public.%I for update using (public.user_has_workspace_access(workspace_id)) with check (public.user_has_workspace_access(workspace_id))', table_name, table_name);
    execute format('create policy %I_delete on public.%I for delete using (public.user_has_workspace_access(workspace_id))', table_name, table_name);
  end loop;
end $$;

create index if not exists idx_crm_contacts_workspace on public.crm_contacts(workspace_id, created_at desc);
create index if not exists idx_marketing_campaigns_workspace on public.marketing_campaigns(workspace_id, created_at desc);
create index if not exists idx_data_cloud_metric_snapshots_workspace on public.data_cloud_metric_snapshots(workspace_id, observed_at desc);
create index if not exists idx_predictive_models_workspace on public.predictive_models(workspace_id, updated_at desc);
create index if not exists idx_event_bus_events_workspace on public.event_bus_events(workspace_id, occurred_at desc);
create index if not exists idx_event_bus_subscriptions_workspace on public.event_bus_subscriptions(workspace_id, updated_at desc);
create index if not exists idx_event_bus_triggers_workspace on public.event_bus_triggers(workspace_id, updated_at desc);
create index if not exists idx_event_bus_deliveries_workspace on public.event_bus_deliveries(workspace_id, created_at desc);
create index if not exists idx_automation_rules_workspace on public.automation_rules(workspace_id, updated_at desc);
create index if not exists idx_automation_runs_workspace on public.automation_runs(workspace_id, started_at desc);
create index if not exists idx_market_intelligence_signals_workspace on public.market_intelligence_signals(workspace_id, observed_at desc);
create index if not exists idx_market_intelligence_recommendations_workspace on public.market_intelligence_recommendations(workspace_id, created_at desc);
create index if not exists idx_market_competitors_workspace on public.market_competitors(workspace_id, updated_at desc);
create index if not exists idx_mobile_devices_workspace on public.mobile_devices(workspace_id, last_seen_at desc);
create index if not exists idx_approval_requests_workspace on public.approval_requests(workspace_id, requested_at desc);

grant select, insert, update, delete on public.crm_contacts to authenticated;
grant select, insert, update, delete on public.marketing_campaigns to authenticated;
grant select, insert, update, delete on public.data_cloud_metric_snapshots to authenticated;
grant select, insert, update, delete on public.predictive_models to authenticated;
grant select, insert, update, delete on public.event_bus_events to authenticated;
grant select, insert, update, delete on public.event_bus_subscriptions to authenticated;
grant select, insert, update, delete on public.event_bus_triggers to authenticated;
grant select, insert, update, delete on public.event_bus_deliveries to authenticated;
grant select, insert, update, delete on public.automation_rules to authenticated;
grant select, insert, update, delete on public.automation_runs to authenticated;
grant select, insert, update, delete on public.market_intelligence_signals to authenticated;
grant select, insert, update, delete on public.market_intelligence_recommendations to authenticated;
grant select, insert, update, delete on public.market_competitors to authenticated;
grant select, insert, update, delete on public.mobile_devices to authenticated;
grant select, insert, update, delete on public.approval_requests to authenticated;
