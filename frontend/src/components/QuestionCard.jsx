import { pictureUrl } from "../lib/api";
import Avatar from "./Avatar";
import { formatDate } from "../lib/date";
import { formatCount } from "../lib/format";
import { categoryLabel } from "../lib/category";
import QuestionRow from "./QuestionRow";

// A question from GET /api/question as a canvas question row. The list
// response carries no answer text or answerer, so the byline credits the
// asker instead of "Dijawab oleh".
function QuestionCard({ slug, question }) {
  const isAnswered = Boolean(question.isAnswered);

  return (
    <QuestionRow
      to={`/question/detail/${slug}`}
      meta={
        <>
          {question.category && <span className="text-forest">{categoryLabel(question.category)}</span>}
          <span className="text-ink-faint">{formatDate(question.createdAt)}</span>
          <span className="text-ink-faint">{formatCount(question.views)} dibaca</span>
          <span className={isAnswered ? "text-gold-dark" : "text-ink-faint"}>
            {isAnswered ? "Terjawab" : "Menunggu jawaban"}
          </span>
        </>
      }
      title={question.title}
      excerpt={question.content}
      byline={
        <>
          <Avatar src={pictureUrl(question.userPicture)} name={question.userName} size={20} />
          <span>Ditanyakan oleh</span>
          <span className="text-forest">{question.userName}</span>
          <span className="text-ink-faint">&middot; {formatCount(question.commentCount)} komentar</span>
        </>
      }
    />
  );
}

export default QuestionCard;
