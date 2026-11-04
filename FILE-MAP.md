# FILE-MAP — карта файлов и папок Prient-flow

> За что отвечает каждый файл и папка в репозитории.
> Правило: этот файл обновляется командой `/заключение`, если в сессии
> добавлялись или удалялись файлы/папки.
> Последняя синхронизация: 2026-11-04.

## Корень

| Путь                  | Назначение                                                                       |
| --------------------- | -------------------------------------------------------------------------------- |
| `apps/`               | Приложения монорепозитория (web, desktop, bot)                                   |
| `packages/`           | Переиспользуемые пакеты: БД, бизнес-логика, парсер                               |
| `supabase/`           | `migrations/` — SQL-миграции и RLS-политики (пока пусто)                         |
| `.kimi-code/skills/`  | Команды-скиллы агента: `/заключение`, `/формат`                                  |
| `.kimi-code/agents/`  | Субагент arch-reviewer — архитектурный ревьюер по правилам CLAUDE.md (read-only) |
| `package.json`        | Корневой манифест: turbo-скрипты, dev-зависимости, packageManager                |
| `pnpm-workspace.yaml` | Состав воркспейса + `onlyBuiltDependencies` (electron, esbuild)                  |
| `pnpm-lock.yaml`      | Локфайл зависимостей (генерируется, руками не править)                           |
| `.npmrc`              | Дублирует одобренные build-скрипты для pnpm                                      |
| `turbo.json`          | Задачи Turborepo: dev/build/lint/test и их зависимости                           |
| `tsconfig.base.json`  | Базовый strict-конфиг TS для всех пакетов                                        |
| `tsconfig.json`       | Корневой typecheck: покрывает `packages/*/src`, `apps/*/src`, алиас `@/`         |
| `eslint.config.mjs`   | Flat-конфиг ESLint (typescript-eslint + prettier-compat)                         |
| `.prettierrc.json`    | Правила форматирования Prettier                                                  |
| `.prettierignore`     | Исключения Prettier (node_modules, dist, lockfile…)                              |
| `.gitignore`          | Исключения git (node_modules, .turbo, .env, dist…)                               |
| `.env.example`        | Шаблон переменных окружения (VITE_*, Supabase, Telegram, Upstash)                |
| `README.md`           | Обзор проекта: стек, структура, быстрый старт                                    |
| `ROADMAP.md`          | Дорожная карта: 6 этапов, разбитых на спринты с чекбоксами                       |
| `CLAUDE.md`           | Правила архитектуры и контекст для ИИ-агентов                                    |
| `FILE-MAP.md`         | Этот файл — карта всех файлов                                                    |
| `.turbo/`             | Локальный кэш Turborepo (ускоряет повторные сборки; в git не попадает)           |

## apps/ — приложения

### apps/web — SPA админки + публичный калькулятор (Vite + React + FSD)

| Путь                 | Назначение                                                                                                                                      |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `index.html`         | HTML-оболочка, точка монтирования `#root`                                                                                                       |
| `vite.config.ts`     | Конфиг Vite: react-плагин, алиас `@/` → `src`, порт 5173                                                                                        |
| `tsconfig.json`      | TS-конфиг приложения: jsx, DOM lib, paths `@/*`                                                                                                 |
| `tailwind.config.ts` | Конфиг Tailwind (content-скан src)                                                                                                              |
| `postcss.config.js`  | PostCSS: tailwind + autoprefixer                                                                                                                |
| `ARCHITECTURE.md`    | Правила FSD-слоёв и карта слоёв                                                                                                                 |
| `src/main.tsx`       | Точка входа: рендер `<App />` в `#root`                                                                                                         |
| `src/vite-env.d.ts`  | Типы `import.meta.env` (vite/client)                                                                                                            |
| `src/app/`           | Слой инициализации: `App.tsx`, `providers/` (Redux store + RTK Query), `routes/` (React Router), `layouts/BaseLayout.tsx`, `styles/globals.css` |
| `src/pages/`         | Страницы-маршруты: `dashboard`, `orders`, `inventory`, `printers`, `clients`, `settings`, `calculator` (публичная), `not-found`                 |
| `src/widgets/`       | Крупные блоки: `sidebar` (навигация), `header` (шапка)                                                                                          |
| `src/features/`      | Действия пользователя (пока пусто — со Спринта 2.3)                                                                                             |
| `src/entities/`      | Бизнес-сущности (пока пусто — со Спринта 1.5/2.3)                                                                                               |
| `src/shared/`        | Инфраструктура: `api/supabase.ts` (клиент), `config/routes.ts` (маршруты), `ui/`, `lib/`                                                        |

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

| Путь                     | Назначение                                                                                                                                                                |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/database/`     | Supabase-клиенты и типы БД. `src/index.ts` — фабрика клиента; `src/database.types.ts` — автогенерация (`pnpm db:types`), сейчас заглушка                                  |
| `packages/shared/`       | Единый источник бизнес-логики: `src/pricing/` (формула себестоимости — скелет), `src/schemas/` (Zod-контракты статусов), `src/constants/` (коэффициенты, типы материалов) |
| `packages/gcode-parser/` | Парсер метаданных .gcode/.3mf: `src/index.ts` — скелет `parseGcode()` (реализация — Этап 5)                                                                               |

## История изменений карты

- 2026-11-03 — первичное заполнение (каркас + apps/web на FSD).
- 2026-11-04 — добавлен субагент arch-reviewer (.kimi-code/agents/).
