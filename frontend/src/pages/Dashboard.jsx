import Footer from "../components/Footer";
import Header from "../components/Header";
import QuestionCard from "../components/QuestionCard";
import ArticleCard from "../components/ArticleCard";
import ArticleMemberCard from "../components/ArticleMemberCard";
import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { API_URL } from "../lib/api";

// Question model has no Category field yet (see BE_PLAN.md). Until the backend adds one,
// we approximate a category from title/content keywords so the filter below has something
// real to operate on instead of inventing fake questions. Replace with a real `?category=`
// query once the backend ships it.
const CATEGORIES = [
  { key: "semua", label: "Semua" },
  { key: "sholat", label: "Sholat", keywords: ["sholat", "shalat", "salat", "sembahyang"] },
  { key: "puasa", label: "Puasa", keywords: ["puasa", "sawm", "shaum"] },
  { key: "zakat", label: "Zakat", keywords: ["zakat"] },
  { key: "keluarga", label: "Keluarga & Pernikahan", keywords: ["nikah", "keluarga", "suami", "istri", "cerai", "talak"] },
  { key: "muamalah", label: "Keuangan & Muamalah", keywords: ["riba", "dagang", "bisnis", "investasi", "keuangan", "muamalah", "utang", "hutang"] },
];

function matchCategory(text) {
  const lower = text.toLowerCase();
  for (const cat of CATEGORIES.slice(1)) {
    if (cat.keywords.some((k) => lower.includes(k))) {
      return cat.key;
    }
  }
  return null;
}

function categoryLabel(key) {
  return CATEGORIES.find((c) => c.key === key)?.label ?? "Lainnya";
}

function getFeaturedAnswer(question) {
  return question.answers.find((a) => a.role === "Guru") ?? question.answers[0];
}

function formatDate(value) {
  return new Date(value).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function formatReadCount(n) {
  if (n >= 1000) {
    return `${(n / 1000).toFixed(1).replace(".", ",")}rb`;
  }
  return `${n}`;
}

// Placeholder only — there is no view/read-count tracking in the backend at all yet.
// Swap this out once the backend adds a Views field + sort-by-views support (see BE_PLAN.md).
const MOST_READ_PLACEHOLDER = [
  {
    id: "placeholder-1",
    categoryLabel: "Sholat",
    title: "Apa hukum menjamak sholat karena alasan pekerjaan?",
    excerpt:
      "Penjelasan mengenai syarat dan ketentuan menjamak sholat bagi pekerja yang memiliki jadwal padat dan sulit menunaikan sholat tepat waktu.",
    answererName: "Ustadz Fajar",
    reads: 1240,
  },
  {
    id: "placeholder-2",
    categoryLabel: "Zakat",
    title: "Bagaimana cara menghitung zakat penghasilan yang benar?",
    excerpt: "Panduan lengkap perhitungan nisab dan haul untuk zakat profesi bagi karyawan dan pekerja lepas.",
    answererName: "Ustadzah Hana",
    reads: 980,
  },
  {
    id: "placeholder-3",
    categoryLabel: "Keluarga & Pernikahan",
    title: "Apa saja syarat sah pernikahan menurut syariat Islam?",
    excerpt: "Rukun dan syarat pernikahan yang wajib dipenuhi agar akad nikah dianggap sah secara syariat.",
    answererName: "Ustadz Fajar",
    reads: 756,
  },
];

function LoadingState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-center">
      <span className="material-symbols-outlined text-primary-container text-4xl! animate-spin" data-icon="progress_activity">
        progress_activity
      </span>
      <p className="font-body-md text-body-md text-on-surface-variant">{message}</p>
    </div>
  );
}

function EmptyState({ icon, title, message }) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-3 py-16 px-6 bg-surface-container-lowest rounded-2xl border border-dashed border-outline-variant">
      <div className="w-16 h-16 rounded-full bg-primary-container/10 flex items-center justify-center">
        <span className="material-symbols-outlined text-primary-container text-3xl!" data-icon={icon}>
          {icon}
        </span>
      </div>
      <h3 className="font-title-md text-title-md text-on-surface">{title}</h3>
      {message && <p className="font-body-md text-body-md text-on-surface-variant max-w-md">{message}</p>}
    </div>
  );
}

function AnsweredCard({ question, categoryTag }) {
  const answer = getFeaturedAnswer(question);

  return (
    <NavLink
      to={`/detail-question/${question.id}`}
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
      <h3 className="font-body-lg text-body-lg text-on-surface font-medium line-clamp-2">{question.title}</h3>
      <div className="pl-4 border-l-2 border-secondary-fixed-dim bg-surface-container-low/50 p-4 rounded-r-lg">
        <div className="flex items-center gap-2 mb-2">
          <img
            alt="Foto Ustadz"
            className="w-8 h-8 rounded-full object-cover"
            src={answer.userPicture ? API_URL + answer.userPicture : "/default-avatar.png"}
          />
          <span className="font-label-sm text-label-sm text-on-surface font-semibold">{answer.userName}</span>
          {answer.role === "Guru" && (
            <span className="material-symbols-outlined text-secondary-container text-[16px]" data-icon="verified">
              verified
            </span>
          )}
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2">{answer.content}</p>
      </div>
    </NavLink>
  );
}

