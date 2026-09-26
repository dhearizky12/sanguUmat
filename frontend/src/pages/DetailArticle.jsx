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
import ArticleCover from "../components/article/ArticleCover";
import { FormError } from "../components/Field";
import { PageBody, PageHeader } from "../components/Page";
import { useAuth } from "../hooks/useAuth";
import { API_URL, pictureUrl } from "../lib/api";
import { formatDate } from "../lib/date";
import { formatCount } from "../lib/format";
import { canManageArticle, canWriteArticles } from "../lib/article";

// One article: header band with rubrik, title, summary and byline; then the cover and the
// body in a reading column. Its author and Admins also get the draft notice and the
// edit/delete actions. A read is counted once per visit, for published articles only.
function DetailArticle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { me } = useAuth();
  const [loaded, setLoaded] = useState({ id: null, article: null, notFound: false });
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/articles/${id}`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data) => {
        setLoaded({ id, article: data, notFound: false });
        if (data.status === "published") {
          fetch(`${API_URL}/api/articles/${id}/view`, { method: "POST" })
            .then((res) => (res.ok ? res.json() : null))
            .then((v) => v && setLoaded((prev) => (prev.id === id ? { ...prev, article: { ...prev.article, views: v.views } } : prev)))
            .catch((err) => console.error(err));
        }
      })
      .catch(() => setLoaded({ id, article: null, notFound: true }));
  }, [id]);

  const article = loaded.id === id ? loaded.article : null;
  const notFound = loaded.id === id && loaded.notFound;
  const canManage = canManageArticle(me, article);
  const isGuru = article?.author.role === "Guru";

  const remove = async () => {
    if (!window.confirm("Hapus artikel ini? Tindakan ini tidak dapat dibatalkan.")) return;
    setDeleting(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/articles/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error(String(res.status));
      navigate(canWriteArticles(me) ? "/articles/saya" : "/articles", { replace: true });
    } catch (err) {
      console.error(err);
      setError("Gagal menghapus artikel. Silakan coba lagi.");
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
              title="Artikel tidak ditemukan."
              message="Artikel ini tidak ada, sudah dihapus, atau belum diterbitkan."
              action={{ label: "Lihat semua artikel", to: "/articles" }}
            />
          </PageBody>
        ) : !article ? (
          <LoadingState message="Memuat artikel…" />
        ) : (
          <>
            <PageHeader>
              <Breadcrumb
                items={[
                  { label: "Artikel", to: "/articles" },
                  article.category
                    ? { label: article.category.name, to: `/articles?category=${encodeURIComponent(article.category.key)}` }
                    : { label: "Lainnya" },
                ]}
              />
              {article.status === "draft" && (
                <MonoLabel as="div" size="sm" className="self-start px-3 py-2 tracking-[0.13em] bg-gold-tint border border-gold-line text-gold-ink">
                  Draf — belum diterbitkan
                </MonoLabel>
              )}
              <div className="max-w-[820px] flex flex-col gap-4">
                <MonoLabel className="tracking-[0.14em] text-forest">{article.category?.name ?? "Lainnya"}</MonoLabel>
                <h1 className="text-[clamp(32px,4.8vw,50px)] leading-[1.08] font-normal tracking-[-0.02em] text-balance">{article.title}</h1>
                {article.summary && <p className="max-w-[60ch] text-[19px] leading-relaxed text-ink-soft text-pretty">{article.summary}</p>}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 pt-1">
                <div className="flex items-center gap-3 min-w-0">
                  {isGuru ? (
                    <Link to={`/ustadz/${article.author.id}`} aria-hidden="true" tabIndex={-1} className="shrink-0">
                      <Avatar src={pictureUrl(article.author.picture)} name={article.author.name} size={40} verified />
                    </Link>
                  ) : (
                    <Avatar src={pictureUrl(article.author.picture)} name={article.author.name} size={40} />
                  )}
                  <div className="flex flex-col gap-0.5 min-w-0">
                    {isGuru ? (
                      <Link to={`/ustadz/${article.author.id}`} className="text-lg text-ink hover:text-forest transition-colors">
                        {article.author.name}
                      </Link>
                    ) : (
                      <span className="text-lg text-ink">{article.author.name}</span>
                    )}
                    <MonoLabel size="sm" className="text-ink-faint">
                      {[
                        article.publishedAt ? formatDate(article.publishedAt) : `Diubah ${formatDate(article.updatedAt)}`,
                        `${article.readMinutes} menit baca`,
                        article.status === "published" ? `${formatCount(article.views)} dibaca` : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </MonoLabel>
                  </div>
                </div>
                {canManage && (
                  <div className="flex flex-wrap items-center gap-5">
                    <Button as={Link} to={`/articles/${id}/ubah`} variant="outline" className="px-5 py-3">
                      Ubah artikel
                    </Button>
                    <Button variant="danger" disabled={deleting} onClick={remove}>
                      {deleting ? "Menghapus…" : "Hapus"}
                    </Button>
                  </div>
                )}
              </div>
              {error && <FormError>{error}</FormError>}
            </PageHeader>

            <PageBody as="article" className="flex flex-col items-center">
              <div className="w-full max-w-[720px] flex flex-col gap-[clamp(28px,4vw,40px)]">
                {article.cover && <ArticleCover cover={article.cover} className="w-full aspect-video" />}
                {article.body ? (
                  <ArticleBody html={article.body} />
                ) : (
                  <p className="text-base text-ink-faint">Artikel ini belum berisi tulisan.</p>
                )}
                <div className="pt-6 border-t border-stone-line flex flex-wrap items-center justify-between gap-4">
                  <Button as={Link} to="/articles" variant="link">
                    &larr; Semua artikel
                  </Button>
                  {article.category && (
                    <Button as={Link} to={`/articles?category=${encodeURIComponent(article.category.key)}`} variant="link">
                      Artikel {article.category.name} lainnya
                    </Button>
                  )}
                </div>
              </div>
            </PageBody>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default DetailArticle;
