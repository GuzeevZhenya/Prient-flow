# Память: Спринт 2.3 — CRUD склада (materials)

> Рабочий бриф. Составлено 2026-11-07 после закрытия Спринта 2.2 (pricing).
> Источники: `ROADMAP.md` (2.3), `AGENTS.md`, `data-and-state.mdc`,
> таблица `materials` / `inventory_logs`, заглушка `pages/inventory`.

## Где мы

- Этап 1 ✅, Спринты 2.1–2.2 ✅.
- **Сейчас:** 2.3 — CRUD склада в `apps/web` (таблица + формы + списание/пополнение
  - low-stock). Миграции БД не нужны — схема уже есть.
- Ветка: `feature/cursor-agent-setup` (или `feature/inventory-crud` от неё).

## Что уже есть

| Путь                    | Состояние                                                                                                |
| ----------------------- | -------------------------------------------------------------------------------------------------------- |
| `pages/inventory`       | Заглушка-текст «Спринт 2.3»                                                                              |
| `shared/api/baseApi`    | Пустой RTK Query, ждать `injectEndpoints`                                                                |
| `MATERIAL_TYPES`        | `filament \| resin \| paint \| primer \| consumable` в shared                                            |
| `materials` (SQL)       | type, brand, name, color_hex, initial/remaining_amount, cost_per_unit, low_stock_threshold, workspace_id |
| `inventory_logs`        | material_id, delta_amount, reason (`manual_adjustment` / `restock` / …)                                  |
| `WorkspaceSettingsForm` | **техдолг**: ходит в Supabase из feature — в 2.3 склад делать правильно через RTK Query                  |

## Задачи спринта (DoD)

1. **Zod** в `packages/shared`: схема материала (create/update) + схема
   движения остатка (delta + reason). Типы из `MATERIAL_TYPES` / `inventoryReasonSchema`.
2. **`entities/material`**: RTK Query эндпоинты (`getMaterials`, `createMaterial`,
   `updateMaterial`, adjust stock) через `baseApi.injectEndpoints`, фильтр
   `workspace_id`, public API через `index.ts`.
3. **`features/material-*`**: формы react-hook-form + zod (добавление/редактирование);
   действие списания/пополнения → запись в `inventory_logs` + обновление
   `remaining_amount` (транзакционно или последовательными запросами с откатом UX).
4. **`pages/inventory`**: таблица с фильтром по `type`, бейдж/подсветка low-stock
   (`remaining_amount < low_stock_threshold`), пустые/error-состояния.
5. Без прямого `supabase.from` в UI-компонентах (правило `data-and-state.mdc`).
6. `pnpm ci:check` + при правках shared — `pnpm test`. Сборка web:
   `pnpm --filter @prient-flow/web build`.
7. ROADMAP 2.3 → `[x]`; обновить AGENTS / PROJECT-MEMORY; бриф 2.4.

## Грабли

- Нужен текущий `workspace_id` пользователя (как в settings) — вынести получение
  workspace в entity/shared, не копипастить запрос из SettingsForm.
- `react-hook-form` + `@hookform/resolvers` могут отсутствовать в web — добавить
  при необходимости.
- Не трогать pricing UI и канбан (2.4).

## Команды

```bash
pnpm --filter @prient-flow/web build
pnpm ci:check
pnpm test   # если меняли packages/*
```

Docker/Supabase для ручной проверки CRUD **нужны** (`pnpm db:start` + `apps/web/.env`).
