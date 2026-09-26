import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BellIcon } from "./Icons";
import MonoLabel from "./MonoLabel";
import NotificationItem from "./NotificationItem";
import {
  NOTIFICATIONS_CHANGED,
  fetchNotifications,
  fetchUnread,
  markAllRead,
  markRead,
} from "../lib/notifications";

const POLL_MS = 45_000;
const PANEL_SIZE = 8;

// The header bell for a signed-in user: the unread count (9+), refreshed every 45 s while
// the tab is visible and whenever it regains focus; opening it shows the latest eight.
export default function NotificationBell() {
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(null);
  const root = useRef(null);

  const refresh = useCallback(() => {
    fetchUnread()
      .then((d) => d && setUnread(d.unread))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    refresh();
    const timer = setInterval(() => document.visibilityState === "visible" && refresh(), POLL_MS);
    const onVisible = () => document.visibilityState === "visible" && refresh();
    window.addEventListener("focus", refresh);
    window.addEventListener(NOTIFICATIONS_CHANGED, refresh);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", refresh);
      window.removeEventListener(NOTIFICATIONS_CHANGED, refresh);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  // Close on Escape and on a click outside the panel.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    const onClick = (e) => root.current && !root.current.contains(e.target) && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) {
      setItems(null);
      fetchNotifications(1)
        .then((d) => {
          if (!d) return;
          setItems(d.items.slice(0, PANEL_SIZE));
          setUnread(d.unread);
        })
        .catch((err) => console.error(err));
    }
  };

  const choose = (n) => {
    setOpen(false);
    if (!n.read) {
      setUnread((u) => Math.max(0, u - 1));
      markRead(n.id).catch((err) => console.error(err));
    }
    navigate(n.link);
  };

  const readAll = () => {
    setUnread(0);
    setItems((list) => list?.map((n) => ({ ...n, read: true })) ?? list);
    markAllRead().catch((err) => console.error(err));
  };

  const label = unread > 0 ? `Notifikasi, ${unread} belum dibaca` : "Notifikasi";

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-label={label}
        title="Notifikasi"
        aria-expanded={open}
        aria-haspopup="true"
        className={`relative size-11 md:size-10 flex items-center justify-center border transition-colors cursor-pointer ${
          open ? "border-forest text-forest bg-cream-hover" : "border-stone-border text-forest hover:bg-cream-hover"
        }`}
      >
        <BellIcon />
        {unread > 0 && (
          <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-live text-cream-text text-[10px] font-mono leading-none">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifikasi"
          className="fixed left-3 right-3 top-[76px] md:absolute md:left-auto md:right-0 md:top-[calc(100%+10px)] md:w-[380px] z-50 bg-paper border border-stone-border shadow-[0_18px_44px_-24px_rgba(0,0,0,0.45)]"
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-ink">
            <MonoLabel className="tracking-[0.14em] text-ink">Notifikasi</MonoLabel>
            <MonoLabel
              as="button"
              type="button"
              size="sm"
              onClick={readAll}
              disabled={unread === 0}
              className={`tracking-[0.12em] border-b transition-colors ${
                unread > 0 ? "text-gold-dark border-stone-border cursor-pointer" : "text-ink-disabled border-transparent"
              }`}
            >
              Tandai semua dibaca
            </MonoLabel>
          </div>
          <div className="max-h-[min(60vh,440px)] overflow-y-auto">
            {items === null ? (
              <p className="px-4 py-6 text-[15px] text-ink-faint">Memuat…</p>
            ) : items.length === 0 ? (
              <p className="px-4 py-6 text-[15px] text-ink-muted">Belum ada notifikasi.</p>
            ) : (
              items.map((n) => <NotificationItem key={n.id} notification={n} onChoose={choose} compact />)
            )}
          </div>
          <Link
            to="/notifikasi"
            onClick={() => setOpen(false)}
            className="block px-4 py-3 text-center font-mono text-mono-label tracking-[0.14em] uppercase text-forest hover:bg-cream-hover transition-colors"
          >
            Lihat semua
          </Link>
        </div>
      )}
    </div>
  );
}
