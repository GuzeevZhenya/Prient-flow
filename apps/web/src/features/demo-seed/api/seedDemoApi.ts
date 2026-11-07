import { baseApi, mapSupabaseError, supabase, toQueryError } from "@/shared/api";
import {
  DEMO_CLIENTS,
  DEMO_INVENTORY_LOGS,
  DEMO_MATERIALS,
  DEMO_ORDER_PREFIX,
  DEMO_ORDERS,
  DEMO_PRINTERS,
  DEMO_WORKSHOP_NAME,
  DEMO_WORKSHOP_SETTINGS,
} from "../lib/catalog";

export type SeedDemoResult = { status: "seeded" } | { status: "already" };

function hoursAgoIso(hours: number): string {
  return new Date(Date.now() - hours * 3600 * 1000).toISOString();
}

function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 24 * 3600 * 1000).toISOString();
}

function errMsg(error: { message?: string; code?: string } | null, fallback: string): string {
  return error ? mapSupabaseError(error, fallback) : fallback;
}

export const seedDemoApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    seedDemoWorkshop: builder.mutation<SeedDemoResult, { workspaceId: string }>({
      async queryFn({ workspaceId }) {
        const { data: existingDemo, error: existingError } = await supabase
          .from("orders")
          .select("id")
          .eq("workspace_id", workspaceId)
          .like("order_number", `${DEMO_ORDER_PREFIX}%`)
          .limit(1);

        if (existingError) {
          return {
            error: toQueryError(mapSupabaseError(existingError, "Не удалось проверить демо")),
          };
        }
        if (existingDemo && existingDemo.length > 0) {
          return { data: { status: "already" } };
        }

        const { error: workspaceError } = await supabase
          .from("workspaces")
          .update({
            name: DEMO_WORKSHOP_NAME,
            settings: DEMO_WORKSHOP_SETTINGS,
          })
          .eq("id", workspaceId);

        if (workspaceError) {
          return {
            error: toQueryError(mapSupabaseError(workspaceError, "Не удалось обновить цех")),
          };
        }

        const { data: clients, error: clientsError } = await supabase
          .from("clients")
          .insert(
            DEMO_CLIENTS.map((client) => ({
              workspace_id: workspaceId,
              name: client.name,
              phone: client.phone,
              telegram_username: client.telegram_username,
            })),
          )
          .select("id, name");

        if (clientsError || !clients) {
          return { error: toQueryError(errMsg(clientsError, "Не удалось добавить клиентов")) };
        }

        const clientIds = new Map(DEMO_CLIENTS.map((client) => [client.key, ""]));
        for (const row of clients) {
          const match = DEMO_CLIENTS.find((client) => client.name === row.name);
          if (match) clientIds.set(match.key, row.id);
        }

        const { data: materials, error: materialsError } = await supabase
          .from("materials")
          .insert(
            DEMO_MATERIALS.map((material) => ({
              workspace_id: workspaceId,
              type: material.type,
              brand: material.brand,
              name: material.name,
              color_hex: material.color_hex,
              initial_amount: material.initial_amount,
              remaining_amount: material.remaining_amount,
              cost_per_unit: material.cost_per_unit,
              low_stock_threshold: material.low_stock_threshold,
            })),
          )
          .select("id, name");

        if (materialsError || !materials) {
          return { error: toQueryError(errMsg(materialsError, "Не удалось добавить материалы")) };
        }

        const materialIds = new Map(DEMO_MATERIALS.map((material) => [material.key, ""]));
        for (const row of materials) {
          const match = DEMO_MATERIALS.find((material) => material.name === row.name);
          if (match) materialIds.set(match.key, row.id);
        }

        const { data: printers, error: printersError } = await supabase
          .from("printers")
          .insert(
            DEMO_PRINTERS.map((printer) => ({
              workspace_id: workspaceId,
              name: printer.name,
              technology: printer.technology,
              connection_type: printer.connection_type,
              local_ip: printer.local_ip,
              access_code: printer.access_code,
              power_watts: printer.power_watts,
              depreciation_per_hour: printer.depreciation_per_hour,
              status: printer.status,
            })),
          )
          .select("id, name");

        if (printersError || !printers) {
          return { error: toQueryError(errMsg(printersError, "Не удалось добавить принтеры")) };
        }

        const printerIds = new Map(DEMO_PRINTERS.map((printer) => [printer.key, ""]));
        for (const row of printers) {
          const match = DEMO_PRINTERS.find((printer) => printer.name === row.name);
          if (match) printerIds.set(match.key, row.id);
        }

        const jobIds = new Map<string, string>();

        for (const order of DEMO_ORDERS) {
          const clientId = clientIds.get(order.clientKey);
          if (!clientId) {
            return { error: toQueryError(`Не найден клиент ${order.clientKey}`) };
          }

          const { data: created, error: orderError } = await supabase
            .from("orders")
            .insert({
              workspace_id: workspaceId,
              client_id: clientId,
              order_number: order.order_number,
              status: order.status,
              total_price: order.total_price,
              calculated_cost: order.calculated_cost,
              is_paid: order.is_paid,
              created_at: daysAgoIso(order.daysAgo),
            })
            .select("id")
            .single();

          if (orderError || !created) {
            return {
              error: toQueryError(errMsg(orderError, `Не удалось создать ${order.order_number}`)),
            };
          }

          const { data: items, error: itemsError } = await supabase
            .from("order_items")
            .insert(
              order.items.map((item) => ({
                order_id: created.id,
                name: item.name,
                quantity: item.quantity,
                technology: item.technology,
                material_id: materialIds.get(item.materialKey) ?? null,
                estimated_weight_g: item.estimated_weight_g,
                estimated_time_sec: item.estimated_time_sec,
                post_processing_mins: item.post_processing_mins,
              })),
            )
            .select("id");

          if (itemsError || !items) {
            return {
              error: toQueryError(
                errMsg(itemsError, `Не удалось добавить позиции ${order.order_number}`),
              ),
            };
          }

          if (order.job) {
            const item = items[order.job.itemIndex];
            const printerId = printerIds.get(order.job.printerKey);
            if (!item || !printerId) {
              return { error: toQueryError(`Не удалось привязать печать ${order.order_number}`) };
            }

            const { data: job, error: jobError } = await supabase
              .from("print_jobs")
              .insert({
                order_item_id: item.id,
                printer_id: printerId,
                status: order.job.status,
                actual_weight_used_g: order.job.actual_weight_used_g,
                failure_reason: order.job.failure_reason,
                started_at: hoursAgoIso(order.job.hoursAgoStarted),
                finished_at:
                  order.job.hoursAgoFinished == null
                    ? null
                    : hoursAgoIso(order.job.hoursAgoFinished),
              })
              .select("id")
              .single();

            if (jobError || !job) {
              return {
                error: toQueryError(
                  errMsg(jobError, `Не удалось записать задание ${order.order_number}`),
                ),
              };
            }
            jobIds.set(order.order_number, job.id);
          }
        }

        const logs = DEMO_INVENTORY_LOGS.flatMap((log) => {
          const materialId = materialIds.get(log.materialKey);
          if (!materialId) return [];
          return [
            {
              material_id: materialId,
              print_job_id: log.orderNumber ? (jobIds.get(log.orderNumber) ?? null) : null,
              delta_amount: log.delta_amount,
              reason: log.reason,
            },
          ];
        });

        const { error: logsError } = await supabase.from("inventory_logs").insert(logs);

        if (logsError) {
          return { error: toQueryError(errMsg(logsError, "Не удалось записать движения склада")) };
        }

        return { data: { status: "seeded" } };
      },
      invalidatesTags: [
        { type: "Workspace", id: "CURRENT" },
        { type: "Client", id: "LIST" },
        { type: "Material", id: "LIST" },
        { type: "Printer", id: "LIST" },
        { type: "Order", id: "LIST" },
      ],
    }),
  }),
});

export const { useSeedDemoWorkshopMutation } = seedDemoApi;
