import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import { useAuth } from "../hooks/useAuth";
import { API_URL } from "../lib/api";
import { formatDate } from "../lib/date";
import { matchCategory, categoryLabel } from "../lib/category";

function CreateQuestion() {
  const { me } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [myQuestions, setMyQuestions] = useState([]);
  const [loadingMine, setLoadingMine] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!me) {
      return;
    }

    // No "my questions" endpoint yet (see BE_PLAN.md) — filter the full list client-side, then
    // pull each one's detail to know whether it's been answered. Fine at the scale of "one
    // person's own questions"; swap for GET /api/question/mine once that ships.
    let cancelled = false;

    const fetchMine = async () => {
      setLoadingMine(true);
      try {
        const listRes = await fetch(`${API_URL}/api/question`, { credentials: "include" });
        if (!listRes.ok) throw new Error("Failed to fetch questions");
        const list = await listRes.json();
        const mine = list.filter((q) => q.userId === me.id);

        const details = await Promise.all(
          mine.map((q) =>
            fetch(`${API_URL}/api/question/${q.id}`)
              .then((r) => (r.ok ? r.json() : null))
              .then((detail) => (detail ? { ...q, ...detail } : null))
              .catch(() => null),
          ),
        );

        if (!cancelled) {
          setMyQuestions(details.filter(Boolean));
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) {
          setLoadingMine(false);
        }
      }
    };

    fetchMine();

    return () => {
      cancelled = true;
    };
  }, [me, refreshKey]);

  const submitQuestion = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert("Judul dan detail pertanyaan tidak boleh kosong.");
      return;
    }

    const response = await fetch(`${API_URL}/api/question`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        content,
      }),
    });

    if (response.ok) {
      alert("Pertanyaan berhasil dibuat");
      setTitle("");
      setContent("");
      setRefreshKey((k) => k + 1);
    } else {
      alert("Gagal membuat pertanyaan");
    }
  };

  return (
    <div className="font-body-md min-h-screen flex flex-col">
      <Header />
      <main className="grow max-w-container-max w-full mx-auto px-gutter py-section-gap">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6 md:p-8">
              <h1 className="font-headline-lg text-headline-lg text-primary-container mb-2">Ajukan Pertanyaan</h1>
              <p className="font-body-md text-body-md text-on-surface-variant mb-6">
                Tuliskan pertanyaan anda seputar Islam, dan dapatkan jawaban dari para ustadz terverifikasi.
              </p>
              <form className="space-y-6" onSubmit={submitQuestion}>
                <div className="flex flex-col gap-2">
                  <label className="font-label-sm text-label-sm text-on-surface-variant ml-1">Judul</label>
                  <input
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 font-body-md text-body-md text-on-surface outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors"
                    type="text"
                    placeholder="Tulis judul pertanyaan anda"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-label-sm text-label-sm text-on-surface-variant ml-1">Detail Pertanyaan</label>
                  <textarea
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 font-body-md text-body-md text-on-surface outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors resize-none"
                    placeholder="Jelaskan pertanyaan anda dengan detail..."
                    rows="6"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-primary-container text-on-primary px-6 py-3 rounded-full font-label-sm text-label-sm font-bold hover:bg-tertiary transition-colors shadow-sm active:scale-95 flex items-center gap-2"
                  >
                    Kirim Pertanyaan
                    <span className="material-symbols-outlined text-[18px]" data-icon="send">
                      send
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          <aside className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6">
              <h2 className="font-title-md text-title-md text-on-surface mb-4">Pertanyaan Saya</h2>

              {loadingMine ? (
                <LoadingState message="Memuat pertanyaan anda..." />
              ) : myQuestions.length === 0 ? (
                <EmptyState icon="quiz" title="Belum Ada Pertanyaan" message="Pertanyaan yang anda ajukan akan tampil di sini." />
              ) : (
                <div className="divide-y divide-outline-variant/50">
                  {myQuestions.map((q) => {
                    const isAnswered = q.answers && q.answers.length > 0;
                    const category = matchCategory(`${q.title} ${q.content}`);

                    return (
                      <NavLink key={q.id} to={`/question/detail/${q.id}`} className="block py-4 first:pt-0 last:pb-0 group">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="px-2 py-0.5 rounded-full bg-surface-container-low text-primary-container font-label-sm text-[11px] font-semibold border border-primary-container/20">
                            {categoryLabel(category)}
                          </span>
                          <span
                            className={`flex items-center gap-1 font-label-sm text-[11px] pl-2 p-0.5 rounded-full ml-auto ${
                              isAnswered ? "text-primary" : "text-on-surface/50"
                            }`}
                          >
                            {isAnswered ? "Terjawab" : "Menunggu"}
                            <span className="material-symbols-outlined text-[13px]">{isAnswered ? "check_circle" : "schedule"}</span>
                          </span>
                        </div>
                        <h3 className="font-body-md text-body-md text-on-surface font-medium line-clamp-2 group-hover:text-primary-container transition-colors">
                          {q.title}
                        </h3>
                        <p className="text-[12px] text-outline mt-1">{formatDate(q.createdAt)}</p>
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default CreateQuestion;
