# Слой `features` — бизнес-действия пользователя

Каждая фича = одно действие, приносящее ценность: кнопка, форма, диалог.
Например:

- `features/order/change-status/` — смена статуса заказа (drag-and-drop канбана)
- `features/material/adjust-stock/` — списание/пополнение остатка
- `features/order/upload-stl/` — загрузка модели с 3D-превью (Этап 3)
- `features/printer/send-command/` — пауза/стоп принтера (Этап 6)

Структура: `features/<domain>/<action>/{ui,model,api}/index.ts` + `index.ts`.

**Импортирует:** entities, shared. **Не импортирует:** другие фичи, widgets, pages.
