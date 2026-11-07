import type {
  InventoryReason,
  MaterialCreateInput,
  MaterialType,
  MaterialUpdateInput,
} from "@prient-flow/shared";
import type { Tables } from "@prient-flow/database";

type MaterialRow = Tables<"materials">;

export type Material = Omit<MaterialRow, "type"> & { type: MaterialType };

export interface GetMaterialsArgs {
  workspaceId: string;
  type?: MaterialType;
}

export interface CreateMaterialArgs {
  workspaceId: string;
  input: MaterialCreateInput;
}

export interface UpdateMaterialArgs {
  id: string;
  workspaceId: string;
  input: MaterialUpdateInput;
}

export interface AdjustMaterialStockArgs {
  materialId: string;
  workspaceId: string;
  deltaAmount: number;
  reason: InventoryReason;
}
