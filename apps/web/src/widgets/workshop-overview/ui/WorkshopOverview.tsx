import { Link } from "react-router-dom";
import { isMaterialLowStock, type OrderStatus } from "@prient-flow/shared";
import { KANBAN_STATUSES, ORDER_STATUS_LABELS, type Order } from "@/entities/order";
import { formatAmount, MATERIAL_TYPE_UNITS, type Material } from "@/entities/material";
import { PRINTER_STATUS_LABELS, type Printer } from "@/entities/printer";
import { ROUTES } from "@/shared/config/routes";
import { formatMoney } from "@/shared/lib";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/shared/ui";

const IN_PROGRESS: OrderStatus[] = ["approved", "printing", "post_processing", "painting", "ready"];

const PIPELINE_TONE: Partial<Record<OrderStatus, string>> = {
  printing: "bg-emerald-100 text-emerald-800",
  painting: "bg-amber-100 text-amber-800",
  ready: "bg-sky-100 text-sky-800",
  cancelled: "bg-slate-200 text-slate-500",
};

const ROADMAP_NEXT = [
  { title: "3D-вьювер STL/OBJ", detail: "крутить модель в браузере до слайса" },
  { title: "Объём и вес", detail: "из геометрии сразу в калькулятор" },
  { title: "Telegram-бот", detail: "мастер двигает статус, клиент видит трек" },
  { title: "Десктоп-хаб", detail: "перехват .gcode/.3mf из слайсера" },
  { title: "Живые принтеры", detail: "Moonraker / Bambu MQTT, пауза и стоп" },
  { title: "Публичный трекинг", detail: "ссылка клиенту без входа в ERP" },
];

export interface WorkshopOverviewProps {
  workspaceName: string;
  currency: string;
  orders: Order[];
  materials: Material[];
  printers: Printer[];
  clientCount: number;
}

function money(value: number, currency: string): string {
  return `${formatMoney(value)} ${currency}`;
}

