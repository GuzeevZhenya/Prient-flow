# PROJECT-MEMORY — память проекта Prient-flow

> Сжатый контекст для быстрого входа в проект (новый чат, новый агент, новый участник).
> Обновляется по мере развития. Последняя синхронизация: 2026-11-05.

## Что это

ERP для 3D-печатной мастерской и студии покраса: заказы (канбан), склад
расходников (филамент/смола/краски/грунт), парк принтеров, расчёт
себестоимости и цены, Telegram-бот (пульт мастера + трекер клиента),
десктоп-хаб (перехват файлов слайсера, мост к принтерам в LAN).
Заложена мультитенантность (`workspaces`) — путь к SaaS.

Репозиторий: https://github.com/GuzeevZhenya/Prient-flow
Локальный путь: `D:\Kimi\Prient-flow`. Активная ветка: **Lesson-1**.

## Ключевые архитектурные решения (приняты в чате)

1. **Монорепо**: Turborepo + pnpm workspaces (`apps/*`, `packages/*`).
2. **Web — SPA, НЕ Next.js**: Vite + React 19 + TS, React Router 7,
   архитектура **Feature-Sliced Design** (app/pages/widgets/features/entities/shared,
   правила в `apps/web/ARCHITECTURE.md`, README в каждом слое).
   Референс FSD — проект стажировки Ict.
3. **Бэкенд = Supabase** без отдельного API-сервиса: PostgreSQL, Auth,
   Storage, Realtime. Все приложения ходят через `packages/database`.
4. **Бизнес-логика только в `packages/shared`**: формулы цены, Zod-схемы,
   константы статусов. Apps — тонкие слои.
5. **Контур качества**: ESLint (flat) + Prettier + `tsc --noEmit` в корне;
   единая команда `pnpm ci:check` (lint + typecheck + format).

## Окружение (Windows) — важные грабли

- **pnpm**: системный shim (`%LOCALAPPDATA%\pnpm`) умеет скачивать версии,
  но скачивание 12.16.1 оборвалось → проекты падают. Решение: во всех
  проектах `packageManager: "pnpm@10.32.1"` (уже в кэше shim'а).
  Если сломается снова: удалить `%LOCALAPPDATA%\pnpm\.tools\pnpm\<версия>*`.
- `ERR_PNPM_IGNORED_BUILDS` → `pnpm approve-builds electron esbuild -y`
  (записано в `pnpm-workspace.yaml` + `.npmrc`).
- Поле `pnpm.*` в корневом package.json pnpm не читает — настройки только
  в `pnpm-workspace.yaml` / `.npmrc`.
- Lockfile pnpm 10 пересоздан под свой формат (v9.0).
- Peer-варнинг `react-composer` (drei) vs React 19 — известный, безвредный.

## Рабочий процесс

- Разработка строго по `ROADMAP.md` (6 этапов → 22 спринта), последовательно.
- Команды-скиллы в `.kimi-code/skills/`:
  - `/формат` — полный цикл: format:fix → lint:fix → typecheck, дочинка до зелёного.
  - `/заключение` — отчёт сессии `.docs/history/YYYY-MM-DD_printflow-summary.md`;
    перед отчётом обновляет `FILE-MAP.md`, если менялись файлы/папки.
- `FILE-MAP.md` — карта всех файлов/папок (что за что отвечает).
- `CLAUDE.md` — правила архитектуры для ИИ-агентов.
- После каждого логического шага: `pnpm ci:check` → коммит → пуш в `Lesson-1`.

## Текущий статус (снимок 2026-11-05)

✅ Сделано:

- Спринт 1.1 — каркас монорепо, зависимости, git.
- Контур качества + скиллы `/формат`, `/заключение`.
- `apps/web` на Vite + React + FSD: роутер, layout (Sidebar/Header),
  8 страниц-заглушек, shared/api supabase-клиент, алиас `@/`.
  Сборка и ci:check зелёные (часть Спринта 2.1 🟡).

⬜ Следующее по ROADMAP:

- **Спринт 1.2** — Supabase CLI + локальный стек (нужен Docker).
- Остаток 2.1 — UI-кит в `shared/ui`, Supabase Auth, защищённые роуты.
- Далее 1.3–1.5: SQL-миграция (8 таблиц), RLS, генерация типов.

## Открытые вопросы / техдолг

- Docker ещё не проверен — блокер Спринта 1.2.
- `packages/database/src/database.types.ts` — заглушка до первого запуска Supabase.
- `apps/desktop` и `apps/bot` — только манифесты + заглушка бота (Этапы 4–5).
