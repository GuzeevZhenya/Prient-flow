import type { ClientCreateInput, ClientUpdateInput } from "@prient-flow/shared";
import type { Tables } from "@prient-flow/database";

export type Client = Tables<"clients">;

export interface GetClientsArgs {
  workspaceId: string;
}

export interface CreateClientArgs {
  workspaceId: string;
  input: ClientCreateInput;
}

export interface UpdateClientArgs {
  id: string;
  workspaceId: string;
  input: ClientUpdateInput;
}

export interface DeleteClientArgs {
  id: string;
  workspaceId: string;
}
