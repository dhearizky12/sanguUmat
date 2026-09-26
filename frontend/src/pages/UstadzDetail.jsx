import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Avatar from "../components/Avatar";
import Breadcrumb from "../components/Breadcrumb";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
import MonoLabel from "../components/MonoLabel";
import Pagination from "../components/Pagination";
import QuestionCard from "../components/QuestionCard";
import SectionHeading from "../components/SectionHeading";
import ExpertiseTags from "../components/ustadz/ExpertiseTags";
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

// One ustadz: their profile beside the questions they answered, paged through the
// browse endpoint (?page= in the URL). Parts of the profile left empty are left out.
function UstadzDetail() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number.parseInt(params.get("page") ?? "1", 10) || 1);
  const { me } = useAuth();
  const [loaded, setLoaded] = useState({ id: null, ustadz: null, notFound: false });
  const [answers, setAnswers] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/ustadz/${id}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data) => setLoaded({ id, ustadz: data, notFound: false }))
      .catch(() => setLoaded({ id, ustadz: null, notFound: true }));
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_URL}/api/question/browse?ustadz=${id}&page=${page}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => !cancelled && setAnswers({ key: `${id}:${page}`, data }))
      .catch((err) => console.error(err));
    return () => {
      cancelled = true;
    };
  }, [id, page]);

  const ustadz = loaded.id === id ? loaded.ustadz : null;
  const notFound = loaded.id === id && loaded.notFound;
  const canEdit = me && (String(me.id) === String(id) || me.role === "Admin");
  const answerData = answers?.data;

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

            <PageBody className="grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)] gap-x-[clamp(32px,5vw,60px)] gap-y-10 items-start">
              <aside className="flex flex-col gap-8 lg:sticky lg:top-24">
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

              <section className="flex flex-col min-w-0">
                <SectionHeading
                  title={`Jawaban dari ${ustadz.name}`}
                  meta={answerData ? `${formatCount(answerData.total)} jawaban` : ""}
                />
                {!answerData ? (
                  <LoadingState message="Memuat jawaban…" />
                ) : answerData.items.length === 0 ? (
                  <EmptyState className="mt-6" title="Belum ada jawaban." message="Jawaban ustadz ini akan tampil di sini." />
                ) : (
                  <>
                    <div className="grid grid-cols-1 min-[900px]:grid-cols-2 min-[900px]:gap-x-10">
                      {answerData.items.map((q) => (
                        <QuestionCard key={q.id} slug={q.id} question={q} />
                      ))}
                    </div>
                    <Pagination
                      page={answerData.page}
                      totalPages={answerData.totalPages}
                      onChange={(p) => {
                        setParams(p > 1 ? { page: String(p) } : {});
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    />
                  </>
                )}
              </section>
            </PageBody>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default UstadzDetail;
