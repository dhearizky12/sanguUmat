import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Breadcrumb from "../components/Breadcrumb";
import Button from "../components/Button";
import Loading from "../components/Loading";
import LoadingState from "../components/LoadingState";
import ArticleCover from "../components/article/ArticleCover";
import Editor from "../components/article/Editor";
import { FieldHint, FieldLabel, FormError, Input, Select, TextArea } from "../components/Field";
import { PageBody, PageHeader, PageLead, PageTitle } from "../components/Page";
import { useAuth } from "../hooks/useAuth";
import { API_URL } from "../lib/api";
import { canManageArticle } from "../lib/article";
import { useCategories } from "../lib/category";

const TITLE_MAX = 160;
const SUMMARY_MAX = 300;

const EMPTY = { title: "", summary: "", category: "", cover: null, body: "" };

function Counter({ value, max }) {
  return (
    <span className={`font-mono text-mono-label-xs tracking-[0.1em] ${value.length > max ? "text-rust" : "text-ink-hint"}`}>
      {value.length}/{max}
    </span>
  );
}

// Writes a new article (/articles/tulis) or edits one (/articles/:id/ubah). The route
// guards who may open it; an edit also checks, once loaded, that the viewer may manage this
// article. Saving replaces the whole article and its status, then opens its page.
function ArticleEditor({ id }) {
  const isNew = !id;
  const navigate = useNavigate();
  const { me, loading } = useAuth();
  const categories = useCategories();
  const fileInput = useRef(null);

  const [loaded, setLoaded] = useState(isNew ? { form: EMPTY, status: "draft", author: null } : null);
  const [form, setForm] = useState(EMPTY);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");
  const [coverError, setCoverError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(null);
  const [redirect, setRedirect] = useState(null);

  useEffect(() => {
    if (isNew) return;
    fetch(`${API_URL}/api/articles/${id}`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((a) => {
        const initial = { title: a.title, summary: a.summary ?? "", category: a.category?.key ?? "", cover: a.cover, body: a.body };
        setLoaded({ form: initial, status: a.status, author: a.author });
        setForm(initial);
      })
      .catch(() => setRedirect(`/articles/${id}`));
  }, [id, isNew]);

  // Ask before a reload or closing the tab loses unsaved work.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  if (redirect) return <Navigate to={redirect} replace />;
  if (loading) return <Loading />;
  if (loaded && !isNew && !canManageArticle(me, { author: loaded.author })) return <Navigate to={`/articles/${id}`} replace />;

  const published = loaded?.status === "published";

  const update = (patch) => {
    setForm((f) => ({ ...f, ...patch }));
    setDirty(true);
    setError("");
  };

  const uploadCover = async (file) => {
    if (!file) return;
    setUploading(true);
    setCoverError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch(`${API_URL}/api/articles/cover`, { method: "POST", credentials: "include", body });
      if (!res.ok) {
        setCoverError((await res.text()) || "Gagal mengunggah sampul. Silakan coba lagi.");
        return;
      }
      update({ cover: (await res.json()).cover });
    } catch (err) {
      console.error(err);
      setCoverError("Gagal mengunggah sampul. Silakan coba lagi.");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const save = async (publish) => {
    setSaving(publish ? "publish" : "draft");
    setError("");
    try {
      const res = await fetch(isNew ? `${API_URL}/api/articles` : `${API_URL}/api/articles/${id}`, {
        method: isNew ? "POST" : "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, publish }),
      });
      if (!res.ok) {
        setError((await res.text()) || "Gagal menyimpan artikel. Silakan coba lagi.");
        return;
      }
      const saved = await res.json();
      setDirty(false);
      navigate(`/articles/${saved.id}`);
    } catch (err) {
      console.error(err);
      setError("Gagal menyimpan artikel. Silakan coba lagi.");
    } finally {
      setSaving(null);
    }
  };

  const unpublish = () => {
    if (window.confirm("Batalkan terbit? Artikel akan kembali menjadi draf dan tidak tampil di daftar Artikel.")) save(false);
  };

  const title = isNew ? "Tulis artikel" : "Ubah artikel";

  return (
    <div className="min-h-screen flex flex-col bg-cream font-serif text-ink">
      <Header />
      <main className="grow">
        <PageHeader>
          <Breadcrumb
            items={[
              { label: "Artikel", to: "/articles" },
              ...(isNew ? [] : [{ label: loaded?.form.title || "Artikel", to: `/articles/${id}` }]),
              { label: isNew ? "Tulis" : "Ubah" },
            ]}
          />
          <div className="flex flex-col gap-2.5">
            <PageTitle>{title}</PageTitle>
            <PageLead>
              {published
                ? "Artikel ini sudah terbit. Perubahan tampil untuk pembaca begitu disimpan."
                : "Simpan sebagai draf kapan saja; artikel baru tampil untuk pembaca setelah diterbitkan."}
            </PageLead>
          </div>
        </PageHeader>

        <PageBody>
          {!loaded ? (
            <LoadingState message="Memuat artikel…" />
          ) : (
            <form onSubmit={(e) => e.preventDefault()} className="max-w-[860px] flex flex-col gap-7">
              <div className="flex flex-col gap-2.5">
                <div className="flex items-baseline justify-between gap-3">
                  <FieldLabel htmlFor="article-title">Judul</FieldLabel>
                  <Counter value={form.title} max={TITLE_MAX} />
                </div>
                <Input
                  id="article-title"
                  size="lg"
                  value={form.title}
                  onChange={(e) => update({ title: e.target.value })}
                  placeholder="Misalnya: Memahami Maqasid Syariah di Era Modern"
                />
              </div>

              <div className="flex flex-col gap-2.5">
                <div className="flex items-baseline justify-between gap-3">
                  <FieldLabel htmlFor="article-summary">
                    Ringkasan <span className="text-ink-hint">opsional</span>
                  </FieldLabel>
                  <Counter value={form.summary} max={SUMMARY_MAX} />
                </div>
                <TextArea
                  id="article-summary"
                  rows="3"
                  value={form.summary}
                  onChange={(e) => update({ summary: e.target.value })}
                  placeholder="Satu atau dua kalimat yang tampil di daftar Artikel. Bila kosong, diambil dari awal tulisan."
                />
              </div>

              <div className="flex flex-col gap-2.5 max-w-[420px]">
                <FieldLabel htmlFor="article-category">Rubrik</FieldLabel>
                <Select id="article-category" value={form.category} onChange={(e) => update({ category: e.target.value })}>
                  <option value="">Lainnya (tanpa rubrik)</option>
                  {categories.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="flex flex-col gap-3">
                <FieldLabel as="div">
                  Sampul <span className="text-ink-hint">opsional</span>
                </FieldLabel>
                <div className="flex flex-wrap items-start gap-5">
                  <ArticleCover cover={form.cover} placeholder className="w-full max-w-[360px] aspect-video" />
                  <div className="flex flex-col gap-3">
                    <input
                      ref={fileInput}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => uploadCover(e.target.files?.[0])}
                    />
                    <div className="flex flex-wrap items-center gap-5">
                      <Button variant="outline" disabled={uploading} onClick={() => fileInput.current?.click()} className="px-4 py-2.5">
                        {uploading ? "Mengunggah…" : form.cover ? "Ganti sampul" : "Unggah sampul"}
                      </Button>
                      {form.cover && !uploading && (
                        <Button variant="danger" onClick={() => update({ cover: null })}>
                          Hapus sampul
                        </Button>
                      )}
                    </div>
                    <FieldHint>
                      JPG, PNG atau WebP, maksimal 5 MB. Rasio 3:2 atau 16:9 paling pas.
                    </FieldHint>
                    {coverError && <FormError>{coverError}</FormError>}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <FieldLabel as="div" id="article-body-label">
                  Isi artikel
                </FieldLabel>
                <Editor value={loaded.form.body} onChange={(body) => update({ body })} labelledBy="article-body-label" />
              </div>

              {error && <FormError>{error}</FormError>}

              <div className="flex flex-wrap items-center gap-3 pt-1">
                {published ? (
                  <>
                    <Button disabled={!!saving} onClick={() => save(true)} className="min-h-14 px-[26px] tracking-[0.16em]">
                      {saving === "publish" ? "Menyimpan…" : "Simpan perubahan"}
                    </Button>
                    <Button variant="outline" disabled={!!saving} onClick={unpublish} className="min-h-14 px-6">
                      {saving === "draft" ? "Menyimpan…" : "Batalkan terbit"}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button disabled={!!saving} onClick={() => save(true)} className="min-h-14 px-[26px] tracking-[0.16em]">
                      {saving === "publish" ? "Menerbitkan…" : "Terbitkan"}
                    </Button>
                    <Button variant="outline" disabled={!!saving} onClick={() => save(false)} className="min-h-14 px-6">
                      {saving === "draft" ? "Menyimpan…" : "Simpan draf"}
                    </Button>
                  </>
                )}
                <Button as={Link} to={isNew ? "/articles/saya" : `/articles/${id}`} variant="link" className="ml-2">
                  Batal
                </Button>
              </div>
            </form>
          )}
        </PageBody>
      </main>
      <Footer />
    </div>
  );
}

// Keyed by the article, so moving between two edit pages (or to a new article) starts fresh.
function ArticleEdit() {
  const { id } = useParams();
  return <ArticleEditor key={id ?? "new"} id={id} />;
}

export default ArticleEdit;
