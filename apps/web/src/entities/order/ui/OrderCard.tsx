import { Badge } from "@/shared/ui";
import { formatDate, formatMoney } from "@/shared/lib";
import type { Order } from "../model/types";

export interface OrderCardProps {
  order: Order;
  onEdit?: (order: Order) => void;
}

export function OrderCard({ order, onEdit }: OrderCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium text-slate-900">{order.order_number}</p>
        <Badge variant={order.is_paid ? "success" : "default"}>
          {order.is_paid ? "Оплачен" : "Не оплачен"}
        </Badge>
      </div>
      <p className="mt-1 truncate text-sm text-slate-600">{order.clientName ?? "Без клиента"}</p>
      <p className="mt-2 text-sm text-slate-900">{formatMoney(order.total_price)}</p>
      <p className="mt-1 text-xs text-slate-500">Создан {formatDate(order.created_at)}</p>
      {onEdit ? (
        <button
          type="button"
          className="mt-2 text-xs font-medium text-slate-600 hover:text-slate-900"
          onClick={(event) => {
            event.stopPropagation();
            onEdit(order);
          }}
        >
          Изменить
        </button>
      ) : null}
    </article>
  );
}
