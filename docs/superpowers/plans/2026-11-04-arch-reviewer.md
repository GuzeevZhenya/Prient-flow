# arch-reviewer Agent Implementation Plan

> **Актуально с 2026-11-07:** агент живёт в `.cursor/agents/arch-reviewer.md`,
> источник правил — `AGENTS.md` (не CLAUDE.md / KIMI.md / `.kimi-code/`).
> Ниже — исторический план реализации от 2026-11-04.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Создать read-only кастомного субагента `arch-reviewer`, который проверяет код Prient-flow против правил CLAUDE.md и сверяет документацию с фактическим кодом.

**Architecture:** Один Markdown-файл агента с YAML-frontmatter по формату кастомных агентов Kimi Code, в проектной области `.kimi-code/agents/`. Код не пишется, зависимости не добавляются — только конфигурация агента и её регистрация в FILE-MAP.md.

**Tech Stack:** Kimi Code custom agents (frontmatter + system prompt), Prettier (проверка форматирования).

**Spec:** Дизайн, утверждённый в диалоге 2026-11-04 (короткий дизайн «arch-reviewer — архитектурный ревьюер Prient-flow»): read-only ревьюер правил FSD/границ пакетов/Zod/workspace_id/VITE_ + сверка CLAUDE.md, FILE-MAP, README, ROADMAP с кодом; расположение — `.kimi-code/agents/arch-reviewer.md`; без вложенного делегирования.

## Global Constraints

- Формат файла агента Kimi Code: frontmatter с полями `name` (kebab-case), `description` (обязательно), `whenToUse`, `tools`, `subagents`; тело — системный промпт.
- Read-only на уровне инструментов: только `Read`, `Grep`, `Glob`. Без `Bash`, `Edit`, `Write`. `subagents: []` — вложенное делегирование запрещено.
- Язык агента и отчёта — русский (язык документации проекта).
- Файл обязан проходить `pnpm format` (Prettier проверяет `.md`, `.kimi-code/` не исключён).
- Никаких коммитов без явной команды пользователя.

## Review Focus

- Синтаксис frontmatter: неверная форма `tools`/`subagents` молча меняет поведение (пустой список отключает, `*` разрешает всё) — проверить после записи глазами.
- Тело обязано содержать инструкцию «финальное сообщение = самодостаточный отчёт»: у кастомных агентов нет встроенного правила передачи результата вызвавшему (в отличие от built-in типов).
- Агент обязан читать актуальный `CLAUDE.md` перед каждой проверкой (источник истины), а не полагаться на зашитые в промпт правила — иначе рассинхрон с документацией.

---

### Task 1: Создать файл агента

**Files:**

- Create: `.kimi-code/agents/arch-reviewer.md`

**Interfaces:**

- Consumes: ничего (самодостаточный агент).
- Produces: обнаруживаемый субагент `arch-reviewer` (project scope) — описание доступно главному агенту для делегирования.

- [ ] **Step 1: Написать frontmatter**

Поля и значения (ровно так):

- `name: arch-reviewer`
- `description:` — одна строка: read-only ревьюер архитектуры Prient-flow; проверяет FSD-слои, границы пакетов, Zod, мультитенантность, сверяет доки с кодом; возвращает находки с путями и строками.
- `whenToUse:` — перед коммитом, после спринта, по команде «прогони arch-reviewer».
- `tools: [Read, Grep, Glob]`
- `subagents: []`

- [ ] **Step 2: Написать тело промпта**

Секции в порядке: роль → «перед проверкой прочитай CLAUDE.md из корня проекта, он — источник истины» → чек-лист правил (FSD-направление импортов app→pages→widgets→features→entities→shared; public API слайсов через `index.ts`; запрет кросс-импортов внутри слоя; бизнес-логика только в `packages/shared`; внешние данные валидируются Zod из shared; статусы только из констант shared; каждый запрос к БД ограничен `workspace_id`; браузерный env только `VITE_*`; сверка CLAUDE.md/FILE-MAP/README/ROADMAP с фактической структурой кода) → жёсткий запрет что-либо менять → формат результата: финальное сообщение = полный отчёт; находки как `severity (blocker|warning) — путь:строка — нарушенное правило`; если чисто — явно «нарушений не найдено» + перечень проверенного.

- [ ] **Step 3: Проверить форматирование**

Run: `pnpm exec prettier --check .kimi-code/agents/arch-reviewer.md`
Expected: `All matched files use Prettier code style!`

- [ ] **Step 4: Сверить чек-лист тела с дизайном**

Глазами: 8 пунктов чек-листа из Step 2 на месте, формат отчёта описан, запрет правок присутствует, инструкция «прочитай CLAUDE.md» первая.

### Task 2: Зарегистрировать файл в FILE-MAP.md

**Files:**

- Modify: `FILE-MAP.md`

**Interfaces:**

- Consumes: путь `.kimi-code/agents/arch-reviewer.md` из Task 1.
- Produces: актуальная карта репозитория (правило проекта: FILE-MAP обновляется при добавлении файлов).

- [ ] **Step 1: Добавить строку в таблицу «Корень»**

Рядом со строкой `.kimi-code/skills/` добавить: `| `.kimi-code/agents/` | Субагент arch-reviewer — архитектурный ревьюер по правилам CLAUDE.md (read-only) |`.

- [ ] **Step 2: Обновить метаданные карты**

«Последняя синхронизация: 2026-11-03» → `2026-11-04`; в «Историю изменений карты» добавить строку `- 2026-11-04 — добавлен субагент arch-reviewer (.kimi-code/agents/).`.

- [ ] **Step 3: Проверить форматирование и общий цикл**

Run: `pnpm format && pnpm lint && pnpm typecheck`
Expected: все три зелёные (изменения только в `.md`, типы не затронуты).
