export function parseAmount(input: string | number): number {
  if (typeof input === "number") return input;
  if (!input) return 0;
  const cleaned = input.replace(/[\s ,]/g, "").replace(",", ".");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}
