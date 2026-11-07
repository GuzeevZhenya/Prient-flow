import type { ConnectionType, PrinterStatus, PrinterTechnology } from "@prient-flow/shared";

export const PRINTER_STATUS_LABELS: Record<PrinterStatus, string> = {
  idle: "Свободен",
  printing: "Печатает",
  paused: "Пауза",
  error: "Ошибка",
  offline: "Офлайн",
};

export const CONNECTION_TYPE_LABELS: Record<ConnectionType, string> = {
  bambu_mqtt: "Bambu MQTT",
  moonraker: "Moonraker",
  octoprint: "OctoPrint",
  manual: "Вручную",
};

export const PRINTER_TECHNOLOGY_LABELS: Record<PrinterTechnology, string> = {
  FDM: "FDM",
  SLA: "SLA",
};
