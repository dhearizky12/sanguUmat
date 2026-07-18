import { useEffect, useState } from "react";
import { NavLink, useSearchParams } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import QuestionCard from "../components/QuestionCard";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import { API_URL } from "../lib/api";
import { CATEGORIES, matchCategory } from "../lib/category";

function Questions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const [inputValue, setInputValue] = useState(search);
  const [syncedSearch, setSyncedSearch] = useState(search);
  const [category, setCategory] = useState("semua");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Keep the input in sync if the URL's search param changes from outside this component —
  // arriving here from the Dashboard hero search, or browser back/forward. Adjusted directly
  // during render (React's documented pattern for this) rather than in an effect, so it takes
  // effect before paint instead of causing an extra render pass.
  if (search !== syncedSearch) {
    setSyncedSearch(search);
    setInputValue(search);
  }

  // Debounce: only push the typed value into the URL (which drives the fetch below) after the
  // user pauses typing, instead of firing a request on every keystroke.
  useEffect(() => {
    if (inputValue === search) {
      return;
    }

    const timeout = setTimeout(() => {
      setSearchParams(inputValue ? { search: inputValue } : {}, { replace: true });
    }, 400);

    return () => clearTimeout(timeout);
  }, [inputValue, search, setSearchParams]);

  useEffect(() => {
    let cancelled = false;

    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/api/question?search=${encodeURIComponent(search)}`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch questions");
        }

        const data = await response.json();
        if (!cancelled) {
          setQuestions(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchQuestions();

    return () => {
      cancelled = true;
    };
  }, [search]);

  const handleSearchChange = (e) => {
    setInputValue(e.target.value);
  };

  const categorized = questions.map((q) => ({ ...q, category: matchCategory(`${q.title} ${q.content}`) }));
  const filtered = category === "semua" ? categorized : categorized.filter((q) => q.category === category);

  return (
    <div className="font-body-md min-h-screen flex flex-col">
      <Header />
      <main className="grow">
        <section className="max-w-container-max mx-auto px-gutter py-section-gap">
          <div className="text-center mb-10">
            <h1 className="font-headline-lg text-headline-lg text-primary-container mb-2">Tanya Jawab</h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto">
              Telusuri seluruh pertanyaan seputar Islam yang telah diajukan oleh komunitas, atau ajukan pertanyaan anda sendiri.
            </p>
          </div>

          <div className="max-w-2xl mx-auto relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-outline" data-icon="search">
                search
              </span>
            </div>
            <input
              className="w-full pl-14 pr-4 py-4 bg-surface-container-lowest border border-outline-variant rounded-2xl font-body-md text-body-md text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all"
              placeholder="Cari pertanyaan..."
              type="text"
              value={inputValue}
              onChange={handleSearchChange}
            />
          </div>

          <div className="flex flex-wrap gap-2 justify-center mb-6" role="radiogroup" aria-label="Filter kategori">
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

          <div className="flex justify-between items-center mb-8">
            <p className="font-body-md text-body-md text-on-surface-variant">
              {loading ? "Memuat..." : `${filtered.length} pertanyaan ditemukan${search ? ` untuk "${search}"` : ""}.`}
            </p>
            <NavLink
              to="/question/create"
              className="hidden sm:inline-flex items-center gap-2 bg-primary-container text-on-primary font-label-sm text-label-sm px-5 py-2.5 rounded-full hover:bg-tertiary transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]" data-icon="edit_note">
                edit_note
              </span>
              Ajukan Pertanyaan
            </NavLink>
          </div>

          {loading ? (
            <LoadingState message="Memuat pertanyaan..." />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon="search_off"
              title="Tidak Ada Pertanyaan Ditemukan"
              message="Coba kata kunci atau kategori lain, atau jadilah yang pertama mengajukan pertanyaan ini."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((q) => (
                <QuestionCard key={q.id} slug={q.id} question={q} adminId={false} />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default Questions;
