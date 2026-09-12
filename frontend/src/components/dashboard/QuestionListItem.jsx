import { NavLink } from "react-router-dom";
import { formatDate } from "../../lib/date";
import { formatCount } from "../../lib/format";
import { categoryLabel } from "../../lib/category";

function getFeaturedAnswer(question) {
  return question.answers.find((a) => a.role === "Guru") ?? question.answers[0];
}

function VerifiedBadge() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" className="shrink-0">
      <path
        d="M12 1.6l2.47 1.79 3.03-.28 1.15 2.82 2.6 1.6-.6 2.99.98 2.9-2.35 1.94-.78 2.95-3.05.28L12 22.4l-2.45-1.81-3.05-.28-.78-2.95L3.37 15.4l.98-2.9-.6-2.99 2.6-1.6L7.5 5.09l3.03.28L12 1.6z"
        fill="#0C4A38"
      />
      <path
        d="M8.2 12.3l2.6 2.6 5-5.2"
        fill="none"
        stroke="#FBFAF5"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function QuestionListItem({ question }) {
  const answer = getFeaturedAnswer(question);

  return (
    <NavLink
      to={`/question/detail/${question.id}`}
      className="flex flex-col gap-2.5 py-6 md:pl-4 border-b border-stone-line border-l-2 border-l-transparent hover:bg-cream-hover hover:border-l-gold-deep transition-colors"
    >
      <div className="flex flex-wrap items-baseline gap-x-3.5 gap-y-1.5 label-mono">
        <span className="text-forest">{categoryLabel(question.category)}</span>
        <span className="text-ink-faint">{formatDate(question.createdAt)}</span>
        <span className="text-ink-faint">{formatCount(question.views)} dibaca</span>
      </div>

      <h3 className="font-serif text-xl md:text-2xl font-normal leading-snug tracking-tight text-ink max-w-[40ch] text-pretty">
        {question.title}
      </h3>

      {answer && <p className="text-base leading-relaxed text-ink-soft max-w-[74ch] text-pretty line-clamp-2">{answer.content}</p>}

      {answer && (
        <div className="flex items-center flex-wrap gap-x-2 gap-y-1 label-mono tracking-normal text-ink-muted">
          <span>Dijawab oleh</span>
          <span className="inline-flex items-center gap-1.5 text-forest">
            {answer.role === "Guru" && <VerifiedBadge />}
            {answer.userName}
          </span>
        </div>
      )}
    </NavLink>
  );
}

export default QuestionListItem;
