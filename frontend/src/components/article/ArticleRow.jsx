import { Link } from "react-router-dom";
import { formatDate } from "../../lib/date";
import ArticleByline, { ArticleMeta } from "./ArticleByline";
import ArticleCover from "./ArticleCover";

// One article in the Artikel list, after its canvas: a row with the cover on the left
// (stacked on phones), or a card with the cover on top (`card`, the two-column view).
// A row without a cover shows none; a card shows the hatched placeholder, so cards in a
// grid line up.
export default function ArticleRow({ article, card = false }) {
  const body = (
    <span className="flex-1 min-w-0 flex flex-col gap-2.5">
      <ArticleMeta category={article.category} date={formatDate(article.publishedAt)} readMinutes={article.readMinutes} />
      <span
        className={`font-serif font-normal leading-[1.26] tracking-[-0.012em] text-ink max-w-[42ch] text-pretty ${
          card ? "text-[clamp(20px,2.2vw,23px)]" : "text-[clamp(20px,2.4vw,26px)]"
        }`}
      >
        {article.title}
      </span>
      {article.summary && <span className="text-base leading-[1.62] text-ink-soft max-w-[68ch] text-pretty line-clamp-3">{article.summary}</span>}
      <span className="mt-auto pt-0.5">
        <ArticleByline author={article.author} views={article.views} />
      </span>
    </span>
  );

  return (
    <Link
      to={`/articles/${article.id}`}
      className={`flex gap-[clamp(14px,2.5vw,24px)] py-[clamp(18px,3vw,26px)] border-b border-stone-line border-l-2 border-l-transparent hover:bg-cream-hover hover:border-l-gold-deep transition-colors ${
        card ? "flex-col px-[clamp(12px,2vw,16px)]" : "flex-col min-[640px]:flex-row items-start pl-[clamp(12px,3vw,18px)] pr-2"
      }`}
    >
      {(article.cover || card) && (
        <ArticleCover
          cover={article.cover}
          placeholder={card}
          className={card ? "w-full aspect-video" : "w-full aspect-video min-[640px]:w-[clamp(120px,18vw,188px)] min-[640px]:aspect-[3/2] shrink-0"}
        />
      )}
      {body}
    </Link>
  );
}

// The Sorotan: the newest article, large, above the list on its plain first page.
export function ArticleLead({ article }) {
  return (
    <Link
      to={`/articles/${article.id}`}
      className="mt-1.5 flex flex-wrap items-center gap-[clamp(18px,3vw,30px)] py-[clamp(22px,3vw,30px)] px-[clamp(12px,3vw,18px)] border-b border-ink hover:bg-cream-hover transition-colors"
    >
      <ArticleCover cover={article.cover} placeholder className="flex-[1_1_300px] min-w-[min(100%,260px)] aspect-[3/2]" />
      <span className="flex-[1_1_320px] min-w-0 flex flex-col gap-[11px] py-[clamp(4px,2vw,8px)]">
        <ArticleMeta kicker="Sorotan" category={article.category} date={formatDate(article.publishedAt)} readMinutes={article.readMinutes} />
        <span className="font-serif text-[clamp(26px,3.2vw,36px)] leading-[1.16] tracking-[-0.018em] text-ink max-w-[24ch] text-pretty">
          {article.title}
        </span>
        {article.summary && <span className="text-[17px] leading-[1.6] text-ink-soft max-w-[56ch] text-pretty">{article.summary}</span>}
        <ArticleByline author={article.author} views={article.views} />
      </span>
    </Link>
  );
}
