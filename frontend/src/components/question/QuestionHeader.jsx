import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RichContent from "../RichContent";
import { API_URL, pictureUrl } from "../../lib/api";
import { handleAvatarError } from "../../lib/image";
import { categoryLabel } from "../../lib/category";

// The question itself — a page header, not a card, so it reads as the top-level subject
// rather than looking identical to the answer list below it. Owns the owner's inline edit
// and the owner/admin delete.
function QuestionHeader({ question, canEdit, canDelete, onUpdated }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const navigate = useNavigate();

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
      const response = await fetch(`${API_URL}/api/question/${question.id}`, {
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
        onUpdated({ title: editTitle, content: editContent });
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

  return (
    <div className="border-b border-outline-variant pb-8">
      <div className="flex items-center justify-between gap-3 mb-4">
        <span className="inline-block px-2.5 py-1 rounded-full bg-surface-container-low text-primary-container font-label-sm text-[12px] font-semibold border border-primary-container/20">
          {categoryLabel(question.category ?? null)}
        </span>

        {(canEdit || canDelete) && !isEditing && (
          <div className="ml-auto flex items-center gap-4">
            {canEdit && (
              <button
                onClick={startEditQuestion}
                title="Edit Pertanyaan"
                className="flex items-center gap-1 text-primary-container font-label-sm text-label-sm hover:opacity-60 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
                Edit
              </button>
            )}
            {canDelete && (
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
              src={pictureUrl(question.userPicture) ?? "/default-avatar.png"}
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
  );
}

export default QuestionHeader;
