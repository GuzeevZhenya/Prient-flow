import {
  orderCreateSchema,
  orderItemCreateSchema,
  orderItemUpdateSchema,
  orderStatusSchema,
  orderStatusUpdateSchema,
  orderUpdateSchema,
  printerTechnologySchema,
} from "@prient-flow/shared";
import type { Tables } from "@prient-flow/database";
import { baseApi, supabase, toQueryError } from "@/shared/api";
import type {
  CreateOrderArgs,
  CreateOrderItemArgs,
  DeleteOrderArgs,
  DeleteOrderItemArgs,
  GetOrdersArgs,
  Order,
  OrderItem,
  UpdateOrderArgs,
  UpdateOrderItemArgs,
  UpdateOrderStatusArgs,
} from "../model/types";

type OrderRow = Tables<"orders">;
type OrderItemRow = Tables<"order_items">;

interface OrderQueryRow extends OrderRow {
  clients: { id: string; name: string } | { id: string; name: string }[] | null;
  order_items: OrderItemRow[] | null;
}

const ORDER_SELECT = `
  id,
  workspace_id,
  client_id,
  order_number,
  status,
  total_price,
  calculated_cost,
  is_paid,
  public_tracking_token,
  created_at,
  clients ( id, name ),
  order_items (
    id,
    order_id,
    name,
    quantity,
    technology,
    material_id,
    estimated_weight_g,
    estimated_time_sec,
    post_processing_mins,
    stl_file_path,
    gcode_file_path,
    thumbnail_path,
    created_at
  )
`;

function mapItem(row: OrderItemRow): OrderItem {
  return {
    ...row,
    technology: printerTechnologySchema.parse(row.technology),
  };
}

function mapOrder(row: OrderQueryRow): Order {
  const client = Array.isArray(row.clients) ? (row.clients[0] ?? null) : row.clients;
  return {
    id: row.id,
    workspace_id: row.workspace_id,
    client_id: row.client_id,
    order_number: row.order_number,
    status: orderStatusSchema.parse(row.status),
    total_price: row.total_price,
    calculated_cost: row.calculated_cost,
    is_paid: row.is_paid,
    public_tracking_token: row.public_tracking_token,
    created_at: row.created_at,
    clientName: client?.name ?? null,
    items: (row.order_items ?? []).map(mapItem),
  };
}

