// Константы статусов и дефолтные коэффициенты (Этап 1–2)
export const DEFECT_RISK = {
  FDM_SIMPLE: 1.05,
  SLA_COMPLEX: 1.15,
} as const;

export const MATERIAL_TYPES = ["filament", "resin", "paint", "primer", "consumable"] as const;
