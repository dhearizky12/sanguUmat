import { NavLink } from "react-router-dom";
import ArticleRow from "./ArticleRow";

// Static preview content — the Articles feature has no backend yet, same as the rest of
// the current dashboard's article cards. Replace with real fetched data once it exists.
const FEATURED_ARTICLE = {
  category: "Teologi",
  readTime: "12 menit baca",
  title: "Memahami Maqasid al-Shariah di Era Modern",
  excerpt: "Eksplorasi tujuan-tujuan luhur hukum Islam dan bagaimana hal itu memandu penalaran hukum kontemporer.",
};

const ARTICLES = [
  {
    kicker: "Muamalah",
    locked: true,
    title: "Hukum Investasi Saham Syariah bagi Pemula",
    excerpt: "Kriteria penyaringan emiten, akad yang mendasarinya, dan hal yang membuat sebuah transaksi keluar dari koridor syariah.",
  },
  {
    kicker: "Keluarga",
    locked: true,
    title: "Adab Menjaga Keharmonisan Rumah Tangga",
    excerpt: "Panduan praktis membangun komunikasi, membagi peran, dan menyelesaikan konflik dengan tuntunan Nabi.",
  },
  {
    kicker: "Ibadah",
    locked: false,
    title: "Keutamaan Sholat Berjamaah di Masjid",
    excerpt: "Dalil keutamaannya, hukum bagi laki-laki dan perempuan, serta uzur yang diterima untuk meninggalkannya.",
  },
];

function ArticlesSection() {
  return (
    <section id="artikel" className="max-w-container-max mx-auto px-gutter py-10 md:py-16">
      <div className="flex items-baseline justify-between gap-5 flex-wrap border-b border-ink pb-3 mb-10">
        <h2 className="font-serif text-2xl md:text-[32px] font-normal tracking-tight text-ink">Artikel Pilihan</h2>
        <span className="label-mono text-ink-muted">Pembahasan mendalam</span>
      </div>

      <div className="grid gap-11 items-start" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))" }}>
        <NavLink to="/detail-article/0" className="flex flex-col gap-4">
          <span className="aspect-[3/2] w-full bg-parchment border border-stone-line flex items-center justify-center label-mono text-ink-faint [background-image:repeating-linear-gradient(135deg,rgba(23,32,28,.05)_0_9px,transparent_9px_18px)]">
            foto artikel utama
          </span>
          <span className="flex flex-col gap-2.5">
            <span className="label-mono text-forest">
              {FEATURED_ARTICLE.category} &middot; {FEATURED_ARTICLE.readTime}
            </span>
            <span className="font-serif text-2xl md:text-[31px] leading-tight tracking-tight text-ink max-w-[22ch]">
              {FEATURED_ARTICLE.title}
            </span>
            <span className="text-base leading-relaxed text-ink-soft max-w-[50ch]">{FEATURED_ARTICLE.excerpt}</span>
          </span>
        </NavLink>

        <div className="flex flex-col">
          {ARTICLES.map((article, i) => (
            <ArticleRow key={article.title} slug={i} article={article} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default ArticlesSection;
