import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button";
import Footer from "../components/Footer";
import Header from "../components/Header";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import Breadcrumb from "../components/Breadcrumb";
import MonoLabel from "../components/MonoLabel";
import QuestionCard from "../components/QuestionCard";
import { FilterChip, FilterRow } from "../components/Filters";
import { PageBody, PageHeader, PageLead, PageTitle } from "../components/Page";
import { useAuth } from "../hooks/useAuth";
import { API_URL } from "../lib/api";
import { ALL_CATEGORIES, useCategories } from "../lib/category";

function AnswerQueue() {
  const categories = useCategories();
  const { me } = useAuth();
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

  // The server lists questions directed to this ustadz first, then newest first.
  const filtered = category === "semua" ? questions : questions.filter((q) => q.category === category);
  const toMe = filtered.filter((q) => q.directedTo && String(q.directedTo.id) === String(me?.id)).length;

  return (
    <div className="min-h-screen flex flex-col bg-cream font-serif text-ink">
      <Header />
      <main className="grow">
        <PageHeader>
          <Breadcrumb items={[{ label: "Jawab Pertanyaan" }]} />
          <div className="flex flex-col gap-2.5">
            <PageTitle>Jawab Pertanyaan</PageTitle>
            <PageLead>Pertanyaan dari jamaah yang masih menunggu jawaban Anda, terbaru lebih dulu.</PageLead>
          </div>
        </PageHeader>

        <PageBody>
          <div className="pb-6">
            <FilterRow label="Kategori">
              {[ALL_CATEGORIES, ...categories].map((cat) => (
                <FilterChip key={cat.key} active={category === cat.key} onClick={() => setCategory(cat.key)}>
                  {cat.name}
                </FilterChip>
              ))}
            </FilterRow>
          </div>

          <div className="pb-3 border-b border-ink">
            <MonoLabel className="text-ink-muted">
              {loading
                ? "Memuat…"
                : `${filtered.length} pertanyaan menunggu jawaban${toMe > 0 ? ` · ${toMe} ditujukan kepada Anda` : ""}`}
            </MonoLabel>
          </div>

          {loading ? (
            <LoadingState message="Memuat pertanyaan…" />
          ) : filtered.length === 0 ? (
            <EmptyState
              className="mt-6"
              title="Semua pertanyaan sudah terjawab."
              message="Tidak ada pertanyaan yang menunggu jawaban untuk kategori ini. Kerja bagus!"
              action={category !== "semua" ? { label: "Semua kategori", onClick: () => setCategory("semua"), variant: "outline" } : undefined}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-10">
              {filtered.map((q) => (
                <QuestionCard
                  key={q.id}
                  slug={q.id}
                  question={q}
                  flags
                  meId={me?.id}
                  action={
                    <Button as={Link} to={`/question/detail/${q.id}#jawab`} className="px-5 py-2.5 tracking-[0.16em]">
                      Jawab
                    </Button>
                  }
                />
              ))}
            </div>
          )}
        </PageBody>
      </main>
      <Footer />
    </div>
  );
}

export default AnswerQueue;
