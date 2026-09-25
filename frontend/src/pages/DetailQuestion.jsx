import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import QuestionHeader from "../components/question/QuestionHeader";
import AnswerItem from "../components/question/AnswerItem";
import AnswerForm from "../components/question/AnswerForm";
import RelatedSidebar from "../components/question/RelatedSidebar";
import { useAuth } from "../hooks/useAuth";
import { API_URL } from "../lib/api";

function DetailQuestion() {
  const [question, setQuestion] = useState(null);
  const { id } = useParams();
  const { me } = useAuth();

  useEffect(() => {
    fetch(`${API_URL}/api/Question/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setQuestion(data);
      });

    // Fire-and-forget: records a real view for this specific visit. Deliberately not the same
    // request as the fetch above — that endpoint is also reused as a batch data-fetch
    // workaround elsewhere (Dashboard.jsx etc.), which must never count as a view.
    fetch(`${API_URL}/api/question/${id}/view`, { method: "POST" }).catch((err) => console.error(err));
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
    <div className="font-body-md min-h-screen flex flex-col">
      <Header />
      <main className="grow max-w-container-max w-full mx-auto px-gutter py-section-gap">
        {!question ? (
          <LoadingState message="Memuat pertanyaan..." />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-8">
              <QuestionHeader
                question={question}
                canEdit={canEditQuestion}
                canDelete={canDeleteQuestion}
                onUpdated={updateQuestion}
              />

              <div>
                <h2 className="font-title-md text-title-md text-on-surface mb-4">{question.answers.length} Jawaban</h2>

                {question.answers.length === 0 ? (
                  <EmptyState title="Belum Ada Jawaban" message="Jawaban dari ustadz akan tampil di sini begitu tersedia." />
                ) : (
                  <div className="space-y-4">
                    {question.answers.map((item) => (
                      <AnswerItem
                        key={item.id}
                        answer={item}
                        canManage={me?.id === item.userId || me?.role === "Admin"}
                        onUpdated={(content) => updateAnswer(item.id, content)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {me?.role === "Guru" && <AnswerForm questionId={id} />}
            </div>

            <RelatedSidebar question={question} isGuru={me?.role === "Guru"} />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default DetailQuestion;
