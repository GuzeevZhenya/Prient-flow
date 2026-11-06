import { z } from "zod";

/** Округление денежных значений до копеек / центов. */
function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Вход калькулятора. Имена тарифов совпадают с `workspaceSettingsSchema`,
 * чтобы UI мог маппить настройки workspace без синонимов.
 */
export const pricingInputSchema = z.object({
  weightGrams: z.number().nonnegative(),
  costPerGram: z.number().nonnegative(),
  printTimeSec: z.number().nonnegative(),
  powerWatts: z.number().nonnegative(),
  electricityRatePerKwh: z.number().nonnegative(),
  depreciationPerHour: z.number().nonnegative(),
  postProcessingMins: z.number().nonnegative(),
  laborRatePerHour: z.number().nonnegative(),
  /** Коэффициент риска брака; дефолты из DEFECT_RISK ≥ 1.05. */
  defectRiskFactor: z.number().min(1),
  marginPercent: z.number().nonnegative(),
});

export type PricingInput = z.infer<typeof pricingInputSchema>;

function parsePricingInput(input: PricingInput): PricingInput {
  return pricingInputSchema.parse(input);
}

/**
 * Себестоимость с учётом брака:
 * (material + electricity + depreciation + labor) × defectRiskFactor
 */
export function calculateCost(input: PricingInput): number {
  const parsed = parsePricingInput(input);

  const hours = parsed.printTimeSec / 3600;

  const material = parsed.weightGrams * parsed.costPerGram;
  const electricity = (parsed.powerWatts / 1000) * hours * parsed.electricityRatePerKwh;
  const depreciation = parsed.depreciationPerHour * hours;
  const labor = parsed.laborRatePerHour * (parsed.postProcessingMins / 60);

  const baseCost = material + electricity + depreciation + labor;
  return roundMoney(baseCost * parsed.defectRiskFactor);
}

/**
 * Цена для клиента: себестоимость × (1 + marginPercent / 100).
 */
export function calculatePrice(input: PricingInput): number {
  const parsed = parsePricingInput(input);
  const cost = calculateCost(parsed);
  return roundMoney(cost * (1 + parsed.marginPercent / 100));
}