export function WorkshopOverview({
  workspaceName,
  currency,
  orders,
  materials,
  printers,
  clientCount,
}: WorkshopOverviewProps) {
  const inProgress = orders.filter((order) => IN_PROGRESS.includes(order.status));
  const paidTotal = orders
    .filter((order) => order.is_paid)
    .reduce((sum, order) => sum + (order.total_price ?? 0), 0);
  const lowStock = materials.filter((material) =>
    isMaterialLowStock(material.remaining_amount, material.low_stock_threshold),
  );
  const printingNow = printers.filter((printer) => printer.status === "printing");
  const byStatus = Object.fromEntries(
    KANBAN_STATUSES.map((status) => [
      status,
      orders.filter((order) => order.status === status).length,
    ]),
  ) as Record<OrderStatus, number>;
  const recent = [...orders].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 5);

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-amber-700">
          ERP для 3D-печати и покраса
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">{workspaceName}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Один контур вместо таблиц, мессенджера и «на глаз»: заявка → просчёт по себестоимости →
          печать → постобработка → покраска → выдача. Склад не кончается посреди тиража, цена не
          уезжает в минус, клиент не пишет «ну как там».
        </p>
        <ul className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-3">
          <li className="rounded-lg bg-slate-50 px-3 py-2">
            Считать цену из материала, электричества, амортизации и труда — не из потолка.
          </li>
          <li className="rounded-lg bg-slate-50 px-3 py-2">
            Видеть очередь цеха целиком: от черновика до выдачи и брака.
          </li>
          <li className="rounded-lg bg-slate-50 px-3 py-2">
            Держать филамент, смолу и краску с порогом «пора заказать».
          </li>
        </ul>
        <Link
          to={ROUTES.calculator}
          className="mt-4 inline-flex h-9 items-center rounded-md bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-700"
        >
          Открыть калькулятор
        </Link>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="В работе" value={String(inProgress.length)} hint="согласован → готов" />
        <Kpi
          label="Оплачено"
          value={money(paidTotal, currency)}
          hint={`${orders.length} заказов в канбане`}
        />
        <Kpi
          label="Мало на складе"
          value={String(lowStock.length)}
          hint={`${materials.length} позиций всего`}
          tone={lowStock.length > 0 ? "warn" : "ok"}
        />
        <Kpi
          label="Печатают сейчас"
          value={`${printingNow.length} / ${printers.length}`}
          hint={`${clientCount} клиентов`}
        />
      </section>

      <section>
        <h2 className="text-sm font-medium text-slate-800">Труба заказов</h2>
        <p className="mt-1 text-xs text-slate-500">
          Как деталь идёт по цеху. Карточки — на странице заказов.
        </p>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {KANBAN_STATUSES.map((status) => (
            <div
              key={status}
              className={`min-w-24 shrink-0 rounded-lg px-3 py-2 text-center text-xs ${
                PIPELINE_TONE[status] ?? "bg-white text-slate-700 ring-1 ring-slate-200"
              }`}
            >
              <p className="text-lg font-semibold">{byStatus[status]}</p>
              <p className="mt-0.5">{ORDER_STATUS_LABELS[status]}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>Склад: заканчивается</CardTitle>
          </CardHeader>
          <CardContent>
            {lowStock.length === 0 ? (
              <p className="text-sm text-slate-500">Все позиции выше порога.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {lowStock.map((material) => (
                  <li key={material.id} className="flex items-center justify-between gap-2">
                    <span className="truncate text-slate-800">{material.name}</span>
                    <Badge variant="danger">
                      {formatAmount(material.remaining_amount)} {MATERIAL_TYPE_UNITS[material.type]}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
            <Link
              to={ROUTES.inventory}
              className="mt-4 inline-block text-sm font-medium text-slate-700"
            >
              Открыть склад →
            </Link>
          </CardContent>
        </Card>

        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>Парк принтеров</CardTitle>
          </CardHeader>
          <CardContent>
            {printers.length === 0 ? (
              <p className="text-sm text-slate-500">Принтеров пока нет.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {printers.map((printer) => (
                  <li key={printer.id} className="flex items-center justify-between gap-2">
                    <span className="truncate text-slate-800">{printer.name}</span>
                    <Badge
                      variant={
                        printer.status === "printing"
                          ? "success"
                          : printer.status === "error"
                            ? "danger"
                            : printer.status === "paused"
                              ? "warning"
                              : "default"
                      }
                    >
                      {PRINTER_STATUS_LABELS[printer.status]}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
            <Link
              to={ROUTES.printers}
              className="mt-4 inline-block text-sm font-medium text-slate-700"
            >
              Парк целиком →
            </Link>
          </CardContent>
        </Card>

        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>Последние заказы</CardTitle>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <p className="text-sm text-slate-500">Заказов пока нет.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {recent.map((order) => (
                  <li key={order.id} className="flex items-center justify-between gap-2">
                    <span className="truncate">
                      <span className="font-medium text-slate-800">{order.order_number}</span>
                      <span className="ml-2 text-slate-500">{order.clientName}</span>
                    </span>
                    <span className="shrink-0 text-slate-700">
                      {money(order.total_price ?? 0, currency)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <Link
              to={ROUTES.orders}
              className="mt-4 inline-block text-sm font-medium text-slate-700"
            >
              Канбан заказов →
            </Link>
          </CardContent>
        </Card>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Что ещё сюда ляжет</h2>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">
          Сейчас это рабочий контур цеха. Дальше — модель в браузере, бот вместо «напиши мастеру»,
          хаб к слайсеру и станкам, чтобы ERP знала факт печати, а не только план.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ROADMAP_NEXT.map((item) => (
            <div key={item.title} className="rounded-lg bg-slate-50 px-3 py-3">
              <p className="text-sm font-medium text-slate-900">{item.title}</p>
              <p className="mt-1 text-xs text-slate-500">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Kpi({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  tone?: "warn" | "ok";
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p
        className={`mt-2 text-2xl font-semibold ${
          tone === "warn" ? "text-red-700" : "text-slate-900"
        }`}
      >
        {value}
      </p>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </div>
  );
}
