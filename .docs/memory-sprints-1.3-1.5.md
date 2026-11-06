# Память: Спринты 1.3–1.5 — схема БД, RLS, типы и клиенты

> Рабочий бриф для новой сессии. Составлено 2026-11-06, сразу после поднятия
> локального Supabase (Спринт 1.2 ✅).
> Источники правды: `AGENTS.md` (правила; ранее KIMI.md), `ROADMAP.md` (чекбоксы),
> `packages/shared/src/schemas` (значения enum'ов), Technical Blueprint §3 (домен).

## Где мы

- Локальный стек Supabase работает: Studio `:54323`, API `:54321`,
  PostgreSQL напрямую `postgresql://postgres:postgres@127.0.0.1:54322/postgres`.
- Ключи: `supabase status` покажет актуальные (publishable/secret).
  Закреплённые на 2026-11-06: publishable `sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH`.
- Доменные enum'ы **уже закодированы** в `packages/shared/src/schemas/index.ts`:
  `orderStatusSchema` (9), `printerStatusSchema` (5), `connectionTypeSchema` (4),
  `printJobStatusSchema` (4), `inventoryReasonSchema` (4), `printerTechnologySchema` (FDM/SLA),
  в constants — `MATERIAL_TYPES`. **Миграция обязана совпадать с ними.**

## Грабли окружения (прочитать перед стартом)

- После установки Docker **перезапустить Cursor** (новый терминал агента) — иначе
  `docker`/`supabase` могут быть не видны в PATH старого процесса.
- Если PATH всё ещё не видит: `export PATH="$PATH:/c/Users/Guzeev/AppData/Local/Programs/DockerDesktop/resources/bin"`.
- Порядок каждого дня: Docker Desktop (Engine running) → `pnpm db:start`.
  Данные живут в volume между запусками; `pnpm db:reset` пересоздаёт БД
  и **применяет все миграции из `supabase/migrations/`** — это и есть способ
  проверять миграции.
- Существующие миграции править нельзя — только новые файлы через
  `supabase migration new <name>`.

## Спринт 1.3 — SQL-миграция `init_schema`

Команды: `supabase migration new init_schema` → заполнить файл → `pnpm db:reset` →
проверить в Studio (`localhost:54323`), что 8 таблиц созданы.

Таблицы (blueprint §3 + уточнения сессии):

| Таблица          | Ключевые поля                                                                                                                                                                                                                      | Примечания                                                                                       |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `workspaces`     | id uuid PK, name, **slug unique**, owner_id → auth.users(id), settings jsonb                                                                                                                                                       | slug — публичные ссылки `/<slug>` (путь к SaaS); settings: кВт⋅ч, маржа %, валюта, тариф мастера |
| `clients`        | id, workspace_id FK, name, phone, telegram_username, telegram_chat_id bigint null                                                                                                                                                  | chat_id заполнится из бота (deep-link, Спринт 4.1)                                               |
| `materials`      | id, workspace_id FK, type text CHECK (`MATERIAL_TYPES`), brand, name, color_hex, initial_amount numeric, remaining_amount numeric, cost_per_unit numeric, low_stock_threshold numeric                                              | суммы numeric, не float                                                                          |
| `printers`       | id, workspace_id FK, name, technology CHECK (FDM/SLA), connection_type CHECK (bambu_mqtt/moonraker/octoprint/manual), local_ip, access_code, power_watts, depreciation_per_hour, status CHECK (idle/printing/paused/error/offline) | enum-значения — из shared                                                                        |
| `orders`         | id, workspace_id FK, client_id FK, order_number, status CHECK (9 значений `orderStatusSchema`), total_price numeric, calculated_cost numeric, is_paid bool, **public_tracking_token uuid unique default gen_random_uuid()**        | токен — для публичного трекинга и привязки TG                                                    |
| `order_items`    | id, order_id FK, name, quantity, technology CHECK, stl_file_path, gcode_file_path, thumbnail_path, material_id FK, estimated_weight_g numeric, estimated_time_sec int, post_processing_mins int                                    | пути — в Supabase Storage (бакеты на 1.4/1.5)                                                    |
| `print_jobs`     | id, order_item_id FK, printer_id FK, started_at, finished_at, status CHECK (queued/printing/success/failed), actual_weight_used_g numeric, failure_reason text null                                                                | фото брака — позже через Storage                                                                 |
| `inventory_logs` | id, material_id FK, print_job_id FK null, delta_amount numeric, reason CHECK (print_success/print_fail/manual_adjustment/restock)                                                                                                  | delta отрицательный при списании                                                                 |

Общие правила миграции:

- PK: `id uuid primary key default gen_random_uuid()`.
- Всем таблицам добавить `created_at timestamptz not null default now()`
  (в blueprint не было, проекту нужно для логов и сортировок).
- Enum'ы — `text` + `check constraint` (не Postgres-типы ENUM: дешевле менять).
- Индексы: **на каждый FK и на `workspace_id`** всех тенант-таблиц.
- FK `owner_id → auth.users(id)` — обязателен для RLS в 1.4.

## Спринт 1.4 — RLS и мультитенантность

- `alter table <t> enable row level security` — все 8 таблиц.
- Базовый шаблон политики владельца (таблицы без своего workspace_id
  смотрят через родителя — например order_items через orders):
  `workspace_id in (select id from workspaces where owner_id = auth.uid())`.
- `workspaces`: select/insert where `owner_id = auth.uid()`.
- Публичное чтение заказа по токену (для трекинг-страницы) — **решение в сессии**:
  рекомендуемый паттерн — заголовок `X-Tracking-Token` → функция чтения
  `request.headers` → политика `public_tracking_token = token` для роли anon.
  Если спорно — оставить TODO-комментарием и вынести в бэклог, не блокировать 1.5.
- Таблицы-справочники без workspace (сейчас таких нет) — не создавать.
- Проверка: `supabase test db` (pgTAP) или ручной сценарий через anon-ключ:
  запрос чужого workspace возвращает 0 строк.

## Спринт 1.5 — типы, клиенты, `.env`

1. `pnpm db:types` → перезапишет заглушку
   `packages/database/src/database.types.ts` — это ожидаемо, файл генерируемый,
   руками не править.
2. `.env` из `.env.example`:
   - `VITE_SUPABASE_URL=http://localhost:54321`
   - `VITE_SUPABASE_ANON_KEY=<publishable из supabase status>`
   - `SUPABASE_SERVICE_ROLE_KEY=<secret>` (только для бота/сервера, не в браузер)
3. `packages/database`: фабрика `createSupabaseClient` уже типизирована под
   `Database`. Добавить `createServiceRoleClient` (для Этапа 4, бот).
   **SSR-фабрика не нужна** — проект это Vite SPA, не Next.js; осознанное
   отклонение от blueprint.
4. Смоук-тест: скрипт через supabase-js делает `select` к списку таблиц
   (например `.from("workspaces").select("id").limit(1)`) — успех = 1.5 закрыт.

## Definition of Done (каждый спринт)

- `pnpm ci:check` и `pnpm test` зелёные.
- Миграция применяется на чистой БД (`pnpm db:reset` без ошибок).
- ROADMAP: спринт отмечен `[x]`; `.docs/PROJECT-MEMORY.md` — обновить снимок.
- Один спринт = один коммит (правило проекта).

## Открытые вопросы (решать по месту, не блокировать)

- Трекинг-токен в 1.4: заголовок `X-Tracking-Token` vs RPC-обёртка.
- Нужна ли уже сейчас таблица `memberships` (приглашения в workspace) —
  blueprint обходится `owner_id`; для SaaS (бэклог) понадобится.
- Имена бакетов Storage (`stl`, `gcode`, `photos`) — зафиксировать при 1.5,
  если будем создавать бакеты миграцией.
