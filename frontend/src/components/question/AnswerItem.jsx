import { useState } from "react";
import RichContent from "../RichContent";
import CommentSection from "../CommentSection";
import { API_URL, pictureUrl } from "../../lib/api";
import Avatar from "../Avatar";
import Button from "../Button";
import MonoLabel from "../MonoLabel";
import VerifiedBadge from "../VerifiedBadge";
import { TextArea } from "../Field";

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
    <article className="py-8 border-b border-stone-line">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar src={pictureUrl(answer.userPicture)} name={answer.userName} size={40} />
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="inline-flex items-center gap-1.5 font-serif text-lg text-ink">
              {answer.userName}
              {answer.role === "Guru" && <VerifiedBadge />}
            </span>
            <MonoLabel size="xs" className="text-ink-faint">
              {answer.role === "Guru" ? "Guru" : "Anggota"}
            </MonoLabel>
          </div>
        </div>
        {canManage && !isEditing && (
          <div className="flex items-center gap-5 shrink-0 pt-1">
            <Button variant="link" onClick={startEditAnswer}>
              Ubah
            </Button>
            <Button variant="danger" onClick={deleteAnswer}>
              Hapus
            </Button>
          </div>
        )}
      </div>

      <div className="mt-5 md:pl-[52px]">
        {isEditing ? (
          <div className="flex flex-col gap-3">
            <TextArea
              aria-label="Ubah jawaban"
              rows="10"
              value={editAnswerContent}
              onChange={(e) => setEditAnswerContent(e.target.value)}
            />
            <div className="flex flex-wrap justify-end gap-3">
              <Button variant="outline" onClick={cancelEditAnswer} className="px-5 py-3">
                Batal
              </Button>
              <Button onClick={saveAnswerEdit} disabled={savingAnswerEdit} className="px-6 py-3">
                {savingAnswerEdit ? "Menyimpan…" : "Simpan"}
              </Button>
            </div>
          </div>
        ) : (
          <RichContent text={answer.content} className="text-[17px] leading-[1.7] text-ink-soft max-w-[70ch] text-pretty" />
        )}

        <div className="mt-8">
          <CommentSection answerId={answer.id} />
        </div>
      </div>
    </article>
  );
}

export default AnswerItem;
