# Архитектура apps/web — Feature-Sliced Design (FSD)

SPA на Vite + React 19 + TypeScript. Слои импортируют **только вниз**:

```
app → pages → widgets → features → entities → shared
```

| Слой        | Назначение                                            | Подробности                                      |
| ----------- | ----------------------------------------------------- | ------------------------------------------------ |
| `app/`      | Запуск: провайдеры, роутер, лейауты, глобальные стили | [src/app/README.md](src/app/README.md)           |
| `pages/`    | Страницы-маршруты, тонкая композиция                  | [src/pages/README.md](src/pages/README.md)       |
| `widgets/`  | Крупные блоки: сайдбар, канбан, таблицы               | [src/widgets/README.md](src/widgets/README.md)   |
| `features/` | Действия пользователя: смена статуса, списание        | [src/features/README.md](src/features/README.md) |
| `entities/` | Бизнес-сущности: order, material, printer, client     | [src/entities/README.md](src/entities/README.md) |
| `shared/`   | Инфраструктура: supabase-клиент, UI-кит, lib          | [src/shared/README.md](src/shared/README.md)     |

## Правила

- Каждый слайс экспортирует только через `index.ts` (public API).
  Импорт внутренностей `features/x/ui/Form` снаружи запрещён.
- Алиас `@/` = `src/` (vite.config.ts + tsconfig paths).
- Кросс-импорты внутри одного слоя запрещены (feature не импортирует feature).
- Доменные типы/схемы/формулы — в монорепо-пакете `@prient-flow/shared`,
  во фронтовом `shared/` только инфраструктура UI.
- Клиент Supabase — единственный экземпляр в `shared/api/supabase.ts`.

## Команды (в этой папке)

```bash
pnpm dev       # vite dev-сервер (порт 5173)
pnpm build     # продакшн-сборка в dist/
pnpm preview   # превью собранного
```
