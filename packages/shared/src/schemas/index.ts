import { z } from "zod";

// Zod-схемы контрактов (Этап 1–2)
export const printerTechnologySchema = z.enum(["FDM", "SLA"]);
export type PrinterTechnology = z.infer<typeof printerTechnologySchema>;

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

// Вход в админку (email/password, Спринт 2.1)
export const loginCredentialsSchema = z.object({
  email: z.string().trim().email("Введите корректный email"),
  password: z.string().min(6, "Пароль — минимум 6 символов"),
});
export type LoginCredentials = z.infer<typeof loginCredentialsSchema>;

// Тарифы мастерской — содержимое колонки workspaces.settings (jsonb)
export const workspaceSettingsSchema = z.object({
  currency: z.enum(["BYN", "RUB", "USD", "EUR"]),
  electricityRatePerKwh: z.coerce.number().nonnegative("Тариф не может быть отрицательным"),
  laborRatePerHour: z.coerce.number().nonnegative("Тариф не может быть отрицательным"),
  marginPercent: z.coerce
    .number()
    .min(0, "Маржа не может быть отрицательной")
    .max(1000, "Маржа выше 1000% выглядит как ошибка"),
});
export type WorkspaceSettings = z.infer<typeof workspaceSettingsSchema>;

export const defaultWorkspaceSettings: WorkspaceSettings = {
  currency: "BYN",
  electricityRatePerKwh: 0.25,
  laborRatePerHour: 10,
  marginPercent: 30,
};

export const materialTypeSchema = z.enum(["filament", "resin", "paint", "primer", "consumable"]);
export type MaterialType = z.infer<typeof materialTypeSchema>;

const optionalBrandSchema = z
  .string()
  .optional()
  .nullable()
  .transform((value) => {
    if (value == null) return null;
    const trimmed = value.trim();
    return trimmed.length === 0 ? null : trimmed;
  });

const optionalColorHexSchema = z
  .string()
  .optional()
  .nullable()
  .transform((value) => {
    if (value == null) return null;
    const trimmed = value.trim();
    return trimmed.length === 0 ? null : trimmed;
  })
  .refine((value) => value === null || /^#[0-9A-Fa-f]{6}$/.test(value), {
    message: "Цвет — в формате #RRGGBB",
  });

const materialFieldsSchema = z.object({
  type: materialTypeSchema,
  brand: optionalBrandSchema,
  name: z.string().trim().min(1, "Укажите название"),
  color_hex: optionalColorHexSchema,
  initial_amount: z.coerce.number().nonnegative("Количество не может быть отрицательным"),
  cost_per_unit: z.coerce.number().nonnegative("Цена не может быть отрицательной"),
  low_stock_threshold: z.coerce.number().nonnegative("Порог не может быть отрицательным"),
});

export const materialCreateSchema = materialFieldsSchema;
export type MaterialCreateInput = z.infer<typeof materialCreateSchema>;

export const materialUpdateSchema = materialFieldsSchema
  .omit({ initial_amount: true })
  .partial()
  .strict();
export type MaterialUpdateInput = z.infer<typeof materialUpdateSchema>;

export const inventoryMovementSchema = z
  .object({
    delta_amount: z.coerce
      .number()
      .refine((value) => value !== 0, "Количество не может быть нулевым"),
    reason: inventoryReasonSchema,
  })
  .superRefine((value, ctx) => {
    if (value.reason === "restock" && value.delta_amount <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Пополнение должно быть больше нуля",
        path: ["delta_amount"],
      });
    }
  });
export type InventoryMovement = z.infer<typeof inventoryMovementSchema>;

export function isMaterialLowStock(remainingAmount: number, lowStockThreshold: number): boolean {
  return remainingAmount < lowStockThreshold;
}

export type InventoryDeltaResult = { ok: true; remaining: number } | { ok: false; message: string };

