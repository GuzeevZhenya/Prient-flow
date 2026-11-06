# PROJECT-MEMORY — память проекта Prient-flow

> Сжатый контекст для быстрого входа в проект (новый чат, новый агент, новый участник).
> Обновляется по мере развития. Последняя синхронизация: 2026-11-07 (ветка feature/cursor-agent-setup).

## Что это

ERP для 3D-печатной мастерской и студии покраса: заказы (канбан), склад
расходников (филамент/смола/краски/грунт), парк принтеров, расчёт
себестоимости и цены, Telegram-бот (пульт мастера + трекер клиента),
десктоп-хаб (перехват файлов слайсера, мост к принтерам в LAN).
Заложена мультитенантность (`workspaces`) — путь к SaaS.

Репозиторий: https://github.com/GuzeevZhenya/Prient-flow
Локальный путь агента: `F:\cursor-projects\print-flow`. База урока: **Lesson-4**.

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

- `AGENTS.md` (бывшие CLAUDE.md → KIMI.md) — главный файл правил для Cursor.
- `.cursor/rules/` — `typescript-strict`, `data-and-state`, `definition-of-done`,
  `github-flow`, `frontend-fsd`, `package-boundaries`.
- `.cursor/skills/` — `/формат`, `/заключение`.
- `.cursor/agents/arch-reviewer.md` — read-only архитектурный ревьюер.
- `.cursor/docs/` — architecture / database / dev-guide.
- `REVIEW.md` — чеклист PR. `FILE-MAP.md` — карта файлов. `ROADMAP.md` — спринты.

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
- После каждого шага: `pnpm ci:check` → коммит (по просьбе) → пуш.
- Перед правками сверяться с git (`git log`, `git status`); уроки — ветки Lesson-N.

## Текущий статус (снимок 2026-11-06, Lesson-4)

✅ Сделано:

- Спринт 1.1 — каркас монорепо, зависимости, git.
- Контур качества + скиллы + субагент arch-reviewer + .cursor/rules.
- `apps/web` на Vite + React + FSD: роутер, layout, страницы-заглушки,
  Redux store с RTK Query (часть Спринта 2.1 🟡).
- Спринт 1.2 — локальный Supabase (Docker): Studio `:54323`, API `:54321`.
- Спринт 1.3 — миграция `init_schema`: 8 таблиц, CHECK'и = enum'ы shared,
  индексы на все FK и `workspace_id`.
- Спринт 1.4 — RLS на всех таблицах: изоляция по `owner_id`, публичное
  чтение заказа по заголовку `X-Tracking-Token` (роль anon).
- Спринт 1.5 — `database.types.ts` сгенерирован, корневой `.env`,
  фабрика `createServiceRoleClient`, смоук-скрипт читает все 8 таблиц
  (`pnpm --filter @prient-flow/database smoke`).
- Спринт 2.1 — каркас SPA завершён: UI-кит в `shared/ui` (Button, Input,
  Label, Select, Modal на `<dialog>`, Card, Badge, Spinner), Supabase Auth
  (email/password) — `entities/session` (Redux-слайс) + `SessionProvider`,
  `features/auth` (LoginForm/LogoutButton), `pages/login`, защита роутов
  `app/routes/RequireAuth`; страница настроек workspace — тарифы в
  `workspaces.settings` (jsonb), схема `workspaceSettingsSchema` в shared,
  фича `features/workspace-settings`. Env для Vite — `apps/web/.env`
  (не коммитится, см. `.env.example`).

⬜ Следующее по ROADMAP:

- Спринт 2.2 — математическое ядро `calculateCost()/calculatePrice()`.

## Открытые вопросы / техдолг

- Трекинг-токен: выбран заголовок `X-Tracking-Token`; если прокси будет
  резать заголовок — вернуться к RPC-обёртке.
- pgTAP-автотесты RLS не заведены (проверка 1.4 — ручной REST-сценарий).
- OAuth-провайдеры для Auth (Google/GitHub) — в бэклоге: локально не
  проверить без ключей провайдера; сейчас только email/password.
- `apps/desktop` и `apps/bot` — манифесты + заглушка бота (Этапы 4–5).

## История снимков

- 2026-11-05 — первичная память; синхронизация с Lesson-3
  (RTK Query, KIMI.md, .cursor/rules, arch-reviewer).
- 2026-11-06 — Lesson-4: спринты 1.3–1.5 (схема БД, RLS, типы и клиенты).
- 2026-11-06 — Lesson-4: спринт 2.1 (UI-кит, Supabase Auth + RequireAuth,
  настройки workspace).
- 2026-11-07 — миграция агентского контура Kimi → Cursor (`AGENTS.md`,
  `.cursor/skills|agents|docs`, REVIEW.md).
