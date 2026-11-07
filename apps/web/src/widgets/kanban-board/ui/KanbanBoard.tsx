import {
  DndContext,
  PointerSensor,
  closestCorners,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { orderStatusSchema, type OrderStatus } from "@prient-flow/shared";
import {
  KANBAN_STATUSES,
  ORDER_STATUS_LABELS,
  OrderCard,
  useUpdateOrderStatusMutation,
  type Order,
} from "@/entities/order";

function columnId(status: OrderStatus): string {
  return `column:${status}`;
}

function parseColumnStatus(overId: string): OrderStatus | null {
  if (!overId.startsWith("column:")) return null;
  const parsed = orderStatusSchema.safeParse(overId.slice("column:".length));
  return parsed.success ? parsed.data : null;
}

interface KanbanCardProps {
  order: Order;
  onEdit: (order: Order) => void;
}

function KanbanCard({ order, onEdit }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: order.id,
  });
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="touch-none">
      <OrderCard order={order} onEdit={onEdit} />
    </div>
  );
}

interface KanbanColumnProps {
  status: OrderStatus;
  orders: Order[];
  onEdit: (order: Order) => void;
}

function KanbanColumn({ status, orders, onEdit }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: columnId(status) });
  const cancelled = status === "cancelled";

  return (
    <section
      ref={setNodeRef}
      aria-label={ORDER_STATUS_LABELS[status]}
      className={`flex w-64 shrink-0 flex-col rounded-lg p-2 ${
        cancelled ? "bg-slate-200/80" : "bg-slate-100"
      } ${isOver ? "ring-2 ring-slate-400" : ""}`}
    >
      <header className="mb-2 flex items-center justify-between px-1">
        <h2 className="text-sm font-medium text-slate-800">{ORDER_STATUS_LABELS[status]}</h2>
        <span className="text-xs text-slate-500">{orders.length}</span>
      </header>
      <div className="flex min-h-24 flex-col gap-2">
        {orders.map((order) => (
          <KanbanCard key={order.id} order={order} onEdit={onEdit} />
        ))}
      </div>
    </section>
  );
}

export interface KanbanBoardProps {
  workspaceId: string;
  orders: Order[];
  onEdit: (order: Order) => void;
}

export function KanbanBoard({ workspaceId, orders, onEdit }: KanbanBoardProps) {
  const [updateStatus] = useUpdateOrderStatusMutation();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const order = orders.find((row) => row.id === String(active.id));
    if (!order) return;

    const overId = String(over.id);
    const fromColumn = parseColumnStatus(overId);
    const droppedOnOrder = orders.find((row) => row.id === overId);
    const nextStatus = fromColumn ?? droppedOnOrder?.status ?? null;
    if (!nextStatus || nextStatus === order.status) return;

    void updateStatus({ id: order.id, workspaceId, status: nextStatus });
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {KANBAN_STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            orders={orders.filter((order) => order.status === status)}
            onEdit={onEdit}
          />
        ))}
      </div>
    </DndContext>
  );
}
