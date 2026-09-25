import { formatDate } from "../../lib/date";
import { categoryLabel, useCategories } from "../../lib/category";
import QuestionRow from "../QuestionRow";
import { pictureUrl } from "../../lib/api";

function getFeaturedAnswer(question) {
  return question.answers.find((a) => a.role === "Guru") ?? question.answers[0];
}

function QuestionListItem({ question }) {
  const categories = useCategories();
  const answer = getFeaturedAnswer(question);

  return (
    <QuestionRow
      to={`/question/detail/${question.id}`}
      category={categoryLabel(categories, question.category)}
      date={formatDate(question.createdAt)}
      views={question.views}
      title={question.title}
      excerpt={answer?.content}
      asker={{ name: question.userName, picture: pictureUrl(question.userPicture) }}
      answerer={answer && { name: answer.userName, picture: pictureUrl(answer.userPicture), isGuru: answer.role === "Guru" }}
    />
  );
}

export default QuestionListItem;
