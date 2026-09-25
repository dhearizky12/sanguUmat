import { NavLink } from "react-router-dom";
import { formatDate } from "../../lib/date";
import { formatCount } from "../../lib/format";
import { categoryLabel } from "../../lib/category";
import MonoLabel from "../MonoLabel";
import VerifiedBadge from "../VerifiedBadge";

function getFeaturedAnswer(question) {
  return question.answers.find((a) => a.role === "Guru") ?? question.answers[0];
}

function QuestionListItem({ question }) {
  const answer = getFeaturedAnswer(question);

  return (
    <NavLink
      to={`/question/detail/${question.id}`}
      className="flex flex-col gap-2.5 py-6 md:pl-4 border-b border-stone-line border-l-2 border-l-transparent hover:bg-cream-hover hover:border-l-gold-deep transition-colors"
    >
      <MonoLabel as="div" className="flex flex-wrap items-baseline gap-x-3.5 gap-y-1.5">
        <span className="text-forest">{categoryLabel(question.category)}</span>
        <span className="text-ink-faint">{formatDate(question.createdAt)}</span>
        <span className="text-ink-faint">{formatCount(question.views)} dibaca</span>
      </MonoLabel>

      <h3 className="font-serif text-xl md:text-2xl font-normal leading-snug tracking-tight text-ink max-w-[40ch] text-pretty">
        {question.title}
      </h3>

      {answer && <p className="text-base leading-relaxed text-ink-soft max-w-[74ch] text-pretty line-clamp-2">{answer.content}</p>}

      {answer && (
        <MonoLabel as="div" className="flex items-center flex-wrap gap-x-2 gap-y-1 tracking-normal text-ink-muted">
          <span>Dijawab oleh</span>
          <span className="inline-flex items-center gap-1.5 text-forest">
            {answer.role === "Guru" && <VerifiedBadge />}
            {answer.userName}
          </span>
        </MonoLabel>
      )}
    </NavLink>
  );
}

export default QuestionListItem;
