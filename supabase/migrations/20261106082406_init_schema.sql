-- Спринт 1.3 — init_schema: 8 доменных таблиц Prient-flow.
-- Значения CHECK-ограничений обязаны совпадать с Zod-схемами
-- в packages/shared/src/schemas и MATERIAL_TYPES в packages/shared/src/constants.

create table workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  owner_id uuid not null references auth.users (id) on delete cascade,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table clients (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces (id) on delete cascade,
  name text not null,
  phone text,
  telegram_username text,
  telegram_chat_id bigint,
  created_at timestamptz not null default now()
);

create table materials (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces (id) on delete cascade,
  type text not null check (type in ('filament', 'resin', 'paint', 'primer', 'consumable')),
  brand text,
  name text not null,
  color_hex text,
  initial_amount numeric not null default 0,
  remaining_amount numeric not null default 0,
  cost_per_unit numeric not null default 0,
  low_stock_threshold numeric not null default 0,
  created_at timestamptz not null default now()
);

create table printers (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces (id) on delete cascade,
  name text not null,
  technology text not null check (technology in ('FDM', 'SLA')),
  connection_type text not null check (connection_type in ('bambu_mqtt', 'moonraker', 'octoprint', 'manual')),
  local_ip text,
  access_code text,
  power_watts numeric,
  depreciation_per_hour numeric,
  status text not null default 'offline' check (status in ('idle', 'printing', 'paused', 'error', 'offline')),
  created_at timestamptz not null default now()
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces (id) on delete cascade,
  client_id uuid not null references clients (id) on delete restrict,
  order_number text not null,
  status text not null default 'draft' check (
    status in (
      'draft',
      'quoted',
      'approved',
      'printing',
      'post_processing',
      'painting',
      'ready',
      'completed',
      'cancelled'
    )
  ),
  total_price numeric,
  calculated_cost numeric,
  is_paid boolean not null default false,
  public_tracking_token uuid not null unique default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  name text not null,
  quantity integer not null default 1,
  technology text not null check (technology in ('FDM', 'SLA')),
  stl_file_path text,
  gcode_file_path text,
  thumbnail_path text,
  material_id uuid references materials (id) on delete set null,
  estimated_weight_g numeric,
  estimated_time_sec integer,
  post_processing_mins integer,
  created_at timestamptz not null default now()
);

create table print_jobs (
  id uuid primary key default gen_random_uuid(),
  order_item_id uuid not null references order_items (id) on delete cascade,
  printer_id uuid not null references printers (id) on delete restrict,
  started_at timestamptz,
  finished_at timestamptz,
  status text not null default 'queued' check (status in ('queued', 'printing', 'success', 'failed')),
  actual_weight_used_g numeric,
  failure_reason text,
  created_at timestamptz not null default now()
);

create table inventory_logs (
  id uuid primary key default gen_random_uuid(),
  material_id uuid not null references materials (id) on delete cascade,
  print_job_id uuid references print_jobs (id) on delete set null,
  delta_amount numeric not null,
  reason text not null check (reason in ('print_success', 'print_fail', 'manual_adjustment', 'restock')),
  created_at timestamptz not null default now()
);

-- Индексы: на каждый FK и на workspace_id всех тенант-таблиц.
create index workspaces_owner_id_idx on workspaces (owner_id);
create index clients_workspace_id_idx on clients (workspace_id);
create index materials_workspace_id_idx on materials (workspace_id);
create index printers_workspace_id_idx on printers (workspace_id);
create index orders_workspace_id_idx on orders (workspace_id);
create index orders_client_id_idx on orders (client_id);
create index order_items_order_id_idx on order_items (order_id);
create index order_items_material_id_idx on order_items (material_id);
create index print_jobs_order_item_id_idx on print_jobs (order_item_id);
create index print_jobs_printer_id_idx on print_jobs (printer_id);
create index inventory_logs_material_id_idx on inventory_logs (material_id);
create index inventory_logs_print_job_id_idx on inventory_logs (print_job_id);
