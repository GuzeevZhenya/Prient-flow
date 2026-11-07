-- Фикс-пас финального ревью ветки Lesson-4.
-- 1) anon-трекинг: колоночные гранты вместо полного SELECT — клиент не должен
--    видеть calculated_cost, client_id, workspace_id (RLS-политика по токену
--    продолжает ограничивать строки).
-- 2) Кросс-тенантные FK в WITH CHECK: субзапросы к связанным таблицам
--    отфильтровываются их собственным RLS, поэтому чужие UUID не пройдут.

revoke select on public.orders from anon;
grant select (id, order_number, status, total_price, is_paid, public_tracking_token, created_at)
  on public.orders to anon;

drop policy "orders tenant isolation" on orders;
create policy "orders tenant isolation" on orders
  for all to authenticated
  using (workspace_id in (select id from workspaces where owner_id = auth.uid()))
  with check (
    workspace_id in (select id from workspaces where owner_id = auth.uid())
    and client_id in (select id from clients)
  );

drop policy "order_items tenant isolation" on order_items;
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
    order_id in (select id from orders)
    and (material_id is null or material_id in (select id from materials))
  );

drop policy "print_jobs tenant isolation" on print_jobs;
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
    order_item_id in (select id from order_items)
    and printer_id in (select id from printers)
  );

drop policy "inventory_logs tenant isolation" on inventory_logs;
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
    material_id in (select id from materials)
    and (print_job_id is null or print_job_id in (select id from print_jobs))
  );
