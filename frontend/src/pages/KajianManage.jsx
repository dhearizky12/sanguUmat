import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Breadcrumb from "../components/Breadcrumb";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
import MonoLabel from "../components/MonoLabel";
import KajianThumb from "../components/kajian/KajianThumb";
import { PageBody, PageHeader, PageLead, PageTitle } from "../components/Page";
import { useAuth } from "../hooks/useAuth";
import { API_URL } from "../lib/api";
import { wibDay, wibFullDate, wibTime } from "../lib/wib";

const GROUPS = [
  { status: "live", title: "Live" },
  { status: "scheduled", title: "Terjadwal" },
  { status: "recorded", title: "Rekaman" },
];

// "Kelola kajian": a Guru's own kajian (every kajian for an Admin), by status. Scheduled
// ones read soonest first; the rest newest first.
function KajianManage() {
  const { me } = useAuth();
  const [list, setList] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/kajian/mine`)
      .then((res) => (res.ok ? res.json() : []))
      .then(setList)
      .catch((err) => {
        console.error(err);
        setList([]);
      });
  }, []);

  const groups = GROUPS.map((g) => {
    const items = (list ?? []).filter((k) => k.status === g.status);
    return { ...g, items: g.status === "scheduled" ? [...items].reverse() : items };
  }).filter((g) => g.items.length > 0);

  return (
    <div className="min-h-screen flex flex-col bg-cream font-serif text-ink">
      <Header />
      <main className="grow">
        <PageHeader>
          <Breadcrumb items={[{ label: "Ngaji Bareng", to: "/live" }, { label: "Kelola kajian" }]} />
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
            <div className="flex flex-col gap-2.5">
              <PageTitle>Kelola kajian</PageTitle>
              <PageLead>
                {me?.role === "Admin" ? "Semua kajian dari seluruh ustadz." : "Kajian yang Anda pimpin."} Waktu dalam WIB.
              </PageLead>
            </div>
            <Button as={Link} to="/live/tambah" className="px-5 py-3">
              Tambah kajian
            </Button>
          </div>
        </PageHeader>

        <PageBody className="flex flex-col gap-10">
          {!list ? (
            <LoadingState message="Memuat kajian…" />
          ) : list.length === 0 ? (
            <EmptyState
              title="Belum ada kajian."
              message="Tempel tautan YouTube kajian berikutnya agar tampil di Jadwal pekan ini."
              action={{ label: "Tambah kajian", to: "/live/tambah" }}
            />
          ) : (
            groups.map((g) => (
              <section key={g.status} className="flex flex-col">
                <MonoLabel as="h2" className="flex justify-between gap-3 tracking-[0.14em] text-ink pb-2.5 border-b border-ink">
                  <span>{g.title}</span>
                  <span className="text-ink-muted">{g.items.length}</span>
                </MonoLabel>
                {g.items.map((k) => (
                  <div key={k.id} className="flex flex-wrap items-center gap-x-5 gap-y-3 py-4 border-b border-stone-line">
                    <KajianThumb kajian={k} className="w-[128px] shrink-0" />
                    <div className="flex-[1_1_260px] min-w-0 flex flex-col gap-1.5">
                      <MonoLabel as="div" size="sm" className="flex flex-wrap gap-x-3 gap-y-1 tracking-[0.1em]">
                        <span className="text-forest">
                          {k.series} &middot; Sesi ke-{k.sessionNumber}
                        </span>
                        <span className="text-ink-faint">
                          {wibDay(k.startsAt)}, {wibFullDate(k.startsAt)} &middot; {wibTime(k.startsAt)} WIB
                        </span>
                      </MonoLabel>
                      <Link to={`/live/${k.id}`} className="text-lg leading-snug text-ink hover:text-forest transition-colors text-pretty">
                        {k.title}
                      </Link>
                      <span className="font-mono text-mono-label tracking-[0.08em] text-ink-muted">{k.ustadz?.name}</span>
                    </div>
                    <div className="flex items-center gap-5">
                      <Button as={Link} to={`/live/${k.id}`} variant="link">
                        Buka
                      </Button>
                      <Button as={Link} to={`/live/${k.id}/ubah`} variant="link">
                        Ubah
                      </Button>
                    </div>
                  </div>
                ))}
              </section>
            ))
          )}
        </PageBody>
      </main>
      <Footer />
    </div>
  );
}

export default KajianManage;
