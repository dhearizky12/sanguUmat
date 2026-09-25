import { NavLink } from "react-router-dom";
import EmptyState from "../EmptyState";
import LoadingState from "../LoadingState";
import MonoLabel from "../MonoLabel";
import { categoryLabel, useCategories } from "../../lib/category";
import { formatDate } from "../../lib/date";

// Answered reads like the canvas's "Sudah dijawab" badge, waiting like "Menunggu tinjauan".
function StatusBadge({ answered }) {
  return (
    <MonoLabel
      size="sm"
      className={`px-2 py-1 border ${
        answered ? "bg-forest border-forest text-cream-text" : "bg-gold-tint border-gold-line text-gold-ink"
      }`}
    >
      {answered ? "Sudah dijawab" : "Menunggu jawaban"}
    </MonoLabel>
  );
}

// "Pertanyaan saya" under the form: everything the signed-in user has asked, newest first.
function MyQuestions({ questions, loading }) {
  const categories = useCategories();
  const answered = questions.filter((q) => q.isAnswered).length;

  return (
    <section id="riwayat" className="scroll-mt-24">
      <div className="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-2.5">
        <h2 className="text-[clamp(24px,3vw,32px)] font-normal tracking-[-0.015em]">Pertanyaan saya</h2>
        {!loading && (
          <MonoLabel className="text-ink-muted">
            {questions.length} pertanyaan &middot; {answered} sudah dijawab
          </MonoLabel>
        )}
      </div>

      {loading ? (
        <LoadingState message="Memuat pertanyaan Anda…" />
      ) : questions.length === 0 ? (
        <EmptyState
          className="mt-6"
          title="Belum ada pertanyaan."
          message="Pertanyaan yang Anda ajukan akan tampil di sini, lengkap dengan status jawabannya."
        />
      ) : (
        <div className="flex flex-col border-t border-ink mt-4">
          {questions.map((q) => (
            <NavLink
              key={q.id}
              to={`/question/detail/${q.id}`}
              className="flex flex-col gap-2.5 py-5 px-[clamp(12px,3vw,18px)] border-b border-stone-line hover:bg-cream-warm transition-colors"
            >
              <MonoLabel as="span" size="sm" className="flex flex-wrap items-center gap-x-3.5 gap-y-2">
                <StatusBadge answered={q.isAnswered} />
                <span className="text-forest">{categoryLabel(categories, q.category)}</span>
                <span className="text-ink-faint">{formatDate(q.createdAt)}</span>
              </MonoLabel>
              <span className="text-[clamp(18px,2.1vw,22px)] leading-[1.3] tracking-[-0.01em] text-ink text-pretty">{q.title}</span>
              <span className="text-base leading-relaxed text-ink-soft max-w-[72ch] line-clamp-2 text-pretty">{q.content}</span>
            </NavLink>
          ))}
        </div>
      )}
    </section>
  );
}

export default MyQuestions;
