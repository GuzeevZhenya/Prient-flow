# PROJECT-MEMORY — память проекта Prient-flow

> Сжатый контекст для быстрого входа в проект (новый чат, новый агент, новый участник).
> Обновляется по мере развития. Последняя синхронизация: 2026-11-05 (ветка Lesson-3).

## Что это

ERP для 3D-печатной мастерской и студии покраса: заказы (канбан), склад
расходников (филамент/смола/краски/грунт), парк принтеров, расчёт
себестоимости и цены, Telegram-бот (пульт мастера + трекер клиента),
десктоп-хаб (перехват файлов слайсера, мост к принтерам в LAN).
Заложена мультитенантность (`workspaces`) — путь к SaaS.

Репозиторий: https://github.com/GuzeevZhenya/Prient-flow
Локальный путь: `D:\Kimi\Prient-flow`. Активная ветка: **Lesson-3**.

## Ключевые архитектурные решения (приняты в чатах)

1. **Монорепо**: Turborepo + pnpm workspaces (`apps/*`, `packages/*`).
2. **Web — SPA, НЕ Next.js**: Vite + React 19 + TS, React Router 7,
   архитектура **Feature-Sliced Design** (app/pages/widgets/features/entities/shared,
   правила в `apps/web/ARCHITECTURE.md`, README в каждом слое).
   Референс FSD — проект стажировки Ict.
3. **Дата-слой web — RTK Query** (Redux Toolkit + react-redux).
   TanStack Query был на старте — выпилен, не возвращать.
4. **Бэкенд = Supabase** без отдельного API-сервиса: PostgreSQL, Auth,
   Storage, Realtime. Все приложения ходят через `packages/database`.
5. **Бизнес-логика только в `packages/shared`**: формулы цены, Zod-схемы,
   константы статусов. Apps — тонкие слои.
6. **Контур качества**: ESLint (flat) + Prettier + `tsc --noEmit` + vitest
   в корне; единая команда `pnpm ci:check`.

## Правила и регламенты (источники правды)

- `KIMI.md` (бывший CLAUDE.md) — главный файл правил архитектуры для ИИ-агентов.
- `.cursor/rules/` — строгие регламенты: `typescript-strict.mdc`,
  `data-and-state.mdc`, `definition-of-done.mdc`.
- `.kimi-code/skills/` — команды: `/формат` (цикл качества),
  `/заключение` (отчёт сессии в `.docs/history/` + обновление FILE-MAP.md).
- `.kimi-code/agents/arch-reviewer.md` — read-only субагент: проверка
  соблюдения правил и сверка доков с кодом.
- `FILE-MAP.md` — карта файлов/папок. `ROADMAP.md` — план спринтов.

## Окружение (Windows) — важные грабли

- **pnpm**: системный shim (`%LOCALAPPDATA%\pnpm`) не смог докачать 12.16.1 →
  во всех проектах закреплено `packageManager: "pnpm@10.32.1"` (в кэше shim'а).
  Рецидив: удалить `%LOCALAPPDATA%\pnpm\.tools\pnpm\<версия>*`.
- `ERR_PNPM_IGNORED_BUILDS` → `pnpm approve-builds electron esbuild -y`.
- Настройки pnpm — только в `pnpm-workspace.yaml` / `.npmrc`
  (поле `pnpm.*` в package.json игнорируется).
- Peer-варнинг `react-composer` (drei) vs React 19 — известный, безвредный.

## Рабочий процесс

- Разработка строго по `ROADMAP.md` (6 этапов → 22 спринта), последовательно.
- После каждого шага: `pnpm ci:check` → коммит → пуш в текущую ветку.
- Работа идёт из нескольких чатов — перед правками сверяться с git
  (`git log`, `git status`), ветки меняются по урокам (Lesson-N).

## Текущий статус (снимок 2026-11-05, Lesson-3)

✅ Сделано:

- Спринт 1.1 — каркас монорепо, зависимости, git.
- Контур качества + скиллы + субагент arch-reviewer + .cursor/rules.
- `apps/web` на Vite + React + FSD: роутер, layout, страницы-заглушки,
  Redux store с RTK Query (часть Спринта 2.1 🟡).

⬜ Следующее по ROADMAP:

- **Спринт 1.2** — Supabase CLI + локальный стек (нужен Docker).
- Остаток 2.1 — UI-кит в `shared/ui`, Supabase Auth, защищённые роуты.
- Далее 1.3–1.5: SQL-миграция (8 таблиц), RLS, генерация типов.

## Открытые вопросы / техдолг

- Docker ещё не проверен — блокер Спринта 1.2.
- `packages/database/src/database.types.ts` — заглушка до запуска Supabase.
- `apps/desktop` и `apps/bot` — манифесты + заглушка бота (Этапы 4–5).

## История снимков

- 2026-11-05 — первичная память; синхронизация с Lesson-3
  (RTK Query, KIMI.md, .cursor/rules, arch-reviewer).
