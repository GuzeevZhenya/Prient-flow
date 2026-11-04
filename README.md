# Prient-flow

ERP для 3D-печатной мастерской и студии покраса: заказы, склад расходников,
парк принтеров, расчёт себестоимости, Telegram-бот и десктоп-хаб для
интеграции со слайсером и принтерами в локальной сети.

## Стек

| Слой            | Технологии                                                                           |
| --------------- | ------------------------------------------------------------------------------------ |
| Монорепозиторий | Turborepo + pnpm workspaces                                                          |
| Бэкенд и БД     | Supabase (PostgreSQL, Auth, Storage, Realtime)                                       |
| Web             | Vite + React 19 + TypeScript (FSD), React Router, Tailwind CSS, shadcn/ui, RTK-Query |
| 3D              | Three.js + @react-three/fiber + @react-three/drei                                    |
| Desktop         | Electron + electron-vite + React, chokidar, mqtt                                     |
| Telegram-бот    | grammY + @grammyjs/conversations + Upstash Redis                                     |
| Контракты       | TypeScript + Zod (`packages/shared`)                                                 |

## Структура

```
apps/
  web/        # Vite + React + FSD: админка мастерской + публичный калькулятор
  desktop/    # Electron: парсер G-code, мост к принтерам в LAN
  bot/        # grammY: уведомления клиентам + пульт мастера
packages/
  database/   # Supabase-клиенты и автогенерированные типы БД
  shared/     # Zod-схемы, формулы себестоимости, константы
  gcode-parser/ # Метаданные из .gcode и .3mf
supabase/
  migrations/ # SQL-миграции и RLS-политики
```

Архитектура фронтенда (Feature-Sliced Design) — [apps/web/ARCHITECTURE.md](apps/web/ARCHITECTURE.md).

## Быстрый старт

```bash
pnpm install          # установка зависимостей
pnpm dev              # запуск всех приложений (turbo)
pnpm db:start         # локальный Supabase (нужен Docker)
pnpm db:types         # генерация TS-типов из схемы БД
```

План разработки по спринтам — в [ROADMAP.md](ROADMAP.md).
Правила архитектуры для ИИ-агентов — в [CLAUDE.md](CLAUDE.md).
