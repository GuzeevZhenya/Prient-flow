# Память: Спринт 3.1 — рендер STL/OBJ

> Рабочий бриф. Составлено 2026-11-07 после закрытия Спринта 2.4 (канбан).
> Источники: `ROADMAP.md` (3.1), `AGENTS.md`, заглушка `pages/calculator`,
> three / @react-three/fiber / @react-three/drei уже в `apps/web/package.json`.

## Где мы

- Этапы 1–2 ✅ (включая склад и канбан).
- **Сейчас:** 3.1 — просмотр модели в браузере, без аналитики объёма (это 3.2).
- Ветка: от `feature/orders-kanban` (или `feature/model-viewer`).

## Что уже есть

| Путь                                               | Состояние                              |
| -------------------------------------------------- | -------------------------------------- |
| `three`, `@react-three/fiber`, `@react-three/drei` | зависимости web стоят (Спринт 2.1)     |
| `pages/calculator`                                 | заглушка публичного калькулятора       |
| `order_items.stl_file_path`                        | колонка есть; загрузка в Storage — 3.2 |
| канбан / склад                                     | не трогать                             |

## Задачи спринта (DoD)

1. Виджет `widgets/model-viewer`: `<ModelViewer />` с orbit-controls, сеткой, светом.
2. Drag-and-drop `.stl` / `.obj` в браузер (File API), без отправки на сервер.
3. STLLoader / OBJLoader, нормализация модели в кадр (fit camera to bounding box).
4. Страница, где это видно: калькулятор или модалка у позиции заказа — одно место, тонкий слой.
5. `pnpm ci:check` + `pnpm --filter @prient-flow/web build`. Браузер: drop файла → модель крутится.
6. ROADMAP 3.1 → `[x]`; AGENTS / PROJECT-MEMORY; бриф 3.2.

## Грабли

- Не считать объём/вес (3.2). Не upload в Storage (3.2).
- `drei` peer-варнинг на React 19 — известный, не даунгрейдить React.
- Загрузчики three.js: динамический import, чтобы не раздувать initial bundle сильнее необходимого.
- FSD: вьюер в widgets, drop-зона может быть feature `model-drop`.

## Команды

```bash
pnpm --filter @prient-flow/web build
pnpm ci:check
```
