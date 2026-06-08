alter table public.integration_logs
  add column if not exists error_message text;

create table if not exists public.integration_sync_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  provider text not null,
  integration_type text not null,
  status text not null,
  message text not null,
  error_message text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.stock_snapshots (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  product_variant_id uuid references public.product_variants(id) on delete cascade,
  stock_location_id uuid references public.stock_locations(id) on delete set null,
  quantity numeric(14, 3) not null default 0,
  provider text,
  captured_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace view public.inventory_movements as
select
  id,
  workspace_id,
  product_id,
  product_variant_id,
  stock_location_id,
  movement_type,
  quantity,
  unit_cost,
  reference_type,
  reference_id,
  notes,
  created_by,
  created_at,
  updated_at
from public.stock_movements;

do $$
begin
  if exists (select 1 from pg_type where typname = 'integration_status') then
    alter type public.integration_status add value if not exists 'connecting';
  end if;
end $$;

do $$
begin
  if exists (select 1 from pg_type where typname = 'order_status') then
    alter type public.order_status add value if not exists 'fulfilled';
    alter type public.order_status add value if not exists 'refunded';
  end if;
end $$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'integration_sync_logs',
    'stock_snapshots'
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

create index if not exists idx_integration_sync_logs_workspace on public.integration_sync_logs(workspace_id, created_at desc);
create index if not exists idx_stock_snapshots_workspace on public.stock_snapshots(workspace_id, captured_at desc);
create index if not exists idx_marketplace_accounts_provider on public.marketplace_accounts(workspace_id, provider, status);
create index if not exists idx_ecommerce_integrations_provider on public.ecommerce_integrations(workspace_id, provider, status);
create index if not exists idx_products_external_provider on public.products(workspace_id, ((metadata->>'provider')), ((metadata->>'external_id')));
create index if not exists idx_orders_external on public.orders(workspace_id, external_order_id);
create index if not exists idx_order_items_workspace_sku on public.order_items(workspace_id, sku);
create index if not exists idx_stock_movements_workspace on public.stock_movements(workspace_id, created_at desc);
create index if not exists idx_suppliers_workspace on public.suppliers(workspace_id, created_at desc);
create index if not exists idx_ai_insights_workspace on public.ai_insights(workspace_id, created_at desc);

grant select, insert, update, delete on public.integration_sync_logs to authenticated;
grant select, insert, update, delete on public.stock_snapshots to authenticated;
grant select on public.inventory_movements to authenticated;
