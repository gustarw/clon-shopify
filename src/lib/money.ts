const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/** Formats integer cents as BRL currency. */
export function money(cents: number): string {
  return brl.format((cents || 0) / 100);
}

/** Parses a user input like "1.234,56" or "1234.56" into integer cents. */
export function parseMoney(input: string): number {
  const cleaned = String(input).replace(/[^\d.,-]/g, "");
  const normalized = cleaned.includes(",")
    ? cleaned.replace(/\./g, "").replace(",", ".")
    : cleaned;
  const value = Number(normalized);
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100);
}

/** Formats a compact revenue figure, e.g. R$ 12,4 mil */
export function moneyCompact(cents: number): string {
  const value = (cents || 0) / 100;
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1).replace(".", ",")} mi`;
  if (value >= 1_000) return `R$ ${(value / 1_000).toFixed(1).replace(".", ",")} mil`;
  return brl.format(value);
}
