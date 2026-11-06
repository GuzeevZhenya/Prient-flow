# Слой `pages` — страницы приложения

Одна папка = один маршрут. Страница — тонкая композиция виджетов и фич,
без бизнес-логики и запросов в обход entities/features.

Структура слайса: `pages/<name>/ui/<Name>Page.tsx` + `index.ts` (public API).

| Страница      | Маршрут      | Спринт             |
| ------------- | ------------ | ------------------ |
| `dashboard/`  | `/`          | 2.1                |
| `orders/`     | `/orders`    | 2.4 (канбан)       |
| `inventory/`  | `/inventory` | 2.3 (склад)        |
| `printers/`   | `/printers`  | Этап 6             |
| `clients/`    | `/clients`   | 2.4                |
| `settings/`   | `/settings`  | 2.1                |
| `calculator/` | `/calc`      | Этап 3 (публичная) |
| `not-found/`  | `*`          | —                  |

**Импортирует:** widgets, features, entities, shared.
