import type { OrderStatus, PrinterTechnology } from "@prient-flow/shared";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  draft: "Черновик",
  quoted: "Просчёт",
  approved: "Согласован",
  printing: "Печать",
  post_processing: "Постобработка",
  painting: "Покраска",
  ready: "Готов",
  completed: "Выдан",
  cancelled: "Отменён",
};

export const KANBAN_STATUSES: OrderStatus[] = [
  "draft",
  "quoted",
  "approved",
  "printing",
  "post_processing",
  "painting",
  "ready",
  "completed",
  "cancelled",
];

export const TECHNOLOGY_LABELS: Record<PrinterTechnology, string> = {
  FDM: "FDM",
  SLA: "SLA",
};
