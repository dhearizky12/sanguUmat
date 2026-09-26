import { Link } from "react-router-dom";
import Button from "../components/Button";
import MonoLabel from "../components/MonoLabel";
import AdminList, { AdminRow, Tag } from "../components/admin/AdminList";
import AdminPage from "../components/admin/AdminPage";
import { formatDate } from "../lib/date";

const STATUSES = [
  { key: "menunggu", label: "Menunggu" },
  { key: "terjawab", label: "Terjawab" },
  { key: "privat", label: "Privat" },
];

// Every question — waiting, private and anonymous included, askers unmasked — to open or
// remove. Removing someone's question notifies them (the question delete endpoint does).
function AdminQuestions() {
  return (
    <AdminPage crumb="Pertanyaan" lead="Semua pertanyaan, termasuk yang menunggu, privat, dan anonim.">
      <AdminList
        endpoint="/api/admin/questions"
        statuses={STATUSES}
        searchLabel="Cari pertanyaan"
        placeholder="Cari judul, isi, atau nama penanya"
        noun="pertanyaan"
        emptyTitle="Tidak ada pertanyaan yang cocok."
        renderRow={(q, remove) => (
          <AdminRow
            key={q.id}
            actions={
              <>
                <Button as={Link} to={`/question/detail/${q.id}`} variant="link">
                  Buka
                </Button>
                <Button variant="danger" onClick={() => remove(`/api/question/${q.id}`, `Hapus pertanyaan "${q.title}"? Penanya akan diberi tahu.`)}>
                  Hapus
                </Button>
              </>
            }
          >
            <MonoLabel as="div" size="sm" className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-ink-faint">
              {q.answerCount === 0 ? <Tag tone="gold">Menunggu</Tag> : q.allowPublish ? <Tag tone="forest">Terjawab</Tag> : <Tag>Privat</Tag>}
              {q.isAnonymous && <Tag>Anonim</Tag>}
              <span className="text-forest">{q.category?.name ?? "Lainnya"}</span>
              <span>{formatDate(q.createdAt)}</span>
            </MonoLabel>
            <Link to={`/question/detail/${q.id}`} className="text-[17px] leading-snug text-ink hover:text-forest transition-colors text-pretty">
              {q.title}
            </Link>
            <span className="font-mono text-mono-label tracking-[0.04em] text-ink-muted">
              {q.asker.name}
              {q.isAnonymous ? " (anonim)" : ""}
              {q.directedTo ? ` · ditujukan kepada ${q.directedTo.name}` : ""} · {q.answerCount} jawaban · {q.commentCount} komentar
            </span>
          </AdminRow>
        )}
      />
    </AdminPage>
  );
}

export default AdminQuestions;
