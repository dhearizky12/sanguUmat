import { NavLink } from "react-router-dom";

function ArticleRow({ slug, article }) {
  return (
    <NavLink
      to={`/detail-article/${slug}`}
      className="flex gap-[18px] items-start py-5 border-t border-stone-line hover:bg-cream-hover transition-colors"
    >
      <span className="shrink-0 w-[84px] h-16 bg-parchment border border-stone-line [background-image:repeating-linear-gradient(135deg,rgba(23,32,28,.05)_0_8px,transparent_8px_16px)]" />
      <span className="flex-1 min-w-0 flex flex-col gap-1.5">
        <span className="flex gap-2.5 items-center flex-wrap label-mono text-forest">
          {article.kicker}
          {article.locked && <span className="bg-gold-muted/30 text-gold-dark px-2 py-0.5 tracking-wider">Khusus Anggota</span>}
        </span>
        <span className="text-lg leading-snug text-ink text-pretty">{article.title}</span>
        <span className="text-[15px] leading-relaxed text-ink-muted text-pretty">{article.excerpt}</span>
      </span>
    </NavLink>
  );
}

export default ArticleRow;
