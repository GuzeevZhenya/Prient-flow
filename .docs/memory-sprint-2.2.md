# Память: Спринт 2.2 — математическое ядро калькулятора

> Рабочий бриф для новой сессии. Составлено 2026-11-07 после Cursor-миграции
> агентского контура и закрытия Спринта 2.1.
> Источники правды: `AGENTS.md`, `ROADMAP.md` (Спринт 2.2),
> `packages/shared/src/{pricing,schemas,constants}`,
> `workspaceSettingsSchema` (тарифы из Спринта 2.1).

## Где мы

- Этап 1 (Foundation) ✅: монорепо, Supabase, 8 таблиц, RLS, типы, smoke.
- Спринт 2.1 ✅: Vite + React + FSD, Auth, UI-кит, настройки workspace
  (`workspaces.settings` ↔ `workspaceSettingsSchema`).
- **Следующее:** Спринт 2.2 — только `packages/shared` (pricing + Zod + тесты).
  UI калькулятора (`apps/web/.../calculator`) — **не этот спринт** (Этап 3 /
  публичная витрина). CRUD склада — 2.3.

Ветка: **`feature/cursor-agent-setup`** (Lesson-4 + Cursor-контур).
Старт на новой машине: `.docs/HANDOFF.md`.

## Что уже лежит в shared (не ломать)

| Путь                          | Состояние                                                                                                                                    |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/pricing/index.ts`        | Скелет: `PricingInput` + `calculateCost()` → `0` (TODO). `calculatePrice` нет.                                                               |
| `src/schemas/index.ts`        | Enum'ы статусов, `loginCredentialsSchema`, **`workspaceSettingsSchema`** (currency, electricityRatePerKwh, laborRatePerHour, marginPercent). |
| `src/constants/index.ts`      | `DEFECT_RISK.FDM_SIMPLE = 1.05`, `SLA_COMPLEX = 1.15`; `MATERIAL_TYPES`.                                                                     |
| `src/schemas/schemas.test.ts` | Только enum-регрессии; тестов pricing нет.                                                                                                   |
| `package.json`                | `vitest run --passWithNoTests`; entry `./pricing`, `./schemas`, `./constants`.                                                               |

Пункт ROADMAP «константы статусов в `src/constants/`» фактически закрыт
Zod-enum'ами в `schemas/` (единый источник для БД CHECK и UI). В 2.2
**не дублировать** статусы вторым массивом — либо re-export из schemas в
constants для удобства, либо отметить чекбокс как выполненный через schemas
и не плодить литералы.

## Формулы (зафиксировать в коде)

Себестоимость до брака (сумма компонент):

```
material      = weightGrams × costPerGram
electricity   = (powerWatts / 1000) × (printTimeSec / 3600) × electricityPricePerKwh
depreciation  = depreciationPerHour × (printTimeSec / 3600)
labor         = masterHourlyRate × (postProcessingMins / 60)

