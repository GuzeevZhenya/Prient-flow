# HANDOFF — перенос на другой компьютер

Чеклист, чтобы открыть Cursor в этом репо и сразу идти в **Спринт 2.2**.

## 1. Клон и ветка

```bash
git clone https://github.com/GuzeevZhenya/Prient-flow.git
cd Prient-flow
git fetch origin
git checkout feature/cursor-agent-setup
```

На этой ветке: код Lesson-4 (спринты 1.x–2.1) + Cursor-контур (`AGENTS.md`,
`.cursor/`, бриф 2.2). Не начинай спринт с голого `main` — там только каркас.

Альтернатива пути клона (как удобно): `F:\cursor-projects\print-flow` или
любой другой каталог. Путь в доках не важен — важен корень репо в Cursor.

## 2. Софт на машине

| Нужно сейчас (2.2)                                       | Зачем                                 |
| -------------------------------------------------------- | ------------------------------------- |
| Node.js ≥ 20                                             | runtime                               |
| pnpm (подтянется через `packageManager`: `pnpm@10.32.1`) | install / test                        |
| Cursor                                                   | агент читает `AGENTS.md` и `.cursor/` |

| Можно позже                      | Зачем                            |
| -------------------------------- | -------------------------------- |
| Docker Desktop + Supabase CLI    | `pnpm db:start`, smoke, web Auth |
| Аккаунт GitHub + `gh auth login` | PR из CLI                        |

Спринт 2.2 — чистая математика в `packages/shared`: Docker **не обязателен**.

## 3. Установка

```bash
pnpm install
pnpm --filter @prient-flow/shared test   # сейчас зелёный (enum-тесты)
```

Env для 2.2 не нужен. Когда понадобится web/БД:

```powershell
Copy-Item .env.example .env
# Vite читает env из apps/web — создай apps/web/.env вручную:
@"
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<publishable из supabase status>
"@ | Set-Content apps\web\.env
# в корневой .env также SUPABASE_SERVICE_ROLE_KEY=<secret>
```

## 4. Открыть в Cursor

1. File → Open Folder → корень клона (`Prient-flow`).
2. Новый чат Agent.
3. Первое сообщение (можно копировать):

```
Читай AGENTS.md и .docs/memory-sprint-2.2.md.
Делай Спринт 2.2 по брифу: calculateCost/calculatePrice + Zod + vitest
только в packages/shared. Без UI и без миграций.
```

Агент подхватит rules из `.cursor/rules/` (в т.ч. allowlist Superpowers),
скиллы `/формат` и `/заключение`, субагента `arch-reviewer`.

## 5. Что читать (порядок)

1. `.docs/HANDOFF.md` — этот файл
2. `.docs/memory-sprint-2.2.md` — бриф спринта (формулы, DoD, скоуп)
3. `AGENTS.md` — инварианты
4. `ROADMAP.md` — чекбоксы 2.2
5. При необходимости: `.docs/PROJECT-MEMORY.md`, `.cursor/docs/dev-guide.md`

## 6. Definition of Done спринта (кратко)

- `pricingInputSchema` + `calculateCost` / `calculatePrice`
- тесты FDM/SLA, нулевой вес, маржа
- `pnpm --filter @prient-flow/shared test` и `pnpm ci:check` зелёные
- ROADMAP 2.2 `[x]`, обновить снимок в PROJECT-MEMORY / «Текущее состояние» в AGENTS

## 7. Если pnpm сломался (Windows)

```powershell
Remove-Item -Recurse -Force "$env:LOCALAPPDATA\pnpm\.tools\pnpm\10.32.1*" -ErrorAction SilentlyContinue
pnpm --version
pnpm approve-builds electron esbuild -y   # если ERR_PNPM_IGNORED_BUILDS
```

## 8. Не тащить с старого ПК

- `.env`, `apps/web/.env` — секреты, не в git
- `node_modules/`, `.turbo/` — ставятся заново
- локальный путь `D:\Kimi\...` / `F:\cursor-projects\...` — не коммитить как обязательный
