# Слой `widgets` — крупные самостоятельные блоки

Собирают entities и features в законченные блоки интерфейса:
канбан-доска, таблица склада, карточка принтера с телеметрией, сайдбар, шапка.

Структура слайса: `widgets/<name>/ui/<Name>.tsx` + `index.ts` (public API).

Текущие: `sidebar/`, `header/`.
Планируются: `kanban-board/` (2.4), `inventory-table/` (2.3), `printer-status-card/` (Этап 6), `model-viewer/` (Этап 3).

**Импортирует:** features, entities, shared.
