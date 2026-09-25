import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Breadcrumb from "../components/Breadcrumb";
import Button from "../components/Button";
import MonoLabel from "../components/MonoLabel";
import QuestionCard from "../components/QuestionCard";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import { API_URL } from "../lib/api";
import { CATEGORIES } from "../lib/category";
import { PageBody, PageHeader, PageLead, PageTitle } from "../components/Page";

const STATUSES = [
  { key: "semua", label: "Semua status" },
  { key: "terjawab", label: "Terjawab" },
  { key: "menunggu", label: "Menunggu jawaban" },
];

// One toggle in a filter row: outlined, filled forest when selected.
function FilterChip({ active, onClick, children }) {
  return (
    <MonoLabel
      as="button"
      type="button"
      role="radio"
      aria-checked={active}
      size="sm"
      onClick={onClick}
      className={`px-3 py-2 border cursor-pointer transition-colors ${
        active ? "bg-forest border-forest text-cream-text" : "border-stone-border text-ink-muted hover:bg-cream-hover hover:text-ink"
      }`}
    >
      {children}
    </MonoLabel>
  );
}

function FilterRow({ label, children }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5">
      <MonoLabel size="sm" className="w-[72px] shrink-0 tracking-[0.13em] text-ink-faint">
        {label}
      </MonoLabel>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
        {children}
      </div>
    </div>
  );
}

function Questions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const [inputValue, setInputValue] = useState(search);
  const [syncedSearch, setSyncedSearch] = useState(search);
  const [category, setCategory] = useState("semua");
  const [status, setStatus] = useState("semua");
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

  // "Cari", Enter and the ✕ apply immediately instead of waiting out the debounce.
  const applySearch = (value) => {
    setInputValue(value);
    setSearchParams(value ? { search: value } : {}, { replace: true });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    applySearch(inputValue.trim());
  };

  const hasFilters = category !== "semua" || status !== "semua";
  const resetFilters = () => {
    setCategory("semua");
    setStatus("semua");
  };

  const byCategory = category === "semua" ? questions : questions.filter((q) => q.category === category);
  const filtered =
    status === "semua" ? byCategory : byCategory.filter((q) => (status === "terjawab" ? q.isAnswered : !q.isAnswered));

  return (
    <div className="min-h-screen flex flex-col bg-cream font-serif text-ink">
      <Header />
      <main className="grow">
        <PageHeader>
          <Breadcrumb items={[{ label: "Tanya Jawab" }]} />
          <div className="flex flex-col gap-2.5">
            <PageTitle>Tanya Jawab</PageTitle>
            <PageLead>
              Telusuri pertanyaan seputar Islam yang diajukan komunitas dan dijawab para ustadz. Saring berdasarkan kategori
              atau status jawabannya.
            </PageLead>
          </div>
          <form
            role="search"
            onSubmit={handleSearchSubmit}
            className="w-full flex flex-wrap items-stretch bg-cream border border-stone-border focus-within:border-forest transition-colors"
          >
            <input
              type="text"
              aria-label="Cari pertanyaan"
              value={inputValue}
              onChange={handleSearchChange}
              placeholder="Cari pertanyaan, misalnya: menjamak sholat"
              className="flex-[1_1_220px] min-w-0 bg-transparent outline-none px-[clamp(14px,4vw,20px)] h-14 text-[17px] text-ink placeholder:text-ink-faint"
            />
            {inputValue && (
              <button
                type="button"
                onClick={() => applySearch("")}
                aria-label="Hapus pencarian"
                className="shrink-0 px-3.5 text-[17px] text-ink-faint hover:text-ink cursor-pointer transition-colors"
              >
                &#x2715;
              </button>
            )}
            <Button type="submit" className="shrink-0 tracking-[0.16em] px-[clamp(18px,5vw,26px)]">
              Cari
            </Button>
          </form>
        </PageHeader>

        <PageBody>
          <div className="flex flex-col gap-3 pb-6">
            <FilterRow label="Kategori">
              {CATEGORIES.map((cat) => (
                <FilterChip key={cat.key} active={category === cat.key} onClick={() => setCategory(cat.key)}>
                  {cat.label}
                </FilterChip>
              ))}
            </FilterRow>
            <FilterRow label="Status">
              {STATUSES.map((opt) => (
                <FilterChip key={opt.key} active={status === opt.key} onClick={() => setStatus(opt.key)}>
                  {opt.label}
                </FilterChip>
              ))}
            </FilterRow>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3 pb-3 border-b border-ink">
            <MonoLabel className="text-ink-muted">
              {loading
                ? "Memuat…"
                : `${filtered.length} dari ${questions.length} pertanyaan${search ? ` untuk “${search}”` : ""}`}
            </MonoLabel>
          </div>

          {loading ? (
            <LoadingState message="Memuat pertanyaan…" />
          ) : filtered.length === 0 ? (
            <EmptyState
              className="mt-6"
              title="Belum ada pertanyaan yang cocok."
              message="Coba kata kunci atau saringan lain, atau ajukan pertanyaanmu langsung kepada para ustadz."
              action={
                hasFilters
                  ? { label: "Atur ulang saringan", onClick: resetFilters, variant: "outline" }
                  : { label: "Ajukan Pertanyaan", to: "/question/create" }
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-10">
              {filtered.map((q) => (
                <QuestionCard key={q.id} slug={q.id} question={q} />
              ))}
            </div>
          )}
        </PageBody>
      </main>
      <Footer />
    </div>
  );
}

export default Questions;
