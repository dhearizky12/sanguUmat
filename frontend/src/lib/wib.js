// Kajian times are stored in UTC and always shown in WIB (Asia/Jakarta, UTC+7 all year,
// no daylight saving), whatever the viewer's own time zone.
const TZ = "Asia/Jakarta";
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

const dayFmt = new Intl.DateTimeFormat("id-ID", { timeZone: TZ, weekday: "long" });
const dateFmt = new Intl.DateTimeFormat("id-ID", { timeZone: TZ, day: "numeric", month: "short" });
const fullDateFmt = new Intl.DateTimeFormat("id-ID", { timeZone: TZ, day: "numeric", month: "short", year: "numeric" });
const timeFmt = new Intl.DateTimeFormat("id-ID", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false });

export const wibDay = (iso) => dayFmt.format(new Date(iso));

// The WIB calendar date as a day number, so two moments can be compared by date.
export const wibDateKey = (value) => Math.floor((new Date(value).getTime() + WIB_OFFSET_MS) / 86_400_000);

// "hari ini", "kemarin", "3 hari lalu" by WIB calendar date.
export function daysAgoLabel(iso, now = Date.now()) {
  const days = wibDateKey(now) - wibDateKey(iso);
  if (days <= 0) return "hari ini";
  if (days === 1) return "kemarin";
  return `${days} hari lalu`;
}
export const wibDate = (iso) => dateFmt.format(new Date(iso));
export const wibFullDate = (iso) => fullDateFmt.format(new Date(iso));
// "19.30", the Indonesian way of writing times.
export const wibTime = (iso) => timeFmt.format(new Date(iso)).replace(":", ".");

// For <input type="datetime-local">, read and written as WIB.
export function toWibInput(iso) {
  if (!iso) return "";
  return new Date(new Date(iso).getTime() + WIB_OFFSET_MS).toISOString().slice(0, 16);
}

export function fromWibInput(value) {
  if (!value) return null;
  const utc = Date.parse(`${value}:00Z`) - WIB_OFFSET_MS;
  return Number.isNaN(utc) ? null : new Date(utc).toISOString();
}

// "45 m", "1 j", "1 j 15 m" — the canvas's compact duration on thumbnails.
export function shortDuration(minutes) {
  if (minutes < 60) return `${minutes} m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} j` : `${h} j ${m} m`;
}

// A Google Calendar "add event" link for a kajian, standing in for reminders.
export function calendarLink(kajian, pageUrl) {
  const stamp = (iso) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${kajian.title} — Ngaji Bareng`,
    dates: `${stamp(kajian.startsAt)}/${stamp(kajian.endsAt)}`,
    details: `${kajian.ustadz?.name ?? ""} · Seri ${kajian.series}\n${pageUrl}`,
    ctz: TZ,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}
