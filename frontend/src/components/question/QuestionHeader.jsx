import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../Breadcrumb";
import Button from "../Button";
import Byline from "../Byline";
import CheckRow from "../CheckRow";
import MonoLabel from "../MonoLabel";
import RichContent from "../RichContent";
import { FieldLabel, Input, TextArea } from "../Field";
import { API_URL, pictureUrl } from "../../lib/api";
import Avatar from "../Avatar";
import { categoryLabel, useCategories } from "../../lib/category";
import { formatDate } from "../../lib/date";
import { formatCount } from "../../lib/format";
import { PageHeader } from "../Page";
import { useAuth } from "../../hooks/useAuth";
import QuestionFlags from "./QuestionFlags";

// The question itself, set as the page's warm header band so it reads as the subject the
// answers below respond to. Owns the owner's inline edit and the owner/admin delete.
function QuestionHeader({ question, canEdit, canDelete, onUpdated }) {
  const categories = useCategories();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editAnonymous, setEditAnonymous] = useState(false);
  const [editPublish, setEditPublish] = useState(true);
  const { me } = useAuth();
  const [savingEdit, setSavingEdit] = useState(false);
  const navigate = useNavigate();

  const startEditQuestion = () => {
    setEditTitle(question.title);
    setEditContent(question.content);
    setEditAnonymous(question.isAnonymous);
    setEditPublish(question.allowPublish);
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
      const response = await fetch(`${API_URL}/api/question/${question.id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editTitle,
          content: editContent,
          isAnonymous: editAnonymous,
          allowPublish: editPublish,
        }),
      });

      if (response.ok) {
        onUpdated({ title: editTitle, content: editContent, isAnonymous: editAnonymous, allowPublish: editPublish });
        setIsEditing(false);
      } else {
        alert("Gagal menyimpan perubahan. Silakan coba lagi.");
      }
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan perubahan. Silakan coba lagi.");
    } finally {
      setSavingEdit(false);
    }
  };

  const deleteQuestion = async () => {
    const confirmDelete = window.confirm("Hapus pertanyaan ini? Tindakan ini tidak bisa dibatalkan.");
    if (!confirmDelete) return;

    const response = await fetch(`${API_URL}/api/question/${question.id}`, {
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

  const category = categoryLabel(categories, question.category);
  // The real name of an anonymous asker reaches only the asker, Gurus and Admins.
  const anonymousShown = question.isAnonymous && question.userId != null;

  return (
    <PageHeader>
      <Breadcrumb items={[{ label: "Tanya Jawab", to: "/questions" }, { label: category }]} />

      {isEditing ? (
        <form onSubmit={saveQuestionEdit} className="flex flex-col gap-5 max-w-[760px]">
          <div className="flex flex-col gap-2.5">
            <FieldLabel htmlFor="edit-title">Judul</FieldLabel>
            <Input id="edit-title" type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2.5">
            <FieldLabel htmlFor="edit-content">Detail pertanyaan</FieldLabel>
            <TextArea id="edit-content" rows="8" value={editContent} onChange={(e) => setEditContent(e.target.value)} />
          </div>
          <div className="flex flex-col gap-3">
            <CheckRow checked={editAnonymous} onChange={setEditAnonymous}>
              Tampilkan sebagai anonim. Nama saya disembunyikan dari halaman publik.
            </CheckRow>
            <CheckRow checked={editPublish} onChange={setEditPublish}>
              Jawaban boleh ditayangkan di Tanya Jawab agar bermanfaat bagi jamaah lain.
            </CheckRow>
          </div>
          <div className="flex flex-wrap justify-end gap-3">
            <Button variant="outline" onClick={cancelEditQuestion} className="px-5 py-3">
              Batal
            </Button>
            <Button type="submit" disabled={savingEdit} className="px-6 py-3">
              {savingEdit ? "Menyimpan…" : "Simpan"}
            </Button>
          </div>
        </form>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            <MonoLabel as="div" className="flex flex-wrap items-baseline gap-x-3.5 gap-y-1.5">
              <span className="text-forest">{category}</span>
              <span className="text-ink-faint">{formatDate(question.createdAt)}</span>
              <span className="text-ink-faint">{formatCount(question.views)} dibaca</span>
              <QuestionFlags question={question} meId={me?.id} linkUstadz />
            </MonoLabel>
            {question.allowPublish === false && (
              <MonoLabel as="div" size="sm" className="self-start px-3 py-2 tracking-[0.13em] bg-gold-tint border border-gold-line text-gold-ink">
                Privat — tidak ditayangkan di Tanya Jawab
              </MonoLabel>
            )}
            <h1 className="font-serif text-[clamp(30px,4.4vw,46px)] leading-[1.1] font-normal tracking-[-0.02em] text-ink max-w-[30ch] text-balance">
              {question.title}
            </h1>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            <Byline>
              <Avatar src={pictureUrl(question.userPicture)} name={question.userName} size={28} />
              <span>Ditanyakan oleh</span>
              <span className="text-forest">{question.userName}</span>
              {anonymousShown && <span className="text-ink-faint">(anonim)</span>}
            </Byline>

            {(canEdit || canDelete) && (
              <div className="flex items-center gap-5">
                {canEdit && (
                  <Button variant="link" onClick={startEditQuestion}>
                    Ubah
                  </Button>
                )}
                {canDelete && (
                  <Button variant="danger" onClick={deleteQuestion}>
                    Hapus
                  </Button>
                )}
              </div>
            )}
          </div>

          <RichContent text={question.content} className="text-[17px] leading-[1.7] text-ink-soft max-w-[70ch] text-pretty" />
        </>
      )}
    </PageHeader>
  );
}

export default QuestionHeader;
