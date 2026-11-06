-- Спринт 1.4 — RLS и мультитенантность.
-- Шаблон: тенант-таблицы ограничены workspace_id владельца (auth.uid());
-- таблицы без своего workspace_id смотрят через родителя.

alter table workspaces enable row level security;
alter table clients enable row level security;
alter table materials enable row level security;
alter table printers enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table print_jobs enable row level security;
alter table inventory_logs enable row level security;

-- workspaces: владелец управляет только своими записями.
create policy "workspaces owner select" on workspaces
  for select to authenticated
  using (owner_id = auth.uid());

create policy "workspaces owner insert" on workspaces
  for insert to authenticated
  with check (owner_id = auth.uid());

create policy "workspaces owner update" on workspaces
  for update to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "workspaces owner delete" on workspaces
  for delete to authenticated
  using (owner_id = auth.uid());

-- Тенант-таблицы с workspace_id: полный доступ владельцу workspace.
create policy "clients tenant isolation" on clients
  for all to authenticated
  using (workspace_id in (select id from workspaces where owner_id = auth.uid()))
  with check (workspace_id in (select id from workspaces where owner_id = auth.uid()));

create policy "materials tenant isolation" on materials
  for all to authenticated
  using (workspace_id in (select id from workspaces where owner_id = auth.uid()))
  with check (workspace_id in (select id from workspaces where owner_id = auth.uid()));

create policy "printers tenant isolation" on printers
  for all to authenticated
  using (workspace_id in (select id from workspaces where owner_id = auth.uid()))
  with check (workspace_id in (select id from workspaces where owner_id = auth.uid()));

create policy "orders tenant isolation" on orders
  for all to authenticated
  using (workspace_id in (select id from workspaces where owner_id = auth.uid()))
  with check (workspace_id in (select id from workspaces where owner_id = auth.uid()));

-- order_items: доступ через родительский заказ.
create policy "order_items tenant isolation" on order_items
  for all to authenticated
  using (
    order_id in (
      select o.id from orders o
      join workspaces w on w.id = o.workspace_id
      where w.owner_id = auth.uid()
    )
  )
  with check (
    order_id in (
      select o.id from orders o
      join workspaces w on w.id = o.workspace_id
      where w.owner_id = auth.uid()
    )
  );

-- print_jobs: доступ через позицию заказа → заказ.
create policy "print_jobs tenant isolation" on print_jobs
  for all to authenticated
  using (
    order_item_id in (
      select oi.id from order_items oi
      join orders o on o.id = oi.order_id
      join workspaces w on w.id = o.workspace_id
      where w.owner_id = auth.uid()
    )
  )
  with check (
    order_item_id in (
      select oi.id from order_items oi
      join orders o on o.id = oi.order_id
      join workspaces w on w.id = o.workspace_id
      where w.owner_id = auth.uid()
    )
  );

-- inventory_logs: доступ через материал склада.
create policy "inventory_logs tenant isolation" on inventory_logs
  for all to authenticated
  using (
    material_id in (
      select m.id from materials m
      join workspaces w on w.id = m.workspace_id
      where w.owner_id = auth.uid()
    )
  )
  with check (
    material_id in (
      select m.id from materials m
      join workspaces w on w.id = m.workspace_id
      where w.owner_id = auth.uid()
    )
  );

-- Публичный трекинг заказа: anon читает заказ, только если передал
-- заголовок X-Tracking-Token со значением public_tracking_token.
create or replace function public.request_tracking_token()
returns text
language sql
stable
as $$
  select coalesce(
    nullif(current_setting('request.headers', true), '')::json ->> 'x-tracking-token',
    ''
  );
$$;

create policy "orders public tracking by token" on orders
  for select to anon
  using (public_tracking_token::text = public.request_tracking_token());
