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
- [ ] Установить Supabase CLI (`pnpm add -g supabase` или scoop)
- [ ] `supabase init` → проверить `supabase/config.toml`
- [ ] `pnpm db:start` — поднять локальный стек (Docker)
- [ ] Проверить доступ к Studio (http://localhost:54323)

### Спринт 1.3 — SQL-миграция: схема БД
- [ ] `supabase migration new init_schema`
- [ ] Таблица `workspaces` (id, name, slug, owner_id, settings jsonb)
- [ ] Таблица `clients` (workspace_id, name, phone, telegram_username, telegram_chat_id)
- [ ] Таблица `materials` (type, brand, name, color_hex, initial_amount, remaining_amount, cost_per_unit, low_stock_threshold)
- [ ] Таблица `printers` (name, technology, connection_type, local_ip, access_code, power_watts, depreciation_per_hour, status)
- [ ] Таблица `orders` (client_id, order_number, status, total_price, calculated_cost, is_paid, public_tracking_token)
- [ ] Таблица `order_items` (order_id, name, quantity, technology, stl/gcode/thumbnail paths, material_id, estimated_weight_g, estimated_time_sec, post_processing_mins)
- [ ] Таблица `print_jobs` (order_item_id, printer_id, started_at, finished_at, status, actual_weight_used_g, failure_reason)
- [ ] Таблица `inventory_logs` (material_id, print_job_id, delta_amount, reason)
- [ ] Индексы по всем FK и `workspace_id`

### Спринт 1.4 — RLS-политики и мультитенантность
- [ ] Включить RLS на всех таблицах
- [ ] Политики: пользователь видит только свои `workspaces` и связанные данные
- [ ] Политика публичного чтения заказа по `public_tracking_token` (для трекинг-страницы)
- [ ] Тесты политик через `supabase test db` (pgTAP) или ручная проверка

### Спринт 1.5 — Генерация типов и пакет database
- [ ] `pnpm db:types` → `packages/database/src/database.types.ts`
- [ ] Фабрики клиентов: browser-клиент, server-клиент (SSR), service-role
- [ ] `.env` на основе `.env.example`, подключение к локальному Supabase
- [ ] Проверка: тестовый скрипт читает список таблиц

---

## Этап 2 — Склад и калькулятор (apps/web + packages/shared) ⬜

### Спринт 2.1 — Каркас Next.js
- [ ] `create-next-app`-структура в `apps/web` (App Router, TS)
- [ ] Подключить Tailwind CSS + shadcn/ui (init, базовые компоненты)
- [ ] TanStack Query: провайдер, devtools
- [ ] Auth через Supabase (email/OAuth), middleware защиты `/dashboard`
- [ ] Layout дашборда: сайдбар (Заказы / Склад / Принтеры / Клиенты / Настройки)

### Спринт 2.2 — Математическое ядро (packages/shared)
- [ ] Функция `calculateCost()` в `src/pricing/`:
      материал + электричество + амортизация + ручной труд × k_брака
- [ ] Функция `calculatePrice()` = себестоимость × (1 + маржа)
- [ ] Zod-схемы всех входных данных калькулятора
- [ ] Юнит-тесты Vitest: краевые случаи, SLA vs FDM, нулевой вес
- [ ] Константы статусов заказов и принтеров в `src/constants/`

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
