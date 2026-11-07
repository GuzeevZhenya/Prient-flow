import type { MaterialType } from "@prient-flow/shared";

export const MATERIAL_TYPE_LABELS: Record<MaterialType, string> = {
  filament: "Филамент",
  resin: "Смола",
  paint: "Краска",
  primer: "Грунт",
  consumable: "Расходник",
};

export const MATERIAL_TYPE_UNITS: Record<MaterialType, string> = {
  filament: "г",
  resin: "мл",
  paint: "мл",
  primer: "мл",
  consumable: "шт",
};
