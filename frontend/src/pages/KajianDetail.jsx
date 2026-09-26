import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Avatar from "../components/Avatar";
import Breadcrumb from "../components/Breadcrumb";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
import MonoLabel from "../components/MonoLabel";
import ArticleBody from "../components/article/ArticleBody";
import { LiveMark } from "../components/kajian/KajianThumb";
import YouTubePlayer from "../components/kajian/YouTubePlayer";
import { FormError } from "../components/Field";
import { PageBody, PageHeader } from "../components/Page";
import { useAuth } from "../hooks/useAuth";
import { API_URL, pictureUrl } from "../lib/api";
import { absoluteAppUrl } from "../lib/basePath";
import { formatCount } from "../lib/format";
import { canManageKajian, canWriteKajian, STATUS_LABELS } from "../lib/kajian";
import { calendarLink, wibDate, wibDay, wibFullDate, wibTime } from "../lib/wib";
import { youtubeWatchUrl } from "../lib/youtube";

function StatusTag({ status }) {
  if (status === "live") return <LiveMark />;
  return (
    <MonoLabel
      size="xs"
      className={`px-2 py-1 tracking-[0.12em] border ${
        status === "scheduled" ? "bg-gold-tint border-gold-line text-gold-ink" : "border-stone-border text-ink-muted"
      }`}
    >
      {STATUS_LABELS[status]}
    </MonoLabel>
  );
}

