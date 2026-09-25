import { formatDate } from "../../lib/date";
import { formatCount } from "../../lib/format";
import { categoryLabel } from "../../lib/category";
import QuestionRow from "../QuestionRow";
import VerifiedBadge from "../VerifiedBadge";

function getFeaturedAnswer(question) {
  return question.answers.find((a) => a.role === "Guru") ?? question.answers[0];
}

function QuestionListItem({ question }) {
  const answer = getFeaturedAnswer(question);

  return (
    <QuestionRow
      to={`/question/detail/${question.id}`}
      meta={
        <>
          <span className="text-forest">{categoryLabel(question.category)}</span>
          <span className="text-ink-faint">{formatDate(question.createdAt)}</span>
          <span className="text-ink-faint">{formatCount(question.views)} dibaca</span>
        </>
      }
      title={question.title}
      excerpt={answer?.content}
      byline={
        answer && (
          <>
            <span>Dijawab oleh</span>
            <span className="inline-flex items-center gap-1.5 text-forest">
              {answer.role === "Guru" && <VerifiedBadge />}
              {answer.userName}
            </span>
          </>
        )
      }
    />
  );
}

export default QuestionListItem;
