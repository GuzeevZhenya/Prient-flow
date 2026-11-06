import { describe, expect, it } from "vitest";

import {
  connectionTypeSchema,
  inventoryReasonSchema,
  orderStatusSchema,
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
