---
name: format
description: Команда /формат — Prettier, ESLint и typecheck с автофиксом до зелёного. Use when user says /формат, format check, or asks to fix lint/format/types.
---

# Команда: /формат (Prient-flow)

В корне монорепозитория выполни полный цикл качества:

## Шаг 1 — Prettier

```bash
pnpm format:fix
```

## Шаг 2 — ESLint

```bash
pnpm lint:fix
```

## Шаг 3 — TypeScript

```bash
pnpm typecheck
```

Ошибки типов автофиксом не лечатся — правь код руками.

## Шаг 4 — Отчёт

- ✅/❌ Prettier — сколько файлов переформатировано
- ✅/❌ ESLint — оставшиеся проблемы (`файл:строка — причина`)
- ✅/❌ TypeScript — список ошибок типов
- Вердикт: готов ли код к коммиту

## Правила

- Порядок строго: format → lint → typecheck.
- Красное после автофикса — чини и повторяй цикл до зелёного.
- Не коммить без явной просьбы пользователя.
- Эквивалент без фикса: `pnpm ci:check`.
