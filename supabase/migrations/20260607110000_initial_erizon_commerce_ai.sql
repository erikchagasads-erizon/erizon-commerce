create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'workspace_role') then
    create type public.workspace_role as enum ('owner', 'admin', 'manager', 'analyst', 'operator');
  end if;

  if not exists (select 1 from pg_type where typname = 'integration_status') then
    create type public.integration_status as enum ('planned', 'connected', 'disabled', 'error');
  end if;

  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type public.order_status as enum ('pending', 'paid', 'picking', 'packing', 'shipped', 'delivered', 'returned', 'cancelled');
  end if;

  if not exists (select 1 from pg_type where typname = 'stock_movement_type') then
    create type public.stock_movement_type as enum ('inbound', 'outbound', 'transfer', 'adjustment', 'reservation', 'release');
  end if;

  if not exists (select 1 from pg_type where typname = 'financial_direction') then
    create type public.financial_direction as enum ('receivable', 'payable');
  end if;

  if not exists (select 1 from pg_type where typname = 'insight_priority') then
    create type public.insight_priority as enum ('low', 'medium', 'high', 'critical');
  end if;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  owner_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  default_workspace_id uuid references public.workspaces(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.workspace_role not null default 'owner',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (workspace_id, user_id)
);

create table if not exists public.channels (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  code text not null,
  name text not null,
  channel_type text not null,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (workspace_id, code)
);

create table if not exists public.marketplace_accounts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  channel_id uuid references public.channels(id) on delete set null,
  provider text not null,
  account_name text not null,
  external_account_id text,
  status public.integration_status not null default 'planned',
  metadata jsonb not null default '{}'::jsonb,
  connected_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.ecommerce_integrations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  channel_id uuid references public.channels(id) on delete set null,
  provider text not null,
  store_name text not null,
  store_url text,
  external_store_id text,
  status public.integration_status not null default 'planned',
  metadata jsonb not null default '{}'::jsonb,
  connected_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.stock_locations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  code text not null,
  location_type text not null default 'warehouse',
  branch_name text,
  is_shared boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (workspace_id, code)
);