// One kajian: the embedded YouTube player, then who, when and which series, the
// description and catatan ngaji, and the other sessions of its series. One view is counted
// per visit. Its ustadz and Admins also get edit and delete.
function KajianDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { me } = useAuth();
  const [loaded, setLoaded] = useState({ id: null, data: null, notFound: false });
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/kajian/${id}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data) => {
        setLoaded({ id, data, notFound: false });
        fetch(`${API_URL}/api/kajian/${id}/view`, { method: "POST" })
          .then((res) => (res.ok ? res.json() : null))
          .then(
            (v) =>
              v &&
              setLoaded((prev) =>
                prev.id === id ? { ...prev, data: { ...prev.data, kajian: { ...prev.data.kajian, views: v.views } } } : prev,
              ),
          )
          .catch((err) => console.error(err));
      })
      .catch(() => setLoaded({ id, data: null, notFound: true }));
  }, [id]);

  const data = loaded.id === id ? loaded.data : null;
  const notFound = loaded.id === id && loaded.notFound;
  const kajian = data?.kajian;
  const canManage = canManageKajian(me, kajian);

  const remove = async () => {
    if (!window.confirm("Hapus kajian ini? Tindakan ini tidak dapat dibatalkan.")) return;
    setDeleting(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/kajian/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error(String(res.status));
      navigate(canWriteKajian(me) ? "/live/kelola" : "/live", { replace: true });
    } catch (err) {
      console.error(err);
      setError("Gagal menghapus kajian. Silakan coba lagi.");
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream font-serif text-ink">
      <Header />
      <main className="grow">
        {notFound ? (
          <PageBody>
            <EmptyState
              title="Kajian tidak ditemukan."
              message="Kajian ini tidak ada atau sudah dihapus."
              action={{ label: "Buka Ngaji Bareng", to: "/live" }}
            />
          </PageBody>
        ) : !kajian ? (
          <LoadingState message="Memuat kajian…" />
        ) : (
          <>
            <PageHeader>
              <Breadcrumb
                items={[
                  { label: "Ngaji Bareng", to: "/live" },
                  { label: kajian.series, to: `/live?series=${encodeURIComponent(kajian.series.toLowerCase())}#arsip` },
                ]}
              />
              <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-x-[clamp(28px,4vw,48px)] gap-y-6 items-start">
                <YouTubePlayer videoId={kajian.youtubeId} title={kajian.title} />
                <div className="flex flex-col gap-4 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <StatusTag status={kajian.status} />
                    <MonoLabel className="tracking-[0.12em] text-forest">
                      Seri {kajian.series} &middot; Sesi ke-{kajian.sessionNumber}
                    </MonoLabel>
                  </div>
                  <h1 className="text-[clamp(28px,3.6vw,38px)] leading-[1.14] font-normal tracking-[-0.018em] text-balance">
                    {kajian.title}
                  </h1>
                  <div className="flex items-center gap-3 min-w-0">
                    <Link to={`/ustadz/${kajian.ustadz.id}`} aria-hidden="true" tabIndex={-1} className="shrink-0">
                      <Avatar src={pictureUrl(kajian.ustadz.picture)} name={kajian.ustadz.name} size={40} verified />
                    </Link>
                    <Link to={`/ustadz/${kajian.ustadz.id}`} className="text-lg text-ink hover:text-forest transition-colors">
                      {kajian.ustadz.name}
                    </Link>
                  </div>
                  <MonoLabel as="div" size="sm" className="flex flex-col gap-1.5 text-ink-faint tracking-[0.1em]">
                    <span>
                      {wibDay(kajian.startsAt)}, {wibFullDate(kajian.startsAt)} &middot; {wibTime(kajian.startsAt)} WIB
                    </span>
                    <span>
                      {kajian.durationMinutes} menit &middot; {formatCount(kajian.views)} disimak
                    </span>
                  </MonoLabel>
                  {kajian.description && <p className="text-base leading-relaxed text-ink-soft text-pretty">{kajian.description}</p>}
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    {kajian.status === "scheduled" && (
                      <Button
                        as="a"
                        href={calendarLink(kajian, absoluteAppUrl(`/live/${kajian.id}`))}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-3"
                      >
                        Tambah ke kalender
                      </Button>
                    )}
                    <Button as="a" href={youtubeWatchUrl(kajian.youtubeId)} target="_blank" rel="noopener noreferrer" variant="outline" className="px-5 py-3">
                      Buka di YouTube
                    </Button>
                  </div>
                  {canManage && (
                    <div className="flex flex-wrap items-center gap-5 pt-1">
                      <Button as={Link} to={`/live/${kajian.id}/ubah`} variant="link">
                        Ubah kajian
                      </Button>
                      <Button variant="danger" disabled={deleting} onClick={remove}>
                        {deleting ? "Menghapus…" : "Hapus"}
                      </Button>
                    </div>
                  )}
                  {error && <FormError>{error}</FormError>}
                </div>
              </div>
            </PageHeader>

            <PageBody className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-x-[clamp(28px,4vw,48px)] gap-y-10 items-start">
              <section className="flex flex-col gap-5 min-w-0">
                <MonoLabel as="h2" className="tracking-[0.14em] text-ink pb-2.5 border-b border-ink">
                  Catatan ngaji
                </MonoLabel>
                {data.notes ? (
                  <ArticleBody html={data.notes} className="max-w-[72ch]" />
                ) : (
                  <p className="text-base text-ink-faint">Belum ada catatan untuk sesi ini.</p>
                )}
              </section>

              <aside className="flex flex-col">
                <MonoLabel as="h2" className="tracking-[0.14em] text-ink pb-2.5 border-b border-ink">
                  Sesi lain dalam seri ini
                </MonoLabel>
                {data.seriesSessions.length === 0 ? (
                  <p className="py-4 text-[15px] text-ink-faint">Belum ada sesi lain.</p>
                ) : (
                  data.seriesSessions.map((s) => (
                    <Link
                      key={s.id}
                      to={`/live/${s.id}`}
                      className="flex flex-col gap-1 py-3.5 px-1 border-b border-stone-line-soft hover:bg-cream-hover transition-colors"
                    >
                      <MonoLabel size="xs" className="flex flex-wrap gap-x-2.5 text-ink-faint tracking-[0.1em]">
                        <span className="text-forest">Sesi ke-{s.sessionNumber}</span>
                        <span>
                          {wibDate(s.startsAt)} &middot; {wibTime(s.startsAt)}
                        </span>
                        {s.status !== "recorded" && <span className={s.status === "live" ? "text-live" : "text-gold-dark"}>{STATUS_LABELS[s.status]}</span>}
                      </MonoLabel>
                      <span className="text-base leading-snug text-ink text-pretty">{s.title}</span>
                    </Link>
                  ))
                )}
              </aside>
            </PageBody>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default KajianDetail;
