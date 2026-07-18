import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { handleAvatarError } from "../lib/image";

// Mock only — there is no Comment model/endpoint on the backend yet (see BE_PLAN.md).
// Comments typed here live in local component state, so they demo the intended UX but do not
// persist past a page reload.
const SEED_COMMENTS = [
  { id: "seed-1", name: "Budi Santoso", text: "Jazakallah khair atas penjelasannya, sangat membantu.", picture: null },
  { id: "seed-2", name: "Siti Aminah", text: "Izin bertanya, apakah hukumnya sama untuk kondisi yang berbeda?", picture: null },
];

function CommentSection() {
  const { isAuthenticated, me, profile } = useAuth();
  const [comments, setComments] = useState(SEED_COMMENTS);
  const [draft, setDraft] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) {
      return;
    }

    setComments((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        name: me?.name || "Anda",
        text: trimmed,
        picture: profile?.picture,
      },
    ]);
    setDraft("");
  };

  return (
    <div>
      <p className="font-label-sm text-label-sm text-on-surface-variant font-semibold mb-3">{comments.length} Komentar</p>

      <div className="space-y-3 mb-4">
        {comments.map((c) => (
          <div key={c.id} className="flex items-start gap-2">
            <img
              alt="Foto profil"
              className="w-8 h-8 rounded-full object-cover shrink-0"
              src={c.picture || "/default-avatar.png"}
              onError={handleAvatarError}
            />
            <div className="bg-surface-container-low rounded-xl px-3 py-2 flex-1">
              <p className="font-label-sm text-label-sm text-on-surface font-semibold">{c.name}</p>
              <p className="font-body-md text-body-md text-on-surface-variant">{c.text}</p>
            </div>
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
            className="bg-primary-container text-on-primary px-4 py-2 rounded-full font-label-sm text-label-sm hover:bg-tertiary transition-colors"
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
