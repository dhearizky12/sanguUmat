import { useState } from "react";
import RichContent from "../RichContent";
import CommentSection from "../CommentSection";
import { API_URL, pictureUrl } from "../../lib/api";
import { handleAvatarError } from "../../lib/image";

// One answer with its comments. `canManage` (the answer's author or an Admin) unlocks the
// inline edit and the delete.
function AnswerItem({ answer, canManage, onUpdated }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editAnswerContent, setEditAnswerContent] = useState("");
  const [savingAnswerEdit, setSavingAnswerEdit] = useState(false);

  const deleteAnswer = async () => {
    const confirmDelete = window.confirm("Hapus jawaban ini?");
    if (!confirmDelete) return;

    const response = await fetch(`${API_URL}/api/answer/${answer.id}`, {
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

  const startEditAnswer = () => {
    setEditAnswerContent(answer.content);
    setIsEditing(true);
  };

  const cancelEditAnswer = () => {
    setIsEditing(false);
  };

  const saveAnswerEdit = async () => {
    if (!editAnswerContent.trim()) {
      alert("Jawaban tidak boleh kosong.");
      return;
    }

    setSavingAnswerEdit(true);
    try {
      const response = await fetch(`${API_URL}/api/answer/${answer.id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: editAnswerContent }),
      });

      if (response.ok) {
        onUpdated(editAnswerContent);
        setIsEditing(false);
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

  return (
    <div>
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <img
              src={pictureUrl(answer.userPicture) ?? "/default-avatar.png"}
              alt="Foto profil"
              onError={handleAvatarError}
              className="w-11 h-11 rounded-full object-cover"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <strong className="font-label-sm text-label-sm text-on-surface">{answer.userName}</strong>
                {answer.role === "Guru" && (
                  <span className="material-symbols-outlined icon-fill text-secondary-container text-[16px]">verified</span>
                )}
              </div>
              <p className="text-[12px] text-outline">{answer.role === "Guru" ? "Guru" : "Murid"}</p>
            </div>
          </div>
          {canManage && !isEditing && (
            <div className="flex items-center gap-1">
              <button
                onClick={startEditAnswer}
                title="Edit Jawaban"
                className="w-9 h-9 rounded-full flex items-center justify-center text-primary-container hover:bg-surface-container-low transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
              </button>
              <button
                onClick={deleteAnswer}
                title="Hapus Jawaban"
                className="w-9 h-9 rounded-full flex items-center justify-center text-error hover:bg-error-container/20 transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
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
                onClick={saveAnswerEdit}
                disabled={savingAnswerEdit}
                className="bg-primary-container text-on-primary px-6 py-3 rounded-full font-label-sm text-label-sm font-bold hover:bg-tertiary transition-colors disabled:opacity-60"
              >
                {savingAnswerEdit ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        ) : (
          <RichContent text={answer.content} className="font-body-md text-body-md text-on-surface-variant leading-relaxed" />
        )}
      </div>

      <div className="pt-12">
        <CommentSection answerId={answer.id} />
      </div>
    </div>
  );
}

export default AnswerItem;
