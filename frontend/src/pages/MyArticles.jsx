import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Breadcrumb from "../components/Breadcrumb";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
import MonoLabel from "../components/MonoLabel";
import { PageBody, PageHeader, PageLead, PageTitle } from "../components/Page";
import { API_URL } from "../lib/api";
import { formatDate } from "../lib/date";
import { formatCount } from "../lib/format";

function StatusTag({ status }) {
  return status === "published" ? (
    <MonoLabel size="xs" className="px-2 py-1 tracking-[0.12em] bg-forest text-cream-text">
      Terbit
    </MonoLabel>
  ) : (
    <MonoLabel size="xs" className="px-2 py-1 tracking-[0.12em] bg-gold-tint border border-gold-line text-gold-ink">
      Draf
    </MonoLabel>
  );
}

// A Guru's or an Admin's own articles, drafts included, most recently changed first.
function MyArticles() {
  const [list, setList] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/articles/mine`)
      .then((res) => (res.ok ? res.json() : []))
      .then(setList)
      .catch((err) => {
        console.error(err);
        setList([]);
      });
  }, []);

  const drafts = list?.filter((a) => a.status === "draft").length ?? 0;

  return (
    <div className="min-h-screen flex flex-col bg-cream font-serif text-ink">
      <Header />
      <main className="grow">
        <PageHeader>
          <Breadcrumb items={[{ label: "Artikel", to: "/articles" }, { label: "Artikel saya" }]} />
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
            <div className="flex flex-col gap-2.5">
              <PageTitle>Artikel saya</PageTitle>
              <PageLead>Draf dan artikel yang sudah kamu terbitkan. Draf hanya terlihat olehmu dan Admin.</PageLead>
            </div>
            <Button as={Link} to="/articles/tulis" className="px-5 py-3">
              Tulis artikel
            </Button>
          </div>
        </PageHeader>

        <PageBody>
          <MonoLabel as="div" className="text-ink-muted pb-3 border-b border-ink">
            {list ? `${list.length} artikel · ${drafts} draf` : "Memuat…"}
          </MonoLabel>
          {!list ? (
            <LoadingState message="Memuat artikel…" />
          ) : list.length === 0 ? (
            <EmptyState
              className="mt-6"
              title="Belum ada artikel."
              message="Tulis pembahasan pertamamu; simpan sebagai draf dan terbitkan saat sudah siap."
              action={{ label: "Tulis artikel", to: "/articles/tulis" }}
            />
          ) : (
            <ul className="flex flex-col">
              {list.map((a) => (
                <li key={a.id} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-5 border-b border-stone-line">
                  <div className="flex flex-col gap-2 min-w-0 flex-[1_1_320px]">
                    <MonoLabel as="div" className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                      <StatusTag status={a.status} />
                      <span className="text-forest">{a.category?.name ?? "Lainnya"}</span>
                      <span className="text-ink-faint">
                        {a.status === "published" ? formatDate(a.publishedAt) : `Diubah ${formatDate(a.updatedAt)}`}
                      </span>
                      {a.status === "published" && <span className="text-ink-faint">{formatCount(a.views)} dibaca</span>}
                    </MonoLabel>
                    <Link to={`/articles/${a.id}`} className="text-xl leading-snug text-ink hover:text-forest transition-colors text-pretty">
                      {a.title}
                    </Link>
                  </div>
                  <div className="flex items-center gap-5">
                    <Button as={Link} to={`/articles/${a.id}`} variant="link">
                      Buka
                    </Button>
                    <Button as={Link} to={`/articles/${a.id}/ubah`} variant="link">
                      Ubah
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </PageBody>
      </main>
      <Footer />
    </div>
  );
}

export default MyArticles;
