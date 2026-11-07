export function formatAmount(value: number): string {
  if (Number.isInteger(value)) {
    return String(value);
  }
  return value.toLocaleString("ru-RU", { maximumFractionDigits: 2 });
}
