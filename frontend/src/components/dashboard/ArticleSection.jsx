import { Link } from "react-router-dom";
import ArticleCover from "../article/ArticleCover";

// "Artikel Pilihan" on the home page: the newest article with a cover as the lead (or the
// newest, if none has one), and the next three beside it. Shown only when any is published.
export default function ArticleSection({ articles }) {
  const list = articles ?? [];
  if (list.length === 0) return null;
  const lead = list.find((a) => a.cover) ?? list[0];
  const rest = list.filter((a) => a.id !== lead.id).slice(0, 3);

  return (
    <section id="artikel" className="max-w-container-max mx-auto px-page py-[clamp(40px,6vw,80px)]">
      <div className="flex flex-wrap items-baseline justify-between gap-5 pb-3 mb-10 border-b border-ink">
        <h2 className="font-serif text-[clamp(24px,3vw,32px)] font-normal tracking-[-0.015em]">Artikel Pilihan</h2>
        <span className="font-mono text-mono-label tracking-[0.12em] uppercase text-ink-muted">Pembahasan mendalam</span>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-11 items-start">
        <Link to={`/articles/${lead.id}`} className="flex flex-col gap-4 group">
          <ArticleCover cover={lead.cover} placeholder className="w-full aspect-[3/2]" />
          <span className="flex flex-col gap-2.5">
            <span className="font-mono text-mono-label tracking-[0.14em] uppercase text-forest">
              {lead.category?.name ?? "Lainnya"} &middot; {lead.readMinutes} menit baca
            </span>
            <span className="font-serif text-[clamp(24px,2.6vw,31px)] leading-[1.22] tracking-[-0.015em] text-ink max-w-[22ch] text-pretty group-hover:text-forest transition-colors">
              {lead.title}
            </span>
            {lead.summary && <span className="text-base leading-[1.62] text-ink-soft max-w-[50ch] text-pretty">{lead.summary}</span>}
          </span>
        </Link>

        <div className="flex flex-col">
          {rest.map((a) => (
            <Link key={a.id} to={`/articles/${a.id}`} className="flex items-start gap-[18px] py-5 border-t border-stone-line hover:bg-cream-hover transition-colors">
              <ArticleCover cover={a.cover} placeholder className="shrink-0 w-[84px] h-16" />
              <span className="flex-1 min-w-0 flex flex-col gap-[7px]">
                <span className="font-mono text-mono-label tracking-[0.14em] uppercase text-forest">{a.category?.name ?? "Lainnya"}</span>
                <span className="text-xl leading-[1.3] text-ink text-pretty">{a.title}</span>
                {a.summary && <span className="text-[15px] leading-[1.55] text-ink-muted text-pretty line-clamp-2">{a.summary}</span>}
              </span>
            </Link>
          ))}
          <Link
            to="/articles"
            className="self-start mt-[22px] font-mono text-mono-label tracking-[0.16em] uppercase text-forest border-b border-stone-border hover:text-gold-dark transition-colors"
          >
            Semua artikel
          </Link>
        </div>
      </div>
    </section>
  );
}
