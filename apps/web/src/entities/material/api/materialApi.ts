import {
  applyInventoryDelta,
  inventoryMovementSchema,
  materialCreateSchema,
  materialTypeSchema,
  materialUpdateSchema,
} from "@prient-flow/shared";
import type { Tables } from "@prient-flow/database";
import { baseApi, supabase, toQueryError } from "@/shared/api";
import type {
  AdjustMaterialStockArgs,
  CreateMaterialArgs,
  GetMaterialsArgs,
  Material,
  UpdateMaterialArgs,
} from "../model/types";

type MaterialRow = Tables<"materials">;

function mapMaterial(row: MaterialRow): Material {
  return {
    ...row,
    type: materialTypeSchema.parse(row.type),
  };
}

export const materialApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMaterials: builder.query<Material[], GetMaterialsArgs>({
      async queryFn({ workspaceId, type }) {
        let request = supabase
          .from("materials")
          .select("*")
          .eq("workspace_id", workspaceId)
          .order("name");

        if (type) {
          request = request.eq("type", type);
        }

        const { data, error } = await request;
        if (error) {
          return { error: toQueryError("Не удалось загрузить склад") };
        }

        try {
          return { data: (data ?? []).map(mapMaterial) };
        } catch {
          return { error: toQueryError("Некорректный тип материала в ответе БД") };
        }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map((material) => ({ type: "Material" as const, id: material.id })),
              { type: "Material", id: "LIST" },
            ]
          : [{ type: "Material", id: "LIST" }],
    }),
    createMaterial: builder.mutation<Material, CreateMaterialArgs>({
      async queryFn({ workspaceId, input }) {
        const parsed = materialCreateSchema.safeParse(input);
        if (!parsed.success) {
          return {
            error: toQueryError(parsed.error.issues[0]?.message ?? "Проверьте поля формы"),
          };
        }

        const { data, error } = await supabase
          .from("materials")
          .insert({
            workspace_id: workspaceId,
            type: parsed.data.type,
            brand: parsed.data.brand,
            name: parsed.data.name,
            color_hex: parsed.data.color_hex,
            initial_amount: parsed.data.initial_amount,
            remaining_amount: parsed.data.initial_amount,
            cost_per_unit: parsed.data.cost_per_unit,
            low_stock_threshold: parsed.data.low_stock_threshold,
          })
          .select("*")
          .single();

        if (error || !data) {
          return { error: toQueryError("Не удалось добавить материал") };
        }

        try {
          return { data: mapMaterial(data) };
        } catch {
          return { error: toQueryError("Некорректный тип материала в ответе БД") };
        }
      },
      invalidatesTags: [{ type: "Material", id: "LIST" }],
    }),
    updateMaterial: builder.mutation<Material, UpdateMaterialArgs>({
      async queryFn({ id, workspaceId, input }) {
        const parsed = materialUpdateSchema.safeParse(input);
        if (!parsed.success) {
          return {
            error: toQueryError(parsed.error.issues[0]?.message ?? "Проверьте поля формы"),
          };
        }

        const { data, error } = await supabase
          .from("materials")
          .update(parsed.data)
          .eq("id", id)
          .eq("workspace_id", workspaceId)
          .select("*")
          .single();

        if (error || !data) {
          return { error: toQueryError("Не удалось сохранить материал") };
        }

        try {
          return { data: mapMaterial(data) };
        } catch {
          return { error: toQueryError("Некорректный тип материала в ответе БД") };
        }
      },
      invalidatesTags: (_result, _error, arg) => [
        { type: "Material", id: arg.id },
        { type: "Material", id: "LIST" },
      ],
    }),
    adjustMaterialStock: builder.mutation<{ remaining: number }, AdjustMaterialStockArgs>({
      async queryFn({ materialId, workspaceId, deltaAmount, reason }) {
        const parsed = inventoryMovementSchema.safeParse({
          delta_amount: deltaAmount,
          reason,
        });
        if (!parsed.success) {
          return {
            error: toQueryError(parsed.error.issues[0]?.message ?? "Проверьте количество"),
          };
        }

        const { data: current, error: readError } = await supabase
          .from("materials")
          .select("remaining_amount")
          .eq("id", materialId)
          .eq("workspace_id", workspaceId)
          .single();

        if (readError || !current) {
          return { error: toQueryError("Не удалось прочитать остаток материала") };
        }

        const next = applyInventoryDelta(current.remaining_amount, parsed.data.delta_amount);
        if (!next.ok) {
          return { error: toQueryError(next.message) };
        }

        const { error: updateError } = await supabase
          .from("materials")
          .update({ remaining_amount: next.remaining })
          .eq("id", materialId)
          .eq("workspace_id", workspaceId);

        if (updateError) {
          return { error: toQueryError("Не удалось обновить остаток") };
        }

        const { error: logError } = await supabase.from("inventory_logs").insert({
          material_id: materialId,
          delta_amount: parsed.data.delta_amount,
          reason: parsed.data.reason,
        });

        if (logError) {
          await supabase
            .from("materials")
            .update({ remaining_amount: current.remaining_amount })
            .eq("id", materialId)
            .eq("workspace_id", workspaceId);
          return { error: toQueryError("Не удалось записать движение склада") };
        }

        return { data: { remaining: next.remaining } };
      },
      invalidatesTags: (_result, _error, arg) => [
        { type: "Material", id: arg.materialId },
        { type: "Material", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetMaterialsQuery,
  useCreateMaterialMutation,
  useUpdateMaterialMutation,
  useAdjustMaterialStockMutation,
} = materialApi;
