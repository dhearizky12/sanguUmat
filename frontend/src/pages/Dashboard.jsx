import Footer from "../components/Footer";
import Header from "../components/Header";
import ArticleCard from "../components/ArticleCard";
import ArticleMemberCard from "../components/ArticleMemberCard";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { API_URL } from "../lib/api";
import { handleAvatarError } from "../lib/image";
import { formatDate } from "../lib/date";
import { formatCount } from "../lib/format";
import { CATEGORIES, categoryLabel } from "../lib/category";

function getFeaturedAnswer(question) {
  return question.answers.find((a) => a.role === "Guru") ?? question.answers[0];
}

// Topics cycled through the hero search placeholder via a typewriter effect, so the copy
// itself demonstrates the site covers more than just Fiqh.
const HERO_SEARCH_TOPICS = [
  "fiqih",
  "waris",
  "shalat",
  "Al-Qur'an",
  "hadis",
  "zakat",
  "pernikahan",
  "muamalah",
  "akhlak",
  "isu sosial",
];

function AnsweredCard({ question, categoryTag }) {
  const answer = getFeaturedAnswer(question);

  return (
    <NavLink
      to={`/question/detail/${question.id}`}
      className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex items-center justify-between gap-3">
        {categoryTag && (
          <span className="px-2.5 py-1 rounded-full bg-surface-container-low text-primary-container font-label-sm text-[12px] font-semibold border border-primary-container/20">
            {categoryTag}
          </span>
        )}
        <span className="text-outline font-label-sm text-label-sm ml-auto">{formatDate(question.createdAt)}</span>
      </div>
      <h3 className="font-body-lg text-body-lg text-on-surface font-medium line-clamp-2 min-h-14">{question.title}</h3>
      <div className="pl-4 border-l-2 border-secondary-fixed-dim bg-surface-container-low/50 p-4 rounded-r-lg">
        <div className="flex items-center gap-2 mb-2">
          <img
            alt="Foto Ustadz"
            className="w-8 h-8 rounded-full object-cover"
            src={answer.userPicture ? API_URL + answer.userPicture : "/default-avatar.png"}
            onError={handleAvatarError}
          />
          <span className="font-label-sm text-label-sm text-on-surface font-semibold">{answer.userName}</span>
          {answer.role === "Guru" && (
            <span className="material-symbols-outlined icon-fill text-secondary-container text-[16px]" data-icon="verified">
              verified
            </span>
          )}
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2 min-h-12">{answer.content}</p>
      </div>
      <div className="flex items-center gap-4 text-outline mt-auto">
        <span className="flex items-center gap-1 font-label-sm text-label-sm">
          <span className="material-symbols-outlined text-[16px]">visibility</span>
          {formatCount(question.views)}
        </span>
        <span className="flex items-center gap-1 font-label-sm text-label-sm">
          <span className="material-symbols-outlined text-[16px]">chat_bubble_outline</span>
          {formatCount(question.commentCount)}
        </span>
      </div>
    </NavLink>
  );
}