baseCost      = material + electricity + depreciation + labor
calculateCost = baseCost × defectRiskFactor
```

Цена для клиента (`marginPercent` — процентные пункты, как в settings, default `30`):

```
calculatePrice = calculateCost × (1 + marginPercent / 100)
```

Округление: до 2 знаков после запятой на выходе обеих функций
(`Math.round(x * 100) / 100`) — деньги в BYN/RUB; внутри можно считать float.
Отрицательные входы не допускаются (Zod), нулевой вес → material = 0,
остальные компоненты считаются как обычно.

## Стыковка имён: PricingInput ↔ WorkspaceSettings

Сейчас поля **разъехались**. В спринте либо переименовать input под settings,
либо явно маппить при вызове. Рекомендация брифа:

| `PricingInput` (сейчас)                             | Откуда брать значение                                 |
| --------------------------------------------------- | ----------------------------------------------------- |
| `electricityPricePerKwh`                            | `WorkspaceSettings.electricityRatePerKwh`             |
| `masterHourlyRate`                                  | `WorkspaceSettings.laborRatePerHour`                  |
| `marginPercent`                                     | `WorkspaceSettings.marginPercent`                     |
| `defectRiskFactor`                                  | `DEFECT_RISK.FDM_SIMPLE` / `SLA_COMPLEX` (или кастом) |
| `weightGrams`, `costPerGram`                        | позиция заказа / материал                             |
| `printTimeSec`, `powerWatts`, `depreciationPerHour` | принтер + gcode/оценка                                |
| `postProcessingMins`                                | `order_items.post_processing_mins`                    |

В Zod-схеме входа калькулятора допустимо **переименовать** поля PricingInput
под settings (`electricityRatePerKwh`, `laborRatePerHour`), чтобы не плодить
синонимы — обновить интерфейс + экспорты одним коммитом спринта.

## Задачи спринта (DoD)

1. **`pricingInputSchema`** (Zod) — все поля `PricingInput`, числа `nonnegative`,
   `defectRiskFactor` ≥ 1 (или > 0 — зафиксировать в тесте; дефолты ≥ 1.05).
   Тип `PricingInput = z.infer<typeof pricingInputSchema>`; интерфейс руками не держать.
2. **`calculateCost(input)`** — формула выше; вход валидировать схемой
   (`safeParse` / `parse`) — мусор снаружи не считать.
3. **`calculatePrice(input)`** или `calculatePrice(cost, marginPercent)` —
   ROADMAP: `себестоимость × (1 + маржа)`. Предпочтительно одна функция от
   полного input (внутри зовёт cost), чтобы UI не дублировал поля.
4. **Юнит-тесты** `src/pricing/pricing.test.ts` (vitest):
   - happy-path FDM с `DEFECT_RISK.FDM_SIMPLE`;
   - SLA с `DEFECT_RISK.SLA_COMPLEX` (цена выше при прочих равных);
   - нулевой вес → material = 0, cost > 0 если есть время/труд;
   - нулевое время печати → electricity = depreciation = 0;
   - margin 0 → price === cost; margin 100 → price === 2 × cost;
   - отказ Zod на отрицательный вес / NaN.
5. Экспорт из `src/index.ts` / `./pricing` без ломания существующих импортов
   (`workspaceSettingsSchema` и т.д.).
6. `pnpm --filter @prient-flow/shared test` + корневой `pnpm ci:check` зелёные.
7. ROADMAP 2.2 → `[x]`; обновить «Текущее состояние» в `AGENTS.md` и снимок
   в `.docs/PROJECT-MEMORY.md`.

Вне скоупа 2.2: UI calculator page, RTK Query, миграции БД, склад, канбан.

## Команды

```bash
pnpm --filter @prient-flow/shared test
pnpm --filter @prient-flow/shared test:watch
pnpm ci:check
```

Docker/Supabase для этого спринта **не обязательны** — чистая математика.

## Грабли / решения не откладывать

- Не класть формулы в `apps/web` — только shared (правило границ пакетов).
- Не возвращать TanStack Query; не трогать FSD ради калькулятора.
- `WorkspaceSettingsForm` сейчас ходит в Supabase напрямую из feature —
  нарушение `data-and-state.mdc`, **техдолг**, не чинить в 2.2 без запроса.
- Публичный `CalculatorPage` — заглушка Этапа 3; не подключать ядро «заодно».

## Открытые вопросы (если всплывут — спросить)

- Нужен ли breakdown `{ material, electricity, depreciation, labor, cost, price }`
  для UI позже, или достаточно двух чисел? (По умолчанию — два числа + при
  необходимости отдельная `calculateCostBreakdown` в том же файле.)
- Краски/покраска (`painting` в статусах) — отдельный тариф труда или тот же
  `laborRatePerHour` × `postProcessingMins`? По умолчанию — тот же labor.

## После спринта

- Следующий по ROADMAP: **2.3 CRUD склада (materials)** в `apps/web`.
- Ядро pricing тогда начнут звать формы заказа / склада — контракт не ломать.
