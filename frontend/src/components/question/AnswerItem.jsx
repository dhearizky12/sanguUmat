import { useState } from "react";
import { Link } from "react-router-dom";
import AnswerBody from "./AnswerBody";
import CommentSection from "../CommentSection";
import { API_URL, pictureUrl } from "../../lib/api";
import Avatar from "../Avatar";
import Button from "../Button";
import MonoLabel from "../MonoLabel";
import LazyEditor from "../article/LazyEditor";
import { plainToHtml } from "../../lib/answer";

// One answer with its comments. `canManage` (the answer's author or an Admin) unlocks the
// inline edit and the delete.
function AnswerItem({ answer, canManage, isPost = false, onUpdated }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editAnswerContent, setEditAnswerContent] = useState("");
  const [savingAnswerEdit, setSavingAnswerEdit] = useState(false);

  const deleteAnswer = async () => {
    const confirmDelete = window.confirm("Hapus jawaban ini?");
    if (!confirmDelete) return;

    const response = await fetch(`${API_URL}/api/answer/${answer.id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      alert("Jawaban berhasil dihapus");
      window.location.reload();
    } else {
      alert("Gagal menghapus jawaban");
    }
  };

  const startEditAnswer = () => {
    setEditAnswerContent(answer.isHtml ? answer.content : plainToHtml(answer.content));
    setIsEditing(true);
  };

  const cancelEditAnswer = () => {
    setIsEditing(false);
  };

  const saveAnswerEdit = async () => {
    if (!editAnswerContent) {
      alert("Jawaban tidak boleh kosong.");
      return;
    }

    setSavingAnswerEdit(true);
    try {
      const response = await fetch(`${API_URL}/api/answer/${answer.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: editAnswerContent, isHtml: true }),
      });

      if (response.ok) {
        onUpdated(editAnswerContent, true);
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
    <article id={`jawaban-${answer.id}`} className="py-8 border-b border-stone-line scroll-mt-24">
      {!isPost && (
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {answer.isUstadz ? (
              <Link to={`/ustadz/${answer.userId}`} aria-hidden="true" tabIndex={-1} className="shrink-0">
                <Avatar src={pictureUrl(answer.userPicture)} name={answer.userName} size={40} verified />
              </Link>
            ) : (
              <Avatar src={pictureUrl(answer.userPicture)} name={answer.userName} size={40} />
            )}
            <div className="flex flex-col gap-0.5 min-w-0">
              {answer.isUstadz ? (
                <Link to={`/ustadz/${answer.userId}`} className="font-serif text-lg text-ink hover:text-forest transition-colors">
                  {answer.userName}
                </Link>
              ) : (
                <span className="font-serif text-lg text-ink">{answer.userName}</span>
              )}
              <MonoLabel size="xs" className="text-ink-faint">
                {answer.role === "Guru" ? "Guru" : answer.role === "Admin" ? "Admin" : "Anggota"}
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
      )}

      <div className={isPost ? "" : "mt-5 md:pl-[52px]"}>
        {isEditing ? (
          <div className="flex flex-col gap-3">
            <span id={`ubah-jawaban-${answer.id}`} className="sr-only">
              Ubah jawaban
            </span>
            <LazyEditor
              value={editAnswerContent}
              onChange={setEditAnswerContent}
              labelledBy={`ubah-jawaban-${answer.id}`}
              placeholder="Ubah jawaban…"
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
          <AnswerBody answer={answer} />
        )}

        <div className="mt-8">
          <CommentSection answerId={answer.id} />
        </div>
      </div>
    </article>
  );
}

export default AnswerItem;
