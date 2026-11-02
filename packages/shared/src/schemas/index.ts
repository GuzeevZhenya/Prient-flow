import { z } from "zod";

// Zod-схемы контрактов (Этап 1–2)
export const printerTechnologySchema = z.enum(["FDM", "SLA"]);

export const orderStatusSchema = z.enum([
  "draft",
  "quoted",
  "approved",
  "printing",
  "post_processing",
  "painting",
  "ready",
  "completed",
  "cancelled",
]);

export type OrderStatus = z.infer<typeof orderStatusSchema>;
