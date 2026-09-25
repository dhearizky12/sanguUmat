import { NavLink } from "react-router-dom";
import MonoLabel from "../MonoLabel";
import PlaceholderTexture from "../PlaceholderTexture";

function ArticleRow({ slug, article }) {
  return (
    <NavLink
      to={`/detail-article/${slug}`}
      className="flex gap-[18px] items-start py-5 border-t border-stone-line hover:bg-cream-hover transition-colors"
    >
      <PlaceholderTexture size="sm" className="shrink-0 w-[84px] h-16" />
      <span className="flex-1 min-w-0 flex flex-col gap-1.5">
        <MonoLabel className="flex gap-2.5 items-center flex-wrap text-forest">
          {article.kicker}
          {article.locked && <span className="bg-gold-muted/30 text-gold-dark px-2 py-0.5 tracking-wider">Khusus Anggota</span>}
        </MonoLabel>
        <span className="text-lg leading-snug text-ink text-pretty">{article.title}</span>
        <span className="text-[15px] leading-relaxed text-ink-muted text-pretty">{article.excerpt}</span>
      </span>
    </NavLink>
  );
}

export default ArticleRow;
