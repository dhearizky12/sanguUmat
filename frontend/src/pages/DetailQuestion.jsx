import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import RichContent from "../components/RichContent";
import CommentSection from "../components/CommentSection";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import { useAuth } from "../hooks/useAuth";
import { API_URL } from "../lib/api";
import { handleAvatarError } from "../lib/image";
import { matchCategory, categoryLabel } from "../lib/category";

function DetailQuestion() {
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const { id } = useParams();
  const { me } = useAuth();

  const deleteAnswer = async (answerId) => {
    const confirmDelete = window.confirm("Hapus jawaban ini?");
    if (!confirmDelete) return;

    const response = await fetch(`${API_URL}/api/answer/${answerId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (response.ok) {
      alert("Jawaban berhasil dihapus");
      window.location.reload();
    } else {
      alert("Gagal menghapus jawaban");
    }
  };

  useEffect(() => {
    fetch(`${API_URL}/api/Question/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setQuestion(data);
      });
  }, [id]);

  const submitAnswer = async () => {
    const response = await fetch(`${API_URL}/api/answer/${id}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Content: answer,
      }),
    });

    if (response.ok) {
      alert("Jawaban berhasil dibuat");
      window.location.reload();
    }
  };

  const category = question ? matchCategory(`${question.title} ${question.content}`) : null;

  return (
    <div className="font-body-md min-h-screen flex flex-col">
      <Header />
      <main className="grow max-w-container-max w-full mx-auto px-gutter py-section-gap">
        {!question ? (
          <LoadingState message="Memuat pertanyaan..." />
        ) : (
          <div className="space-y-8">
            {/* QUESTION — a page header, not a card, so it reads as the top-level subject
                rather than looking identical to the answer list below it. */}
            <div className="border-b border-outline-variant pb-8">
              {category && (
                <span className="inline-block px-2.5 py-1 rounded-full bg-surface-container-low text-primary-container font-label-sm text-[12px] font-semibold border border-primary-container/20 mb-4">
                  {categoryLabel(category)}
                </span>
              )}
              <h1 className="font-headline-lg text-headline-lg text-on-surface mb-4">{question.title}</h1>
              <div className="flex items-center gap-3 mb-6">
                <img
                  src={question.userPicture ? API_URL + "/" + question.userPicture : "/default-avatar.png"}
                  alt="Foto profil"
                  onError={handleAvatarError}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="font-label-sm text-label-sm text-on-surface-variant">{question.userName}</span>
              </div>
              <RichContent text={question.content} className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed" />
            </div>

            {/* ANSWERS */}
            <div>
              <h2 className="font-title-md text-title-md text-on-surface mb-4">{question.answers.length} Jawaban</h2>

              {question.answers.length === 0 ? (
                <EmptyState icon="forum" title="Belum Ada Jawaban" message="Jawaban dari ustadz akan tampil di sini begitu tersedia." />
              ) : (
                <div className="space-y-4">
                  {question.answers.map((item) => (
                    <div key={item.id}>
                      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6 space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.userPicture ? API_URL + "/" + item.userPicture : "/default-avatar.png"}
                              alt="Foto profil"
                              onError={handleAvatarError}
                              className="w-11 h-11 rounded-full object-cover"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <strong className="font-label-sm text-label-sm text-on-surface">{item.userName}</strong>
                                {item.role === "Guru" && (
                                  <span className="material-symbols-outlined text-secondary-container text-[16px]">verified</span>
                                )}
                              </div>
                              <p className="text-[12px] text-outline">{item.role === "Guru" ? "Guru" : "Murid"}</p>
                            </div>
                          </div>
                          {me?.id === item.userId && (me?.role === "Admin" || me?.role === "Guru") && (
                            <button
                              onClick={() => deleteAnswer(item.id)}
                              title="Hapus Jawaban"
                              className="w-9 h-9 rounded-full flex items-center justify-center text-error hover:bg-error-container/20 transition cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          )}
                        </div>

                        <RichContent text={item.content} className="font-body-md text-body-md text-on-surface-variant leading-relaxed" />
                      </div>

                      <div className="pt-12">
                        <CommentSection />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* FORM JAWABAN */}
            {me?.role === "Guru" && (
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6">
                <h3 className="font-title-md text-title-md text-on-surface mb-4">Tulis Jawaban</h3>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Tulis jawaban terbaik..."
                  className="w-full border border-outline-variant rounded-2xl p-4 min-h-[160px] outline-none focus:border-primary-container resize-none font-body-md text-body-md"
                />
                <div className="flex justify-end mt-4">
                  <button
                    onClick={submitAnswer}
                    className="bg-primary-container text-on-primary px-6 py-3 rounded-full font-label-sm text-label-sm font-semibold hover:bg-tertiary transition-colors"
                  >
                    Kirim Jawaban
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default DetailQuestion;
