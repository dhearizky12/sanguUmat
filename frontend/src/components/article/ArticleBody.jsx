import { ARTICLE_TYPE } from "./articleType";

// An article's body. The HTML is sanitised by the server on every save
// (backend/Articles/ArticleHtml.cs), which is what makes rendering it directly safe.
export default function ArticleBody({ html, className = "" }) {
  return <div dir="auto" className={`${ARTICLE_TYPE} ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}
