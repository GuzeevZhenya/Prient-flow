# Память: Спринт 2.4 — канбан заказов и клиенты

> Рабочий бриф. Составлено 2026-11-07 после закрытия Спринта 2.3 (склад).
> Источники: `ROADMAP.md` (2.4), `AGENTS.md`, таблица `orders` / `order_items` /
> `clients`, заглушки `pages/orders` и `pages/clients`.

## Где мы

- Этап 1 ✅, Спринты 2.1–2.3 ✅.
- **Сейчас:** 2.4 — канбан заказов + CRUD `order_items` + CRUD клиентов.
- Ветка: от актуальной `feature/inventory-crud` (или `feature/orders-kanban`).

## Что уже есть

| Путь                 | Состояние                                                                                            |
| -------------------- | ---------------------------------------------------------------------------------------------------- |
| `pages/orders`       | Заглушка-текст «Спринт 2.4»                                                                          |
| `pages/clients`      | Заглушка-текст «Спринт 2.4»                                                                          |
| `orderStatusSchema`  | 9 статусов: draft → quoted → … → completed / cancelled                                               |
| `orders` (SQL)       | workspace_id, client_id, order_number, status, total_price, calculated_cost, is_paid, tracking token |
| `order_items` (SQL)  | name, qty, technology, material_id, вес/время, post_processing_mins, пути STL/gcode                  |
| `clients` (SQL)      | name, phone, telegram_username, telegram_chat_id                                                     |
| `entities/workspace` | `useGetWorkspaceByOwnerQuery` — брать `workspace_id` отсюда, не копипастить                          |
| `entities/material`  | список материалов — для выбора `material_id` в позиции                                               |
| `shared/ui`          | Button, Modal, Card, Badge, Select — канбан-колонки собирать из этого                                |

## Задачи спринта (DoD)

1. **Zod** в `packages/shared`: схемы клиента, заказа (create/update, статус),
   позиции заказа. Статусы только из `orderStatusSchema`, технология из
   `printerTechnologySchema`. Тесты — `tdd-packages`.
2. **`entities/client` + `entities/order`**: RTK Query через
   `baseApi.injectEndpoints`, фильтр `workspace_id`, public API `index.ts`.
   Смена статуса заказа — отдельный mutation (для dnd).
3. **`features/client-*` / `features/order-*`**: формы CRUD (react-hook-form +
   zod); создание заказа с хотя бы одной позицией.
4. **`pages/orders`**: канбан-колонки по статусам, карточка (клиент, сумма,
   оплата). Drag-and-drop (`@dnd-kit/core`) → mutation статуса.
   `cancelled` можно вынести из основной ленты (отдельная колонка или фильтр).
5. **`pages/clients`**: таблица + формы CRUD, пустые/error-состояния.
6. Без прямого `supabase.from` в UI. Не трогать склад (2.3) и калькулятор (Этап 3).
7. `pnpm ci:check` + `pnpm test` (если shared) + `pnpm --filter @prient-flow/web build`.
8. ROADMAP 2.4 → `[x]`; обновить AGENTS / PROJECT-MEMORY; бриф 3.1.

## Грабли

- В `orders` **нет колонки срока** (ROADMAP пишет «срок» на карточке). Не
  выдумывать поле: либо показать `created_at`, либо `supabase migration new`
  с `due_at` + RLS в той же миграции + Zod. Если нужен due date — спроси.
- `dnd-kit` ещё не в зависимостях web — добавить при сборке канбана.
- Позиции ссылаются на `material_id` (nullable) — склад уже есть, можно выбрать
  материал из `useGetMaterialsQuery`.
- Цена/себестоимость заказа в 2.4 можно вводить вручную; авторасчёт через
  `calculatePrice` — бонус, не блокер (калькулятор UI — Этап 3).
- Кросс-импорты features запрещены: карточка заказа не импортирует форму
  клиента — только entities.

## Команды

```bash
pnpm --filter @prient-flow/web build
pnpm ci:check
pnpm test   # если меняли packages/*
```

Docker/Supabase для ручной проверки канбана **нужны**.
