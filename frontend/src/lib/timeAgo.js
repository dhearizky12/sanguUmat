import { formatDate } from "./date";
import { wibDateKey } from "./wib";

// "baru saja", "5 menit lalu", "3 jam lalu", "kemarin", "4 hari lalu", then the date.
export function timeAgo(iso, now = Date.now()) {
  const seconds = Math.max(0, (now - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "baru saja";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} menit lalu`;
  const days = wibDateKey(now) - wibDateKey(iso);
  if (days === 0) return `${Math.floor(seconds / 3600)} jam lalu`;
  if (days === 1) return "kemarin";
  if (days < 7) return `${days} hari lalu`;
  return formatDate(iso);
}
