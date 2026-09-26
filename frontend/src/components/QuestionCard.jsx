import { pictureUrl } from "../lib/api";
import { formatDate } from "../lib/date";
import { categoryLabel, useCategories } from "../lib/category";
import QuestionRow from "./QuestionRow";
import QuestionFlags from "./question/QuestionFlags";

// A question from GET /api/question as a canvas question row, crediting who asked it and
// who answered it (the list carries the answerer's name and role, not the answer text).
// An anonymous asker arrives as "Hamba Allah" for the public; staff get the real name,
// marked anonim. `flags` shows the asker's choices (the answer queue), `meId` the viewer.
function QuestionCard({ slug, question, flags = false, meId }) {
  const categories = useCategories();

  return (
    <QuestionRow
      to={`/question/detail/${slug}`}
      category={categoryLabel(categories, question.category)}
      date={formatDate(question.createdAt)}
      views={question.views}
      comments={question.commentCount}
      readMinutes={question.readMinutes}
      title={question.title}
      excerpt={question.content}
      asker={{
        name: question.userName,
        picture: pictureUrl(question.userPicture),
        anonymous: question.isAnonymous && question.userId != null,
      }}
      flags={flags ? <QuestionFlags question={question} meId={meId} /> : null}
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
