import { timeAgo } from "../lib/timeAgo";

// One notification line: an unread dot, its text and how long ago. The caller decides what
// choosing it does (mark read, then go to its link).
export default function NotificationItem({ notification, onChoose, compact = false }) {
  const unread = !notification.read;
  return (
    <button
      type="button"
      onClick={() => onChoose(notification)}
      className={`w-full flex items-start gap-3 text-left border-b border-stone-line-soft cursor-pointer transition-colors hover:bg-cream-hover ${
        compact ? "px-4 py-3" : "px-[clamp(12px,3vw,18px)] py-4"
      } ${unread ? "bg-gold-tint/40" : ""}`}
    >
      <span
        aria-hidden="true"
        className={`shrink-0 mt-[7px] size-2 rounded-full ${unread ? "bg-gold-deep" : "bg-transparent"}`}
      />
      <span className="flex-1 min-w-0 flex flex-col gap-1">
        <span className={`${compact ? "text-[15px]" : "text-base"} leading-snug text-pretty ${unread ? "text-ink" : "text-ink-soft"}`}>
          {notification.text}
        </span>
        <span className="font-mono text-mono-label-xs tracking-[0.06em] text-ink-faint">
          {timeAgo(notification.createdAt)}
          {unread && <span className="sr-only"> · belum dibaca</span>}
        </span>
      </span>
    </button>
  );
}
