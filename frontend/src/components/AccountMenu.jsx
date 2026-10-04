import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Avatar from "./Avatar";
import MonoLabel from "./MonoLabel";

// The menu on a signed-in visitor's avatar (specs/site-header): the header actions that did not
// fit in the bar, then "Profil saya" and "Keluar". `items` are { key, label, to, count? };
// `badge` is the pending-answers count shown on the avatar when "Jawab Pertanyaan" is in here.
export default function AccountMenu({ items = [], badge = 0 }) {
  const { profile, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  const trigger = useRef(null);

  // Close on Escape (returning focus to the avatar) and on a click outside.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      trigger.current?.focus();
    };
    const onClick = (e) => root.current && !root.current.contains(e.target) && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  const item = "flex items-center justify-between gap-3 px-4 py-3 text-left w-full hover:bg-cream-hover transition-colors cursor-pointer";

  return (
    <div ref={root} className="relative shrink-0">
      <button
        ref={trigger}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={badge > 0 ? `Menu akun, ${badge} pertanyaan menunggu jawaban` : "Menu akun"}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`relative block rounded-full cursor-pointer outline-offset-2 ${open ? "ring-2 ring-forest" : ""}`}
      >
        <Avatar src={profile?.picture} name={profile?.name} size={36} />
        {badge > 0 && (
          <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-live text-cream-text text-[10px] font-mono leading-none">
            {badge}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Menu akun"
          className="absolute right-0 top-[calc(100%+10px)] w-[240px] max-w-[calc(100vw-24px)] z-50 bg-paper border border-stone-border shadow-[0_18px_44px_-24px_rgba(0,0,0,0.45)] flex flex-col"
        >
          {items.map((a) => (
            <MonoLabel
              key={a.key}
              as={Link}
              to={a.to}
              role="menuitem"
              onClick={() => setOpen(false)}
              className={`${item} text-ink border-b border-stone-line-soft`}
            >
              <span>{a.label}</span>
              {a.count > 0 && (
                <span className="min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-live text-cream-text text-[10px] font-mono leading-none">
                  {a.count}
                </span>
              )}
            </MonoLabel>
          ))}
          <MonoLabel as={Link} to="/profile" role="menuitem" onClick={() => setOpen(false)} className={`${item} text-ink border-b border-stone-line-soft`}>
            Profil saya
          </MonoLabel>
          <MonoLabel
            as="button"
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className={`${item} text-ink-muted`}
          >
            Keluar
          </MonoLabel>
        </div>
      )}
    </div>
  );
}
