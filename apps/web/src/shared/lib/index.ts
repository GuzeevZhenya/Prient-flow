export function formatMoney(value: number | null | undefined): string {
  if (value == null) return "—";
  if (Number.isInteger(value)) return String(value);
  return value.toLocaleString("ru-RU", { maximumFractionDigits: 2 });
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("ru-RU");
}
