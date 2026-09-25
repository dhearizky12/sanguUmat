import { useState } from "react";
import { NavLink } from "react-router-dom";
import QuestionListItem from "./QuestionListItem";
import MonoLabel from "../MonoLabel";
import SectionHeading from "../SectionHeading";
import Button from "../Button";
import EmptyState from "../EmptyState";
import LoadingState from "../LoadingState";

function OneColumnIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <rect x="1.5" y="2.5" width="13" height="4" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <rect x="1.5" y="9.5" width="13" height="4" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function TwoColumnIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <rect x="1.5" y="2.5" width="5.5" height="11" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <rect x="9" y="2.5" width="5.5" height="11" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function QuestionListSection({ questions, loading, totalCount, activeCategoryLabel }) {
  const [columns, setColumns] = useState(2);

  const title = activeCategoryLabel ?? "Jawaban Terbaru";
  const meta = `${questions.length} dari ${totalCount} jawaban`;

  return (
    <section id="tanya" className="max-w-container-max mx-auto px-page py-10 md:py-16">
      <SectionHeading
        title={title}
        className="mb-1"
        meta={
          <div className="flex items-center flex-wrap gap-x-4 gap-y-2">
            <MonoLabel className="text-ink-muted">{meta}</MonoLabel>
            <div className="hidden sm:flex items-stretch border border-stone-border">
              <button
                type="button"
                aria-label="Satu kolom"
                aria-pressed={columns === 1}
                onClick={() => setColumns(1)}
                className={`px-2.5 py-2 flex items-center justify-center transition-colors ${
                  columns === 1 ? "bg-forest text-cream-text" : "text-ink-muted hover:bg-cream-hover"
                }`}
              >
                <OneColumnIcon />
              </button>
              <button
                type="button"
                aria-label="Dua kolom"
                aria-pressed={columns === 2}
                onClick={() => setColumns(2)}
                className={`px-2.5 py-2 flex items-center justify-center transition-colors ${
                  columns === 2 ? "bg-forest text-cream-text" : "text-ink-muted hover:bg-cream-hover"
                }`}
              >
                <TwoColumnIcon />
              </button>
            </div>
          </div>
        }
      />

      {loading ? (
        <LoadingState message="Memuat pertanyaan terjawab…" />
      ) : questions.length === 0 ? (
        <EmptyState
          title="Belum ada jawaban yang cocok."
          message="Coba kategori lain, atau ajukan pertanyaanmu langsung kepada para ustadz."
          action={{ label: "Ajukan Pertanyaan", to: "/question/create" }}
        />
      ) : (
        <div className={columns === 2 ? "grid grid-cols-1 md:grid-cols-2 md:gap-x-10" : "flex flex-col"}>
          {questions.map((question) => (
            <QuestionListItem key={question.id} question={question} />
          ))}
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <Button
          variant="outline"
          as={NavLink}
          to="/questions"
          className="px-6 py-3 hover:border-forest"
        >
          Lihat semua jawaban
        </Button>
      </div>
    </section>
  );
}

export default QuestionListSection;
