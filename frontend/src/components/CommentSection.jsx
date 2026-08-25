import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { API_URL } from "../lib/api";
import { handleAvatarError } from "../lib/image";

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
      <p className="font-label-sm text-label-sm text-on-surface-variant font-semibold mb-3">
        {loading ? "Memuat komentar..." : `${comments.length} Komentar`}
      </p>

      <div className="space-y-3 mb-4">
        {comments.map((c) => (
          <div key={c.id} className="flex items-start gap-2">
            <img
              alt="Foto profil"
              className="w-8 h-8 rounded-full object-cover shrink-0"
              src={c.userPicture ? API_URL + "/" + c.userPicture : "/default-avatar.png"}
              onError={handleAvatarError}
            />
            <div className="bg-surface-container-low rounded-xl px-3 py-2 flex-1">
              <p className="font-label-sm text-label-sm text-on-surface font-semibold">{c.userName}</p>
              <p className="font-body-md text-body-md text-on-surface-variant">{c.content}</p>
            </div>
            {(me?.id === c.userId || me?.role === "Admin") && (
              <button
                onClick={() => handleDelete(c.id)}
                title="Hapus Komentar"
                className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-error hover:bg-error-container/20 transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            className="flex-1 bg-surface-container-low border border-outline-variant rounded-full px-4 py-2 font-body-md text-body-md text-on-surface outline-none focus:border-primary-container transition-colors"
            placeholder="Tulis komentar..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <button
            type="submit"
            disabled={submitting}
            className="bg-primary-container text-on-primary px-4 py-2 rounded-full font-label-sm text-label-sm hover:bg-tertiary transition-colors disabled:opacity-60"
          >
            Kirim
          </button>
        </form>
      ) : (
        <p className="font-body-md text-body-md text-on-surface-variant">
          <NavLink to="/login" className="text-primary-container font-semibold hover:underline">
            Masuk
          </NavLink>{" "}
          untuk menulis komentar.
        </p>
      )}
    </div>
  );
}

export default CommentSection;
