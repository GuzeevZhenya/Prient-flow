import {
  defaultWorkspaceSettings,
  workspaceSettingsSchema,
  type WorkspaceSettings,
} from "@prient-flow/shared";
import {
  baseApi,
  getQueryErrorMessage,
  mapSupabaseError,
  supabase,
  toQueryError,
} from "@/shared/api";
import type { Workspace } from "../model/types";

function parseWorkspace(row: {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  settings: unknown;
}): Workspace {
  const parsed = workspaceSettingsSchema.safeParse(row.settings);
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    owner_id: row.owner_id,
    settings: parsed.success ? parsed.data : defaultWorkspaceSettings,
  };
}

export const workspaceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWorkspaceByOwner: builder.query<Workspace | null, string>({
      async queryFn(ownerId) {
        const { data, error } = await supabase
          .from("workspaces")
          .select("id, name, slug, owner_id, settings")
          .eq("owner_id", ownerId)
          .limit(1)
          .maybeSingle();

        if (error) {
          return { error: toQueryError(mapSupabaseError(error, "Не удалось загрузить workspace")) };
        }
        if (!data) {
          return { data: null };
        }
        return { data: parseWorkspace(data) };
      },
      providesTags: [{ type: "Workspace", id: "CURRENT" }],
    }),
    ensureWorkspace: builder.mutation<Workspace, { ownerId: string; name: string }>({
      async queryFn({ ownerId, name }) {
        const { data: existing, error: readError } = await supabase
          .from("workspaces")
          .select("id, name, slug, owner_id, settings")
          .eq("owner_id", ownerId)
          .limit(1)
          .maybeSingle();

        if (readError) {
          return {
            error: toQueryError(mapSupabaseError(readError, "Не удалось проверить workspace")),
          };
        }
        if (existing) {
          return { data: parseWorkspace(existing) };
        }

        const slug = `ws-${ownerId.replaceAll("-", "").slice(0, 12)}`;
        const { data, error } = await supabase
          .from("workspaces")
          .insert({
            name,
            slug,
            owner_id: ownerId,
            settings: defaultWorkspaceSettings,
          })
          .select("id, name, slug, owner_id, settings")
          .single();

        if (error || !data) {
          return {
            error: toQueryError(
              error
                ? mapSupabaseError(error, "Не удалось создать workspace")
                : "Не удалось создать workspace",
            ),
          };
        }
        return { data: parseWorkspace(data) };
      },
      invalidatesTags: [{ type: "Workspace", id: "CURRENT" }],
    }),
    updateWorkspaceSettings: builder.mutation<
      WorkspaceSettings,
      { workspaceId: string; settings: WorkspaceSettings }
    >({
      async queryFn({ workspaceId, settings }) {
        const parsed = workspaceSettingsSchema.safeParse(settings);
        if (!parsed.success) {
          return {
            error: toQueryError(parsed.error.issues[0]?.message ?? "Проверьте поля формы"),
          };
        }

        const { error } = await supabase
          .from("workspaces")
          .update({ settings: parsed.data })
          .eq("id", workspaceId);

        if (error) {
          return {
            error: toQueryError(getQueryErrorMessage(error, "Не удалось сохранить настройки")),
          };
        }
        return { data: parsed.data };
      },
      invalidatesTags: [{ type: "Workspace", id: "CURRENT" }],
    }),
  }),
});

export const {
  useGetWorkspaceByOwnerQuery,
  useEnsureWorkspaceMutation,
  useUpdateWorkspaceSettingsMutation,
} = workspaceApi;
