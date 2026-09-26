import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Avatar from "../components/Avatar";
import Breadcrumb from "../components/Breadcrumb";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
import MonoLabel from "../components/MonoLabel";
import ExpertiseTags from "../components/ustadz/ExpertiseTags";
import UstadzWork from "../components/ustadz/UstadzWork";
import { PageBody, PageHeader } from "../components/Page";
import { useAuth } from "../hooks/useAuth";
import { API_URL, pictureUrl } from "../lib/api";
import { formatDate } from "../lib/date";
import { formatCount } from "../lib/format";

function years(e) {
  if (e.startYear && e.endYear) return `${e.startYear}–${e.endYear}`;
  return e.startYear ? `${e.startYear}–` : e.endYear ? `${e.endYear}` : "";
}

function AsideSection({ title, children }) {
  return (
    <section className="flex flex-col gap-3">
      <MonoLabel as="h2" className="tracking-[0.14em] text-ink pb-2.5 border-b border-ink">
        {title}
      </MonoLabel>
      {children}
    </section>
  );
}

// One ustadz: their profile beside their work — answers, articles and kajian
// (components/ustadz/UstadzWork). Parts of the profile left empty are left out.
function UstadzDetail() {
  const { id } = useParams();
  const { me } = useAuth();
  const [loaded, setLoaded] = useState({ id: null, ustadz: null, notFound: false });

  useEffect(() => {
    fetch(`${API_URL}/api/ustadz/${id}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data) => setLoaded({ id, ustadz: data, notFound: false }))
      .catch(() => setLoaded({ id, ustadz: null, notFound: true }));
  }, [id]);

  const ustadz = loaded.id === id ? loaded.ustadz : null;
  const notFound = loaded.id === id && loaded.notFound;
  const canEdit = me && (String(me.id) === String(id) || me.role === "Admin");
  // With nothing in the profile, the aside is dropped for visitors (the answers take the full
  // width) and becomes a nudge to fill it in for the ustadz and Admins.
  const hasProfile = !!ustadz && (!!ustadz.bio || ustadz.expertise.length > 0 || ustadz.education.length > 0);
  const showAside = hasProfile || canEdit;

  return (
    <div className="min-h-screen flex flex-col bg-cream font-serif text-ink">
      <Header />
      <main className="grow">
        {notFound ? (
          <PageBody>
            <EmptyState
              title="Ustadz tidak ditemukan."
              message="Halaman ustadz ini tidak ada atau sudah tidak aktif."
              action={{ label: "Lihat Dewan Ustadz", to: "/ustadz" }}
            />
          </PageBody>
        ) : !ustadz ? (
          <LoadingState message="Memuat profil ustadz…" />
        ) : (
          <>
            <PageHeader>
              <Breadcrumb items={[{ label: "Dewan Ustadz", to: "/ustadz" }, { label: ustadz.name }]} />
              <div className="flex flex-wrap items-end justify-between gap-6">
                <div className="flex items-center gap-5 min-w-0">
                  <Avatar src={pictureUrl(ustadz.picture)} name={ustadz.name} size={88} verified />
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <MonoLabel size="sm" className="tracking-[0.16em] text-gold-dark">
                      Ustadz terverifikasi
                    </MonoLabel>
                    <h1 className="text-[clamp(30px,4.4vw,44px)] leading-[1.1] font-normal tracking-[-0.02em] text-balance">
                      {ustadz.name}
                    </h1>
                    {ustadz.title && <p className="text-[17px] text-ink-soft">{ustadz.title}</p>}
                    <MonoLabel size="sm" className="text-ink-faint">
                      {formatCount(ustadz.answerCount)} jawaban &middot; Bergabung {formatDate(ustadz.joinedAt)}
                    </MonoLabel>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {String(me?.id) !== String(id) && (
                    <Button as={Link} to={`/question/create?ustadz=${id}`} className="px-5 py-3">
                      Tanya ustadz ini
                    </Button>
                  )}
                  {canEdit && (
                    <Button as={Link} to={`/ustadz/${id}/ubah`} variant="outline" className="px-5 py-3">
                      Ubah profil ustadz
                    </Button>
                  )}
                </div>
              </div>
            </PageHeader>

            <PageBody
              className={`grid grid-cols-1 gap-x-[clamp(32px,5vw,60px)] gap-y-10 items-start ${
                showAside ? "lg:grid-cols-[300px_minmax(0,1fr)]" : ""
              }`}
            >
              {showAside && (
                <aside className="flex flex-col gap-8 lg:sticky lg:top-24">
                  {!hasProfile && (
                    <div className="flex flex-col gap-3 border border-dashed border-stone-dotted p-5">
                      <span className="text-lg text-ink">Profil belum diisi.</span>
                      <p className="text-[15px] leading-relaxed text-ink-muted">
                        Tambahkan profil singkat, bidang keahlian, dan riwayat pendidikan agar jamaah mengenal ustadz ini.
                      </p>
                      <Button as={Link} to={`/ustadz/${id}/ubah`} variant="link" className="self-start">
                        Lengkapi profil
                      </Button>
                    </div>
                  )}
                  {ustadz.bio && (
                    <AsideSection title="Profil singkat">
                      <p className="text-base leading-relaxed text-ink-soft whitespace-pre-line text-pretty">{ustadz.bio}</p>
                    </AsideSection>
                  )}
                  {ustadz.expertise.length > 0 && (
                    <AsideSection title="Bidang keahlian">
                      <ExpertiseTags expertise={ustadz.expertise} ustadzId={ustadz.id} />
                    </AsideSection>
                  )}
                  {ustadz.education.length > 0 && (
                    <AsideSection title="Riwayat pendidikan">
                      <ul className="flex flex-col">
                        {ustadz.education.map((e, i) => (
                          <li key={i} className="flex flex-col gap-0.5 py-3 border-b border-stone-line-soft">
                            <span className="text-base text-ink">{e.institution}</span>
                            {(e.degree || years(e)) && (
                              <MonoLabel size="xs" className="text-ink-faint">
                                {[e.degree, years(e)].filter(Boolean).join(" · ")}
                              </MonoLabel>
                            )}
                          </li>
                        ))}
                      </ul>
                    </AsideSection>
                  )}
                </aside>
              )}

              <UstadzWork ustadz={ustadz} stack={showAside} />
            </PageBody>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default UstadzDetail;
