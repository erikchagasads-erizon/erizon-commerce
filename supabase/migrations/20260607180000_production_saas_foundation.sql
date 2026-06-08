alter type public.workspace_role add value if not exists 'finance';
alter type public.workspace_role add value if not exists 'support';
alter type public.workspace_role add value if not exists 'viewer';

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  legal_name text,
  document_number text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.branches (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade,
  name text not null,
  code text not null,
  city text,
  state text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (workspace_id, code)
);

create table if not exists public.workspace_invitations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  invited_by uuid references auth.users(id) on delete set null,
  email text not null,
  role public.workspace_role not null,
  invitation_token uuid not null unique,
  status text not null default 'pending',
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.workspace_branding (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade unique,
  brand_name text not null default 'ERIZON COMMERCE AI',
  login_headline text,
  logo_url text,
  favicon_url text,
  primary_color text not null default '#6C4BFF',
  accent_color text not null default '#2FFFCB',
  custom_domain text,
  domain_status text not null default 'preview',
  preview_enabled boolean not null default true,
  subdomain text,
  support_email text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.workspace_subscriptions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade unique,
  plan_code text not null default 'starter',
  status text not null default 'trialing',
  trial_ends_at timestamptz,
  current_period_starts_at timestamptz,
  current_period_ends_at timestamptz,
  cancel_at_period_end boolean not null default false,
  provider_customer_id text,
  provider_subscription_id text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.billing_payments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  subscription_id uuid references public.workspace_subscriptions(id) on delete set null,
  provider text not null default 'manual',
  external_reference text,
  amount numeric(14, 2) not null default 0,
  currency text not null default 'BRL',
  status text not null default 'pending',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.workspace_usage_counters (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  metric_key text not null,
  current_value bigint not null default 0,
  period_start timestamptz not null,
  period_end timestamptz not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (workspace_id, metric_key, period_start)
);

create table if not exists public.workspace_api_keys (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  label text not null,
  key_prefix text not null,
  key_hash text not null,
  permissions text[] not null default array[]::text[],
  status text not null default 'active',
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (workspace_id, key_prefix)
);

create table if not exists public.integration_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  provider text not null,
  integration_type text not null,
  status text not null,
  message text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.sync_jobs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  provider text not null,
  job_type text not null,
  resource_type text not null,
  status text not null default 'queued',
  attempts integer not null default 0,
  last_error text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.marketplace_accounts
  add column if not exists encrypted_access_token text,
  add column if not exists encrypted_refresh_token text,
  add column if not exists token_expires_at timestamptz,
  add column if not exists last_sync_at timestamptz,
  add column if not exists sync_mode text not null default 'manual',
  add column if not exists last_error text;

alter table public.ecommerce_integrations
  add column if not exists encrypted_access_token text,
  add column if not exists encrypted_refresh_token text,
  add column if not exists token_expires_at timestamptz,
  add column if not exists last_sync_at timestamptz,
  add column if not exists sync_mode text not null default 'manual',
  add column if not exists last_error text;

create or replace function public.handle_new_workspace_defaults()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.workspace_subscriptions (
    workspace_id,
    plan_code,
    status,
    trial_ends_at,
    current_period_starts_at,
    current_period_ends_at
  )
  values (
    new.id,
    'starter',
    'trialing',
    timezone('utc', now()) + interval '14 days',
    timezone('utc', now()),
    timezone('utc', now()) + interval '14 days'
  )
  on conflict (workspace_id) do nothing;

  insert into public.workspace_branding (
    workspace_id,
    brand_name,
    login_headline,
    subdomain
  )
  values (
    new.id,
    new.name,
    'Seu sistema operacional de comércio inteligente.',
    new.slug
  )
  on conflict (workspace_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_workspace_created on public.workspaces;

create trigger on_workspace_created
after insert on public.workspaces
for each row execute function public.handle_new_workspace_defaults();

insert into public.workspace_subscriptions (
  workspace_id,
  plan_code,
  status,
  trial_ends_at,
  current_period_starts_at,
  current_period_ends_at
)
select
  w.id,
  'starter',
  'trialing',
  timezone('utc', now()) + interval '14 days',
  timezone('utc', now()),
  timezone('utc', now()) + interval '14 days'
from public.workspaces w
where not exists (
  select 1 from public.workspace_subscriptions s where s.workspace_id = w.id
);

insert into public.workspace_branding (
  workspace_id,
  brand_name,
  login_headline,
  subdomain
)
select
  w.id,
  w.name,
  'Seu sistema operacional de comércio inteligente.',
  w.slug
from public.workspaces w
where not exists (
  select 1 from public.workspace_branding b where b.workspace_id = w.id
);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'companies',
    'branches',
    'workspace_invitations',
    'workspace_branding',
    'workspace_subscriptions',
    'billing_payments',
    'workspace_usage_counters',
    'workspace_api_keys',
    'integration_logs',
    'sync_jobs'
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
    'companies',
    'branches',
    'workspace_invitations',
    'workspace_branding',
    'workspace_subscriptions',
    'billing_payments',
    'workspace_usage_counters',
    'workspace_api_keys',
    'integration_logs',
    'sync_jobs'
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

create index if not exists idx_companies_workspace on public.companies(workspace_id);
create index if not exists idx_branches_workspace on public.branches(workspace_id);
create index if not exists idx_workspace_invitations_workspace on public.workspace_invitations(workspace_id, created_at desc);
create index if not exists idx_workspace_subscriptions_workspace on public.workspace_subscriptions(workspace_id);
create index if not exists idx_billing_payments_workspace on public.billing_payments(workspace_id, created_at desc);
create index if not exists idx_workspace_usage_counters_workspace on public.workspace_usage_counters(workspace_id, metric_key, period_start desc);
create index if not exists idx_workspace_api_keys_workspace on public.workspace_api_keys(workspace_id, created_at desc);
create index if not exists idx_integration_logs_workspace on public.integration_logs(workspace_id, created_at desc);
create index if not exists idx_sync_jobs_workspace on public.sync_jobs(workspace_id, created_at desc);

grant select, insert, update, delete on public.companies to authenticated;
grant select, insert, update, delete on public.branches to authenticated;
grant select, insert, update, delete on public.workspace_invitations to authenticated;
grant select, insert, update, delete on public.workspace_branding to authenticated;
grant select, insert, update, delete on public.workspace_subscriptions to authenticated;
grant select, insert, update, delete on public.billing_payments to authenticated;
grant select, insert, update, delete on public.workspace_usage_counters to authenticated;
grant select, insert, update, delete on public.workspace_api_keys to authenticated;
grant select, insert, update, delete on public.integration_logs to authenticated;
grant select, insert, update, delete on public.sync_jobs to authenticated;
