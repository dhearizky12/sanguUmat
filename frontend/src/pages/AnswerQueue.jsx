import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import { API_URL } from "../lib/api";
import { handleAvatarError } from "../lib/image";
import { formatDate } from "../lib/date";
import { CATEGORIES, categoryLabel } from "../lib/category";

function AnswerQueue() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("semua");

  useEffect(() => {
    let cancelled = false;

    const fetchUnanswered = async () => {
      setLoading(true);
      try {
        const listRes = await fetch(`${API_URL}/api/question?status=pending`, { credentials: "include" });
        if (!listRes.ok) throw new Error("Failed to fetch questions");
        const list = await listRes.json();

        if (!cancelled) {
          setQuestions(list);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchUnanswered();

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = category === "semua" ? questions : questions.filter((q) => q.category === category);

  return (
    <div className="font-body-md min-h-screen flex flex-col">
      <Header />
      <main className="grow">
        <section className="max-w-container-max mx-auto px-gutter py-section-gap">
          <div className="text-center mb-10">
            <h1 className="font-headline-lg text-headline-lg text-primary-container mb-2">Jawab Pertanyaan</h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto">
              Pertanyaan dari jamaah yang masih menunggu jawaban dari anda.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 justify-center mb-8" role="radiogroup" aria-label="Filter kategori">
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

          <p className="font-body-md text-body-md text-on-surface-variant mb-8">
            {loading ? "Memuat..." : `${filtered.length} pertanyaan menunggu jawaban.`}
          </p>

          {loading ? (
            <LoadingState message="Memuat pertanyaan..." />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon="task_alt"
              title="Semua Pertanyaan Sudah Terjawab"
              message="Tidak ada pertanyaan yang menunggu jawaban untuk kategori ini. Kerja bagus!"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((q) => (
                <NavLink
                  key={q.id}
                  to={`/question/detail/${q.id}`}
                  className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6 flex flex-col gap-3 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="px-2.5 py-1 rounded-full bg-surface-container-low text-primary-container font-label-sm text-[12px] font-semibold border border-primary-container/20">
                      {categoryLabel(q.category)}
                    </span>
                    <span className="text-outline font-label-sm text-label-sm">{formatDate(q.createdAt)}</span>
                  </div>
                  <h3 className="font-body-lg text-body-lg text-on-surface font-medium line-clamp-2">{q.title}</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2 grow">{q.content}</p>
                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-outline-variant/50">
                    <div className="flex items-center gap-2">
                      <img
                        src={q.userPicture ? API_URL + q.userPicture : "/default-avatar.png"}
                        alt="Foto profil"
                        onError={handleAvatarError}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <span className="font-label-sm text-label-sm text-on-surface-variant">{q.userName}</span>
                    </div>
                    <span className="inline-flex items-center gap-1 bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-bold px-3.5 py-1.5 rounded-full">
                      Jawab
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </span>
                  </div>
                </NavLink>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default AnswerQueue;
