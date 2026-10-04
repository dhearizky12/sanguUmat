import ArticleBody from "../article/ArticleBody";
import RichContent from "../RichContent";

// An answer's text. A formatted answer (`isHtml`) is editor HTML the server has already
// cleaned, shown in the article type; an older plain one goes through RichContent as before.
export default function AnswerBody({ answer }) {
  if (answer.isHtml) return <ArticleBody html={answer.content} className="max-w-[70ch]" />;
  return <RichContent text={answer.content} className="text-[17px] leading-[1.7] text-ink-soft max-w-[70ch] text-pretty" />;
}
