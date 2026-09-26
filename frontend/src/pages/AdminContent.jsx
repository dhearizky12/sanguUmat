import { Link, useSearchParams } from "react-router-dom";
import Button from "../components/Button";
import MonoLabel from "../components/MonoLabel";
import AdminList, { AdminRow, Tag } from "../components/admin/AdminList";
import AdminPage from "../components/admin/AdminPage";
import { FilterChip, FilterRow } from "../components/Filters";
import { formatDate } from "../lib/date";
import { formatCount } from "../lib/format";
import { wibFullDate, wibTime } from "../lib/wib";

const ARTICLE_STATUSES = [
  { key: "draft", label: "Draf" },
  { key: "published", label: "Terbit" },
];
const KAJIAN_STATUSES = [
  { key: "scheduled", label: "Jadwal" },
  { key: "live", label: "Live" },
  { key: "recorded", label: "Rekaman" },
];
const KAJIAN_TAG = { scheduled: ["gold", "Jadwal"], live: ["live", "Live"], recorded: ["plain", "Rekaman"] };

// Every article and kajian, whoever wrote or leads it (?jenis=kajian for kajian).
function AdminContent() {
  const [params, setParams] = useSearchParams();
  const kind = params.get("jenis") === "kajian" ? "kajian" : "artikel";

  const kinds = (
    <FilterRow label="Jenis">
      <FilterChip active={kind === "artikel"} onClick={() => setParams({})}>
        Artikel
      </FilterChip>
      <FilterChip active={kind === "kajian"} onClick={() => setParams({ jenis: "kajian" })}>
        Kajian
      </FilterChip>
    </FilterRow>
  );

  return (
    <AdminPage crumb="Konten" lead="Artikel dan kajian dari seluruh ustadz, termasuk draf.">
      <div className="flex flex-col gap-5">
        {kinds}
        {kind === "artikel" ? (
          <AdminList
            key="artikel"
            endpoint="/api/admin/articles"
            statuses={ARTICLE_STATUSES}
            searchLabel="Cari artikel"
            placeholder="Cari judul atau nama penulis"
            noun="artikel"
            emptyTitle="Tidak ada artikel yang cocok."
            renderRow={(a, remove) => (
              <AdminRow
                key={a.id}
                actions={
                  <>
                    <Button as={Link} to={`/articles/${a.id}`} variant="link">
                      Buka
                    </Button>
                    <Button as={Link} to={`/articles/${a.id}/ubah`} variant="link">
                      Ubah
                    </Button>
                    <Button variant="danger" onClick={() => remove(`/api/articles/${a.id}`, `Hapus artikel "${a.title}"?`)}>
                      Hapus
                    </Button>
                  </>
                }
              >
                <MonoLabel as="div" size="sm" className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-ink-faint">
                  {a.status === "published" ? <Tag tone="forest">Terbit</Tag> : <Tag tone="gold">Draf</Tag>}
                  <span className="text-forest">{a.category?.name ?? "Lainnya"}</span>
                  <span>{a.publishedAt ? formatDate(a.publishedAt) : `Diubah ${formatDate(a.updatedAt)}`}</span>
                  {a.status === "published" && <span>{formatCount(a.views)} dibaca</span>}
                </MonoLabel>
                <Link to={`/articles/${a.id}`} className="text-[17px] leading-snug text-ink hover:text-forest transition-colors text-pretty">
                  {a.title}
                </Link>
                <span className="font-mono text-mono-label tracking-[0.04em] text-ink-muted">{a.author.name}</span>
              </AdminRow>
            )}
          />
        ) : (
          <AdminList
            key="kajian"
            endpoint="/api/admin/kajian"
            statuses={KAJIAN_STATUSES}
            keep={["jenis"]}
            searchLabel="Cari kajian"
            placeholder="Cari judul, seri, atau nama ustadz"
            noun="kajian"
            emptyTitle="Tidak ada kajian yang cocok."
            renderRow={(k, remove) => (
              <AdminRow
                key={k.id}
                actions={
                  <>
                    <Button as={Link} to={`/live/${k.id}`} variant="link">
                      Buka
                    </Button>
                    <Button as={Link} to={`/live/${k.id}/ubah`} variant="link">
                      Ubah
                    </Button>
                    <Button variant="danger" onClick={() => remove(`/api/kajian/${k.id}`, `Hapus kajian "${k.title}"?`)}>
                      Hapus
                    </Button>
                  </>
                }
              >
                <MonoLabel as="div" size="sm" className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-ink-faint">
                  <Tag tone={KAJIAN_TAG[k.status][0]}>{KAJIAN_TAG[k.status][1]}</Tag>
                  <span className="text-forest">{k.series}</span>
                  <span>
                    {wibFullDate(k.startsAt)} · {wibTime(k.startsAt)} WIB · {k.durationMinutes} menit
                  </span>
                  {k.hasNotes && <span>catatan ngaji</span>}
                </MonoLabel>
                <Link to={`/live/${k.id}`} className="text-[17px] leading-snug text-ink hover:text-forest transition-colors text-pretty">
                  {k.title}
                </Link>
                <span className="font-mono text-mono-label tracking-[0.04em] text-ink-muted">
                  {k.ustadz.name} · {formatCount(k.views)} disimak
                </span>
              </AdminRow>
            )}
          />
        )}
      </div>
    </AdminPage>
  );
}

export default AdminContent;
