import {
  connectionTypeSchema,
  printerCreateSchema,
  printerStatusSchema,
  printerTechnologySchema,
} from "@prient-flow/shared";
import type { Tables } from "@prient-flow/database";
import { baseApi, mapSupabaseError, supabase, toQueryError } from "@/shared/api";
import type { CreatePrinterArgs, GetPrintersArgs, Printer } from "../model/types";

type PrinterRow = Tables<"printers">;

function mapPrinter(row: PrinterRow): Printer {
  return {
    ...row,
    status: printerStatusSchema.parse(row.status),
    technology: printerTechnologySchema.parse(row.technology),
    connection_type: connectionTypeSchema.parse(row.connection_type),
  };
}

export const printerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPrinters: builder.query<Printer[], GetPrintersArgs>({
      async queryFn({ workspaceId }) {
        const { data, error } = await supabase
          .from("printers")
          .select("*")
          .eq("workspace_id", workspaceId)
          .order("name");

        if (error) {
          return { error: toQueryError(mapSupabaseError(error, "Не удалось загрузить принтеры")) };
        }

        try {
          return { data: (data ?? []).map(mapPrinter) };
        } catch {
          return { error: toQueryError("Некорректные данные принтера в ответе БД") };
        }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map((printer) => ({ type: "Printer" as const, id: printer.id })),
              { type: "Printer", id: "LIST" },
            ]
          : [{ type: "Printer", id: "LIST" }],
    }),
    createPrinter: builder.mutation<Printer, CreatePrinterArgs>({
      async queryFn({ workspaceId, input }) {
        const parsed = printerCreateSchema.safeParse(input);
        if (!parsed.success) {
          return {
            error: toQueryError(parsed.error.issues[0]?.message ?? "Проверьте поля формы"),
          };
        }

        const { data, error } = await supabase
          .from("printers")
          .insert({
            workspace_id: workspaceId,
            name: parsed.data.name,
            technology: parsed.data.technology,
            connection_type: parsed.data.connection_type,
            local_ip: parsed.data.local_ip,
            access_code: parsed.data.access_code,
            power_watts: parsed.data.power_watts,
            depreciation_per_hour: parsed.data.depreciation_per_hour,
            status: parsed.data.status,
          })
          .select("*")
          .single();

        if (error || !data) {
          return {
            error: toQueryError(
              error
                ? mapSupabaseError(error, "Не удалось добавить принтер")
                : "Не удалось добавить принтер",
            ),
          };
        }

        try {
          return { data: mapPrinter(data) };
        } catch {
          return { error: toQueryError("Некорректные данные принтера в ответе БД") };
        }
      },
      invalidatesTags: [{ type: "Printer", id: "LIST" }],
    }),
  }),
});

export const { useGetPrintersQuery, useCreatePrinterMutation } = printerApi;
