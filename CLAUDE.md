# CLAUDE.md — правила архитектуры Prient-flow

Системный контекст для ИИ-агентов, работающих с этим репозиторием.

## Что это

ERP для 3D-печатной мастерской и студии покраса: заказы, склад расходников
(филамент/смола/краски), парк принтеров, расчёт себестоимости, Telegram-бот
и десктоп-хаб для интеграции со слайсером и принтерами в локальной сети.

Монорепозиторий: Turborepo + pnpm workspaces. Node >= 20, pnpm 12.

**Текущее состояние:** каркас (Спринт 1.1 ✅) + контур качества кода
(ESLint + Prettier + typecheck + скиллы команд). В `apps/*` пока только
`package.json` с зависимостями и заглушка `apps/bot/src/index.ts` —
исходников приложений ещё нет.
Разработка идёт строго по `ROADMAP.md`, этапы последовательно,
не перепрыгивай вперёд без явной команды.

## Карта репозитория

```
apps/
  web/        @prient-flow/web      Next.js 15 (App Router) + React 19,
                                    Tailwind, TanStack Query, three/r3f/drei
  desktop/    @prient-flow/desktop  Electron 33 + electron-vite + Vite 6,
                                    chokidar, mqtt, ws
  bot/        @prient-flow/bot      grammY + @grammyjs/conversations,
                                    Upstash Redis, dev: tsx, build: tsup
packages/
  database/   @prient-flow/database Supabase-клиенты (@supabase/supabase-js,
                                    @supabase/ssr) + database.types.ts
  shared/     @prient-flow/shared   Zod-схемы, pricing, константы; vitest
  gcode-parser/ @prient-flow/gcode-parser  Парсер .gcode/.3mf; vitest
supabase/
  migrations/ SQL-миграции и RLS-политики
```

Внутренние пакеты подключаются как `"@prient-flow/<name>": "workspace:*"`,
entry point — `src/index.ts` (TS напрямую, без шага сборки).

## Границы пакетов

- `packages/shared` — **единственный** источник бизнес-логики и контрактов:
  формулы ценообразования, Zod-схемы, константы статусов.
  Никакой бизнес-логики в apps/* — только вызовы shared.
- `packages/database` — Supabase-клиенты и типы БД. Типы
  `database.types.ts` генерируются командой `pnpm db:types`,
  руками не править (сейчас там заглушка до первого запуска Supabase).
- `packages/gcode-parser` — чистые функции без I/O, покрываются тестами.
- `apps/web`, `apps/desktop`, `apps/bot` — тонкие слои над packages.

## Правила кода

- Строгий TypeScript (`strict: true` из `tsconfig.base.json`),
  без `any` без крайней нужды.
- Все внешние данные (формы, API, вебхуки, конфиги принтеров,
  пейлоады из парсеров) валидируются Zod-схемами из `packages/shared`.
- Статусы заказов/принтеров/материалов — только из констант shared,
  строки-литералы в коде запрещены.
- Мультитенантность: каждый запрос к БД обязан быть ограничен
  `workspace_id` (на уровне RLS + явного фильтра).
- Секреты — только через `.env`; коммитим `.env.example` с пустыми значениями.

## Команды

```bash
pnpm install    # установка всех зависимостей воркспейса
pnpm dev        # turbo dev — все приложения
pnpm test       # тесты пакетов (vitest через turbo)
pnpm build      # сборка (turbo build)
pnpm lint       # ESLint — проверка
pnpm lint:fix   # ESLint — автофикс
pnpm format     # Prettier — проверка форматирования
pnpm format:fix # Prettier — автофикс всех файлов
pnpm typecheck  # tsc --noEmit по packages/*/src и apps/*/src
pnpm ci:check   # lint + typecheck + format одной командой
pnpm db:start   # локальный Supabase (нужен Docker + Supabase CLI)
pnpm db:reset   # пересоздать БД и применить миграции
pnpm db:types   # регенерировать типы БД в packages/database
```

Конфиги качества: `eslint.config.mjs` (flat config, typescript-eslint),
`.prettierrc.json` + `.prettierignore`, корневой `tsconfig.json` для typecheck.

## Команды-скиллы (.kimi-code/skills/)

- `/заключение` — отчёт об итогах сессии в `.docs/history/YYYY-MM-DD_printflow-summary.md`
  (шаблон в `zaklyuchenie-command.md`).
- `/формат` — полный цикл качества: format:fix → lint:fix → typecheck,
  ручной дочин до зелёного, сводка пользователю (`format-command.md`).

## Особенности окружения (Windows)

- Build-скрипты electron и esbuild одобрены через
  `onlyBuiltDependencies` в `pnpm-workspace.yaml` + `.npmrc`.
  Если pnpm ругается на `ERR_PNPM_IGNORED_BUILDS` —
  `pnpm approve-builds electron esbuild -y`.
- Поле `pnpm.*` в корневом package.json не читается pnpm 12 —
  настройки только в `pnpm-workspace.yaml` / `.npmrc`.
- Если standalone-shim pnpm падает с путём `.tools\pnpm\<версия>` —
  оборвалась его самодогрузка версии из поля `packageManager`.
  Лечение: удалить `%LOCALAPPDATA%\pnpm\.tools\pnpm\<версия>*`
  и запустить `pnpm --version` заново (скачает чисто).

## Изменения схемы БД

1. `supabase migration new <name>` — новая миграция, править существующие нельзя.
2. Обновить RLS-политики в той же миграции.
3. `pnpm db:types` — регенерировать типы.
4. Если меняются статусы/поля — синхронно обновить Zod-схемы в shared.

## Рабочий процесс

- Следующая невыполненная задача из `ROADMAP.md` — приоритет.
  Сейчас это Спринт 1.2 (локальный Supabase).
- После завершения спринта отметь его в `ROADMAP.md` (`[x]`) и обнови
  раздел «Текущее состояние» в этом файле.
- Один логический спринт = один коммит (или PR), осмысленное сообщение.
