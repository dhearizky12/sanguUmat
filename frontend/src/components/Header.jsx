import { Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { API_URL } from "../lib/api";
import { handleAvatarError } from "../lib/image";

const NAV_ITEMS = [
  { label: "Beranda", to: "/", matchPaths: ["/"] },
  {
    label: "Tanya Jawab",
    to: "/questions",
    // Covers both the "/questions" listing and everything under "/question/..."
    // (detail, create) — same menu item should read as active for all of it.
    matchPaths: ["/questions", "/question"],
  },
  { label: "Artikel", to: "/articles", matchPaths: ["/articles", "/detail-article"] },
  { label: "Ngaji Bareng", to: "/live", matchPaths: ["/live"] },
];

function isMenuActive(pathname, matchPaths) {
  return matchPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function Header() {
  const { isAuthenticated, me, profile } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [pendingAnswerCount, setPendingAnswerCount] = useState(null);
  const isAdmin = me?.role === "Admin";

  useEffect(() => {
    if (me?.role !== "Guru") {
      return;
    }

    let cancelled = false;

    const loadPendingCount = async () => {
      try {
        const listRes = await fetch(`${API_URL}/api/question?status=pending`, { credentials: "include" });
        const list = listRes.ok ? await listRes.json() : [];
        if (!cancelled) setPendingAnswerCount(list.length);
      } catch (err) {
        console.error(err);
      }
    };

    loadPendingCount();

    return () => {
      cancelled = true;
    };
  }, [me?.role]);

  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur-sm border-b border-stone-line">
      <div className="max-w-container-max mx-auto px-gutter min-h-[68px] py-2.5 flex flex-wrap items-center justify-between gap-x-5 gap-y-2">
        <Link to="/" className="flex items-center gap-2.5 shrink-0 min-w-0">
          <span className="w-6 h-6 shrink-0 bg-forest [box-shadow:inset_0_0_0_1px_#0C4A38,inset_0_0_0_3px_#FBFAF5,inset_0_0_0_4px_#B08A2E]" />
          <span className="font-serif text-xl font-medium tracking-tight text-forest">Sangu Umat</span>
        </Link>

        <nav className="hidden md:flex items-center justify-center gap-6 flex-1 label-mono">
          {NAV_ITEMS.map((item) => {
            const active = isMenuActive(location.pathname, item.matchPaths);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`pb-0.5 transition-colors ${
                  active ? "text-forest border-b-[1.5px] border-gold-deep" : "text-ink-muted hover:text-ink"
                }`}
              >
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center flex-wrap gap-4">
          {isAuthenticated && me?.role === "User" && (
            <Link
              to="/question/create"
              className="label-mono bg-forest text-cream-text px-3.5 py-2.5 whitespace-nowrap hover:bg-ink transition-colors"
            >
              Ajukan Pertanyaan
            </Link>
          )}
          {isAuthenticated && me?.role === "Guru" && (
            <Link
              to="/jawab-pertanyaan"
              title={pendingAnswerCount > 0 ? `${pendingAnswerCount} pertanyaan menunggu jawaban anda` : undefined}
              className="relative label-mono bg-gold text-forest-darker px-3.5 py-2.5 whitespace-nowrap hover:bg-cream-text transition-colors"
            >
              Jawab Pertanyaan
              {pendingAnswerCount > 0 && (
                <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-live text-cream-text text-[10px] font-mono leading-none">
                  {pendingAnswerCount}
                </span>
              )}
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin/users"
              className={`label-mono border px-3.5 py-2.5 whitespace-nowrap transition-colors ${
                isMenuActive(location.pathname, ["/admin"])
                  ? "border-forest text-forest bg-cream-hover"
                  : "border-stone-border text-ink-muted hover:bg-cream-hover"
              }`}
            >
              Panel Admin
            </Link>
          )}
          {isAuthenticated ? (
            <Link to="/profile" className="shrink-0">
              <img
                alt="Foto profil"
                className="w-9 h-9 rounded-full border border-stone-line object-cover"
                data-alt="profile picture"
                src={profile?.picture || "/default-avatar.png"}
                onError={handleAvatarError}
              />
            </Link>
          ) : (
            <>
              <Link to="/login" className="label-mono text-ink-muted hover:text-ink transition-colors">
                Masuk
              </Link>
              <Link
                to="/question/create"
                className="label-mono bg-forest text-cream-text px-3.5 py-2.5 whitespace-nowrap hover:bg-ink transition-colors"
              >
                Ajukan Pertanyaan
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Menu"
          className="md:hidden w-11 h-11 shrink-0 flex items-center justify-center border border-stone-border text-forest text-xl hover:bg-cream-hover"
        >
          {menuOpen ? "✕" : "≡"}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-stone-line">
          <div className="max-w-container-max mx-auto px-gutter pt-1.5 pb-5 flex flex-col">
            {NAV_ITEMS.map((item) => {
              const active = isMenuActive(location.pathname, item.matchPaths);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className={`label-mono py-3.5 border-b border-stone-line-soft ${active ? "text-forest" : "text-ink-muted"}`}
                >
                  {item.label}
                </NavLink>
              );
            })}

            {isAuthenticated && me?.role === "Guru" && (
              <Link
                to="/jawab-pertanyaan"
                onClick={() => setMenuOpen(false)}
                className="label-mono py-3.5 border-b border-stone-line-soft text-forest"
              >
                Jawab Pertanyaan
                {pendingAnswerCount > 0 ? ` (${pendingAnswerCount})` : ""}
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin/users"
                onClick={() => setMenuOpen(false)}
                className="label-mono py-3.5 border-b border-stone-line-soft text-forest"
              >
                Panel Admin
              </Link>
            )}

            <div className="flex flex-wrap gap-3 pt-5">
              {isAuthenticated ? (
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 min-w-[120px] text-center label-mono border border-stone-border text-forest py-3.5 hover:bg-cream-hover transition-colors"
                >
                  Profil Saya
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="flex-1 min-w-[120px] text-center label-mono border border-stone-border text-forest py-3.5 hover:bg-cream-hover transition-colors"
                  >
                    Masuk
                  </Link>
                  <Link
                    to="/question/create"
                    onClick={() => setMenuOpen(false)}
                    className="flex-1 min-w-[160px] text-center label-mono bg-forest text-cream-text py-3.5 hover:bg-ink transition-colors"
                  >
                    Ajukan Pertanyaan
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
