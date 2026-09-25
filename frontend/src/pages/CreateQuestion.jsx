import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Breadcrumb from "../components/Breadcrumb";
import Button from "../components/Button";
import Loading from "../components/Loading";
import LogoMark from "../components/LogoMark";
import MonoLabel from "../components/MonoLabel";
import MyQuestions from "../components/ask/MyQuestions";
import { FieldLabel, Input, Select, TextArea, FormError } from "../components/Field";
import { useAuth } from "../hooks/useAuth";
import { API_URL } from "../lib/api";
import { CATEGORIES } from "../lib/category";

// The Ajukan Pertanyaan canvas, built to what the backend supports today. Left out until
// their roadmap changes land: the monthly quota, ticket numbers and review statuses, the
// ustadz picker, anonymous posting and the review-flow panel.
const TIPS = [
  "Satu pertanyaan untuk satu masalah, agar jawabannya bisa fokus.",
  "Sebutkan konteksnya: pekerjaan, kondisi kesehatan, atau kebiasaan setempat yang relevan.",
  "Cek dulu di Tanya Jawab, barangkali pertanyaan serupa sudah pernah dijawab.",
];

// Shown instead of the form to a visitor who is not signed in.
function SignInGate() {
  return (
    <div className="min-h-screen bg-cream font-serif text-ink flex items-center justify-center px-6 py-10">
      <div className="max-w-[380px] flex flex-col items-center gap-3.5 text-center">
        <LogoMark />
        <MonoLabel size="sm" className="tracking-[0.16em] text-gold-dark">
          Perlu masuk
        </MonoLabel>
        <h1 className="text-[26px] font-normal tracking-[-0.015em]">Masuk untuk mengajukan pertanyaan</h1>
        <p className="text-base leading-relaxed text-ink-muted">Hanya pengguna yang sudah masuk dapat mengajukan pertanyaan.</p>
        <div className="mt-1.5 flex flex-wrap justify-center gap-3">
          <Button as={Link} to="/login" className="tracking-[0.16em] px-[22px] py-3.5">
            Masuk sekarang
          </Button>
          <Button as={Link} to="/" variant="outline" className="px-5 py-3.5">
            Kembali ke beranda
          </Button>
        </div>
      </div>
    </div>
  );
}

