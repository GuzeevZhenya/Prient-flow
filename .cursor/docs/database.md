# Database

Секреты и ключи сюда не писать. Актуальные локальные ключи — `supabase status`.

## Таблицы (init_schema)

| Таблица          | Смысл                                                      |
| ---------------- | ---------------------------------------------------------- |
| `workspaces`     | Тенант; `owner_id` → auth.users; `settings` jsonb (тарифы) |
| `clients`        | Клиенты мастерской                                         |
| `materials`      | Склад (filament/resin/paint/primer)                        |
| `printers`       | Парк принтеров                                             |
| `orders`         | Заказы + `public_tracking_token`                           |
| `order_items`    | Позиции заказа, пути STL/gcode                             |
| `print_jobs`     | Задания печати                                             |
| `inventory_logs` | Движения склада                                            |

Enum'ы — `text` + CHECK, значения совпадают с Zod в `packages/shared`.

## Миграции

```bash
supabase migration new <name>
pnpm db:reset    # применить все на чистой БД
pnpm db:types    # → packages/database/src/database.types.ts
```

Существующие файлы миграций не править. Руками не править `database.types.ts`.

## RLS

Изоляция по владельцу workspace (`owner_id`). Anon читает заказ по
`X-Tracking-Token` (колоночный grant после `rls_hardening`).
