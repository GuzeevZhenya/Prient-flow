import type {
  OrderCreateInput,
  OrderItemCreateInput,
  OrderItemUpdateInput,
  OrderStatus,
  OrderUpdateInput,
  PrinterTechnology,
} from "@prient-flow/shared";
import type { Tables } from "@prient-flow/database";

type OrderRow = Tables<"orders">;
type OrderItemRow = Tables<"order_items">;

export type OrderItem = Omit<OrderItemRow, "technology"> & { technology: PrinterTechnology };

export type Order = Omit<OrderRow, "status"> & {
  status: OrderStatus;
  clientName: string | null;
  items: OrderItem[];
};

export interface GetOrdersArgs {
  workspaceId: string;
}

export interface CreateOrderArgs {
  workspaceId: string;
  input: OrderCreateInput;
}

export interface UpdateOrderArgs {
  id: string;
  workspaceId: string;
  input: OrderUpdateInput;
}

export interface UpdateOrderStatusArgs {
  id: string;
  workspaceId: string;
  status: OrderStatus;
}

export interface DeleteOrderArgs {
  id: string;
  workspaceId: string;
}

export interface CreateOrderItemArgs {
  orderId: string;
  workspaceId: string;
  input: OrderItemCreateInput;
}

export interface UpdateOrderItemArgs {
  id: string;
  orderId: string;
  workspaceId: string;
  input: OrderItemUpdateInput;
}

export interface DeleteOrderItemArgs {
  id: string;
  workspaceId: string;
}
