import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Breadcrumb from "../components/Breadcrumb";
import Button from "../components/Button";
import Loading from "../components/Loading";
import LoadingState from "../components/LoadingState";
import PlaceholderTexture from "../components/PlaceholderTexture";
import Editor from "../components/article/Editor";
import { FieldHint, FieldLabel, FormError, Input, Select, TextArea } from "../components/Field";
import { PageBody, PageHeader, PageLead, PageTitle } from "../components/Page";
import { useAuth } from "../hooks/useAuth";
import { API_URL } from "../lib/api";
import { canManageKajian } from "../lib/kajian";
import { fromWibInput, toWibInput } from "../lib/wib";
import { youtubeIdOf, youtubeThumbnail } from "../lib/youtube";

const TITLE_MAX = 160;
const DESCRIPTION_MAX = 1000;
const DURATIONS = [45, 60, 75, 90, 120];

const EMPTY = { title: "", series: "", youtube: "", startsAt: "", durationMinutes: "60", description: "", notes: "", ustadz: "" };

function Counter({ value, max }) {
  return (
    <span className={`font-mono text-mono-label-xs tracking-[0.1em] ${value.length > max ? "text-rust" : "text-ink-hint"}`}>
      {value.length}/{max}
    </span>
  );
}

// Adds a kajian (/live/tambah) or edits one (/live/:id/ubah). A Guru always leads their
// own; an Admin picks the ustadz. The pasted YouTube link previews its thumbnail as soon as
// it is recognised; the date and time are entered in WIB.
function KajianEditor({ id }) {
  const isNew = !id;
  const navigate = useNavigate();
  const { me, loading } = useAuth();
  const isAdmin = me?.role === "Admin";

  const [loaded, setLoaded] = useState(isNew ? { form: EMPTY, ustadz: null } : null);
  const [form, setForm] = useState(EMPTY);
  const [seriesOptions, setSeriesOptions] = useState([]);
  const [ustadzList, setUstadzList] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [redirect, setRedirect] = useState(null);

  useEffect(() => {
    if (isNew) return;
    fetch(`${API_URL}/api/kajian/${id}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then(({ kajian, notes }) => {
        const initial = {
          title: kajian.title,
          series: kajian.series,
          youtube: `https://www.youtube.com/watch?v=${kajian.youtubeId}`,
          startsAt: toWibInput(kajian.startsAt),
          durationMinutes: String(kajian.durationMinutes),
          description: kajian.description ?? "",
          notes,
          ustadz: String(kajian.ustadz.id),
        };
        setLoaded({ form: initial, ustadz: kajian.ustadz });
        setForm(initial);
      })
      .catch(() => setRedirect(`/live/${id}`));
  }, [id, isNew]);

  // Existing series names, so a new session joins its series with the same spelling.
  useEffect(() => {
    fetch(`${API_URL}/api/kajian?pageSize=1`)
      .then((res) => (res.ok ? res.json() : null))
      .then((d) => d && setSeriesOptions(d.facets.series.map((s) => s.name)))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    fetch(`${API_URL}/api/ustadz`)
      .then((res) => (res.ok ? res.json() : []))
      .then((list) => setUstadzList([...list].sort((a, b) => a.name.localeCompare(b.name, "id"))))
      .catch((err) => console.error(err));
  }, [isAdmin]);

  if (redirect) return <Navigate to={redirect} replace />;
  if (loading) return <Loading />;
  if (loaded && !isNew && !canManageKajian(me, { ustadz: loaded.ustadz })) return <Navigate to={`/live/${id}`} replace />;

  const update = (patch) => {
    setForm((f) => ({ ...f, ...patch }));
    setError("");
  };
  const videoId = youtubeIdOf(form.youtube);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch(isNew ? `${API_URL}/api/kajian` : `${API_URL}/api/kajian/${id}`, {
        method: isNew ? "POST" : "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          series: form.series,
          youtube: form.youtube,
          startsAt: fromWibInput(form.startsAt),
          durationMinutes: Number(form.durationMinutes) || 0,
          description: form.description,
          notes: form.notes,
          ustadz: isAdmin && form.ustadz ? Number(form.ustadz) : null,
        }),
      });
      if (!res.ok) {
        setError((await res.text()) || "Gagal menyimpan kajian. Silakan coba lagi.");
        return;
      }
      const saved = await res.json();
      navigate(`/live/${saved.kajian.id}`);
    } catch (err) {
      console.error(err);
      setError("Gagal menyimpan kajian. Silakan coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream font-serif text-ink">
      <Header />
      <main className="grow">
        <PageHeader>
          <Breadcrumb
            items={[
              { label: "Ngaji Bareng", to: "/live" },
              ...(isNew ? [] : [{ label: loaded?.form.title || "Kajian", to: `/live/${id}` }]),
              { label: isNew ? "Tambah" : "Ubah" },
            ]}
          />
          <div className="flex flex-col gap-2.5">
            <PageTitle>{isNew ? "Tambah kajian" : "Ubah kajian"}</PageTitle>
            <PageLead>
              Tempel tautan YouTube siaran langsung atau video yang sudah diunggah. Status Jadwal, Live dan Rekaman mengikuti
              waktu mulai dan durasinya.
            </PageLead>
          </div>
        </PageHeader>

        <PageBody>
          {!loaded ? (
            <LoadingState message="Memuat kajian…" />
          ) : (
            <form onSubmit={save} className="max-w-[860px] flex flex-col gap-7">
              <div className="flex flex-col gap-2.5">
                <div className="flex items-baseline justify-between gap-3">
                  <FieldLabel htmlFor="kajian-title">Judul</FieldLabel>
                  <Counter value={form.title} max={TITLE_MAX} />
                </div>
                <Input
                  id="kajian-title"
                  size="lg"
                  value={form.title}
                  onChange={(e) => update({ title: e.target.value })}
                  placeholder="Misalnya: Tafsir Surah Al-Kahfi, ayat 32–45"
                />
              </div>

              <div className="flex flex-col gap-3">
                <FieldLabel htmlFor="kajian-youtube">Tautan YouTube</FieldLabel>
                <div className="flex flex-wrap items-start gap-5">
                  <div className="flex-[1_1_320px] flex flex-col gap-2">
                    <Input
                      id="kajian-youtube"
                      value={form.youtube}
                      onChange={(e) => update({ youtube: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=… atau https://youtu.be/…"
                      invalid={form.youtube.trim() !== "" && !videoId}
                    />
                    <FieldHint error={form.youtube.trim() !== "" && !videoId}>
                      {form.youtube.trim() === ""
                        ? "Bisa tautan siaran langsung (youtube.com/live/…), video, atau youtu.be."
                        : videoId
                          ? `Video dikenali: ${videoId}`
                          : "Tautan belum dikenali sebagai video YouTube."}
                    </FieldHint>
                  </div>
                  {videoId ? (
                    <img src={youtubeThumbnail(videoId)} alt="" className="w-[220px] aspect-video object-cover border border-stone-line bg-parchment" />
                  ) : (
                    <PlaceholderTexture size="sm" className="block w-[220px] aspect-video" />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-6">
                <div className="flex flex-col gap-2.5">
                  <FieldLabel htmlFor="kajian-series">Seri</FieldLabel>
                  <Input
                    id="kajian-series"
                    list="kajian-series-options"
                    value={form.series}
                    onChange={(e) => update({ series: e.target.value })}
                    placeholder="Misalnya: Tafsir"
                  />
                  <datalist id="kajian-series-options">
                    {seriesOptions.map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                </div>
                {isAdmin && (
                  <div className="flex flex-col gap-2.5">
                    <FieldLabel htmlFor="kajian-ustadz">Ustadz</FieldLabel>
                    <Select id="kajian-ustadz" value={form.ustadz} onChange={(e) => update({ ustadz: e.target.value })}>
                      <option value="">Pilih ustadz</option>
                      {ustadzList.map((u) => (
                        <option key={u.id} value={String(u.id)}>
                          {u.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                )}
                <div className="flex flex-col gap-2.5">
                  <FieldLabel htmlFor="kajian-start">
                    Waktu mulai <span className="text-ink-hint">WIB</span>
                  </FieldLabel>
                  <Input id="kajian-start" type="datetime-local" value={form.startsAt} onChange={(e) => update({ startsAt: e.target.value })} />
                </div>
                <div className="flex flex-col gap-2.5">
                  <FieldLabel htmlFor="kajian-duration">
                    Durasi <span className="text-ink-hint">menit</span>
                  </FieldLabel>
                  <Input
                    id="kajian-duration"
                    type="number"
                    inputMode="numeric"
                    min="5"
                    max="600"
                    list="kajian-durations"
                    value={form.durationMinutes}
                    onChange={(e) => update({ durationMinutes: e.target.value })}
                  />
                  <datalist id="kajian-durations">
                    {DURATIONS.map((d) => (
                      <option key={d} value={d} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <div className="flex items-baseline justify-between gap-3">
                  <FieldLabel htmlFor="kajian-description">
                    Deskripsi <span className="text-ink-hint">opsional</span>
                  </FieldLabel>
                  <Counter value={form.description} max={DESCRIPTION_MAX} />
                </div>
                <TextArea
                  id="kajian-description"
                  rows="3"
                  value={form.description}
                  onChange={(e) => update({ description: e.target.value })}
                  placeholder="Satu atau dua kalimat tentang isi kajian."
                />
              </div>

              <div className="flex flex-col gap-2.5">
                <FieldLabel as="div" id="kajian-notes-label">
                  Catatan ngaji <span className="text-ink-hint">opsional</span>
                </FieldLabel>
                <Editor
                  value={loaded.form.notes}
                  onChange={(notes) => update({ notes })}
                  labelledBy="kajian-notes-label"
                  placeholder="Ringkasan poin-poin kajian, rujukan, dan catatan untuk jamaah…"
                />
              </div>

              {error && <FormError>{error}</FormError>}

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Button type="submit" disabled={saving} className="min-h-14 px-[26px] tracking-[0.16em]">
                  {saving ? "Menyimpan…" : "Simpan"}
                </Button>
                <Button as={Link} to={isNew ? "/live/kelola" : `/live/${id}`} variant="link" className="ml-2">
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

// Keyed by the kajian, so moving between edit pages (or to a new one) starts fresh.
function KajianEdit() {
  const { id } = useParams();
  return <KajianEditor key={id ?? "new"} id={id} />;
}

export default KajianEdit;
