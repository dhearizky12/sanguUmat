import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import LoadingState from "../components/LoadingState";
import MonoLabel from "../components/MonoLabel";
import AdminPage from "../components/admin/AdminPage";
import { API_URL } from "../lib/api";
import { timeAgo } from "../lib/timeAgo";

const nf = new Intl.NumberFormat("id-ID");

// One numbers tile: a heading, the main figure, and its breakdown; links to its tab.
function Tile({ title, value, to, lines }) {
  return (
    <Link to={to} className="flex flex-col gap-2 p-5 border border-stone-line bg-paper hover:border-forest transition-colors">
      <MonoLabel size="sm" className="tracking-[0.14em] text-ink-faint">
        {title}
      </MonoLabel>
      <span className="text-[34px] leading-none text-ink">{nf.format(value)}</span>
      <span className="flex flex-col gap-0.5 font-mono text-mono-label-xs tracking-[0.06em] text-ink-muted">
        {lines.map(([label, n]) => (
          <span key={label}>
            {nf.format(n)} {label}
          </span>
        ))}
      </span>
    </Link>
  );
}

// Ringkasan: the site's numbers at a glance, and the questions that have waited longest.
function AdminOverview() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/admin/overview`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then(setData)
      .catch((err) => console.error(err));
  }, []);

  return (
    <AdminPage crumb="Ringkasan" lead="Gambaran Sangu Umat hari ini: pengguna, pertanyaan, dan konten para ustadz.">
      {!data ? (
        <LoadingState message="Memuat ringkasan…" />
      ) : (
        <div className="flex flex-col gap-10">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(210px,100%),1fr))] gap-4">
            <Tile
              title="Pengguna"
              value={data.users.total}
              to="/admin/users"
              lines={[["anggota", data.users.anggota], ["ustadz", data.users.ustadz], ["admin", data.users.admin], ["baru 7 hari", data.users.newThisWeek]]}
            />
            <Tile
              title="Pertanyaan"
              value={data.questions.total}
              to="/admin/pertanyaan"
              lines={[["terbit", data.questions.published], ["menunggu", data.questions.waiting], ["privat", data.questions.privateAnswered], ["anonim", data.questions.anonymous]]}
            />
            <Tile
              title="Aktivitas 7 hari"
              value={data.activity.questionsThisWeek + data.activity.answersThisWeek + data.activity.commentsThisWeek}
              to="/admin/komentar"
              lines={[["jawaban", data.activity.answersThisWeek], ["pertanyaan", data.activity.questionsThisWeek], ["komentar", data.activity.commentsThisWeek]]}
            />
            <Tile title="Artikel" value={data.articles.published + data.articles.drafts} to="/admin/konten" lines={[["terbit", data.articles.published], ["draf", data.articles.drafts]]} />
            <Tile
              title="Kajian"
              value={data.kajian.scheduled + data.kajian.live + data.kajian.recorded}
              to="/admin/konten?jenis=kajian"
              lines={[["terjadwal", data.kajian.scheduled], ["live", data.kajian.live], ["rekaman", data.kajian.recorded]]}
            />
          </div>

          <section className="flex flex-col">
            <div className="flex flex-wrap items-baseline justify-between gap-3 pb-3 border-b border-ink">
              <h2 className="font-serif text-2xl md:text-[28px] font-normal tracking-tight">Perlu dijawab</h2>
              <MonoLabel as={Link} to="/admin/pertanyaan?status=menunggu" size="sm" className="text-forest border-b border-stone-border hover:text-gold-dark">
                Semua yang menunggu
              </MonoLabel>
            </div>
            {data.waiting.length === 0 ? (
              <p className="py-5 text-base text-ink-muted">Semua pertanyaan sudah terjawab.</p>
            ) : (
              data.waiting.map((q) => (
                <Link
                  key={q.id}
                  to={`/question/detail/${q.id}`}
                  className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-4 border-b border-stone-line-soft hover:bg-cream-hover transition-colors"
                >
                  <span className="flex-[1_1_320px] text-[17px] leading-snug text-ink text-pretty">{q.title}</span>
                  <MonoLabel size="sm" className="text-ink-faint">
                    menunggu sejak {timeAgo(q.createdAt)}
                    {q.directedTo ? ` · untuk ${q.directedTo.name}` : ""}
                  </MonoLabel>
                </Link>
              ))
            )}
          </section>
        </div>
      )}
    </AdminPage>
  );
}

export default AdminOverview;
