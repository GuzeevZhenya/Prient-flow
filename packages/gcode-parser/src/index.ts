// Парсер метаданных из .gcode и .3mf (Этап 5, спринт 5.1)
export interface GcodeMetadata {
  weightGrams: number | null;
  filamentMeters: number | null;
  printTimeSec: number | null;
  layerHeightMm: number | null;
  thumbnailBase64: string | null;
}

export function parseGcode(_content: string): GcodeMetadata {
  // TODO: реализовать на Этапе 5
  return {
    weightGrams: null,
    filamentMeters: null,
    printTimeSec: null,
    layerHeightMm: null,
    thumbnailBase64: null,
  };
}
