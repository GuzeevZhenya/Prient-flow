# FILE-MAP — карта файлов и папок Prient-flow

> За что отвечает каждый файл и папка в репозитории.
> Правило: этот файл обновляется командой `/заключение`, если в сессии
> добавлялись или удалялись файлы/папки.
> Последняя синхронизация: 2026-11-07.

## Корень

| Путь                  | Назначение                                                                                                                                                 |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/`               | Приложения монорепозитория (web, desktop, bot)                                                                                                             |
| `packages/`           | Переиспользуемые пакеты: БД, бизнес-логика, парсер                                                                                                         |
| `supabase/`           | `config.toml` — конфиг локального стека; `migrations/` — `init_schema` (8 таблиц), `rls_policies`, `rls_hardening`                                         |
| `docs/`               | Планы реализации (superpowers workflow), история спецификаций                                                                                              |
| `.docs/`              | `HANDOFF.md` — перенос на другой ПК; `PROJECT-MEMORY.md`; брифы `memory-sprint-*.md`; `history/` — отчёты (`/заключение`)                                  |
| `.cursor/skills/`     | `/формат`, `/заключение`, `systematic-debugging`, `verification-before-completion`, `receiving-code-review`, `dispatching-parallel-agents`, `tdd-packages` |
| `.cursor/agents/`     | Субагент arch-reviewer — архитектурный ревьюер по правилам AGENTS.md (read-only)                                                                           |
| `.cursor/rules/`      | typescript-strict, data-and-state, definition-of-done, github-flow, frontend-fsd, package-boundaries, superpowers-allowlist                                |
| `.cursor/docs/`       | Подробности: architecture, database, dev-guide (не always-on)                                                                                              |
| `REVIEW.md`           | Чеклист код-ревью                                                                                                                                          |
| `package.json`        | Корневой манифест: turbo-скрипты, dev-зависимости, packageManager                                                                                          |
| `pnpm-workspace.yaml` | Состав воркспейса + `onlyBuiltDependencies` (electron, esbuild)                                                                                            |
| `pnpm-lock.yaml`      | Локфайл зависимостей (генерируется, руками не править)                                                                                                     |
| `.npmrc`              | Дублирует одобренные build-скрипты для pnpm                                                                                                                |
| `turbo.json`          | Задачи Turborepo: dev/build/lint/test и их зависимости                                                                                                     |
| `tsconfig.base.json`  | Базовый strict-конфиг TS для всех пакетов                                                                                                                  |
| `tsconfig.json`       | Корневой typecheck: покрывает `packages/*/src`, `apps/*/src`, алиас `@/`                                                                                   |
| `eslint.config.mjs`   | Flat-конфиг ESLint (typescript-eslint + prettier-compat)                                                                                                   |
| `.prettierrc.json`    | Правила форматирования Prettier                                                                                                                            |
| `.prettierignore`     | Исключения Prettier (node_modules, dist, lockfile, .superpowers…)                                                                                          |
| `.gitignore`          | Исключения git (node_modules, .turbo, .env, dist, .superpowers…)                                                                                           |
| `.env.example`        | Шаблон переменных окружения (VITE_*, Supabase, Telegram, Upstash)                                                                                          |
| `README.md`           | Обзор проекта: стек, структура, быстрый старт                                                                                                              |
| `ROADMAP.md`          | Дорожная карта: 6 этапов, разбитых на спринты с чекбоксами                                                                                                 |
| `AGENTS.md`           | Правила архитектуры и контекст для Cursor-агентов (бывшие CLAUDE.md → KIMI.md)                                                                             |
| `FILE-MAP.md`         | Этот файл — карта всех файлов                                                                                                                              |
| `.turbo/`             | Локальный кэш Turborepo (ускоряет повторные сборки; в git не попадает)                                                                                     |

## apps/ — приложения

### apps/web — SPA админки + публичный калькулятор (Vite + React + FSD)

| Путь                 | Назначение                                                                                                                                                                        |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `index.html`         | HTML-оболочка, точка монтирования `#root`                                                                                                                                         |
| `vite.config.ts`     | Конфиг Vite: react-плагин, алиас `@/` → `src`, порт 5173                                                                                                                          |
| `tsconfig.json`      | TS-конфиг приложения: jsx, DOM lib, paths `@/*`                                                                                                                                   |
| `tailwind.config.ts` | Конфиг Tailwind (content-скан src)                                                                                                                                                |
| `postcss.config.js`  | PostCSS: tailwind + autoprefixer                                                                                                                                                  |
| `ARCHITECTURE.md`    | Правила FSD-слоёв и карта слоёв                                                                                                                                                   |
| `src/main.tsx`       | Точка входа: рендер `<App />` в `#root`                                                                                                                                           |
| `src/vite-env.d.ts`  | Типы `import.meta.env` (vite/client)                                                                                                                                              |
| `src/app/`           | Слой инициализации: `App.tsx`, `providers/` (Redux store + RTK Query + SessionProvider), `routes/` (React Router + `RequireAuth`), `layouts/BaseLayout.tsx`, `styles/globals.css` |
| `src/pages/`         | Страницы-маршруты: `dashboard`, `orders`, `inventory`, `printers`, `clients`, `settings`, `login`, `calculator` (публичная), `not-found`                                          |
| `src/widgets/`       | Крупные блоки: `sidebar` (навигация), `header` (шапка с email и выходом)                                                                                                          |
| `src/features/`      | Действия пользователя: `auth` (LoginForm/LogoutButton), `workspace-settings` (форма тарифов)                                                                                      |
| `src/entities/`      | Бизнес-сущности: `session` (Redux-слайс сессии Supabase Auth)                                                                                                                     |
| `src/shared/`        | Инфраструктура: `api/supabase.ts` (клиент), `api/baseApi.ts` (RTK Query), `config/routes.ts`, `ui/` (Button, Input, Label, Select, Modal, Card, Badge, Spinner), `lib/`           |

