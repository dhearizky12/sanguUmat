import MonoLabel from "../MonoLabel";
import VerifiedBadge from "../VerifiedBadge";
import { formatCount } from "../../lib/format";

// "Oleh ◎ Ustadz Fajar Rahman · 1,2k dibaca" under an article in a list.
export default function ArticleByline({ author, views }) {
  return (
    <span className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-mono-label tracking-[0.08em] text-ink-muted">
      <span>Oleh</span>
      <span className="inline-flex items-center gap-1.5 text-forest">
        {author.role === "Guru" && <VerifiedBadge size={15} />}
        {author.name}
      </span>
      {views != null && <span className="text-ink-faint">&middot; {formatCount(views)} dibaca</span>}
    </span>
  );
}

// The rubrik · date · read time line above an article's title.
export function ArticleMeta({ category, date, readMinutes, kicker }) {
  return (
    <MonoLabel as="span" className="flex flex-wrap items-baseline gap-x-3.5 gap-y-1.5 tracking-[0.12em]">
      {kicker && <span className="text-gold-dark">{kicker}</span>}
      <span className="text-forest">{category?.name ?? "Lainnya"}</span>
      <span className="text-ink-faint">{date}</span>
      <span className="text-ink-faint">{readMinutes} menit baca</span>
    </MonoLabel>
  );
}
