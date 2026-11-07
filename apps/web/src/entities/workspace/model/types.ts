import type { WorkspaceSettings } from "@prient-flow/shared";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  settings: WorkspaceSettings;
}
