import { describe, expect, it } from "vitest";

import {
  applyInventoryDelta,
  clientCreateSchema,
  clientUpdateSchema,
  connectionTypeSchema,
  inventoryMovementSchema,
  inventoryReasonSchema,
  isMaterialLowStock,
  materialCreateSchema,
  materialTypeSchema,
  materialUpdateSchema,
  orderCreateSchema,
  orderItemCreateSchema,
  orderStatusSchema,
  orderStatusUpdateSchema,
  orderUpdateSchema,
  printJobStatusSchema,
  printerStatusSchema,
} from "./index";

describe("доменные enum-схемы (Technical Blueprint §3)", () => {
  it("printerStatusSchema: принимает все статусы принтера, отклоняет мусор", () => {
    for (const status of ["idle", "printing", "paused", "error", "offline"]) {
      expect(printerStatusSchema.parse(status)).toBe(status);
    }
    expect(printerStatusSchema.safeParse("idle ").success).toBe(false);
    expect(printerStatusSchema.safeParse("unknown").success).toBe(false);
  });

  it("connectionTypeSchema: принимает типы подключения, отклоняет опечатки", () => {
    for (const type of ["bambu_mqtt", "moonraker", "octoprint", "manual"]) {
      expect(connectionTypeSchema.parse(type)).toBe(type);
    }
    expect(connectionTypeSchema.safeParse("moonracker").success).toBe(false);
  });

  it("printJobStatusSchema: принимает статусы заданий печати", () => {
    for (const status of ["queued", "printing", "success", "failed"]) {
      expect(printJobStatusSchema.parse(status)).toBe(status);
    }
    expect(printJobStatusSchema.safeParse("done").success).toBe(false);
  });

  it("inventoryReasonSchema: принимает причины движения склада", () => {
    for (const reason of ["print_success", "print_fail", "manual_adjustment", "restock"]) {
      expect(inventoryReasonSchema.parse(reason)).toBe(reason);
    }
    expect(inventoryReasonSchema.safeParse("adjust").success).toBe(false);
  });

  it("orderStatusSchema (регрессия): 9 статусов заказа, отклоняет вне домена", () => {
    expect(orderStatusSchema.options).toHaveLength(9);
    expect(orderStatusSchema.safeParse("shipped").success).toBe(false);
  });
});

const validMaterial = {
  type: "filament",
  brand: "Bambu",
  name: "PLA Basic",
  color_hex: "#00A3E0",
  initial_amount: 1000,
  cost_per_unit: 0.04,
  low_stock_threshold: 200,
};

describe("materialCreateSchema", () => {
  it("принимает валидный филамент и нормализует пустой бренд в null", () => {
    expect(materialCreateSchema.parse(validMaterial)).toEqual(validMaterial);
    expect(materialCreateSchema.parse({ ...validMaterial, brand: "  " }).brand).toBeNull();
    expect(materialCreateSchema.parse({ ...validMaterial, color_hex: "" }).color_hex).toBeNull();
  });

  it("принимает все типы материала из домена", () => {
    for (const type of materialTypeSchema.options) {
      expect(materialCreateSchema.parse({ ...validMaterial, type }).type).toBe(type);
    }
  });

  it("отклоняет пустое имя, отрицательные количества и невалидный hex", () => {
    expect(materialCreateSchema.safeParse({ ...validMaterial, name: "  " }).success).toBe(false);
    expect(materialCreateSchema.safeParse({ ...validMaterial, initial_amount: -1 }).success).toBe(
      false,
    );
    expect(materialCreateSchema.safeParse({ ...validMaterial, cost_per_unit: -0.1 }).success).toBe(
      false,
    );
    expect(
      materialCreateSchema.safeParse({ ...validMaterial, low_stock_threshold: -5 }).success,
    ).toBe(false);
    expect(materialCreateSchema.safeParse({ ...validMaterial, color_hex: "red" }).success).toBe(
      false,
    );
    expect(materialCreateSchema.safeParse({ ...validMaterial, type: "abs" }).success).toBe(false);
  });
});

describe("materialUpdateSchema", () => {
  it("принимает частичное обновление без remaining_amount", () => {
    expect(materialUpdateSchema.parse({ name: "PETG" })).toEqual({ name: "PETG" });
    expect(materialUpdateSchema.safeParse({ remaining_amount: 10 }).success).toBe(false);
  });
});