async function fetchOrder(id: string, workspaceId: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("id", id)
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }
  return mapOrder(data as unknown as OrderQueryRow);
}

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query<Order[], GetOrdersArgs>({
      async queryFn({ workspaceId }) {
        const { data, error } = await supabase
          .from("orders")
          .select(ORDER_SELECT)
          .eq("workspace_id", workspaceId)
          .order("created_at", { ascending: false });

        if (error) {
          return { error: toQueryError("Не удалось загрузить заказы") };
        }

        try {
          return { data: ((data ?? []) as unknown as OrderQueryRow[]).map(mapOrder) };
        } catch {
          return { error: toQueryError("Некорректные данные заказа в ответе БД") };
        }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map((order) => ({ type: "Order" as const, id: order.id })),
              { type: "Order", id: "LIST" },
            ]
          : [{ type: "Order", id: "LIST" }],
    }),
    createOrder: builder.mutation<Order, CreateOrderArgs>({
      async queryFn({ workspaceId, input }) {
        const parsed = orderCreateSchema.safeParse(input);
        if (!parsed.success) {
          return {
            error: toQueryError(parsed.error.issues[0]?.message ?? "Проверьте поля формы"),
          };
        }

        const { data: created, error: createError } = await supabase
          .from("orders")
          .insert({
            workspace_id: workspaceId,
            client_id: parsed.data.client_id,
            order_number: parsed.data.order_number,
            status: parsed.data.status,
            total_price: parsed.data.total_price,
            calculated_cost: parsed.data.calculated_cost,
            is_paid: parsed.data.is_paid,
          })
          .select("id")
          .single();

        if (createError || !created) {
          return { error: toQueryError("Не удалось создать заказ") };
        }

        const { error: itemsError } = await supabase.from("order_items").insert(
          parsed.data.items.map((item) => ({
            order_id: created.id,
            name: item.name,
            quantity: item.quantity,
            technology: item.technology,
            material_id: item.material_id,
            estimated_weight_g: item.estimated_weight_g,
            estimated_time_sec: item.estimated_time_sec,
            post_processing_mins: item.post_processing_mins,
          })),
        );

        if (itemsError) {
          await supabase
            .from("orders")
            .delete()
            .eq("id", created.id)
            .eq("workspace_id", workspaceId);
          return { error: toQueryError("Не удалось сохранить позиции заказа") };
        }

        const order = await fetchOrder(created.id, workspaceId);
        if (!order) {
          return { error: toQueryError("Заказ создан, но не удалось прочитать его") };
        }
        return { data: order };
      },
      invalidatesTags: [{ type: "Order", id: "LIST" }],
    }),
    updateOrder: builder.mutation<Order, UpdateOrderArgs>({
      async queryFn({ id, workspaceId, input }) {
        const parsed = orderUpdateSchema.safeParse(input);
        if (!parsed.success) {
          return {
            error: toQueryError(parsed.error.issues[0]?.message ?? "Проверьте поля формы"),
          };
        }

        const { error } = await supabase
          .from("orders")
          .update(parsed.data)
          .eq("id", id)
          .eq("workspace_id", workspaceId);

        if (error) {
          return { error: toQueryError("Не удалось сохранить заказ") };
        }

        const order = await fetchOrder(id, workspaceId);
        if (!order) {
          return { error: toQueryError("Не удалось прочитать заказ") };
        }
        return { data: order };
      },
      invalidatesTags: (_result, _error, arg) => [
        { type: "Order", id: arg.id },
        { type: "Order", id: "LIST" },
      ],
    }),
    updateOrderStatus: builder.mutation<Order, UpdateOrderStatusArgs>({
      async queryFn({ id, workspaceId, status }) {
        const parsed = orderStatusUpdateSchema.safeParse({ status });
        if (!parsed.success) {
          return { error: toQueryError("Некорректный статус заказа") };
        }

        const { error } = await supabase
          .from("orders")
          .update({ status: parsed.data.status })
          .eq("id", id)
          .eq("workspace_id", workspaceId);

        if (error) {
          return { error: toQueryError("Не удалось сменить статус заказа") };
        }

        const order = await fetchOrder(id, workspaceId);
        if (!order) {
          return { error: toQueryError("Не удалось прочитать заказ") };
        }
        return { data: order };
      },
      async onQueryStarted({ id, workspaceId, status }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          orderApi.util.updateQueryData("getOrders", { workspaceId }, (draft) => {
            const current = draft.find((row) => row.id === id);
            if (current) {
              current.status = status;
            }
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: (_result, _error, arg) => [
        { type: "Order", id: arg.id },
        { type: "Order", id: "LIST" },
      ],
    }),
    deleteOrder: builder.mutation<{ id: string }, DeleteOrderArgs>({
      async queryFn({ id, workspaceId }) {
        const { error } = await supabase
          .from("orders")
          .delete()
          .eq("id", id)
          .eq("workspace_id", workspaceId);

        if (error) {
          return { error: toQueryError("Не удалось удалить заказ") };
        }
        return { data: { id } };
      },
      invalidatesTags: [{ type: "Order", id: "LIST" }],
    }),
    createOrderItem: builder.mutation<Order, CreateOrderItemArgs>({
      async queryFn({ orderId, workspaceId, input }) {
        const parsed = orderItemCreateSchema.safeParse(input);
        if (!parsed.success) {
          return {
            error: toQueryError(parsed.error.issues[0]?.message ?? "Проверьте позицию"),
          };
        }

        const { error } = await supabase.from("order_items").insert({
          order_id: orderId,
          name: parsed.data.name,
          quantity: parsed.data.quantity,
          technology: parsed.data.technology,
          material_id: parsed.data.material_id,
          estimated_weight_g: parsed.data.estimated_weight_g,
          estimated_time_sec: parsed.data.estimated_time_sec,
          post_processing_mins: parsed.data.post_processing_mins,
        });

        if (error) {
          return { error: toQueryError("Не удалось добавить позицию") };
        }

        const order = await fetchOrder(orderId, workspaceId);
        if (!order) {
          return { error: toQueryError("Не удалось прочитать заказ") };
        }
        return { data: order };
      },
      invalidatesTags: [{ type: "Order", id: "LIST" }],
    }),
    updateOrderItem: builder.mutation<Order, UpdateOrderItemArgs>({
      async queryFn({ id, orderId, workspaceId, input }) {
        const parsed = orderItemUpdateSchema.safeParse(input);
        if (!parsed.success) {
          return {
            error: toQueryError(parsed.error.issues[0]?.message ?? "Проверьте позицию"),
          };
        }

        const { error } = await supabase.from("order_items").update(parsed.data).eq("id", id);

        if (error) {
          return { error: toQueryError("Не удалось сохранить позицию") };
        }

        const order = await fetchOrder(orderId, workspaceId);
        if (!order) {
          return { error: toQueryError("Не удалось прочитать заказ") };
        }
        return { data: order };
      },
      invalidatesTags: [{ type: "Order", id: "LIST" }],
    }),
    deleteOrderItem: builder.mutation<Order, DeleteOrderItemArgs>({
      async queryFn({ id, workspaceId }) {
        const { data: item, error: readError } = await supabase
          .from("order_items")
          .select("order_id")
          .eq("id", id)
          .single();

        if (readError || !item) {
          return { error: toQueryError("Позиция не найдена") };
        }

        const { error } = await supabase.from("order_items").delete().eq("id", id);
        if (error) {
          return { error: toQueryError("Не удалось удалить позицию") };
        }

        const order = await fetchOrder(item.order_id, workspaceId);
        if (!order) {
          return { error: toQueryError("Не удалось прочитать заказ") };
        }
        return { data: order };
      },
      invalidatesTags: [{ type: "Order", id: "LIST" }],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useCreateOrderMutation,
  useUpdateOrderMutation,
  useUpdateOrderStatusMutation,
  useDeleteOrderMutation,
  useCreateOrderItemMutation,
  useUpdateOrderItemMutation,
  useDeleteOrderItemMutation,
} = orderApi;
