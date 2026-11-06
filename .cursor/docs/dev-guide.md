# Dev guide

## Setup (Windows)

1. Node >= 20, Docker Desktop (Engine running), Supabase CLI.
2. `pnpm install` в корне (packageManager `pnpm@10.32.1`).
3. Скопировать `.env.example` → `.env` вручную.
4. `pnpm db:start` → ключи из `supabase status` в `.env` и `apps/web/.env`
   (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
5. `pnpm dev` — web на `:5173`.

## Грабли pnpm

- Сломанный shim: удалить `%LOCALAPPDATA%\pnpm\.tools\pnpm\<версия>*`,
  затем `pnpm --version`.
- `ERR_PNPM_IGNORED_BUILDS` → `pnpm approve-builds electron esbuild -y`.

## Качество

```bash
pnpm ci:check   # lint + typecheck + format
pnpm test
pnpm --filter @prient-flow/web build   # вместо корневого build (desktop-заглушка)
```

## Скиллы агента

- `/формат` — цикл автофикса качества
- `/заключение` — отчёт сессии + FILE-MAP
- «прогони arch-reviewer» — read-only архитектурный отчёт