function CreateQuestion() {
  const { isAuthenticated, loading } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [myQuestions, setMyQuestions] = useState([]);
  const [loadingMine, setLoadingMine] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let cancelled = false;

    const fetchMine = async () => {
      setLoadingMine(true);
      try {
        const res = await fetch(`${API_URL}/api/question/mine`, { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch my questions");
        const mine = await res.json();

        if (!cancelled) {
          setMyQuestions(mine);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) {
          setLoadingMine(false);
        }
      }
    };

    fetchMine();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, refreshKey]);

  const submitQuestion = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setError("Judul dan uraian pertanyaan tidak boleh kosong.");
      return;
    }

    setSending(true);
    try {
      const response = await fetch(`${API_URL}/api/question`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          category: category || null,
        }),
      });

      if (response.ok) {
        setTitle("");
        setContent("");
        setCategory("");
        setSent(true);
        setRefreshKey((k) => k + 1);
      } else {
        setError("Gagal mengirim pertanyaan. Silakan coba lagi.");
      }
    } catch (err) {
      console.error(err);
      setError("Gagal mengirim pertanyaan. Silakan coba lagi.");
    } finally {
      setSending(false);
    }
  };

  const clearError = (setter) => (e) => {
    setter(e.target.value);
    setError("");
  };

  if (loading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <SignInGate />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream font-serif text-ink">
      <Header />
      <main className="grow">
        <section className="bg-cream-warm border-b border-stone-line">
          <div className="max-w-container-max mx-auto px-page pt-[clamp(26px,4vw,44px)] pb-[clamp(24px,4vw,38px)] flex flex-col gap-3.5">
            <Breadcrumb items={[{ label: "Tanya Jawab", to: "/questions" }, { label: "Ajukan Pertanyaan" }]} />
            <h1 className="text-[clamp(34px,5vw,52px)] leading-[1.06] font-normal tracking-[-0.02em]">Ajukan Pertanyaan</h1>
            <p className="max-w-[52ch] text-base leading-relaxed text-ink-soft">
              Tulis pertanyaanmu selengkap mungkin agar para ustadz dapat menjawabnya dengan tepat.
            </p>
          </div>
        </section>

        <div className="max-w-container-max mx-auto px-page pt-[clamp(28px,4vw,48px)] grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-x-[clamp(32px,5vw,60px)] gap-y-10 items-start">
          <div className="flex flex-col min-w-0">
            <div className="flex items-baseline justify-between gap-3 pb-3 border-b border-ink">
              <MonoLabel className="tracking-[0.14em] text-ink">Pertanyaan baru</MonoLabel>
              {sent && (
                <MonoLabel size="sm" className="text-ink-hint">
                  Terkirim
                </MonoLabel>
              )}
            </div>

            {sent ? (
              <div className="mt-[22px] border border-gold-line bg-gold-tint p-[clamp(22px,3vw,30px)] flex flex-col gap-3">
                <MonoLabel size="sm" className="tracking-[0.16em] text-gold-ink">
                  Terkirim
                </MonoLabel>
                <span className="text-[22px] leading-[1.3]">Pertanyaanmu sudah terkirim.</span>
                <span className="text-[15px] leading-[1.65] text-gold-ink-soft max-w-[52ch]">
                  Para ustadz akan menjawabnya. Pantau perkembangannya di daftar pertanyaan di bawah.
                </span>
                <div className="flex flex-wrap gap-3 pt-1.5">
                  <Button onClick={() => setSent(false)} className="tracking-[0.16em] px-5 py-3.5">
                    Ajukan lagi
                  </Button>
                  <Button as="a" href="#riwayat" variant="outline" className="tracking-[0.16em] px-5 py-3.5">
                    Lihat pertanyaan saya
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={submitQuestion} className="flex flex-col gap-6 pt-6">
                <div className="flex flex-col gap-2.5 max-w-[360px]">
                  <FieldLabel htmlFor="ask-category">
                    Kategori <span className="text-ink-hint">opsional</span>
                  </FieldLabel>
                  <Select id="ask-category" value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="">Pilih kategori</option>
                    {CATEGORIES.slice(1).map((cat) => (
                      <option key={cat.key} value={cat.key}>
                        {cat.label}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="flex flex-col gap-2.5">
                  <FieldLabel htmlFor="ask-title">Inti pertanyaan</FieldLabel>
                  <Input
                    id="ask-title"
                    type="text"
                    value={title}
                    onChange={clearError(setTitle)}
                    placeholder="Misalnya: Bagaimana cara menjamak sholat saat perjalanan dinas?"
                    invalid={!!error && !title.trim()}
                    className="h-14 text-[17px]"
                  />
                </div>

                <div className="flex flex-col gap-2.5">
                  <FieldLabel htmlFor="ask-content">Uraian &amp; latar belakang</FieldLabel>
                  <TextArea
                    id="ask-content"
                    rows="8"
                    value={content}
                    onChange={clearError(setContent)}
                    placeholder="Ceritakan situasinya: apa yang sudah dilakukan, apa yang membuat ragu, dan jawaban seperti apa yang dibutuhkan."
                    invalid={!!error && !content.trim()}
                    className="text-[17px]"
                  />
                </div>

                {error && (
                  <FormError>{error}</FormError>
                )}

                <div className="pt-1">
                  <Button type="submit" disabled={sending} className="min-h-14 px-[26px] tracking-[0.16em]">
                    {sending ? "Mengirim…" : "Kirim pertanyaan"}
                  </Button>
                </div>
              </form>
            )}
          </div>

          <aside className="flex flex-col lg:sticky lg:top-24">
            <MonoLabel className="tracking-[0.14em] text-ink pb-2.5 border-b border-ink">Sebelum mengirim</MonoLabel>
            {TIPS.map((tip) => (
              <div key={tip} className="flex gap-3 py-4 border-b border-stone-line-soft">
                <span aria-hidden="true" className="shrink-0 size-2 mt-[7px] bg-gold-deep" />
                <span className="text-[15px] leading-relaxed text-ink-soft text-pretty">{tip}</span>
              </div>
            ))}
          </aside>
        </div>

        <div className="max-w-container-max mx-auto px-page pt-[clamp(40px,6vw,68px)] pb-[clamp(48px,7vw,84px)]">
          <MyQuestions questions={myQuestions} loading={loadingMine} />
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default CreateQuestion;