function Dashboard() {
  const [heroSearch, setHeroSearch] = useState("");
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [loadingAnswered, setLoadingAnswered] = useState(true);
  const [category, setCategory] = useState("semua");
  const [heroTopicIndex, setHeroTopicIndex] = useState(0);
  const [heroTypedLength, setHeroTypedLength] = useState(0);
  const [heroDeleting, setHeroDeleting] = useState(false);
  const navigate = useNavigate();

  const { isAuthenticated, me } = useAuth();

  useEffect(() => {
    if (isAuthenticated && me && !me.hasCompletedProfile) {
      navigate("/edit-profile");
    }
  }, [isAuthenticated, me, navigate]);

  useEffect(() => {
    // Pause the typewriter once the user is actually typing a search — the placeholder is
    // invisible anyway once the input has a value, no point animating in the background.
    if (heroSearch.trim() !== "") {
      return;
    }

    const currentTopic = HERO_SEARCH_TOPICS[heroTopicIndex];
    const atFullWord = !heroDeleting && heroTypedLength === currentTopic.length;
    const atEmptyWord = heroDeleting && heroTypedLength === 0;

    const delay = atFullWord ? 1400 : heroDeleting ? 40 : 70;

    const timeout = setTimeout(() => {
      if (atFullWord) {
        setHeroDeleting(true);
      } else if (atEmptyWord) {
        setHeroDeleting(false);
        setHeroTopicIndex((i) => (i + 1) % HERO_SEARCH_TOPICS.length);
      } else {
        setHeroTypedLength((len) => len + (heroDeleting ? -1 : 1));
      }
    }, delay);

    return () => clearTimeout(timeout);
  }, [heroTypedLength, heroDeleting, heroTopicIndex, heroSearch]);

  useEffect(() => {
    // GET /api/question?status=answered gives the real answered set (no more guessing from
    // "most recent 15"), but still no answer content in the list response, so each one's
    // detail is fetched to get the actual answer text to preview. Fine for a homepage widget
    // at today's question volume; revisit if this ever needs to scale further.
    const fetchAnswered = async () => {
      setLoadingAnswered(true);
      try {
        const listRes = await fetch(`${API_URL}/api/question?status=answered`, { credentials: "include" });
        if (!listRes.ok) throw new Error("Failed to fetch questions");
        const list = await listRes.json();

        const details = await Promise.all(
          list.map((q) =>
            fetch(`${API_URL}/api/question/${q.id}`)
              .then((r) => (r.ok ? r.json() : null))
              .then((detail) => (detail ? { ...q, ...detail } : null))
              .catch(() => null)
          )
        );

        const answered = details.filter((d) => d && d.answers && d.answers.length > 0);

        setAnsweredQuestions(answered);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingAnswered(false);
      }
    };

    fetchAnswered();
  }, []);

  // "Important" still has no dedicated backend signal beyond the Guru-authored-answer check
  // already applied when building answeredQuestions, and "latest" is just recency (the list
  // is already newest-first) — both still draw from the same pool. "Most read" is now a real,
  // distinct sort now that Views is tracked (see BE_PLAN.md Phase 4).
  const latestAnswered = answeredQuestions.slice(0, 6);
  const filteredImportant = (category === "semua" ? answeredQuestions : answeredQuestions.filter((q) => q.category === category)).slice(0, 6);
  const mostRead = [...answeredQuestions].sort((a, b) => (b.views ?? 0) - (a.views ?? 0)).slice(0, 6);
  const heroPlaceholder = `Cari pertanyaan tentang ${HERO_SEARCH_TOPICS[heroTopicIndex].slice(0, heroTypedLength)}`;

  const handleHeroSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = heroSearch.trim();
    navigate(trimmed ? `/questions?search=${encodeURIComponent(trimmed)}` : "/questions");
  };

  return (
    <div className="font-body-md min-h-screen flex flex-col">
      <Header />

      <main className="grow">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <img
              alt="Interior masjid yang tenang dengan arsitektur Islam yang indah"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUK50KTJ2hOmuiEacp8LVdISdlSX4ofDO200fpD5TteuACUrexv1EzCUbzGmHjNvDHJe8ZFlZMY7JLpA2bBIovDQ3kVmMV7C8kTWQXXCWgagKR-SWcHb7gn0jSswryFAWP2iKJir4Rdz6sqFMOfCgJ1NQIJN6mO20wz1OF4B9OZOI7biMmPxe3GZws8M7iEKEDeyWiwqkCkbMOSRmKy6F122zjK96ezBAdwC_--JG16GUvxqTkka377faRSzgfy-Cn2AhDcos9Zyc"
            />
            <div className="absolute inset-0 bg-primary-container/60 mix-blend-multiply"></div>
            <div className="absolute inset-0 bg-linear-to-b from-primary-container/90 via-primary-container/70 to-background"></div>
          </div>
          <div className="max-w-container-max mx-auto px-gutter py-section-gap lg:pt-32 lg:pb-52 relative z-10 flex flex-col items-center text-center">
            <h1 className="font-display-lg text-display-lg text-secondary-fixed max-w-3xl mb-6 drop-shadow-md">
              Temukan kejelasan dalam setiap pertanyaan tentang Islam.
            </h1>
            <p className="font-body-lg text-body-lg text-surface-container-low max-w-2xl mb-12 drop-shadow-sm">
              Dari Al-Qur'an, Hadis, fiqih, muamalah, hingga persoalan sosial sehari-hari <br /> tanyakan apa saja seputar Islam dan dapatkan
              jawaban dari para ustadz.
            </p>
            <form onSubmit={handleHeroSearchSubmit} className="w-full max-w-2xl relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <span
                  className="material-symbols-outlined text-outline group-focus-within:text-primary-container transition-colors"
                  data-icon="search"
                >
                  search
                </span>
              </div>
              <input
                className="w-full pl-14 pr-36 py-5 bg-surface rounded-2xl border-0 focus:ring-4 focus:ring-secondary-fixed/50 font-body-lg text-body-lg text-on-surface shadow-xl transition-all outline-none placeholder:text-outline"
                placeholder={heroPlaceholder}
                type="text"
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
              />
              <div className="absolute inset-y-0 right-3 flex items-center">
                <button
                  type="submit"
                  className="bg-secondary-container text-on-secondary-container font-label-sm text-label-sm px-8 py-3 rounded-full hover:bg-secondary-fixed transition-colors shadow-md font-bold"
                >
                  Cari
                </button>
              </div>
            </form>
            <p className="mt-6 font-label-sm text-label-sm text-surface-container-highest drop-shadow-sm">
              Tidak menemukan jawabannya?{" "}
              <NavLink to="/question/create" className="font-bold text-on-primary underline underline-offset-4 hover:text-secondary-fixed">
                Ajukan Pertanyaan
              </NavLink>
            </p>
          </div>
        </section>

        <section className="max-w-container-max mx-auto px-gutter py-section-gap">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-primary-container">Jawab-jawaban Terbaru</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-2">Pertanyaan yang baru saja dijawab oleh komunitas ustadz kami.</p>
            </div>
            <NavLink
              to="/questions"
              className="hidden sm:flex items-center gap-1 font-label-sm text-label-sm text-primary-container hover:text-tertiary font-semibold"
            >
              Lihat semua{" "}
              <span className="material-symbols-outlined" data-icon="arrow_forward">
                arrow_forward
              </span>
            </NavLink>
          </div>
          {loadingAnswered ? (
            <LoadingState message="Memuat pertanyaan terjawab..." />
          ) : latestAnswered.length === 0 ? (
            <EmptyState
              icon="forum"
              title="Belum Ada Pertanyaan Terjawab"
              message="Jawaban dari para ustadz akan tampil di sini begitu tersedia."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestAnswered.map((q) => (
                <AnsweredCard key={q.id} question={q} categoryTag={q.category ? categoryLabel(q.category) : null} />
              ))}
            </div>
          )}
        </section>

        <section className="max-w-container-max mx-auto px-gutter py-section-gap">
          <div className="mb-6">
            <h2 className="font-headline-lg text-headline-lg text-primary-container">Kumpulan Jawaban Penting</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2">
              Jawaban terverifikasi dari para ustadz, dikelompokkan berdasarkan kategori.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 mb-8" role="radiogroup" aria-label="Filter kategori">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                type="button"
                role="radio"
                aria-checked={category === cat.key}
                onClick={() => setCategory(cat.key)}
                className={`px-4 py-2 rounded-full font-label-sm text-label-sm border transition-colors ${
                  category === cat.key
                    ? "bg-primary-container text-on-primary border-primary-container"
                    : "bg-surface-container-lowest text-on-surface-variant border-outline-variant hover:bg-surface-container-low"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          {loadingAnswered ? (
            <LoadingState message="Memuat jawaban penting..." />
          ) : filteredImportant.length === 0 ? (
            <EmptyState
              icon="filter_alt_off"
              title="Belum Ada Jawaban untuk Kategori Ini"
              message='Coba pilih kategori lain, atau kembali ke "Semua" untuk melihat semua jawaban penting.'
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredImportant.map((q) => (
                <AnsweredCard key={q.id} question={q} categoryTag={q.category ? categoryLabel(q.category) : null} />
              ))}
            </div>
          )}
        </section>

        <section className="max-w-container-max mx-auto px-gutter py-section-gap">
          <div className="mb-8">
            <h2 className="font-headline-lg text-headline-lg text-primary-container">Paling Banyak Dibaca</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2">Pertanyaan yang paling banyak dibaca oleh pengguna lain.</p>
          </div>
          {loadingAnswered ? (
            <LoadingState message="Memuat pertanyaan populer..." />
          ) : mostRead.length === 0 ? (
            <EmptyState
              icon="visibility"
              title="Belum Ada Data Pertanyaan Populer"
              message="Statistik pembacaan akan tampil di sini begitu tersedia."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mostRead.map((q) => (
                <AnsweredCard key={q.id} question={q} categoryTag={q.category ? categoryLabel(q.category) : null} />
              ))}
            </div>
          )}
        </section>

        <section className="py-section-gap">
          <div className="max-w-container-max mx-auto px-gutter">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="font-headline-lg text-headline-lg text-primary-container">Artikel Pilihan</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-2">
                  Pembahasan mendalam seputar fiqih Islam dan isu-isu kontemporer.
                </p>
              </div>
              <NavLink
                to="articles"
                className="hidden sm:flex items-center gap-1 font-label-sm text-label-sm text-primary-container hover:text-tertiary font-semibold"
              >
                Lihat semua
                <span className="material-symbols-outlined" data-icon="arrow_forward">
                  arrow_forward
                </span>
              </NavLink>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-[400px]">
              <div className="lg:col-span-2 relative rounded-2xl overflow-hidden group shadow-sm hover:shadow-md transition-all">
                <img
                  alt="Arsitektur Islam"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuApuvinrav-NhOPQ9ilMuFVBZanE8UpHiwo4SlzuEIgMOau7mt6xIH1CQ7Lp0eJ5GTeRyzNvN37vfDJ1GxA5XbP-7vylI8lY34TYLrHLrfgbusiLXF-ohIf66-Kb00G-iMGUjhPUVzFZ9OzgnK3JtbzDuA7esr2-0MnjcO7zKFpKHDd6puAPfR8Eta9Ed9StxVF2NwE6J4-X-ngP17SE88Zjhhw-GRCMUV4oiE1jDydo3R9gZFGOcgJSjx1GAu-xAxgZSSeUBBZYho"
                />
                <div className="absolute inset-0 bg-linear-to-t from-primary-container/90 via-primary-container/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-8 w-full">
                  <span className="inline-block bg-surface/20 backdrop-blur-sm text-on-primary font-label-sm text-label-sm px-3 py-1 rounded-full mb-3 border border-surface/30">
                    Teologi
                  </span>
                  <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-on-primary mb-2">
                    Memahami Maqasid al-Shariah di Era Modern
                  </h3>
                  <p className="font-body-md text-body-md text-on-primary/80 line-clamp-2">
                    Eksplorasi tujuan-tujuan luhur hukum Islam dan bagaimana hal itu memandu penalaran hukum kontemporer.
                  </p>
                </div>
              </div>
              <ArticleMemberCard
                slug={0}
                category="Muamalah"
                title="Hukum Investasi Saham Syariah bagi Pemula"
              />
              <ArticleMemberCard
                slug={1}
                category="Keluarga"
                title="Adab Menjaga Keharmonisan Rumah Tangga"
                image="https://lh3.googleusercontent.com/aida-public/AB6AXuBpmfkssMkPTKHL-677652GIUTLAwGq3O0MiVLSKWM7Ws_ERL4bhaF8jNkDKUn_-PQTDc7UL6irwCOxvmKYiwqwz4DVOOCXtpszWQ8acN25qkF2wert8icM4jY6KWiKmFLTquiPOYen_nP3HWuK0uGeLojmIHl2F7g5ZXL3zfmAO_YXv2KyO82AqYUcrx2UDJeWrVH5WFrGT49kwjd8uuvOclm97z7_B2TN_GjoEVgvVKox9YXDydsrvR_ak5qd23gTtTSrzyd2pjM"
              />
              <ArticleCard slug={0} isMember={false} category="Ibadah" title="Keutamaan Sholat Berjamaah di Masjid" />
              <ArticleCard
                slug={1}
                isMember={false}
                category="Akhlak"
                title="Menjaga Lisan dalam Kehidupan Bermedia Sosial"
                image="https://lh3.googleusercontent.com/aida-public/AB6AXuApuvinrav-NhOPQ9ilMuFVBZanE8UpHiwo4SlzuEIgMOau7mt6xIH1CQ7Lp0eJ5GTeRyzNvN37vfDJ1GxA5XbP-7vylI8lY34TYLrHLrfgbusiLXF-ohIf66-Kb00G-iMGUjhPUVzFZ9OzgnK3JtbzDuA7esr2-0MnjcO7zKFpKHDd6puAPfR8Eta9Ed9StxVF2NwE6J4-X-ngP17SE88Zjhhw-GRCMUV4oiE1jDydo3R9gZFGOcgJSjx1GAu-xAxgZSSeUBBZYho"
              />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default Dashboard;
