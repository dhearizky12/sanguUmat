export function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}