export function applyInventoryDelta(
  remainingAmount: number,
  deltaAmount: number,
): InventoryDeltaResult {
  const remaining = remainingAmount + deltaAmount;
  if (remaining < 0) {
    return { ok: false, message: "Остаток не может стать отрицательным" };
  }
  return { ok: true, remaining };
}

const optionalTextSchema = z
  .string()
  .optional()
  .nullable()
  .transform((value) => {
    if (value == null) return null;
    const trimmed = value.trim();
    return trimmed.length === 0 ? null : trimmed;
  });

const optionalTelegramChatIdSchema = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .transform((value) => {
    if (value == null) return null;
    if (typeof value === "string" && value.trim() === "") return null;
    return typeof value === "number" ? value : Number(value);
  })
  .refine((value) => value === null || (Number.isFinite(value) && Number.isInteger(value)), {
    message: "Telegram chat id — целое число",
  });

const optionalMoneySchema = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .transform((value) => {
    if (value == null || value === "") return null;
    return typeof value === "number" ? value : Number(value);
  })
  .refine((value) => value === null || (Number.isFinite(value) && value >= 0), {
    message: "Сумма не может быть отрицательной",
  });

const optionalUuidSchema = z
  .string()
  .optional()
  .nullable()
  .transform((value) => {
    if (value == null || value.trim() === "") return null;
    return value;
  })
  .refine((value) => value === null || z.string().uuid().safeParse(value).success, {
    message: "Некорректный идентификатор",
  });

const optionalNonNegativeIntSchema = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .transform((value) => {
    if (value == null || value === "") return null;
    return typeof value === "number" ? value : Number(value);
  })
  .refine((value) => value === null || (Number.isInteger(value) && value >= 0), {
    message: "Укажите целое неотрицательное число",
  });

const clientFieldsSchema = z.object({
  name: z.string().trim().min(1, "Укажите имя клиента"),
  phone: optionalTextSchema,
  telegram_username: optionalTextSchema,
  telegram_chat_id: optionalTelegramChatIdSchema,
});

export const clientCreateSchema = clientFieldsSchema;
export type ClientCreateInput = z.infer<typeof clientCreateSchema>;

export const clientUpdateSchema = clientFieldsSchema.partial().strict();
export type ClientUpdateInput = z.infer<typeof clientUpdateSchema>;

export const orderItemCreateSchema = z.object({
  name: z.string().trim().min(1, "Укажите название позиции"),
  quantity: z.coerce.number().int().positive("Количество — целое больше нуля"),
  technology: printerTechnologySchema,
  material_id: optionalUuidSchema,
  estimated_weight_g: optionalMoneySchema,
  estimated_time_sec: optionalNonNegativeIntSchema,
  post_processing_mins: optionalNonNegativeIntSchema,
});
export type OrderItemCreateInput = z.infer<typeof orderItemCreateSchema>;

export const orderItemUpdateSchema = orderItemCreateSchema.partial().strict();
export type OrderItemUpdateInput = z.infer<typeof orderItemUpdateSchema>;

export const orderCreateSchema = z.object({
  client_id: z.string().uuid("Выберите клиента"),
  order_number: z.string().trim().min(1, "Укажите номер заказа"),
  status: orderStatusSchema.default("draft"),
  total_price: optionalMoneySchema,
  calculated_cost: optionalMoneySchema,
  is_paid: z.boolean().default(false),
  items: z.array(orderItemCreateSchema).min(1, "Нужна хотя бы одна позиция"),
});
export type OrderCreateInput = z.infer<typeof orderCreateSchema>;

export const orderUpdateSchema = orderCreateSchema
  .omit({ status: true, items: true })
  .partial()
  .strict();
export type OrderUpdateInput = z.infer<typeof orderUpdateSchema>;

export const orderStatusUpdateSchema = z
  .object({
    status: orderStatusSchema,
  })
  .strict();
export type OrderStatusUpdateInput = z.infer<typeof orderStatusUpdateSchema>;
