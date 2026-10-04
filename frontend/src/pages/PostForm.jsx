import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Breadcrumb from "../components/Breadcrumb";
import Button from "../components/Button";
import LoadingState from "../components/LoadingState";
import MonoLabel from "../components/MonoLabel";
import LazyEditor from "../components/article/LazyEditor";
import { FieldLabel, FormError, Input, Select, TextArea } from "../components/Field";
import { plainToHtml } from "../lib/answer";
import { PageBody, PageHeader, PageLead, PageTitle } from "../components/Page";
import { useAuth } from "../hooks/useAuth";
import { API_URL } from "../lib/api";
import { useCategories } from "../lib/category";

const TIPS = [
  "Tulis pertanyaannya apa adanya, seperti yang disampaikan penanya.",
  "Jawaban dibaca banyak orang: sertakan dalil dan rujukan bila ada.",
  "Posting langsung tayang di Tanya Jawab, tanpa nama penanya. Yang tampil hanya \"Diposting oleh\" nama ustadz.",
];

// Tulis Posting: an ustadz (or an Admin for them) publishes a question together with its
// answer. `/posting/baru` creates, `/posting/:id/ubah` edits (specs/ustadz-posts). A Guru is
// always the credited ustadz; an Admin picks one under "Diposting atas nama".
function PostForm() {
  const { id } = useParams();
  const editing = id != null;
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { me } = useAuth();
  const isAdmin = me?.role === "Admin";
  const categories = useCategories();
  const [ustadzList, setUstadzList] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState("");
  // `?ustadz=` (from an ustadz's page) preselects who an Admin posts for.
  const [ustadzId, setUstadzId] = useState(params.get("ustadz") ?? "");
  const [loading, setLoading] = useState(editing);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/ustadz`)
      .then((res) => (res.ok ? res.json() : []))
      .then((list) => setUstadzList([...list].sort((a, b) => a.name.localeCompare(b.name, "id"))))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (!editing) return;
    let cancelled = false;
    fetch(`${API_URL}/api/question/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("not found");
        return res.json();
      })
      .then((q) => {
        if (cancelled) return;
        if (!q.isPost) {
          setNotFound(true);
          return;
        }
        setTitle(q.title);
        setContent(q.content);
        const a = q.answers?.[q.answers.length - 1];
        setAnswer(a ? (a.isHtml ? a.content : plainToHtml(a.content)) : "");
        setCategory(q.category ?? "");
        setUstadzId(String(q.userId));
      })
      .catch(() => !cancelled && setNotFound(true))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [editing, id]);

  const clearError = (setter) => (e) => {
    setter(e.target.value);
    setError("");
  };

  const clearAnswer = (html) => {
    setAnswer(html);
    setError("");
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !answer) {
      setError("Judul, pertanyaan, dan jawaban harus diisi.");
      return;
    }
    if (isAdmin && !ustadzId) {
      setError("Pilih ustadz yang bersangkutan.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/question/post${editing ? `/${id}` : ""}`, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          answer,
          category: category || null,
          ustadzId: isAdmin && ustadzId ? Number(ustadzId) : null,
        }),
      });

      if (!response.ok) {
        const text = response.status === 400 ? await response.text() : "";
        setError(text || "Gagal menyimpan posting. Silakan coba lagi.");
        return;
      }

      const postId = editing ? id : (await response.json()).id;
      navigate(`/question/detail/${postId}`);
    } catch (err) {
      console.error(err);
      setError("Gagal menyimpan posting. Silakan coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  const heading = editing ? "Ubah Posting" : "Tulis Posting";

  return (
    <div className="min-h-screen flex flex-col bg-cream font-serif text-ink">
      <Header />
      <main className="grow">
        <PageHeader>
          <Breadcrumb items={[{ label: "Tanya Jawab", to: "/questions" }, { label: heading }]} />
          <PageTitle>{heading}</PageTitle>
          <PageLead>
            Bagikan pertanyaan yang Anda terima di luar situs beserta jawabannya, agar bermanfaat bagi jamaah lain.
          </PageLead>
        </PageHeader>

        {loading ? (
          <LoadingState message="Memuat posting…" />
        ) : notFound ? (
          <PageBody>
            <FormError>Posting tidak ditemukan.</FormError>
          </PageBody>
        ) : (
          <PageBody as="div" className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-x-[clamp(32px,5vw,60px)] gap-y-10 items-start">
            <form onSubmit={submit} className="flex flex-col gap-6 min-w-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-6">
                <div className="flex flex-col gap-2.5">
                  <FieldLabel htmlFor="post-category">
                    Kategori <span className="text-ink-hint">opsional</span>
                  </FieldLabel>
                  <Select id="post-category" value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="">Pilih kategori</option>
                    {categories.map((cat) => (
                      <option key={cat.key} value={cat.key}>
                        {cat.name}
                      </option>
                    ))}
                  </Select>
                </div>

                {isAdmin && (
                  <div className="flex flex-col gap-2.5">
                    <FieldLabel htmlFor="post-ustadz">Diposting atas nama</FieldLabel>
                    <Select id="post-ustadz" value={ustadzId} onChange={clearError(setUstadzId)} invalid={!!error && !ustadzId}>
                      <option value="">Pilih ustadz</option>
                      {ustadzList.map((u) => (
                        <option key={u.id} value={String(u.id)}>
                          {u.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2.5">
                <FieldLabel htmlFor="post-title">Pertanyaan (judul)</FieldLabel>
                <Input
                  id="post-title"
                  type="text"
                  value={title}
                  onChange={clearError(setTitle)}
                  placeholder="Misalnya: Bolehkah sholat sambil duduk?"
                  invalid={!!error && !title.trim()}
                  size="lg"
                />
              </div>

              <div className="flex flex-col gap-2.5">
                <FieldLabel htmlFor="post-content">Uraian pertanyaan</FieldLabel>
                <TextArea
                  id="post-content"
                  rows="6"
                  value={content}
                  onChange={clearError(setContent)}
                  placeholder="Tuliskan pertanyaannya selengkap yang disampaikan."
                  invalid={!!error && !content.trim()}
                  size="lg"
                />
              </div>

              <div className="flex flex-col gap-2.5">
                <FieldLabel as="div" id="post-answer-label">
                  Jawaban
                </FieldLabel>
                <LazyEditor
                  value={answer}
                  onChange={clearAnswer}
                  labelledBy="post-answer-label"
                  placeholder="Tulis jawabannya, lengkap dengan dalil dan rujukan."
                />
              </div>

              {error && <FormError>{error}</FormError>}

              <div className="flex flex-wrap gap-3 pt-1">
                <Button type="submit" disabled={saving} className="min-h-14 px-[26px] tracking-[0.16em]">
                  {saving ? "Menyimpan…" : editing ? "Simpan" : "Terbitkan"}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate(-1)} className="min-h-14 px-[26px] tracking-[0.16em]">
                  Batal
                </Button>
              </div>
            </form>

            <aside className="flex flex-col lg:sticky lg:top-24">
              <MonoLabel className="tracking-[0.14em] text-ink pb-2.5 border-b border-ink">Sebelum menerbitkan</MonoLabel>
              {TIPS.map((tip) => (
                <div key={tip} className="flex gap-3 py-4 border-b border-stone-line-soft">
                  <span aria-hidden="true" className="shrink-0 size-2 mt-[7px] bg-gold-deep" />
                  <span className="text-[15px] leading-relaxed text-ink-soft text-pretty">{tip}</span>
                </div>
              ))}
            </aside>
          </PageBody>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default PostForm;
