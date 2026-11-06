# 🗺️ ROADMAP — Prient-flow (PrintFlow ERP)

Дорожная карта разработки. Задачи выполняются **строго последовательно**,
этап за этапом. Каждый этап разбит на подзадачи (спринты по 1–2 вечера).
Отмечай выполненное: `[x]`.

**Легенда статусов:** ⬜ не начато · 🟡 в работе · ✅ готово

---

## Этап 1 — Каркас и база (Foundation) ⬜

### Спринт 1.1 — Инициализация монорепозитория ✅

- [x] Создать структуру `apps/` и `packages/` по blueprint
- [x] Настроить Turborepo (`turbo.json`) и pnpm workspaces
- [x] Базовый `tsconfig.base.json`, `.gitignore`, `.env.example`
- [x] Установить все зависимости (`pnpm install`)
- [x] Инициализировать git, первый коммит, push на GitHub

### Спринт 1.2 — Локальный Supabase

- [x] Установить Supabase CLI (`pnpm add -g supabase` или scoop)
- [x] `supabase init` → проверить `supabase/config.toml`
- [x] `pnpm db:start` — поднять локальный стек (Docker)
- [x] Проверить доступ к Studio (http://localhost:54323)

### Спринт 1.3 — SQL-миграция: схема БД ✅

- [x] `supabase migration new init_schema`
- [x] Таблица `workspaces` (id, name, slug, owner_id, settings jsonb)
- [x] Таблица `clients` (workspace_id, name, phone, telegram_username, telegram_chat_id)
- [x] Таблица `materials` (type, brand, name, color_hex, initial_amount, remaining_amount, cost_per_unit, low_stock_threshold)
- [x] Таблица `printers` (name, technology, connection_type, local_ip, access_code, power_watts, depreciation_per_hour, status) — enum: connection_type = bambu_mqtt | moonraker | octoprint | manual; status = idle | printing | paused | error | offline (источник значений — `packages/shared`)
- [x] Таблица `orders` (client_id, order_number, status, total_price, calculated_cost, is_paid, public_tracking_token)
- [x] Таблица `order_items` (order_id, name, quantity, technology, stl/gcode/thumbnail paths, material_id, estimated_weight_g, estimated_time_sec, post_processing_mins)
- [x] Таблица `print_jobs` (order_item_id, printer_id, started_at, finished_at, status, actual_weight_used_g, failure_reason) — enum status = queued | printing | success | failed (источник значений — `packages/shared`)
- [x] Таблица `inventory_logs` (material_id, print_job_id, delta_amount, reason) — enum reason = print_success | print_fail | manual_adjustment | restock (источник значений — `packages/shared`)
- [x] Индексы по всем FK и `workspace_id`

### Спринт 1.4 — RLS-политики и мультитенантность ✅

- [x] Включить RLS на всех таблицах
- [x] Политики: пользователь видит только свои `workspaces` и связанные данные
- [x] Политика публичного чтения заказа по `public_tracking_token` (для трекинг-страницы)
- [x] Тесты политик через `supabase test db` (pgTAP) или ручная проверка

### Спринт 1.5 — Генерация типов и пакет database ✅

- [x] `pnpm db:types` → `packages/database/src/database.types.ts`
- [x] Фабрики клиентов: browser-клиент, service-role (SSR-фабрика осознанно не нужна — Vite SPA, не Next.js)
- [x] `.env` на основе `.env.example`, подключение к локальному Supabase
- [x] Проверка: тестовый скрипт читает список таблиц (`pnpm --filter @prient-flow/database smoke`)

---

## Этап 2 — Склад и калькулятор (apps/web + packages/shared) ⬜

### Спринт 2.1 — Каркас SPA (Vite + React + FSD) ✅

- [x] Vite + React 19 + TS в `apps/web`, React Router, алиас `@/`
- [x] FSD-структура слоёв (app/pages/widgets/features/entities/shared)
      с README в каждом слое — см. `apps/web/ARCHITECTURE.md`
- [x] Tailwind CSS; RTK Query-провайдер; базовый layout (Sidebar + Header)
- [x] shadcn/ui-подобный UI-кит в `shared/ui` (кнопки, инпуты, модалки)
- [x] Auth через Supabase (email/password; OAuth — в бэклоге), защищённые роуты админки
      (обёртка `RequireAuth` над react-router вместо middleware)
- [x] Страница настроек workspace (тарифы, маржа, валюта)

### Спринт 2.2 — Математическое ядро (packages/shared) ✅

- [x] Функция `calculateCost()` в `src/pricing/`:
      материал + электричество + амортизация + ручной труд × k_брака
- [x] Функция `calculatePrice()` = себестоимость × (1 + маржа)
- [x] Zod-схемы всех входных данных калькулятора
- [x] Юнит-тесты Vitest: краевые случаи, SLA vs FDM, нулевой вес
- [x] Константы статусов заказов и принтеров в `src/constants/`
      (re-export `*.options` из Zod-схем — без дублирования литералов)

### Спринт 2.3 — CRUD склада (materials)

- [ ] Таблица склада: катушки, смолы, краски, грунты (с фильтром по type)
- [ ] Формы добавления/редактирования (react-hook-form + zod)
- [ ] Списание/пополнение остатков → запись в `inventory_logs`
- [ ] Индикация low-stock (остаток < threshold) — бейдж + подсветка

### Спринт 2.4 — Канбан заказов

- [ ] Колонки по статусам заказа (draft → … → completed)
- [ ] Drag-and-drop (dnd-kit) со сменой статуса в БД
- [ ] Карточка заказа: клиент, сумма, срок, оплата
- [ ] CRUD заказов и позиций `order_items`
- [ ] Страницы клиентов (CRUD)

---

## Этап 3 — 3D-вьювер на сайте ⬜

### Спринт 3.1 — Рендер STL/OBJ

- [ ] Подключить three + @react-three/fiber + @react-three/drei
- [ ] Компонент `<ModelViewer />`: orbit-controls, сетка, освещение
- [ ] Drag-and-drop загрузка .STL/.OBJ в браузер (без отправки на сервер)
- [ ] STLLoader/OBJLoader + нормализация модели в кадре

### Спринт 3.2 — Аналитика геометрии

- [ ] Вычисление объёма меша (см³) через signed-volume треугольников
- [ ] Габариты (bounding box) X×Y×Z
- [ ] Оценка веса по % infill и плотности материала
- [ ] Автозаполнение `estimated_weight_g` в позиции заказа
- [ ] Загрузка файла в Supabase Storage, превью-скриншот (canvas → thumbnail_path)

---

## Этап 4 — Telegram-бот (apps/bot) ⬜

### Спринт 4.1 — Каркас бота

- [ ] grammY + @grammyjs/conversations, сессии в Upstash Redis
- [ ] Подключение к Supabase, определение роли по `telegram_chat_id`
- [ ] Команда `/start` с deep-link `track_<public_tracking_token>` → привязка клиента
- [ ] Команда `/help`, обработка неизвестных команд

### Спринт 4.2 — Режим мастера

- [ ] Список активных заказов цеха, инлайн-кнопки смены статуса
- [ ] Обработка алертов принтеров: ✅ Снять со стола / ❌ Брак / 🛑 СТОП
- [ ] Диалог списания брака: «на каком % остановили?» → частичное списание
- [ ] Команда `/stock` — быстрый просмотр и пополнение склада
- [ ] Голосовое/текстовое пополнение склада: LLM парсит сообщение мастера («открыл катушку PETG и баночку грунта») → JSON → пополнение остатков (blueprint §4А)
- [ ] Фотоотчёт: фото → Supabase Storage → пересылка клиенту

### Спринт 4.3 — Режим клиента

- [ ] Уведомления при смене колонок канбана (подписка на Realtime/webhook)
- [ ] Фото готовой работы + кнопка/реквизиты оплаты
- [ ] Команда `/status` — текущий статус заказа

---

## Этап 5 — Desktop-приложение (apps/desktop) ⬜

### Спринт 5.1 — Парсер G-code (packages/gcode-parser)

- [ ] Парсинг комментариев Bambu Studio / OrcaSlicer (вес, метраж, время, слой)
- [ ] Парсинг .3mf (zip → Metadata), извлечение base64-превью
- [ ] Парсинг Chitubox (.ctb — по возможности) или отметить unsupported
- [ ] Юнит-тесты на реальных сэмплах файлов

### Спринт 5.2 — Каркас Electron

- [ ] electron-vite + React, окно + трей
- [ ] Настройка папки слежения (хранение в electron-store)
- [ ] chokidar watcher на папку слайсера
- [ ] Авторизация в Supabase, выбор workspace

### Спринт 5.3 — Перехватчик слайсера

- [ ] Перехват нового .gcode/.3mf → парсинг метаданных
- [ ] Всплывающее окно «Привязать к заказу #…?» (always-on-top)
- [ ] Привязка файла к `order_items` + upload в Storage
- [ ] Автозаполнение веса/времени, пересчёт цены через `packages/shared`

---

## Этап 6 — Интеграция с железом и Realtime ⬜

### Спринт 6.1 — Эмулятор принтера

- [ ] Виртуальный принтер (Moonraker-подобный WS/API) для разработки
- [ ] Сценарии: старт, прогресс, пауза, ошибка, завершение

### Спринт 6.2 — Moonraker/Klipper коннектор

- [ ] Постоянное WebSocket-соединение, реконнект с backoff
- [ ] Пуллинг/подписка на статус печати (прогресс, температура, ETA)
- [ ] Команды: пауза, возобновление, отмена, экстренный стоп

### Спринт 6.3 — Bambu Lab MQTT (опционально)

- [ ] Локальное MQTT-подключение (local_ip + access_code)
- [ ] Парсинг телеметрии, маппинг статусов

### Спринт 6.4 — Realtime-контур

- [ ] Десктоп → Supabase: запись `print_jobs`, обновление статуса принтера
- [ ] Supabase Realtime → веб: живой прогресс печати в канбане
- [ ] Supabase Realtime → десктоп: исполнение команд из веба/бота
- [ ] Алерты в Telegram: завершение/ошибка + фото с камеры
- [ ] Автоматическое списание материала по `actual_weight_used_g`

---

## Бэклог (после MVP)

- [ ] Публичная страница трекинга заказа по `public_tracking_token`
- [ ] Публичный калькулятор стоимости для клиентов (витрина)
- [ ] Онлайн-оплата (Stripe/ЮKassa/крипта)
- [ ] SaaS-режим: регистрация мастерских, onboarding-визард
- [ ] Мобильное PWA для мастера
- [ ] Отчёты: прибыль по периодам, расход материалов, загрузка принтеров
