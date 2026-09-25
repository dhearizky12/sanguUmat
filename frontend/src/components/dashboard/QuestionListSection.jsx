import { useState } from "react";
import { NavLink } from "react-router-dom";
import QuestionListItem from "./QuestionListItem";
import MonoLabel from "../MonoLabel";
import SectionHeading from "../SectionHeading";

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
        <MonoLabel as="div" className="py-16 text-center text-ink-muted">Memuat pertanyaan terjawab&hellip;</MonoLabel>
      ) : questions.length === 0 ? (
        <div className="border border-dashed border-stone-dotted py-14 px-7 text-center flex flex-col items-center gap-2.5">
          <div className="font-serif text-xl md:text-[22px] text-ink">Belum ada jawaban yang cocok.</div>
          <p className="max-w-[46ch] text-base text-ink-muted">
            Coba kategori lain, atau ajukan pertanyaanmu langsung kepada para ustadz.
          </p>
          <MonoLabel
            as={NavLink}
            to="/question/create"
            className="mt-2 bg-forest text-cream-text px-5 py-3 hover:bg-ink transition-colors"
          >
            Ajukan Pertanyaan
          </MonoLabel>
        </div>
      ) : (
        <div className={columns === 2 ? "grid grid-cols-1 md:grid-cols-2 md:gap-x-10" : "flex flex-col"}>
          {questions.map((question) => (
            <QuestionListItem key={question.id} question={question} />
          ))}
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <MonoLabel
          as={NavLink}
          to="/questions"
          className="text-forest border border-stone-border px-6 py-3 hover:border-forest hover:bg-cream-hover transition-colors"
        >
          Lihat semua jawaban
        </MonoLabel>
      </div>
    </section>
  );
}

export default QuestionListSection;
