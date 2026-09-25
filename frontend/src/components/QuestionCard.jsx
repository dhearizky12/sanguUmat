import { pictureUrl } from "../lib/api";
import { formatDate } from "../lib/date";
import { categoryLabel, useCategories } from "../lib/category";
import QuestionRow from "./QuestionRow";

// A question from GET /api/question as a canvas question row, crediting who asked it and
// who answered it (the list carries the answerer's name and role, not the answer text).
function QuestionCard({ slug, question }) {
  const categories = useCategories();

  return (
    <QuestionRow
      to={`/question/detail/${slug}`}
      category={categoryLabel(categories, question.category)}
      date={formatDate(question.createdAt)}
      views={question.views}
      comments={question.commentCount}
      title={question.title}
      excerpt={question.content}
      asker={{ name: question.userName, picture: pictureUrl(question.userPicture) }}
      answerer={
        question.answeredBy && {
          name: question.answeredBy,
          picture: pictureUrl(question.answeredByPicture),
          isGuru: question.answeredByRole === "Guru",
        }
      }
    />
  );
}

export default QuestionCard;
