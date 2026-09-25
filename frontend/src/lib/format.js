export function formatCount(count) {
  const n = count ?? 0;
  return n > 99 ? "99+" : n;
}
