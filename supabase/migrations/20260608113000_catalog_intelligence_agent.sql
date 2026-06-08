create table if not exists public.product_costs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  purchase_cost numeric(14, 2) not null default 0,
  marketplace_fee_percent numeric(10, 4) not null default 16,
  tax_percent numeric(10, 4) not null default 8,
  freight_cost numeric(14, 2) not null default 0,
  commission_cost numeric(14, 2) not null default 0,
  operational_cost numeric(14, 2) not null default 0,
  desired_margin_percent numeric(10, 4) not null default 18,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (workspace_id, product_id)
);

create table if not exists public.catalog_analyses (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  marketplace_account_id uuid references public.marketplace_accounts(id) on delete set null,
  provider text not null default 'mercado_livre',
  catalog_product_id text,
  item_id text,
  product_name text not null,
  my_price numeric(14, 2) not null default 0,
  purchase_cost numeric(14, 2) not null default 0,
  marketplace_fee_percent numeric(10, 4) not null default 0,
  tax_percent numeric(10, 4) not null default 0,
  freight_cost numeric(14, 2) not null default 0,
  commission_cost numeric(14, 2) not null default 0,
  operational_cost numeric(14, 2) not null default 0,
  lowest_price numeric(14, 2),
  highest_price numeric(14, 2),
  average_price numeric(14, 2),
  leading_seller_id text,
  leading_seller_name text,
  leading_seller_sales numeric(14, 2),
  lowest_price_seller_id text,
  lowest_price_seller_name text,
  current_margin_amount numeric(14, 2),
  current_margin_percent numeric(10, 4),
  lowest_price_margin_amount numeric(14, 2),
  lowest_price_margin_percent numeric(10, 4),
  undercut_margin_amount numeric(14, 2),
  undercut_margin_percent numeric(10, 4),
  ideal_price numeric(14, 2),
  can_be_lowest_price boolean not null default false,
  recommendation text not null default 'manter',
  recommendation_summary text not null default '',
  risk_level text not null default 'medium',
  confidence numeric(10, 4) not null default 0,
  signals jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.catalog_sellers (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  analysis_id uuid not null references public.catalog_analyses(id) on delete cascade,
  provider text not null default 'mercado_livre',
  seller_id text not null,
  seller_name text,
  item_id text,
  price numeric(14, 2) not null default 0,
  sold_quantity numeric(14, 2),
  sales_estimate numeric(14, 2),
  reputation text,
  reputation_score numeric(10, 4),
  free_shipping boolean not null default false,
  logistic_type text,
  shipping_mode text,
  estimated_delivery text,
  is_full boolean not null default false,
  is_flex boolean not null default false,
  catalog_position integer,
  permalink text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.catalog_price_history (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  analysis_id uuid references public.catalog_analyses(id) on delete cascade,
  seller_id text,
  item_id text,
  provider text not null default 'mercado_livre',
  price numeric(14, 2) not null default 0,
  catalog_position integer,
  captured_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.catalog_sales_estimates (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  analysis_id uuid references public.catalog_analyses(id) on delete cascade,
  seller_id text,
  item_id text,
  provider text not null default 'mercado_livre',
  sold_quantity numeric(14, 2),
  sales_estimate numeric(14, 2),
  confidence numeric(10, 4) not null default 0,
  source text not null default 'marketplace',
  captured_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.price_recommendations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  analysis_id uuid references public.catalog_analyses(id) on delete cascade,
  provider text not null default 'mercado_livre',
  current_price numeric(14, 2) not null default 0,
  recommended_price numeric(14, 2) not null default 0,
  minimum_profitable_price numeric(14, 2) not null default 0,
  target_margin_percent numeric(10, 4) not null default 0,
  expected_margin_amount numeric(14, 2) not null default 0,
  expected_margin_percent numeric(10, 4) not null default 0,
  action text not null,
  rationale text not null,
  status text not null default 'open',
  question text,
  answer text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'product_costs',
    'catalog_analyses',
    'catalog_sellers',
    'catalog_price_history',
    'catalog_sales_estimates',
    'price_recommendations'
  ] loop
    execute format('drop trigger if exists set_%1$s_updated_at on public.%1$s', table_name);
    execute format(
      'create trigger set_%1$s_updated_at before update on public.%1$s for each row execute function public.set_updated_at()',
      table_name
    );
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

create index if not exists idx_product_costs_workspace_product on public.product_costs(workspace_id, product_id);
create index if not exists idx_catalog_analyses_workspace_product on public.catalog_analyses(workspace_id, product_id, created_at desc);
create index if not exists idx_catalog_analyses_catalog_product on public.catalog_analyses(workspace_id, catalog_product_id, created_at desc);
create index if not exists idx_catalog_sellers_analysis on public.catalog_sellers(workspace_id, analysis_id, catalog_position);
create index if not exists idx_catalog_price_history_product on public.catalog_price_history(workspace_id, product_id, captured_at desc);
create index if not exists idx_catalog_sales_estimates_product on public.catalog_sales_estimates(workspace_id, product_id, captured_at desc);
create index if not exists idx_price_recommendations_workspace_product on public.price_recommendations(workspace_id, product_id, created_at desc);

grant select, insert, update, delete on public.product_costs to authenticated;
grant select, insert, update, delete on public.catalog_analyses to authenticated;
grant select, insert, update, delete on public.catalog_sellers to authenticated;
grant select, insert, update, delete on public.catalog_price_history to authenticated;
grant select, insert, update, delete on public.catalog_sales_estimates to authenticated;
grant select, insert, update, delete on public.price_recommendations to authenticated;