function Dashboard() {
  const [questions, setQuestions] = useState([]);
  const [search, setSearch] = useState("");
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [loadingAnswered, setLoadingAnswered] = useState(true);
  const [category, setCategory] = useState("semua");
  const navigate = useNavigate();

  const { isAuthenticated, me } = useAuth();

  useEffect(() => {
    if (isAuthenticated && me && !me.hasCompletedProfile) {
      navigate("/edit-profile");
    }
  }, [isAuthenticated, me, navigate]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(`${API_URL}/api/question?search=${search}`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch");
        }

        const data = await response.json();
        setQuestions(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchQuestions();
  }, [search]);

  useEffect(() => {
    // GET /api/question does not include answers or a category, so we pull the most recent
    // batch and fetch each one's detail to find out which are actually answered. Fine for a
    // homepage widget at today's question volume; revisit if this ever needs to scale (see
    // BE_PLAN.md for the isAnswered/category fields that would replace this).
    const fetchAnswered = async () => {
      setLoadingAnswered(true);
      try {
        const listRes = await fetch(`${API_URL}/api/question`, { credentials: "include" });
        if (!listRes.ok) throw new Error("Failed to fetch questions");
        const list = await listRes.json();
        const recent = list.slice(0, 15);

        const details = await Promise.all(
          recent.map((q) =>
            fetch(`${API_URL}/api/question/${q.id}`)
              .then((r) => (r.ok ? r.json() : null))
              .catch(() => null)
          )
        );

        const answered = details
          .filter((d) => d && d.answers && d.answers.length > 0)
          .map((d) => ({ ...d, category: matchCategory(`${d.title} ${d.content}`) }));

        setAnsweredQuestions(answered);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingAnswered(false);
      }
    };

    fetchAnswered();
  }, []);

  const latestAnswered = answeredQuestions.slice(0, 6);
  const importantAnswers = answeredQuestions.filter((q) => q.answers.some((a) => a.role === "Guru"));
  const filteredImportant = category === "semua" ? importantAnswers : importantAnswers.filter((q) => q.category === category);
  const isSearching = search.trim() !== "";

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
              Temukan kejelasan dalam kearifan tradisional.
            </h1>
            <p className="font-body-lg text-body-lg text-surface-container-low max-w-2xl mb-12 drop-shadow-sm">
              Telusuri koleksi pertanyaan Fiqih yang lengkap, dijawab oleh para ustadz terverifikasi, atau jelajahi artikel pilihan yang
              menjembatani tradisi dengan kehidupan sehari-hari.
            </p>
            <div className="w-full max-w-2xl relative group">
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
                placeholder="Cari pertanyaan Fiqih..."
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="absolute inset-y-0 right-3 flex items-center">
                <button className="bg-secondary-container text-on-secondary-container font-label-sm text-label-sm px-8 py-3 rounded-xl hover:bg-secondary-fixed transition-colors shadow-md font-bold">
                  Cari
                </button>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-3 items-center">
              <span className="font-label-sm text-label-sm text-surface-container-highest drop-shadow-sm">Populer:</span>
              <a
                className="font-label-sm text-label-sm text-on-primary border border-surface-container-highest/30 bg-surface/10 backdrop-blur-sm px-4 py-1.5 rounded-full hover:bg-surface/20 transition-colors"
                href="#"
              >
                Waktu sholat
              </a>
              <a
                className="font-label-sm text-label-sm text-on-primary border border-surface-container-highest/30 bg-surface/10 backdrop-blur-sm px-4 py-1.5 rounded-full hover:bg-surface/20 transition-colors"
                href="#"
              >
                Kalkulator zakat
              </a>
              <a
                className="font-label-sm text-label-sm text-on-primary border border-surface-container-highest/30 bg-surface/10 backdrop-blur-sm px-4 py-1.5 rounded-full hover:bg-surface/20 transition-colors"
                href="#"
              >
                Aturan puasa
              </a>
            </div>
          </div>
        </section>

        {isSearching ? (
          <section className="max-w-container-max mx-auto px-gutter py-section-gap">
            <div className="mb-8">
              <h2 className="font-headline-lg text-headline-lg text-primary-container">Hasil Pencarian</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-2">
                {questions.length} pertanyaan ditemukan untuk &quot;{search}&quot;.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {questions.map((v) => (
                <QuestionCard key={v.id} slug={v.id} question={v} adminId={false} />
              ))}
            </div>
          </section>
        ) : (
          <>
            <section className="max-w-container-max mx-auto px-gutter py-section-gap">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h2 className="font-headline-lg text-headline-lg text-primary-container">Jawab-jawaban Terbaru</h2>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-2">Pertanyaan yang baru saja dijawab oleh komunitas ustadz kami.</p>
                </div>
                <NavLink
                  to="questions"
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MOST_READ_PLACEHOLDER.map((q) => (
                  <div key={q.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 flex flex-col gap-4 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="px-2.5 py-1 rounded-full bg-surface-container-low text-primary-container font-label-sm text-[12px] font-semibold border border-primary-container/20">
                        {q.categoryLabel}
                      </span>
                      <span className="flex items-center gap-1 text-outline font-label-sm text-label-sm">
                        <span className="material-symbols-outlined text-[14px]" data-icon="visibility">
                          visibility
                        </span>
                        {formatReadCount(q.reads)} dibaca
                      </span>
                    </div>
                    <h3 className="font-body-lg text-body-lg text-on-surface font-medium line-clamp-2">{q.title}</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2">{q.excerpt}</p>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">Dijawab oleh {q.answererName}</span>
                  </div>
                ))}
              </div>
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
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default Dashboard;
