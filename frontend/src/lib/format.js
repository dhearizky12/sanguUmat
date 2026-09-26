// Counts as readers expect them in Bahasa Indonesia: exact up to 999, then shortened with
// a decimal comma — 1.000 → "1k", 1.030 → "1,03k", 1.100 → "1,1k", 12.345 → "12,3k",
// 1.250.000 → "1,25jt". Two decimals below 10k, one below 100k, none above.
export function formatCount(count) {
  const n = Math.max(0, Math.floor(count ?? 0));
  if (n < 1000) return String(n);

  const [value, unit] = n < 1_000_000 ? [n / 1000, "k"] : [n / 1_000_000, "jt"];
  const decimals = value < 10 ? 2 : value < 100 ? 1 : 0;
  // Truncate rather than round, so 999.999 never reads as the next unit up.
  const factor = 10 ** decimals;
  const shown = Math.floor(value * factor) / factor;
  // Drop trailing zeros only after a decimal point ("1,10" → "1,1"), never from "100".
  const text = decimals > 0 ? shown.toFixed(decimals).replace(/0+$/, "").replace(/\.$/, "") : shown.toFixed(0);
  return `${text.replace(".", ",")}${unit}`;
}
