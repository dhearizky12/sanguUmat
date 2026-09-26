import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import AutoGrid from "../components/AutoGrid";
import Avatar from "../components/Avatar";
import Breadcrumb from "../components/Breadcrumb";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
import MonoLabel from "../components/MonoLabel";
import ExpertiseTags from "../components/ustadz/ExpertiseTags";
import { PageBody, PageHeader, PageLead, PageTitle } from "../components/Page";
import { API_URL, pictureUrl } from "../lib/api";
import { formatCount } from "../lib/format";

// Dewan Ustadz: every Guru, most answers first, each linking to their page.
function Ustadz() {
  const [list, setList] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/ustadz`)
      .then((res) => (res.ok ? res.json() : []))
      .then(setList)
      .catch((err) => {
        console.error(err);
        setList([]);
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-cream font-serif text-ink">
      <Header />
      <main className="grow">
        <PageHeader>
          <Breadcrumb items={[{ label: "Dewan Ustadz" }]} />
          <div className="flex flex-col gap-2.5">
            <PageTitle>Dewan Ustadz</PageTitle>
            <PageLead>Para ustadz terverifikasi yang menjawab pertanyaan jamaah di Sangu Umat.</PageLead>
          </div>
        </PageHeader>

        <PageBody>
          <MonoLabel as="div" className="text-ink-muted pb-3 border-b border-ink">
            {list ? `${list.length} ustadz` : "Memuat…"}
          </MonoLabel>
          {!list ? (
            <LoadingState message="Memuat ustadz…" />
          ) : list.length === 0 ? (
            <EmptyState className="mt-6" title="Belum ada ustadz." message="Ustadz yang terdaftar akan tampil di sini." />
          ) : (
            <AutoGrid min={300} className="gap-x-10">
              {list.map((u) => (
                <Link
                  key={u.id}
                  to={`/ustadz/${u.id}`}
                  className="flex items-start gap-4 py-6 md:px-4 border-b border-stone-line hover:bg-cream-hover transition-colors"
                >
                  <Avatar src={pictureUrl(u.picture)} name={u.name} size={56} verified />
                  <div className="flex flex-col gap-2 min-w-0">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xl leading-snug text-ink">{u.name}</span>
                      {u.title && <span className="text-[15px] leading-snug text-ink-soft">{u.title}</span>}
                    </div>
                    <ExpertiseTags expertise={u.expertise} />
                    <MonoLabel size="sm" className="text-ink-faint">
                      {formatCount(u.answerCount)} jawaban
                    </MonoLabel>
                  </div>
                </Link>
              ))}
            </AutoGrid>
          )}
        </PageBody>
      </main>
      <Footer />
    </div>
  );
}

export default Ustadz;
