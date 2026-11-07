# Architecture

Открывать по ссылке из AGENTS.md, не дублировать always-on.

## Слои

| Слой                    | Роль                              |
| ----------------------- | --------------------------------- |
| `apps/web`              | Vite SPA, FSD, RTK Query, Auth UI |
| `apps/desktop`          | Electron-хаб (Этап 5)             |
| `apps/bot`              | Telegram grammY (Этап 4)          |
| `packages/shared`       | Zod, pricing, константы           |
| `packages/database`     | Supabase-клиенты + типы           |
| `packages/gcode-parser` | Парсинг .gcode/.3mf               |
| `supabase/migrations`   | Схема + RLS                       |

## Паттерны

- Бэкенд = Supabase (без отдельного Nest/API-сервиса).
- Web — SPA, не Next.js; SSR-фабрика database не нужна.
- Серверный стейт web — RTK Query (`baseApi.injectEndpoints`), не TanStack Query.
- Публичный трекинг заказа — заголовок `X-Tracking-Token` (см. RLS).

## Как добавить фичу web

1. Сущность/эндпоинт в `entities/` или `features/` через RTK Query.
2. UI в `features/` / `widgets/`, страница в `pages/`.
3. Контракты и формулы — в `packages/shared`.
4. Экспорт только через `index.ts` слайса.
5. `pnpm ci:check` (+ `pnpm test` если трогали packages).
