import { useEffect, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import RichContent from "../components/RichContent";
import CommentSection from "../components/CommentSection";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import { useAuth } from "../hooks/useAuth";
import { API_URL } from "../lib/api";
import { handleAvatarError } from "../lib/image";
import { categoryLabel } from "../lib/category";
import { formatDate } from "../lib/date";

const RELATED_LIMIT = 5;

function DetailQuestion() {
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [relatedQuestions, setRelatedQuestions] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [editingAnswerId, setEditingAnswerId] = useState(null);
  const [editAnswerContent, setEditAnswerContent] = useState("");
  const [savingAnswerEdit, setSavingAnswerEdit] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
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

  const startEditAnswer = (item) => {
    setEditingAnswerId(item.id);
    setEditAnswerContent(item.content);
  };

  const cancelEditAnswer = () => {
    setEditingAnswerId(null);
  };

  const saveAnswerEdit = async (answerId) => {
    if (!editAnswerContent.trim()) {
      alert("Jawaban tidak boleh kosong.");
      return;
    }

    setSavingAnswerEdit(true);
    try {
      const response = await fetch(`${API_URL}/api/answer/${answerId}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: editAnswerContent }),
      });

      if (response.ok) {
        setQuestion((prev) => ({
          ...prev,
          answers: prev.answers.map((a) => (a.id === answerId ? { ...a, content: editAnswerContent } : a)),
        }));
        setEditingAnswerId(null);
      } else {
        alert("Gagal menyimpan perubahan jawaban.");
      }
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan perubahan jawaban.");
    } finally {
      setSavingAnswerEdit(false);
    }
  };

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

  useEffect(() => {
    if (!question) {
      return;
    }

    let cancelled = false;

    const loadRelated = async () => {
      try {
        const res = await fetch(`${API_URL}/api/question`, { credentials: "include" });
        const list = res.ok ? await res.json() : [];
        const others = list.filter((q) => String(q.id) !== String(id));

        if (me?.role === "Guru") {
          // For an ustadz, "related" isn't useful — what matters is what to answer next.
          const unanswered = others.filter((q) => !q.isAnswered);
          if (!cancelled) setRelatedQuestions(unanswered.slice(0, RELATED_LIMIT));
          return;
        }

        // Regular users: same category first, then fill the rest with the most recent other
        // questions.
        const currentCategory = question.category;
        const sameCategory = currentCategory ? others.filter((q) => q.category === currentCategory) : [];
        const rest = others.filter((q) => !sameCategory.includes(q));
        if (!cancelled) setRelatedQuestions([...sameCategory, ...rest].slice(0, RELATED_LIMIT));
      } catch (err) {
        console.error(err);
      }
    };

    loadRelated();

    return () => {
      cancelled = true;
    };
  }, [question, id, me?.role]);

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

  const canEditQuestion = me?.id === question?.userId && question?.answers.length === 0;
  // Admin moderation isn't subject to the zero-answers rule — see BE_PLAN.md Phase 3.
  const canDeleteQuestion = canEditQuestion || me?.role === "Admin";

  const startEditQuestion = () => {
    setEditTitle(question.title);
    setEditContent(question.content);
    setIsEditing(true);
  };

  const cancelEditQuestion = () => {
    setIsEditing(false);
  };

  const saveQuestionEdit = async (e) => {
    e.preventDefault();

    if (!editTitle.trim() || !editContent.trim()) {
      alert("Judul dan detail pertanyaan tidak boleh kosong.");
      return;
    }

    setSavingEdit(true);
    try {
      // PUT /api/question/{id} doesn't exist on the backend yet (see BE_PLAN.md) — this will
      // currently fail (405, no PUT route mapped). Wired to the correct shape so it starts
      // working the moment that endpoint ships, rather than faking a local-only save for
      // something as consequential as a user's own question content.
      const response = await fetch(`${API_URL}/api/question/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editTitle,
          content: editContent,
        }),
      });

      if (response.ok) {
        setQuestion((prev) => ({ ...prev, title: editTitle, content: editContent }));
        setIsEditing(false);
      } else {
        alert("Gagal menyimpan perubahan. Fitur ini belum didukung oleh server.");
      }
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan perubahan. Fitur ini belum didukung oleh server.");
    } finally {
      setSavingEdit(false);
    }
  };

  const deleteQuestion = async () => {
    const confirmDelete = window.confirm("Hapus pertanyaan ini? Tindakan ini tidak bisa dibatalkan.");
    if (!confirmDelete) return;

    const response = await fetch(`${API_URL}/api/question/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (response.ok) {
      alert("Pertanyaan berhasil dihapus");
      navigate("/questions");
    } else if (response.status === 409) {
      alert("Pertanyaan sudah memiliki jawaban dan tidak bisa dihapus.");
    } else if (response.status === 403) {
      alert("Anda tidak memiliki izin untuk menghapus pertanyaan ini.");
    } else {
      alert("Gagal menghapus pertanyaan. Silakan coba lagi.");
    }
  };

  const category = question?.category ?? null;

  return (
    <div className="font-body-md min-h-screen flex flex-col">
      <Header />
      <main className="grow max-w-container-max w-full mx-auto px-gutter py-section-gap">
        {!question ? (
          <LoadingState message="Memuat pertanyaan..." />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-8">
              {/* QUESTION — a page header, not a card, so it reads as the top-level subject
                rather than looking identical to the answer list below it. */}
              <div className="border-b border-outline-variant pb-8">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span className="inline-block px-2.5 py-1 rounded-full bg-surface-container-low text-primary-container font-label-sm text-[12px] font-semibold border border-primary-container/20">
                    {categoryLabel(category)}
                  </span>

                  {(canEditQuestion || canDeleteQuestion) && !isEditing && (
                    <div className="ml-auto flex items-center gap-4">
                      {canEditQuestion && (
                        <button
                          onClick={startEditQuestion}
                          title="Edit Pertanyaan"
                          className="flex items-center gap-1 text-primary-container font-label-sm text-label-sm hover:opacity-60 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                          Edit
                        </button>
                      )}
                      {canDeleteQuestion && (
                        <button
                          onClick={deleteQuestion}
                          title="Hapus Pertanyaan"
                          className="flex items-center gap-1 text-error font-label-sm text-label-sm hover:opacity-60 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                          Hapus
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <form onSubmit={saveQuestionEdit} className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <label className="font-label-sm text-label-sm text-on-surface-variant ml-1">Judul</label>
                      <input
                        className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 font-body-md text-body-md text-on-surface outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors"
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-label-sm text-label-sm text-on-surface-variant ml-1">Detail Pertanyaan</label>
                      <textarea
                        className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 font-body-md text-body-md text-on-surface outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors resize-none"
                        rows="6"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={cancelEditQuestion}
                        className="text-on-surface-variant px-6 py-3 rounded-full font-label-sm text-label-sm hover:bg-surface-container-low transition-colors"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={savingEdit}
                        className="bg-primary-container text-on-primary px-6 py-3 rounded-full font-label-sm text-label-sm font-bold hover:bg-tertiary transition-colors disabled:opacity-60"
                      >
                        {savingEdit ? "Menyimpan..." : "Simpan"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
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
                  </>
                )}
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
                                    <span className="material-symbols-outlined icon-fill text-secondary-container text-[16px]">verified</span>
                                  )}
                                </div>
                                <p className="text-[12px] text-outline">{item.role === "Guru" ? "Guru" : "Murid"}</p>
                              </div>
                            </div>
                            {(me?.id === item.userId || me?.role === "Admin") && editingAnswerId !== item.id && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => startEditAnswer(item)}
                                  title="Edit Jawaban"
                                  className="w-9 h-9 rounded-full flex items-center justify-center text-primary-container hover:bg-surface-container-low transition cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-[18px]">edit</span>
                                </button>
                                <button
                                  onClick={() => deleteAnswer(item.id)}
                                  title="Hapus Jawaban"
                                  className="w-9 h-9 rounded-full flex items-center justify-center text-error hover:bg-error-container/20 transition cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                              </div>
                            )}
                          </div>

                          {editingAnswerId === item.id ? (
                            <div className="space-y-3">
                              <textarea
                                value={editAnswerContent}
                                onChange={(e) => setEditAnswerContent(e.target.value)}
                                className="w-full border border-outline-variant rounded-2xl p-4 min-h-[160px] outline-none focus:border-primary-container resize-none font-body-md text-body-md"
                              />
                              <div className="flex justify-end gap-3">
                                <button
                                  type="button"
                                  onClick={cancelEditAnswer}
                                  className="text-on-surface-variant px-6 py-3 rounded-full font-label-sm text-label-sm hover:bg-surface-container-low transition-colors"
                                >
                                  Batal
                                </button>
                                <button
                                  type="button"
                                  onClick={() => saveAnswerEdit(item.id)}
                                  disabled={savingAnswerEdit}
                                  className="bg-primary-container text-on-primary px-6 py-3 rounded-full font-label-sm text-label-sm font-bold hover:bg-tertiary transition-colors disabled:opacity-60"
                                >
                                  {savingAnswerEdit ? "Menyimpan..." : "Simpan"}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <RichContent text={item.content} className="font-body-md text-body-md text-on-surface-variant leading-relaxed" />
                          )}
                        </div>

                        <div className="pt-12">
                          <CommentSection answerId={item.id} />
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

            {/* SIDEBAR */}
            <aside className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6">
                <h3 className="font-title-md text-title-md text-on-surface mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary-container text-[20px]">
                    {me?.role === "Guru" ? "task_alt" : "forum"}
                  </span>
                  {me?.role === "Guru" ? "Jawab Pertanyaan Lain" : "Pertanyaan Terkait"}
                </h3>
                {relatedQuestions.length === 0 ? (
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    {me?.role === "Guru" ? "Tidak ada pertanyaan lain yang menunggu jawaban." : "Belum ada pertanyaan terkait."}
                  </p>
                ) : (
                  <div className="divide-y divide-outline-variant/50">
                    {relatedQuestions.map((q) => (
                      <NavLink key={q.id} to={`/question/detail/${q.id}`} className="block py-3 first:pt-0 last:pb-0 group">
                        <h4 className="font-label-sm text-label-sm text-on-surface font-semibold line-clamp-2 group-hover:text-primary-container transition-colors">
                          {q.title}
                        </h4>
                        <p className="text-[12px] text-outline mt-1">{formatDate(q.createdAt)}</p>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>

              {me?.role !== "Guru" && (
                <div className="bg-primary-container rounded-xl p-6 text-center">
                  <p className="font-title-md text-title-md text-on-primary mb-2">Punya Pertanyaan Lain?</p>
                  <p className="font-body-md text-body-md text-on-primary/80 mb-4">Ajukan pertanyaan anda dan dapatkan jawaban dari para ustadz.</p>
                  <NavLink
                    to="/question/create"
                    className="inline-flex items-center gap-2 bg-surface text-primary-container font-label-sm text-label-sm px-5 py-2.5 rounded-full hover:bg-surface-container-low transition-colors font-bold"
                  >
                    Ajukan Pertanyaan
                  </NavLink>
                </div>
              )}
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default DetailQuestion;
