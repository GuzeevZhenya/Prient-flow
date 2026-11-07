import {
  connectionTypeSchema,
  inventoryReasonSchema,
  materialTypeSchema,
  orderStatusSchema,
  printJobStatusSchema,
  printerStatusSchema,
  printerTechnologySchema,
} from "../schemas";

// Константы статусов и дефолтные коэффициенты (Этап 1–2).
// Enum-значения — re-export из Zod-схем (единый источник, без дублирования литералов).

export const DEFECT_RISK = {
  FDM_SIMPLE: 1.05,
  SLA_COMPLEX: 1.15,
} as const;

export const MATERIAL_TYPES = materialTypeSchema.options;

export const ORDER_STATUSES = orderStatusSchema.options;
export const PRINTER_STATUSES = printerStatusSchema.options;
export const CONNECTION_TYPES = connectionTypeSchema.options;
export const PRINT_JOB_STATUSES = printJobStatusSchema.options;
export const INVENTORY_REASONS = inventoryReasonSchema.options;
export const PRINTER_TECHNOLOGIES = printerTechnologySchema.options;
