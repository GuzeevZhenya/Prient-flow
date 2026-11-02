// Математическое ядро расчёта себестоимости и цены (Этап 2, спринт 2.2)
export interface PricingInput {
  weightGrams: number;
  costPerGram: number;
  printTimeSec: number;
  powerWatts: number;
  electricityPricePerKwh: number;
  depreciationPerHour: number;
  postProcessingMins: number;
  masterHourlyRate: number;
  defectRiskFactor: number;
  marginPercent: number;
}

export function calculateCost(input: PricingInput): number {
  // TODO: реализовать на Этапе 2
  void input;
  return 0;
}