create table if not exists public.tax_profiles (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  ncm text,
  cfop text,
  icms numeric(10, 2),
  pis numeric(10, 2),
  cofins numeric(10, 2),
  difal numeric(10, 2),
  st numeric(10, 2),
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  slug text,
  sku text,
  barcode text,
  description text,
  category text,
  brand text,
  cost numeric(14, 2) not null default 0,
  price numeric(14, 2) not null default 0,
  margin numeric(10, 2) not null default 0,
  minimum_quantity integer not null default 0,
  status text not null default 'draft',
  tax_profile_id uuid references public.tax_profiles(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  sku text,
  barcode text,
  attributes jsonb not null default '{}'::jsonb,
  price numeric(14, 2) not null default 0,
  cost numeric(14, 2) not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_variant_id uuid references public.product_variants(id) on delete set null,
  stock_location_id uuid references public.stock_locations(id) on delete set null,
  movement_type public.stock_movement_type not null,
  quantity numeric(14, 3) not null,
  unit_cost numeric(14, 2) not null default 0,
  reference_type text,
  reference_id uuid,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  channel_id uuid references public.channels(id) on delete set null,
  external_order_id text,
  order_number text not null,
  customer_name text,
  customer_email text,
  status public.order_status not null default 'pending',
  payment_status text not null default 'pending',
  fulfillment_status text not null default 'pending',
  total_amount numeric(14, 2) not null default 0,
  shipping_amount numeric(14, 2) not null default 0,
  paid_at timestamptz,
  ordered_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (workspace_id, order_number)
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_variant_id uuid references public.product_variants(id) on delete set null,
  sku text,
  name text not null,
  quantity numeric(14, 3) not null default 1,
  unit_price numeric(14, 2) not null default 0,
  total_price numeric(14, 2) not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.order_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  event_type text not null,
  description text not null,
  payload jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.pos_sales (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  stock_location_id uuid references public.stock_locations(id) on delete set null,
  seller_name text,
  payment_method text not null,
  subtotal numeric(14, 2) not null default 0,
  discount_amount numeric(14, 2) not null default 0,
  total_amount numeric(14, 2) not null default 0,
  status text not null default 'open',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.financial_transactions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  pos_sale_id uuid references public.pos_sales(id) on delete set null,
  direction public.financial_direction not null,
  category text not null,
  description text not null,
  amount numeric(14, 2) not null default 0,
  due_date date,
  paid_at timestamptz,
  status text not null default 'pending',
  reconciliation_status text not null default 'not_reconciled',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  supplier_type text not null,
  contact_name text,
  contact_email text,
  contact_phone text,
  lead_time_days integer,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.supplier_products (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_variant_id uuid references public.product_variants(id) on delete set null,
  supplier_sku text,
  price numeric(14, 2) not null default 0,
  available_quantity numeric(14, 3),
  minimum_order_quantity numeric(14, 3),
  margin_projection numeric(10, 2),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.purchase_suggestions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  supplier_id uuid references public.suppliers(id) on delete set null,
  product_id uuid references public.products(id) on delete set null,
  product_variant_id uuid references public.product_variants(id) on delete set null,
  urgency_score numeric(10, 2),
  estimated_stockout_days integer,
  projected_savings_percent numeric(10, 2),
  recommendation text not null,
  status text not null default 'open',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.ai_agents (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  code text not null,
  objective text not null,
  status text not null default 'draft',
  schedule text,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (workspace_id, code)
);

create table if not exists public.ai_memories (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  agent_id uuid references public.ai_agents(id) on delete set null,
  memory_type text not null,
  source text not null,
  title text not null,
  summary text not null,
  payload jsonb not null default '{}'::jsonb,
  relevance_score numeric(10, 2),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.ai_insights (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  agent_id uuid references public.ai_agents(id) on delete set null,
  agent_name text not null,
  title text not null,
  summary text not null,
  priority public.insight_priority not null default 'medium',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create or replace function public.user_has_workspace_access(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = target_workspace_id
      and wm.user_id = auth.uid()
  );
$$;

create or replace function public.ensure_workspace_for_user()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  existing_workspace_id uuid;
  profile_name text;
  profile_email text;
  generated_workspace_id uuid;
  generated_slug text;
begin
  if current_user_id is null then
    raise exception 'Usuário autenticado é obrigatório para provisionar workspace.';
  end if;

  select workspace_id
    into existing_workspace_id
  from public.workspace_members
  where user_id = current_user_id
  order by created_at asc
  limit 1;

  if existing_workspace_id is not null then
    return existing_workspace_id;
  end if;

  profile_email := coalesce((auth.jwt() ->> 'email'), 'workspace@erizon.local');

  insert into public.profiles (id, email, full_name)
  values (
    current_user_id,
    profile_email,
    coalesce(
      nullif(auth.jwt() -> 'user_metadata' ->> 'full_name', ''),
      split_part(profile_email, '@', 1)
    )
  )
  on conflict (id) do nothing;

  select coalesce(nullif(full_name, ''), split_part(coalesce(email, profile_email), '@', 1), 'Workspace Erizon'),
         coalesce(email, profile_email)
    into profile_name, profile_email
  from public.profiles
  where id = current_user_id;

  generated_slug := lower(regexp_replace(profile_name, '[^a-zA-Z0-9]+', '-', 'g'));
  generated_slug := trim(both '-' from generated_slug);
  generated_slug := coalesce(nullif(generated_slug, ''), 'workspace-erizon') || '-' || substring(replace(current_user_id::text, '-', '') from 1 for 8);

  insert into public.workspaces (name, slug, owner_user_id)
  values (profile_name || ' Workspace', generated_slug, current_user_id)
  returning id into generated_workspace_id;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (generated_workspace_id, current_user_id, 'owner')
  on conflict (workspace_id, user_id) do nothing;

  update public.profiles
  set default_workspace_id = generated_workspace_id
  where id = current_user_id;

  return generated_workspace_id;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_name text;
  generated_workspace_id uuid;
  generated_slug text;
begin
  base_name := coalesce(
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    split_part(coalesce(new.email, 'workspace@erizon.local'), '@', 1),
    'Workspace Erizon'
  );

  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, base_name)
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, public.profiles.full_name);

  if exists (select 1 from public.workspace_members where user_id = new.id) then
    return new;
  end if;

  generated_slug := lower(regexp_replace(base_name, '[^a-zA-Z0-9]+', '-', 'g'));
  generated_slug := trim(both '-' from generated_slug);
  generated_slug := coalesce(nullif(generated_slug, ''), 'workspace-erizon') || '-' || substring(replace(new.id::text, '-', '') from 1 for 8);

  insert into public.workspaces (name, slug, owner_user_id)
  values (base_name || ' Workspace', generated_slug, new.id)
  returning id into generated_workspace_id;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (generated_workspace_id, new.id, 'owner');

  update public.profiles
  set default_workspace_id = generated_workspace_id
  where id = new.id;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'workspaces',
    'profiles',
    'workspace_members',
    'channels',
    'marketplace_accounts',
    'ecommerce_integrations',
    'stock_locations',
    'tax_profiles',
    'products',
    'product_variants',
    'stock_movements',
    'orders',
    'order_items',
    'pos_sales',
    'financial_transactions',
    'suppliers',
    'supplier_products',
    'purchase_suggestions',
    'ai_agents',
    'ai_memories',
    'ai_insights'
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
    'channels',
    'marketplace_accounts',
    'ecommerce_integrations',
    'stock_locations',
    'tax_profiles',
    'products',
    'product_variants',
    'stock_movements',
    'orders',
    'order_items',
    'order_events',
    'pos_sales',
    'financial_transactions',
    'suppliers',
    'supplier_products',
    'purchase_suggestions',
    'ai_agents',
    'ai_memories',
    'ai_insights',
    'audit_logs'
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

alter table public.workspaces enable row level security;
drop policy if exists workspaces_select on public.workspaces;
drop policy if exists workspaces_insert on public.workspaces;
drop policy if exists workspaces_update on public.workspaces;
create policy workspaces_select on public.workspaces
for select using (public.user_has_workspace_access(id));
create policy workspaces_insert on public.workspaces
for insert with check (auth.uid() = owner_user_id);
create policy workspaces_update on public.workspaces
for update using (public.user_has_workspace_access(id))
with check (public.user_has_workspace_access(id));

alter table public.profiles enable row level security;
drop policy if exists profiles_select_self on public.profiles;
drop policy if exists profiles_update_self on public.profiles;
create policy profiles_select_self on public.profiles
for select using (auth.uid() = id);
create policy profiles_update_self on public.profiles
for update using (auth.uid() = id)
with check (auth.uid() = id);

alter table public.workspace_members enable row level security;
drop policy if exists workspace_members_select on public.workspace_members;
drop policy if exists workspace_members_insert on public.workspace_members;
drop policy if exists workspace_members_update on public.workspace_members;
drop policy if exists workspace_members_delete on public.workspace_members;
create policy workspace_members_select on public.workspace_members
for select using (public.user_has_workspace_access(workspace_id));
create policy workspace_members_insert on public.workspace_members
for insert with check (public.user_has_workspace_access(workspace_id));
create policy workspace_members_update on public.workspace_members
for update using (public.user_has_workspace_access(workspace_id))
with check (public.user_has_workspace_access(workspace_id));
create policy workspace_members_delete on public.workspace_members
for delete using (public.user_has_workspace_access(workspace_id));

create index if not exists idx_workspace_members_user on public.workspace_members(user_id, workspace_id);
create index if not exists idx_channels_workspace on public.channels(workspace_id);
create index if not exists idx_marketplace_accounts_workspace on public.marketplace_accounts(workspace_id);
create index if not exists idx_ecommerce_integrations_workspace on public.ecommerce_integrations(workspace_id);
create index if not exists idx_stock_locations_workspace on public.stock_locations(workspace_id);
create index if not exists idx_tax_profiles_workspace on public.tax_profiles(workspace_id);
create index if not exists idx_products_workspace on public.products(workspace_id);
create index if not exists idx_product_variants_workspace on public.product_variants(workspace_id);
create index if not exists idx_stock_movements_workspace on public.stock_movements(workspace_id, created_at desc);
create index if not exists idx_orders_workspace on public.orders(workspace_id, created_at desc);
create index if not exists idx_order_items_workspace on public.order_items(workspace_id);
create index if not exists idx_order_events_workspace on public.order_events(workspace_id, created_at desc);
create index if not exists idx_pos_sales_workspace on public.pos_sales(workspace_id, created_at desc);
create index if not exists idx_financial_transactions_workspace on public.financial_transactions(workspace_id, created_at desc);
create index if not exists idx_suppliers_workspace on public.suppliers(workspace_id);
create index if not exists idx_supplier_products_workspace on public.supplier_products(workspace_id);
create index if not exists idx_purchase_suggestions_workspace on public.purchase_suggestions(workspace_id, created_at desc);
create index if not exists idx_ai_agents_workspace on public.ai_agents(workspace_id);
create index if not exists idx_ai_memories_workspace on public.ai_memories(workspace_id, created_at desc);
create index if not exists idx_ai_insights_workspace on public.ai_insights(workspace_id, created_at desc);
create index if not exists idx_audit_logs_workspace on public.audit_logs(workspace_id, created_at desc);

grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
grant execute on function public.user_has_workspace_access(uuid) to authenticated;
grant execute on function public.ensure_workspace_for_user() to authenticated;