В каждом слое лежит свой `README.md` с подробным описанием.

### apps/desktop — локальный хаб принтеров (Electron, Этап 5)

| Путь           | Назначение                                                                 |
| -------------- | -------------------------------------------------------------------------- |
| `package.json` | electron, electron-vite, chokidar, mqtt, ws. Исходники появятся на Этапе 5 |

### apps/bot — Telegram-бот (grammY, Этап 4)

| Путь           | Назначение                                                       |
| -------------- | ---------------------------------------------------------------- |
| `src/index.ts` | Заглушка-точка входа (реализация — Спринт 4.1)                   |
| `package.json` | grammy, conversations, Upstash Redis; dev через tsx, сборка tsup |

## packages/ — общие пакеты

| Путь                     | Назначение                                                                                                                                                                                                                                                           |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/database/`     | Supabase-клиенты и типы БД. `src/index.ts` — фабрики `createSupabaseClient` / `createServiceRoleClient`; `src/database.types.ts` — автогенерация (`pnpm db:types`, в .prettierignore); `scripts/smoke-test.ts` — смоук (`pnpm --filter @prient-flow/database smoke`) |
| `packages/shared/`       | Единый источник бизнес-логики: `src/pricing/` (скелет формул), `src/schemas/` (Zod-контракты статусов + юнит-тесты), `src/constants/` (коэффициенты, типы материалов)                                                                                                |
| `packages/gcode-parser/` | Парсер метаданных .gcode/.3mf: `src/index.ts` — скелет `parseGcode()` (реализация — Этап 5)                                                                                                                                                                          |

## История изменений карты

- 2026-11-03 — первичное заполнение (каркас + apps/web на FSD).
- 2026-11-04 — добавлен субагент arch-reviewer (.kimi-code/agents/).
- 2026-11-05 — CLAUDE.md переименован в KIMI.md; добавлена память проекта (.docs/PROJECT-MEMORY.md).
- 2026-11-06 — добавлены `.cursor/rules/`, `docs/`, `supabase/config.toml`, тесты shared; обновлён состав apps/web/src/shared.
- 2026-11-06 — Lesson-4: миграции `init_schema`/`rls_policies`/`rls_hardening`, смоук-скрипт database, `.docs/history/`.
- 2026-11-07 — Kimi → Cursor: `KIMI.md` → `AGENTS.md`, `.kimi-code/` → `.cursor/skills|agents`, добавлены REVIEW.md и `.cursor/docs/`.
- 2026-11-07 — добавлен бриф `.docs/memory-sprint-2.2.md` (математическое ядро).
- 2026-11-07 — добавлен `.docs/HANDOFF.md` для старта на другом компьютере.
- 2026-11-07 — allowlist Superpowers: 5 скиллов в `.cursor/skills/` + правило `superpowers-allowlist`.
