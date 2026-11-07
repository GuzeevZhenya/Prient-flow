import { clientCreateSchema, clientUpdateSchema } from "@prient-flow/shared";
import { baseApi, supabase, toQueryError } from "@/shared/api";
import type {
  Client,
  CreateClientArgs,
  DeleteClientArgs,
  GetClientsArgs,
  UpdateClientArgs,
} from "../model/types";

export const clientApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getClients: builder.query<Client[], GetClientsArgs>({
      async queryFn({ workspaceId }) {
        const { data, error } = await supabase
          .from("clients")
          .select("*")
          .eq("workspace_id", workspaceId)
          .order("name");

        if (error) {
          return { error: toQueryError("Не удалось загрузить клиентов") };
        }
        return { data: data ?? [] };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map((client) => ({ type: "Client" as const, id: client.id })),
              { type: "Client", id: "LIST" },
            ]
          : [{ type: "Client", id: "LIST" }],
    }),
    createClient: builder.mutation<Client, CreateClientArgs>({
      async queryFn({ workspaceId, input }) {
        const parsed = clientCreateSchema.safeParse(input);
        if (!parsed.success) {
          return {
            error: toQueryError(parsed.error.issues[0]?.message ?? "Проверьте поля формы"),
          };
        }

        const { data, error } = await supabase
          .from("clients")
          .insert({
            workspace_id: workspaceId,
            name: parsed.data.name,
            phone: parsed.data.phone,
            telegram_username: parsed.data.telegram_username,
            telegram_chat_id: parsed.data.telegram_chat_id,
          })
          .select("*")
          .single();

        if (error || !data) {
          return { error: toQueryError("Не удалось добавить клиента") };
        }
        return { data };
      },
      invalidatesTags: [{ type: "Client", id: "LIST" }],
    }),
    updateClient: builder.mutation<Client, UpdateClientArgs>({
      async queryFn({ id, workspaceId, input }) {
        const parsed = clientUpdateSchema.safeParse(input);
        if (!parsed.success) {
          return {
            error: toQueryError(parsed.error.issues[0]?.message ?? "Проверьте поля формы"),
          };
        }

        const { data, error } = await supabase
          .from("clients")
          .update(parsed.data)
          .eq("id", id)
          .eq("workspace_id", workspaceId)
          .select("*")
          .single();

        if (error || !data) {
          return { error: toQueryError("Не удалось сохранить клиента") };
        }
        return { data };
      },
      invalidatesTags: (_result, _error, arg) => [
        { type: "Client", id: arg.id },
        { type: "Client", id: "LIST" },
      ],
    }),
    deleteClient: builder.mutation<{ id: string }, DeleteClientArgs>({
      async queryFn({ id, workspaceId }) {
        const { error } = await supabase
          .from("clients")
          .delete()
          .eq("id", id)
          .eq("workspace_id", workspaceId);

        if (error) {
          return {
            error: toQueryError("Не удалось удалить клиента. Возможно, на него ссылаются заказы."),
          };
        }
        return { data: { id } };
      },
      invalidatesTags: [{ type: "Client", id: "LIST" }],
    }),
  }),
});

export const {
  useGetClientsQuery,
  useCreateClientMutation,
  useUpdateClientMutation,
  useDeleteClientMutation,
} = clientApi;
