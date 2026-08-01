import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";
import { API_URL } from "../lib/api";
import { handleAvatarError } from "../lib/image";

function isMenuActive(pathname, matchPaths) {
  return matchPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function Header() {
  const { isAuthenticated, me } = useAuth();
  const location = useLocation();

  const [profile, setProfile]= useState(null);
  const [pendingAnswerCount, setPendingAnswerCount] = useState(null);
  const isAdmin = me?.role === "Admin";

  const menus = [
    {
      label: "Beranda",
      to: "/",
      matchPaths: ["/"],
    },
    {
      label: "Tanya Jawab",
      to: "/questions",
      // Covers both the "/questions" listing and everything under "/question/..."
      // (detail, create) — same menu item should read as active for all of it.
      matchPaths: ["/questions", "/question"],
    },
    {
      label: "Artikel",
      to: "/articles",
      matchPaths: ["/articles", "/detail-article"],
    },
    {
      label: "Ngaji Bareng",
      to: "/live",
      matchPaths: ["/live"],
    },
  ];

  useEffect(() => {
    if (!isAuthenticated)
    {
      return;
    }
    fetch(
        `${API_URL}/api/auth/profile`,
        {
          credentials: "include"
        }
      )
      .then(res => res.json())
      .then(data => {
        setProfile(data);
      });
  }, [isAuthenticated]);

  useEffect(() => {
    if (me?.role !== "Guru") {
      return;
    }

    let cancelled = false;

    // No "unanswered count" endpoint yet (see BE_PLAN.md) — same N+1 list-then-detail
    // pattern used in AnswerQueue.jsx, just tallied instead of listed.
    const loadPendingCount = async () => {
      try {
        const listRes = await fetch(`${API_URL}/api/question`, { credentials: "include" });
        const list = listRes.ok ? await listRes.json() : [];
        const details = await Promise.all(
          list.map((q) =>
            fetch(`${API_URL}/api/question/${q.id}`)
              .then((r) => (r.ok ? r.json() : null))
              .catch(() => null)
          )
        );
        const unanswered = details.filter((d) => d && d.answers && d.answers.length === 0).length;
        if (!cancelled) setPendingAnswerCount(unanswered);
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
    <nav className="bg-surface shadow-sm top-0 z-50 sticky">
      <div className="max-w-container-max mx-auto px-gutter flex items-center justify-between gap-4 w-full h-20">
        <div className="flex items-center gap-2 cursor-pointer shrink-0">
          <div className="rounded-lg flex items-center justify-center">
            <span>
            <img
                src="/logo.png"
                alt="Sangu Umat Logo"
                className="w-12 h-12 object-contain"
              />
            </span>
          </div>
          <span className="text-title-md font-bold text-primary-container">Sangu Umat</span>
        </div>
        <div className="hidden md:flex flex-1 justify-center items-center gap-6 h-full min-w-0">
          {menus.map((menu) => {
            const isActive = isMenuActive(location.pathname, menu.matchPaths);

            return (
              <NavLink
                key={menu.to}
                to={menu.to}
                className={`flex items-center h-full whitespace-nowrap text-primary-container text-body-md hover:text-primary-container transition-transform duration-200 active:scale-95 ${isActive && "font-bold border-b-2 border-primary-container"}`}
              >
                {menu.label}
              </NavLink>
            );
          })}
        </div>
        <div className="flex items-center gap-4 justify-end shrink-0">
          { isAuthenticated && me?.role === "User" && (
            < Link to="/question/create"
              className="bg-primary-container text-on-primary font-label-sm text-label-sm px-6 py-2.5 rounded-full hover:bg-tertiary transition-colors shadow-sm cursor-pointer text-nowrap">
            <span>Ajukan Pertanyaan</span>
            </Link>
            )}
          {isAuthenticated && me?.role === "Guru" && (
            <Link
              to="/jawab-pertanyaan"
              title={pendingAnswerCount > 0 ? `${pendingAnswerCount} pertanyaan menunggu jawaban anda` : undefined}
              className={`relative flex items-center gap-2 bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-bold px-6 py-2.5 rounded-full hover:opacity-90 transition-colors shadow-sm cursor-pointer text-nowrap`}
            >
              <span className="material-symbols-outlined text-[18px]">edit_note</span>
              <span>Jawab Pertanyaan</span>
              {pendingAnswerCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 flex items-center justify-center rounded-full bg-error text-on-error text-[11px] font-bold leading-none">
                  {pendingAnswerCount}
                </span>
              )}
            </Link>
            )}
          {isAdmin && (
            // No /admin page built yet (see BE_PLAN.md Phase 2) — show the slot so the flag
            // is verifiable, but don't link anywhere real until the page exists.
            <span
              title="Segera hadir"
              className="flex items-center gap-2 bg-surface-container-high text-outline font-label-sm text-label-sm font-bold px-6 py-2.5 rounded-full cursor-not-allowed select-none text-nowrap"
            >
              <span className="material-symbols-outlined text-[18px]">shield_person</span>
              <span>Panel Admin</span>
            </span>
          )}
          {isAuthenticated ? (
            <Link to="/profile" className="cursor-pointer">
              <img
                alt="Foto profil"
                className="w-10 h-10 rounded-full border border-outline-variant object-cover"
                data-alt="profile picture"
                src={profile?.picture ? API_URL + profile.picture : "/default-avatar.png"}
                onError={handleAvatarError}
              />
            </Link>
          ) : (
            <Link
              to="/login"
              className="hidden md:flex text-primary font-label-sm text-label-sm px-6 py-2.5 rounded-full transition-colors border border-primary cursor-pointer items-center"
            >
              <span className="material-symbols-outlined -my-3 mr-2" data-icon="login">
                login
              </span>
              <div>Masuk</div>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Header;
