export function generateOrderNumber(): string {
  const stamp = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const suffix = String(Math.floor(Math.random() * 900 + 100));
  return `PF-${stamp}-${suffix}`;
}
