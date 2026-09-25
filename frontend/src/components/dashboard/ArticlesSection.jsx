import { NavLink } from "react-router-dom";
import ArticleRow from "./ArticleRow";
import MonoLabel from "../MonoLabel";
import SectionHeading from "../SectionHeading";
import AutoGrid from "../AutoGrid";
import PlaceholderTexture from "../PlaceholderTexture";

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
    <section id="artikel" className="max-w-container-max mx-auto px-page py-10 md:py-16">
      <SectionHeading title="Artikel Pilihan" meta="Pembahasan mendalam" className="mb-10" />

      <AutoGrid min={300} className="gap-11 items-start">
        <NavLink to="/detail-article/0" className="flex flex-col gap-4">
          <PlaceholderTexture className="aspect-[3/2] w-full flex items-center justify-center">
            <MonoLabel className="text-ink-faint">foto artikel utama</MonoLabel>
          </PlaceholderTexture>
          <span className="flex flex-col gap-2.5">
            <MonoLabel className="text-forest">
              {FEATURED_ARTICLE.category} &middot; {FEATURED_ARTICLE.readTime}
            </MonoLabel>
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
      </AutoGrid>
    </section>
  );
}

export default ArticlesSection;
