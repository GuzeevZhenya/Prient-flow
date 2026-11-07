# AGENTS.md — правила архитектуры Prient-flow

Системный контекст для Cursor-агентов в этом репозитории.
Бывший `KIMI.md` / `CLAUDE.md` — не использовать.

## Что это

ERP для 3D-печатной мастерской и студии покраса: заказы, склад расходников
(филамент/смола/краски), парк принтеров, расчёт себестоимости, Telegram-бот
и десктоп-хаб для интеграции со слайсером и принтерами в локальной сети.

Монорепозиторий: Turborepo + pnpm workspaces. Node >= 20, pnpm 10
(версия закреплена в поле `packageManager` корневого package.json).

**Текущее состояние:** каркас (Спринт 1.1 ✅) + контур качества кода
(ESLint + Prettier + typecheck + vitest + скиллы команд) + локальный
Supabase (1.2 ✅) + схема БД (1.3 ✅: 8 таблиц, миграция `init_schema`) +
RLS-изоляция тенантов (1.4 ✅) + сгенерированные типы и клиенты
`packages/database` (1.5 ✅: `createSupabaseClient`, `createServiceRoleClient`,
смоук `pnpm --filter @prient-flow/database smoke`). `apps/web` переведён на
Vite + React + FSD (Спринт 2.1 ✅): слои, роутер, layout, Redux store
с RTK Query, UI-кит в `shared/ui`, Supabase Auth с `RequireAuth`,
настройки workspace. Спринт 2.2 ✅: `pricingInputSchema`,
`calculateCost` / `calculatePrice` в `packages/shared` (тарифы как в
`workspaceSettingsSchema`). Спринт 2.3 ✅: CRUD склада. Спринт 2.4 ✅:
канбан заказов (dnd-kit) + CRUD клиентов/`order_items`. `apps/desktop`
и `apps/bot` — манифесты и заглушка бота. Разработка строго по
`ROADMAP.md`, этапы последовательно.

Перенос на другой ПК / старт сессии: `.docs/HANDOFF.md`.
Бриф текущего спринта: `.docs/memory-sprint-3.1.md`.
Память проекта: `.docs/PROJECT-MEMORY.md`. Подробности: `.cursor/docs/`.

## Карта репозитория

```
apps/
  web/        @prient-flow/web      Vite + React 19 + TS, FSD
  desktop/    @prient-flow/desktop  Electron + electron-vite
  bot/        @prient-flow/bot      grammY + Upstash Redis
packages/
  database/   @prient-flow/database Supabase-клиенты + database.types.ts
  shared/     @prient-flow/shared   Zod, pricing, константы; vitest
  gcode-parser/ @prient-flow/gcode-parser  .gcode/.3mf; vitest
supabase/
  migrations/ SQL-миграции и RLS
```

Внутренние пакеты: `"@prient-flow/<name>": "workspace:*"`, entry — `src/index.ts`.

## Правила FSD (apps/web)

- Импорты только вниз: app → pages → widgets → features → entities → shared.
- Public API слайса — только через `index.ts`.
- Алиас `@/` = `apps/web/src/`.
- Кросс-импорты внутри слоя запрещены.
- Env браузера — только `VITE_*`.

## Границы пакетов

- `packages/shared` — единственный источник бизнес-логики и контрактов.
- `packages/database` — клиенты и типы; `database.types.ts` только через `pnpm db:types`.
- `packages/gcode-parser` — чистые функции без I/O, с тестами.
- `apps/*` — тонкие слои над packages.

## Правила кода

- Strict TypeScript, без `any` без крайней нужды.
- Внешние данные валидируются Zod из `packages/shared`.
- Статусы — только константы shared, не строковые литералы.
- Каждый запрос к БД ограничен `workspace_id` (RLS + явный фильтр).
- Секреты только в `.env`; в репо — `.env.example` с пустыми значениями.

## Правила работы агентов

- **Stop & Check**: если запрос нарушает правила (например `localStorage` в UI
  или `any`), сразу скажи об этом до кода.
- **План без ожидания**: кратко опиши план (файлы + правила) и сразу реализуй.
  Вопрос пользователю — только если без ответа нельзя выбрать поведение.
- **Баг** → скилл `systematic-debugging` (причина до патча).
- **Код в `packages/*`** → скилл `tdd-packages` (тест первым). UI — браузер.
- **DoD**: перед финальным ответом — `pnpm ci:check`; при правках `packages/*` —
  ещё `pnpm test` (см. `.cursor/rules/definition-of-done.mdc` и
  `verification-before-completion`).
- Коммиты и PR — только по явной просьбе; Conventional Commits, без
  `Co-authored-by: Cursor`.
- Плагин Superpowers: только allowlist в `.cursor/rules/superpowers-allowlist.mdc`.

## Команды

```bash
pnpm install    # зависимости воркспейса
pnpm dev        # turbo dev
pnpm test       # vitest через turbo
pnpm build      # turbo build (desktop-заглушка ломает корневой build)
pnpm lint       # ESLint
pnpm lint:fix   # ESLint autofix
pnpm format     # Prettier --check
pnpm format:fix # Prettier write
pnpm typecheck  # tsc --noEmit
pnpm ci:check   # lint + typecheck + format
pnpm db:start   # локальный Supabase (Docker + CLI)
pnpm db:reset   # пересоздать БД + миграции
pnpm db:types   # типы БД → packages/database
```

Сборка web отдельно: `pnpm --filter @prient-flow/web build`.

## Скиллы и субагенты (.cursor/)

Скиллы (`.cursor/skills/`):

- `/формат` → `format` — format:fix → lint:fix → typecheck до зелёного.
- `/заключение` → `zaklyuchenie` — отчёт в `.docs/history/` + обновление FILE-MAP.
- `systematic-debugging`, `verification-before-completion`,
  `receiving-code-review`, `dispatching-parallel-agents`, `tdd-packages`.

Субагенты (`.cursor/agents/`):

- `arch-reviewer` — read-only ревью FSD / границ пакетов / Zod / `workspace_id`
  и сверка AGENTS.md + FILE-MAP + README + ROADMAP с кодом.

Правила always-on / по glob: `.cursor/rules/`.
Чеклист ревью: `REVIEW.md`.

## Изменения схемы БД

1. `supabase migration new <name>` — существующие миграции не править.
2. RLS в той же миграции.
3. `pnpm db:types`.
4. Статусы/поля → синхронно Zod в shared.

## STOP

Остановись и спроси, если:

- нужно выбрать между конфликтными архитектурными решениями (не описаны в доках);
- требуется destructive git (`push --force`, hard reset) или коммит секретов;
- без ответа пользователя нельзя понять workspace / окружение.

## Рабочий процесс

- Перед спринтом читай `.docs/HANDOFF.md` (если новая машина) и бриф
  `.docs/memory-sprint-3.1.md` (пока 3.1 не закрыт).
- Следующий незакрытый спринт в `ROADMAP.md` — приоритет (сейчас 3.1 — 3D-вьювер).
- После спринта: `[x]` в ROADMAP + обновить «Текущее состояние» здесь и в
  `.docs/PROJECT-MEMORY.md`; новый бриф клади в `.docs/memory-sprint-X.Y.md`.
- Один логический спринт = один коммит (или PR).
