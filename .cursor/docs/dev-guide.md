# Dev guide

## Новый компьютер → сразу в работу

Полный чеклист: [`.docs/HANDOFF.md`](../../.docs/HANDOFF.md).

Кратко для Спринта 2.2 (без Docker):

```bash
git clone https://github.com/GuzeevZhenya/Prient-flow.git
cd Prient-flow
git checkout feature/cursor-agent-setup
pnpm install
```

В Cursor открой корень репо и дай агенту бриф `.docs/memory-sprint-2.2.md`.

## Setup (Windows) — полный стек

1. Node >= 20, Docker Desktop (Engine running), Supabase CLI.
2. `pnpm install` в корне (`packageManager`: `pnpm@10.32.1`).
3. Скопировать `.env.example` → `.env`; создать `apps/web/.env` с
   `VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY` (см. HANDOFF).
4. `pnpm db:start` → подставить ключи из `supabase status` в оба `.env`.
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
pnpm --filter @prient-flow/shared test
```

## Скиллы агента

- `/формат` — цикл автофикса качества
- `/заключение` — отчёт сессии + FILE-MAP
- «прогони arch-reviewer» — read-only архитектурный отчёт
- Superpowers: только `systematic-debugging`, `tdd-packages`,
  `verification-before-completion`, `receiving-code-review`,
  `dispatching-parallel-agents` (см. `superpowers-allowlist.mdc`)
