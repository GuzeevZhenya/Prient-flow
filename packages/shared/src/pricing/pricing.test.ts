import { describe, expect, it } from "vitest";

import { DEFECT_RISK } from "../constants";
import { calculateCost, calculatePrice, pricingInputSchema, type PricingInput } from "./index";

/** Базовый FDM-сценарий: 100 г × 0.05, 2 ч печати, 30 мин постобработки. */
function baseInput(overrides: Partial<PricingInput> = {}): PricingInput {
  return {
    weightGrams: 100,
    costPerGram: 0.05,
    printTimeSec: 7200,
    powerWatts: 200,
    electricityRatePerKwh: 0.25,
    depreciationPerHour: 1.5,
    postProcessingMins: 30,
    laborRatePerHour: 10,
    defectRiskFactor: DEFECT_RISK.FDM_SIMPLE,
    marginPercent: 30,
    ...overrides,
  };
}

describe("pricingInputSchema", () => {
  it("принимает валидный вход", () => {
    expect(pricingInputSchema.safeParse(baseInput()).success).toBe(true);
  });

  it("отклоняет отрицательный вес", () => {
    expect(pricingInputSchema.safeParse(baseInput({ weightGrams: -1 })).success).toBe(false);
  });

  it("отклоняет NaN", () => {
    expect(pricingInputSchema.safeParse(baseInput({ costPerGram: Number.NaN })).success).toBe(
      false,
    );
  });

  it("отклоняет defectRiskFactor < 1", () => {
    expect(pricingInputSchema.safeParse(baseInput({ defectRiskFactor: 0.9 })).success).toBe(false);
  });
});

describe("calculateCost / calculatePrice", () => {
  it("happy-path FDM с DEFECT_RISK.FDM_SIMPLE", () => {
    // material=5; electricity=0.1; depreciation=3; labor=5 → base=13.1 × 1.05 = 13.755 → 13.76
    const cost = calculateCost(baseInput());
    expect(cost).toBe(13.76);

    // price = 13.76 × 1.3 = 17.888 → 17.89
    expect(calculatePrice(baseInput())).toBe(17.89);
  });

  it("SLA с DEFECT_RISK.SLA_COMPLEX даёт большую цену при прочих равных", () => {
    const fdm = baseInput({ defectRiskFactor: DEFECT_RISK.FDM_SIMPLE });
    const sla = baseInput({ defectRiskFactor: DEFECT_RISK.SLA_COMPLEX });

    expect(calculatePrice(sla)).toBeGreaterThan(calculatePrice(fdm));
    expect(calculateCost(sla)).toBeGreaterThan(calculateCost(fdm));
  });

  it("нулевой вес → material = 0, cost > 0 при времени и труде", () => {
    const cost = calculateCost(baseInput({ weightGrams: 0 }));
    // electricity=0.1 + depreciation=3 + labor=5 = 8.1 × 1.05 = 8.505 → 8.51
    expect(cost).toBe(8.51);
    expect(cost).toBeGreaterThan(0);
  });

  it("нулевое время печати → electricity и depreciation = 0", () => {
    const cost = calculateCost(baseInput({ printTimeSec: 0 }));
    // material=5 + labor=5 = 10 × 1.05 = 10.5
    expect(cost).toBe(10.5);
  });

  it("margin 0 → price === cost; margin 100 → price === 2 × cost", () => {
    const zeroMargin = baseInput({ marginPercent: 0 });
    const costZero = calculateCost(zeroMargin);
    expect(calculatePrice(zeroMargin)).toBe(costZero);

    const fullMargin = baseInput({ marginPercent: 100 });
    const costFull = calculateCost(fullMargin);
    expect(calculatePrice(fullMargin)).toBe(roundMoneyLocal(costFull * 2));
  });

  it("отклоняет мусор на входе calculateCost", () => {
    expect(() => calculateCost(baseInput({ weightGrams: -5 }))).toThrow();
  });
});

function roundMoneyLocal(value: number): number {
  return Math.round(value * 100) / 100;
}
