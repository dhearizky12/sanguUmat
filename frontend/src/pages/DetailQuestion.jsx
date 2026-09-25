import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import SectionHeading from "../components/SectionHeading";
import QuestionHeader from "../components/question/QuestionHeader";
import AnswerItem from "../components/question/AnswerItem";
import AnswerForm from "../components/question/AnswerForm";
import RelatedSidebar from "../components/question/RelatedSidebar";
import { useAuth } from "../hooks/useAuth";
import { API_URL } from "../lib/api";
import { PageBody } from "../components/Page";

function DetailQuestion() {
  // What was loaded, tagged with its id, so moving to another question never shows the
  // previous one. Unknown ids and unanswered questions the caller may not see both answer 404.
  const [loaded, setLoaded] = useState({ id: null, question: null, notFound: false });
  const { id } = useParams();
  const question = loaded.id === id ? loaded.question : null;
  const notFound = loaded.id === id && loaded.notFound;
  const setQuestion = (update) => setLoaded((prev) => ({ ...prev, question: update(prev.question) }));
  const { me } = useAuth();

  useEffect(() => {
    fetch(`${API_URL}/api/Question/${id}`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data) => {
        setLoaded({ id, question: data, notFound: false });
        // Fire-and-forget: records a real view for this specific visit, and only for a question
        // the caller may see. Deliberately not the same request as the fetch above — that
        // endpoint is also reused as a batch data-fetch elsewhere (Dashboard.jsx), which must
        // never count as a view.
        fetch(`${API_URL}/api/question/${id}/view`, { method: "POST", credentials: "include" }).catch((err) =>
          console.error(err),
        );
      })
      .catch(() => setLoaded({ id, question: null, notFound: true }));
  }, [id]);

  const canEditQuestion = me?.id === question?.userId && question?.answers.length === 0;
  // Admin moderation isn't subject to the zero-answers rule.
  const canDeleteQuestion = canEditQuestion || me?.role === "Admin";

  const updateQuestion = (changes) => setQuestion((prev) => ({ ...prev, ...changes }));

  const updateAnswer = (answerId, content) =>
    setQuestion((prev) => ({
      ...prev,
      answers: prev.answers.map((a) => (a.id === answerId ? { ...a, content } : a)),
    }));

  return (
    <div className="min-h-screen flex flex-col bg-cream font-serif text-ink">
      <Header />
      <main className="grow">
        {notFound ? (
          <PageBody>
            <EmptyState
              title="Pertanyaan tidak ditemukan."
              message="Pertanyaan ini tidak ada, atau belum dijawab sehingga belum ditampilkan untuk umum."
              action={{ label: "Buka Tanya Jawab", to: "/questions" }}
            />
          </PageBody>
        ) : !question ? (
          <LoadingState message="Memuat pertanyaan…" />
        ) : (
          <>
            <QuestionHeader
              question={question}
              canEdit={canEditQuestion}
              canDelete={canDeleteQuestion}
              onUpdated={updateQuestion}
            />

            <PageBody as="div" className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-x-14 gap-y-12 items-start">
              <div className="flex flex-col gap-10 min-w-0">
                <section>
                  <SectionHeading title="Jawaban" meta={`${question.answers.length} jawaban`} />
                  {question.answers.length === 0 ? (
                    <EmptyState
                      className="mt-6"
                      title="Belum ada jawaban."
                      message="Jawaban dari ustadz akan tampil di sini begitu tersedia."
                    />
                  ) : (
                    question.answers.map((item) => (
                      <AnswerItem
                        key={item.id}
                        answer={item}
                        canManage={me?.id === item.userId || me?.role === "Admin"}
                        onUpdated={(content) => updateAnswer(item.id, content)}
                      />
                    ))
                  )}
                </section>

                {me?.role === "Guru" && <AnswerForm questionId={id} />}
              </div>

              <RelatedSidebar question={question} isGuru={me?.role === "Guru"} />
            </PageBody>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default DetailQuestion;
