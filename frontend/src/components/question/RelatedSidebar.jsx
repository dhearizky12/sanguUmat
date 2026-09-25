import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { API_URL } from "../../lib/api";
import { formatDate } from "../../lib/date";
import Button from "../Button";
import MonoLabel from "../MonoLabel";

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
    <aside className="flex flex-col gap-8 lg:sticky lg:top-24">
      <div className="flex flex-col">
        <MonoLabel as="h2" className="tracking-[0.14em] text-ink pb-2.5 border-b border-ink">
          {isGuru ? "Jawab pertanyaan lain" : "Pertanyaan terkait"}
        </MonoLabel>
        {relatedQuestions.length === 0 ? (
          <p className="py-3.5 text-[15px] text-ink-faint">
            {isGuru ? "Tidak ada pertanyaan lain yang menunggu jawaban." : "Belum ada pertanyaan terkait."}
          </p>
        ) : (
          relatedQuestions.map((q) => (
            <NavLink
              key={q.id}
              to={`/question/detail/${q.id}`}
              className="flex flex-col gap-1 py-3.5 px-2.5 -mx-2.5 border-b border-stone-line-soft hover:bg-cream-hover transition-colors"
            >
              <span className="text-base leading-snug text-ink line-clamp-2 text-pretty">{q.title}</span>
              <MonoLabel size="xs" className="text-ink-faint">
                {formatDate(q.createdAt)}
              </MonoLabel>
            </NavLink>
          ))
        )}
      </div>

      {!isGuru && (
        <div className="bg-forest p-6 flex flex-col items-start gap-3">
          <MonoLabel className="text-gold">Punya pertanyaan lain?</MonoLabel>
          <p className="font-serif text-xl leading-snug text-cream-text text-pretty">
            Ajukan pertanyaan Anda dan dapatkan jawaban dari para ustadz.
          </p>
          <Button as={NavLink} to="/question/create" variant="gold" className="mt-1 px-5 py-3">
            Ajukan Pertanyaan
          </Button>
        </div>
      )}
    </aside>
  );
}

export default RelatedSidebar;
