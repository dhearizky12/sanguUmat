import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { API_URL, pictureUrl } from "../lib/api";
import { DEFAULT_AVATAR, handleAvatarError } from "../lib/image";
import Button from "./Button";
import MonoLabel from "./MonoLabel";

function CommentSection({ answerId }) {
  const { isAuthenticated, me } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch(`${API_URL}/api/answer/${answerId}/comments`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!cancelled) setComments(data);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [answerId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/answer/${answerId}/comments`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: trimmed }),
      });

      if (response.ok) {
        const created = await response.json();
        setComments((prev) => [...prev, created]);
        setDraft("");
      } else {
        alert("Gagal mengirim komentar.");
      }
    } catch (err) {
      console.error(err);
      alert("Gagal mengirim komentar.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    const confirmDelete = window.confirm("Hapus komentar ini?");
    if (!confirmDelete) return;

    const response = await fetch(`${API_URL}/api/answer/${answerId}/comments/${commentId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (response.ok) {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } else {
      alert("Gagal menghapus komentar.");
    }
  };

  return (
    <div>
      <MonoLabel as="p" className="text-ink-muted mb-3">
        {loading ? "Memuat komentar…" : `${comments.length} komentar`}
      </MonoLabel>

      {comments.length > 0 && (
        <div className="flex flex-col mb-4 border-t border-stone-line-soft">
          {comments.map((c) => (
            <div key={c.id} className="flex items-start gap-3 py-3.5 border-b border-stone-line-soft">
              <img
                alt=""
                className="size-8 rounded-full object-cover shrink-0 border border-stone-line"
                src={pictureUrl(c.userPicture) ?? DEFAULT_AVATAR}
                onError={handleAvatarError}
              />
              <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <span className="text-[15px] font-medium text-ink">{c.userName}</span>
                <p className="text-base leading-relaxed text-ink-soft text-pretty">{c.content}</p>
              </div>
              {(me?.id === c.userId || me?.role === "Admin") && (
                <MonoLabel
                  as="button"
                  type="button"
                  size="xs"
                  onClick={() => handleDelete(c.id)}
                  className="shrink-0 mt-1 text-rust hover:text-rust-deep cursor-pointer transition-colors"
                >
                  Hapus
                </MonoLabel>
              )}
            </div>
          ))}
        </div>
      )}

      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="flex items-stretch border border-stone-border bg-paper focus-within:border-forest transition-colors">
          <input
            aria-label="Tulis komentar"
            className="flex-1 min-w-0 bg-transparent px-4 h-12 text-base text-ink placeholder:text-ink-faint outline-none"
            placeholder="Tulis komentar…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <Button type="submit" disabled={submitting} className="px-5">
            Kirim
          </Button>
        </form>
      ) : (
        <p className="text-base text-ink-muted">
          <NavLink to="/login" className="text-forest border-b border-stone-border hover:text-gold-dark transition-colors">
            Masuk
          </NavLink>{" "}
          untuk menulis komentar.
        </p>
      )}
    </div>
  );
}

export default CommentSection;
