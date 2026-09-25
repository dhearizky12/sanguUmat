import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { API_URL } from "../../lib/api";
import { formatDate } from "../../lib/date";

const RELATED_LIMIT = 5;

// Beside the question: related questions for a visitor, or — for a Guru — the next
// unanswered ones, plus the "ask another question" prompt for non-Guru visitors.
function RelatedSidebar({ question, isGuru }) {
  const [relatedQuestions, setRelatedQuestions] = useState([]);
  const id = question.id;

  useEffect(() => {
    let cancelled = false;

    const loadRelated = async () => {
      try {
        const res = await fetch(`${API_URL}/api/question`, { credentials: "include" });
        const list = res.ok ? await res.json() : [];
        const others = list.filter((q) => String(q.id) !== String(id));

        if (isGuru) {
          // For an ustadz, "related" isn't useful — what matters is what to answer next.
          const unanswered = others.filter((q) => !q.isAnswered);
          if (!cancelled) setRelatedQuestions(unanswered.slice(0, RELATED_LIMIT));
          return;
        }

        // Regular users: same category first, then fill the rest with the most recent other
        // questions.
        const currentCategory = question.category;
        const sameCategory = currentCategory ? others.filter((q) => q.category === currentCategory) : [];
        const rest = others.filter((q) => !sameCategory.includes(q));
        if (!cancelled) setRelatedQuestions([...sameCategory, ...rest].slice(0, RELATED_LIMIT));
      } catch (err) {
        console.error(err);
      }
    };

    loadRelated();

    return () => {
      cancelled = true;
    };
  }, [question, id, isGuru]);

  return (
    <aside className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6">
        <h3 className="font-title-md text-title-md text-on-surface mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary-container text-[20px]">{isGuru ? "task_alt" : "forum"}</span>
          {isGuru ? "Jawab Pertanyaan Lain" : "Pertanyaan Terkait"}
        </h3>
        {relatedQuestions.length === 0 ? (
          <p className="font-body-md text-body-md text-on-surface-variant">
            {isGuru ? "Tidak ada pertanyaan lain yang menunggu jawaban." : "Belum ada pertanyaan terkait."}
          </p>
        ) : (
          <div className="divide-y divide-outline-variant/50">
            {relatedQuestions.map((q) => (
              <NavLink key={q.id} to={`/question/detail/${q.id}`} className="block py-3 first:pt-0 last:pb-0 group">
                <h4 className="font-label-sm text-label-sm text-on-surface font-semibold line-clamp-2 group-hover:text-primary-container transition-colors">
                  {q.title}
                </h4>
                <p className="text-[12px] text-outline mt-1">{formatDate(q.createdAt)}</p>
              </NavLink>
            ))}
          </div>
        )}
      </div>

      {!isGuru && (
        <div className="bg-primary-container rounded-xl p-6 text-center">
          <p className="font-title-md text-title-md text-on-primary mb-2">Punya Pertanyaan Lain?</p>
          <p className="font-body-md text-body-md text-on-primary/80 mb-4">Ajukan pertanyaan anda dan dapatkan jawaban dari para ustadz.</p>
          <NavLink
            to="/question/create"
            className="inline-flex items-center gap-2 bg-surface text-primary-container font-label-sm text-label-sm px-5 py-2.5 rounded-full hover:bg-surface-container-low transition-colors font-bold"
          >
            Ajukan Pertanyaan
          </NavLink>
        </div>
      )}
    </aside>
  );
}

export default RelatedSidebar;