describe("inventoryMovementSchema", () => {
  it("принимает ненулевой delta с причиной из домена", () => {
    expect(inventoryMovementSchema.parse({ delta_amount: 250, reason: "restock" })).toEqual({
      delta_amount: 250,
      reason: "restock",
    });
    expect(
      inventoryMovementSchema.parse({ delta_amount: -15, reason: "manual_adjustment" }),
    ).toEqual({
      delta_amount: -15,
      reason: "manual_adjustment",
    });
  });

  it("отклоняет нулевой delta, restock с минусом и неизвестную причину", () => {
    expect(inventoryMovementSchema.safeParse({ delta_amount: 0, reason: "restock" }).success).toBe(
      false,
    );
    expect(
      inventoryMovementSchema.safeParse({ delta_amount: -10, reason: "restock" }).success,
    ).toBe(false);
    expect(inventoryMovementSchema.safeParse({ delta_amount: 1, reason: "adjust" }).success).toBe(
      false,
    );
  });
});

describe("складские хелперы", () => {
  it("isMaterialLowStock: остаток строго меньше порога", () => {
    expect(isMaterialLowStock(199, 200)).toBe(true);
    expect(isMaterialLowStock(200, 200)).toBe(false);
    expect(isMaterialLowStock(0, 0)).toBe(false);
  });

  it("applyInventoryDelta: считает новый остаток и не даёт уйти в минус", () => {
    expect(applyInventoryDelta(100, 50)).toEqual({ ok: true, remaining: 150 });
    expect(applyInventoryDelta(100, -100)).toEqual({ ok: true, remaining: 0 });
    expect(applyInventoryDelta(10, -11)).toEqual({
      ok: false,
      message: "Остаток не может стать отрицательным",
    });
  });
});

describe("clientCreateSchema", () => {
  it("принимает имя и нормализует пустые контакты в null", () => {
    expect(
      clientCreateSchema.parse({
        name: "Иван",
        phone: "  ",
        telegram_username: "",
        telegram_chat_id: "",
      }),
    ).toEqual({
      name: "Иван",
      phone: null,
      telegram_username: null,
      telegram_chat_id: null,
    });
  });

  it("отклоняет пустое имя и нецелый telegram_chat_id", () => {
    expect(clientCreateSchema.safeParse({ name: "  " }).success).toBe(false);
    expect(clientCreateSchema.safeParse({ name: "Иван", telegram_chat_id: "12.5" }).success).toBe(
      false,
    );
  });
});

describe("clientUpdateSchema", () => {
  it("принимает частичное обновление", () => {
    expect(clientUpdateSchema.parse({ phone: "+37529" })).toEqual({ phone: "+37529" });
  });
});

describe("orderItemCreateSchema", () => {
  it("принимает позицию FDM с количеством ≥ 1", () => {
    expect(
      orderItemCreateSchema.parse({
        name: "Корпус",
        quantity: 2,
        technology: "FDM",
        material_id: null,
      }),
    ).toMatchObject({ name: "Корпус", quantity: 2, technology: "FDM", material_id: null });
  });

  it("отклоняет нулевое количество и неизвестную технологию", () => {
    expect(
      orderItemCreateSchema.safeParse({ name: "Корпус", quantity: 0, technology: "FDM" }).success,
    ).toBe(false);
    expect(
      orderItemCreateSchema.safeParse({ name: "Корпус", quantity: 1, technology: "SLS" }).success,
    ).toBe(false);
  });
});

describe("orderCreateSchema", () => {
  const item = { name: "Корпус", quantity: 1, technology: "SLA" as const };

  it("принимает заказ с клиентом, номером и хотя бы одной позицией", () => {
    const parsed = orderCreateSchema.parse({
      client_id: "11111111-1111-4111-8111-111111111111",
      order_number: "PF-1",
      items: [item],
    });
    expect(parsed.status).toBe("draft");
    expect(parsed.is_paid).toBe(false);
    expect(parsed.items).toHaveLength(1);
  });

  it("отклоняет заказ без позиций, без номера и с чужим статусом", () => {
    const base = {
      client_id: "11111111-1111-4111-8111-111111111111",
      order_number: "PF-1",
      items: [item],
    };
    expect(orderCreateSchema.safeParse({ ...base, items: [] }).success).toBe(false);
    expect(orderCreateSchema.safeParse({ ...base, order_number: "  " }).success).toBe(false);
    expect(orderCreateSchema.safeParse({ ...base, status: "shipped" }).success).toBe(false);
  });
});

describe("orderUpdateSchema и статус", () => {
  it("частично обновляет шапку заказа без смены статуса", () => {
    expect(orderUpdateSchema.parse({ is_paid: true, total_price: 120 })).toEqual({
      is_paid: true,
      total_price: 120,
    });
    expect(orderUpdateSchema.safeParse({ status: "printing" }).success).toBe(false);
  });

  it("orderStatusUpdateSchema принимает только доменные статусы", () => {
    expect(orderStatusUpdateSchema.parse({ status: "printing" })).toEqual({ status: "printing" });
    expect(orderStatusUpdateSchema.safeParse({ status: "shipped" }).success).toBe(false);
  });
});
