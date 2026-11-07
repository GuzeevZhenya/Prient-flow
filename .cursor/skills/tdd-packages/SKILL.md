---
name: tdd-packages
description: >-
  TDD for packages/shared, packages/gcode-parser and package-level bugfixes.
  Use when adding Zod schemas, pricing, parsers, or fixing a failing test in
  packages/*. Not for apps/web UI (browser + ci:check) or generated types.
---

# TDD только для packages/*

Red → green → refactor. Сначала падающий тест, потом минимальный код.

## Когда применять

**Да:** новый код и баги в `packages/shared`, `packages/gcode-parser`;
чистые функции и Zod-схемы; регресс после бага в пакете.

**Нет:** `apps/web` UI (проверка — браузер + `pnpm ci:check`);
конфиги; миграции SQL; сгенерированный `database.types.ts`.

Не подключай скилл `test-driven-development` из плагина Superpowers —
там обязательный TDD на весь код, включая UI, и коммит на каждый шаг.
Здесь один спринт = один коммит, и только по просьбе пользователя.

## Цикл

1. **RED** — один тест на одно поведение, имя описывает ожидание.
2. **Проверь RED** — тест падает из-за отсутствия фичи, не из-за опечатки.
3. **GREEN** — минимальный код, чтобы тест прошёл. Без лишних опций.
4. **Проверь GREEN** — этот тест и остальные зелёные.
5. **REFACTOR** — имена и дубли, поведение не менять.

Команды:

```bash
pnpm --filter @prient-flow/shared test
pnpm --filter @prient-flow/gcode-parser test
pnpm test   # если трогали несколько пакетов
```

## Баг

Сначала тест, который воспроизводит баг и падает. Потом фикс.
Не чини packages/* без красного теста.

## UI

Формы, таблицы, RTK Query в `apps/web` — не TDD. Контракт (Zod) в shared
пишется тестом первым; экран проверяется в браузере.
