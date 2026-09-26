import { Link } from "react-router-dom";
import Button from "../components/Button";
import MonoLabel from "../components/MonoLabel";
import AdminList, { AdminRow } from "../components/admin/AdminList";
import AdminPage from "../components/admin/AdminPage";
import { timeAgo } from "../lib/timeAgo";

// The newest comments across the site, to read in context or remove.
function AdminComments() {
  return (
    <AdminPage crumb="Komentar" lead="Komentar terbaru dari seluruh jawaban, untuk ditinjau dan dihapus bila perlu.">
      <AdminList
        endpoint="/api/admin/comments"
        searchLabel="Cari komentar"
        placeholder="Cari isi komentar atau nama penulis"
        noun="komentar"
        emptyTitle="Tidak ada komentar yang cocok."
        renderRow={(c, remove) => (
          <AdminRow
            key={c.id}
            actions={
              <>
                <Button as={Link} to={`/question/detail/${c.question.id}#jawaban-${c.answerId}`} variant="link">
                  Buka
                </Button>
                <Button variant="danger" onClick={() => remove(`/api/answer/${c.answerId}/comments/${c.id}`, `Hapus komentar dari ${c.user.name}?`)}>
                  Hapus
                </Button>
              </>
            }
          >
            <p className="text-base leading-relaxed text-ink text-pretty whitespace-pre-line line-clamp-4">{c.content}</p>
            <MonoLabel as="div" size="sm" className="flex flex-wrap gap-x-2.5 gap-y-1 text-ink-faint">
              <span className="text-forest">{c.user.name}</span>
              <span>{timeAgo(c.createdAt)}</span>
            </MonoLabel>
            <span className="text-[15px] leading-snug text-ink-muted text-pretty">di: {c.question.title}</span>
          </AdminRow>
        )}
      />
    </AdminPage>
  );
}

export default AdminComments;
