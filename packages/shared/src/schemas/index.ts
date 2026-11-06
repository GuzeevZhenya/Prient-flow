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

// Статусы и типы из Technical Blueprint (§3) — единый источник значений для БД и UI.
// При изменении доменной модели править здесь и в ROADMAP синхронно.
export const printerStatusSchema = z.enum(["idle", "printing", "paused", "error", "offline"]);
export type PrinterStatus = z.infer<typeof printerStatusSchema>;

export const connectionTypeSchema = z.enum(["bambu_mqtt", "moonraker", "octoprint", "manual"]);
export type ConnectionType = z.infer<typeof connectionTypeSchema>;

export const printJobStatusSchema = z.enum(["queued", "printing", "success", "failed"]);
export type PrintJobStatus = z.infer<typeof printJobStatusSchema>;

export const inventoryReasonSchema = z.enum([
  "print_success",
  "print_fail",
  "manual_adjustment",
  "restock",
]);
export type InventoryReason = z.infer<typeof inventoryReasonSchema>;
