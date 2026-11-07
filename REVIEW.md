# Review

Загружать на код-ревью (или вместе с `arch-reviewer`).

## Чеклист

- [ ] Title PR — Conventional Commits
- [ ] `pnpm ci:check` зелёный; при правках packages — `pnpm test`
- [ ] Нет секретов в diff (`.env`, ключи, токены)
- [ ] FSD: импорты только вниз, public API через `index.ts`
- [ ] Бизнес-логика не утекла в `apps/*` — только `packages/shared`
- [ ] Внешние данные валидируются Zod из shared
- [ ] Статусы — константы shared, не литералы
- [ ] Запросы к БД с `workspace_id` / RLS
- [ ] Web env — только `VITE_*`
- [ ] Миграции: новые файлы, существующие не правились
- [ ] ROADMAP / AGENTS / FILE-MAP обновлены, если спринт закрыт

## Пропускать

- `pnpm-lock.yaml`
- сгенерированный `database.types.ts`
- `*.log`, кэш `.turbo`
