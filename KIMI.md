# KIMI.md — правила архитектуры Prient-flow

Системный контекст для ИИ-агентов, работающих с этим репозиторием.

## Что это

ERP для 3D-печатной мастерской и студии покраса: заказы, склад расходников
(филамент/смола/краски), парк принтеров, расчёт себестоимости, Telegram-бот
и десктоп-хаб для интеграции со слайсером и принтерами в локальной сети.

Монорепозиторий: Turborepo + pnpm workspaces. Node >= 20, pnpm 10
(версия закреплена в поле `packageManager` корневого package.json).

**Текущее состояние:** каркас (Спринт 1.1 ✅) + контур качества кода
(ESLint + Prettier + typecheck + vitest + скиллы команд). `apps/web` переведён на
Vite + React + FSD: слои, роутер, layout, страницы-заглушки, Redux store
с RTK Query (часть Спринта 2.1 🟡). `apps/desktop` и `apps/bot` — только
package.json и заглушка бота. Работает субагент `arch-reviewer` (read-only
проверка этих правил + сверка доков с кодом, см. раздел «Скиллы и субагенты»).
Разработка идёт строго по `ROADMAP.md`, этапы последовательно,
не перепрыгивай вперёд без явной команды.

## Карта репозитория

```
apps/
  web/        @prient-flow/web      Vite + React 19 + TS, Feature-Sliced Design
                                    (app/pages/widgets/features/entities/shared,
                                    см. apps/web/ARCHITECTURE.md), React Router 7,
                                    Tailwind, RTK Query, three/r3f/drei
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

## Правила FSD (apps/web)

- Слои импортируют только вниз: app → pages → widgets → features → entities → shared.
- Каждый слайс — public API через `index.ts`; импорт внутренностей слайда запрещён.
- Алиас `@/` = `apps/web/src/`.
- Кросс-импорты внутри слоя запрещены (feature не импортирует feature).
- Env для браузера — только с префиксом `VITE_` (см. `.env.example`).

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

## Правила работы агентов

- **Stop & Check**: перед тем как приступать к написанию кода по любой
  задаче пользователя, мысленно сверь план решения с правилами из этого
  файла. Если запрос пользователя прямо нарушает ограничения (например,
  использование `localStorage` или `any`), агент ОБЯЗАН сразу указать на
  это до написания кода, а не слепо выполнять задачу.
- **Plan Mode**: перед тем как давать задачу на изменения кода, сначала
  пиши план реализации: какие файлы затронешь и какие правила из этого
  файла здесь применяются. Жди подтверждения пользователя, код до
  подтверждения не писать.

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

## Скиллы и субагенты (.kimi-code/)

Скиллы команд (`skills/`):

- `/заключение` — отчёт об итогах сессии в `.docs/history/YYYY-MM-DD_printflow-summary.md`
  (шаблон в `zaklyuchenie-command.md`).
- `/формат` — полный цикл качества: format:fix → lint:fix → typecheck,
  ручной дочин до зелёного, сводка пользователю (`format-command.md`).

Субагенты (`agents/`):

- `arch-reviewer` — read-only архитектурный ревьюер. Проверяет код против
  этого KIMI.md (FSD-слои, границы пакетов, Zod, статусы из констант,
  `workspace_id`) и сверяет документацию с фактическим кодом. Код писать
  не умеет и не должен. Вызывается главным агентом по команде вида
  «прогони arch-reviewer по изменениям», отчёт: `severity — путь:строка — правило`.

## Особенности окружения (Windows)

- Версия pnpm закреплена в поле `packageManager` (`pnpm@10.32.1`) —
  standalone-shim подгружает именно её.
- Build-скрипты electron и esbuild одобрены через
  `only-built-dependencies` в `.npmrc`. Ключ `allowBuilds`
  в `pnpm-workspace.yaml` — синтаксис pnpm 11+, под закреплённый
  pnpm 10 игнорируется (оставлен про запас, настройки живут в `.npmrc`).
  Если pnpm ругается на `ERR_PNPM_IGNORED_BUILDS` —
  `pnpm approve-builds electron esbuild -y`.
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
