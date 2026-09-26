import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Breadcrumb from "../components/Breadcrumb";
import Button from "../components/Button";
import Loading from "../components/Loading";
import LoadingState from "../components/LoadingState";
import MonoLabel from "../components/MonoLabel";
import { FieldLabel, FormError, Input, TextArea } from "../components/Field";
import { PageBody, PageHeader, PageLead, PageTitle } from "../components/Page";
import { useAuth } from "../hooks/useAuth";
import { API_URL } from "../lib/api";
import { useCategories } from "../lib/category";

const TITLE_MAX = 120;
const BIO_MAX = 1000;
const EDUCATION_MAX = 10;

const emptyEducation = () => ({ institution: "", degree: "", startYear: "", endYear: "" });

function Counter({ value, max }) {
  return (
    <span className={`font-mono text-mono-label-xs tracking-[0.1em] ${value.length > max ? "text-rust" : "text-ink-hint"}`}>
      {value.length}/{max}
    </span>
  );
}

// Edits an ustadz's profile — for the ustadz themself and for Admins; anyone else is sent
// to the public page. Saving replaces the whole profile (PUT /api/ustadz/:id).
function UstadzEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { me, loading } = useAuth();
  const categories = useCategories();
  const [form, setForm] = useState(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const allowed = me && (String(me.id) === String(id) || me.role === "Admin");

  useEffect(() => {
    if (!allowed) return;
    fetch(`${API_URL}/api/ustadz/${id}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((u) => {
        setName(u.name);
        setForm({
          title: u.title,
          bio: u.bio,
          expertise: u.expertise.map((e) => e.key),
          education: u.education.map((e) => ({
            institution: e.institution,
            degree: e.degree ?? "",
            startYear: e.startYear ?? "",
            endYear: e.endYear ?? "",
          })),
        });
      })
      .catch(() => navigate(`/ustadz/${id}`, { replace: true }));
  }, [allowed, id, navigate]);

  if (loading) return <Loading />;
  if (!allowed) return <Navigate to={`/ustadz/${id}`} replace />;

  // Every change derives from the latest form, so quick successive clicks never undo each other.
  const update = (change) => {
    setForm((f) => ({ ...f, ...change(f) }));
    setError("");
  };
  const set = (patch) => update(() => patch);
  const setRow = (i, patch) => update((f) => ({ education: f.education.map((e, j) => (j === i ? { ...e, ...patch } : e)) }));
  const moveRow = (i, by) =>
    update((f) => {
      const rows = [...f.education];
      [rows[i], rows[i + by]] = [rows[i + by], rows[i]];
      return { education: rows };
    });
  const removeRow = (i) => update((f) => ({ education: f.education.filter((_, j) => j !== i) }));
  const addRow = () => update((f) => ({ education: [...f.education, emptyEducation()] }));
  const toggleExpertise = (key) =>
    update((f) => ({ expertise: f.expertise.includes(key) ? f.expertise.filter((k) => k !== key) : [...f.expertise, key] }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const toYear = (v) => (v === "" ? null : Number(v));
      const res = await fetch(`${API_URL}/api/ustadz/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          bio: form.bio,
          expertise: form.expertise,
          education: form.education.map((row) => ({
            institution: row.institution,
            degree: row.degree,
            startYear: toYear(row.startYear),
            endYear: toYear(row.endYear),
          })),
        }),
      });
      if (res.ok) {
        navigate(`/ustadz/${id}`);
        return;
      }
      setError((await res.text()) || "Gagal menyimpan profil. Silakan coba lagi.");
    } catch (err) {
      console.error(err);
      setError("Gagal menyimpan profil. Silakan coba lagi.");
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
              { label: "Dewan Ustadz", to: "/ustadz" },
              { label: name || "Ustadz", to: `/ustadz/${id}` },
              { label: "Ubah profil" },
            ]}
          />
          <div className="flex flex-col gap-2.5">
            <PageTitle>Ubah profil ustadz</PageTitle>
            <PageLead>Profil ini tampil di halaman ustadz dan di Dewan Ustadz.</PageLead>
          </div>
        </PageHeader>

        <PageBody>
          {!form ? (
            <LoadingState message="Memuat profil…" />
          ) : (
            <form onSubmit={save} className="max-w-[760px] flex flex-col gap-7">
              <div className="flex flex-col gap-2.5">
                <div className="flex items-baseline justify-between gap-3">
                  <FieldLabel htmlFor="ustadz-title">
                    Gelar & keterangan <span className="text-ink-hint">opsional</span>
                  </FieldLabel>
                  <Counter value={form.title} max={TITLE_MAX} />
                </div>
                <Input
                  id="ustadz-title"
                  value={form.title}
                  onChange={(e) => set({ title: e.target.value })}
                  placeholder="Misalnya: Lc., M.A. · Alumni Al-Azhar"
                />
              </div>

              <div className="flex flex-col gap-2.5">
                <div className="flex items-baseline justify-between gap-3">
                  <FieldLabel htmlFor="ustadz-bio">
                    Profil singkat <span className="text-ink-hint">opsional</span>
                  </FieldLabel>
                  <Counter value={form.bio} max={BIO_MAX} />
                </div>
                <TextArea
                  id="ustadz-bio"
                  rows="6"
                  value={form.bio}
                  onChange={(e) => set({ bio: e.target.value })}
                  placeholder="Latar belakang, tempat mengajar, dan bidang yang ditekuni."
                />
              </div>

              <fieldset className="flex flex-col gap-3">
                <FieldLabel as="legend">Bidang keahlian</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {categories.map((c) => {
                    const on = form.expertise.includes(c.key);
                    return (
                      <MonoLabel
                        as="button"
                        type="button"
                        role="checkbox"
                        aria-checked={on}
                        size="sm"
                        key={c.key}
                        onClick={() => toggleExpertise(c.key)}
                        className={`px-3 py-2 border cursor-pointer transition-colors ${
                          on ? "bg-forest border-forest text-cream-text" : "border-stone-border text-ink-muted hover:bg-cream-hover hover:text-ink"
                        }`}
                      >
                        {c.name}
                      </MonoLabel>
                    );
                  })}
                </div>
              </fieldset>

              <fieldset className="flex flex-col gap-3">
                <div className="flex items-baseline justify-between gap-3">
                  <FieldLabel as="legend">Riwayat pendidikan</FieldLabel>
                  <MonoLabel size="xs" className="text-ink-hint">
                    {form.education.length}/{EDUCATION_MAX}
                  </MonoLabel>
                </div>
                {form.education.map((row, i) => (
                  <div key={i} className="flex flex-col gap-3 p-4 border border-stone-line bg-paper">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        aria-label={`Institusi ${i + 1}`}
                        placeholder="Institusi, misalnya: Universitas Al-Azhar"
                        value={row.institution}
                        onChange={(e) => setRow(i, { institution: e.target.value })}
                      />
                      <Input
                        aria-label={`Jenjang atau jurusan ${i + 1}`}
                        placeholder="Jenjang / jurusan (opsional)"
                        value={row.degree}
                        onChange={(e) => setRow(i, { degree: e.target.value })}
                      />
                      <Input
                        type="number"
                        inputMode="numeric"
                        aria-label={`Tahun mulai ${i + 1}`}
                        placeholder="Tahun mulai (opsional)"
                        value={row.startYear}
                        onChange={(e) => setRow(i, { startYear: e.target.value })}
                      />
                      <Input
                        type="number"
                        inputMode="numeric"
                        aria-label={`Tahun selesai ${i + 1}`}
                        placeholder="Tahun selesai (opsional)"
                        value={row.endYear}
                        onChange={(e) => setRow(i, { endYear: e.target.value })}
                      />
                    </div>
                    <div className="flex flex-wrap justify-end gap-5">
                      <Button variant="link" disabled={i === 0} onClick={() => moveRow(i, -1)}>
                        Naik
                      </Button>
                      <Button variant="link" disabled={i === form.education.length - 1} onClick={() => moveRow(i, 1)}>
                        Turun
                      </Button>
                      <Button variant="danger" onClick={() => removeRow(i)}>
                        Hapus
                      </Button>
                    </div>
                  </div>
                ))}
                <div>
                  <Button
                    variant="outline"
                    disabled={form.education.length >= EDUCATION_MAX}
                    onClick={addRow}
                    className="px-4 py-2.5"
                  >
                    Tambah riwayat
                  </Button>
                </div>
              </fieldset>

              {error && <FormError>{error}</FormError>}

              <div className="flex flex-wrap gap-3 pt-1">
                <Button type="submit" disabled={saving} className="min-h-14 px-[26px] tracking-[0.16em]">
                  {saving ? "Menyimpan…" : "Simpan"}
                </Button>
                <Button as={Link} to={`/ustadz/${id}`} variant="outline" className="min-h-14 inline-flex items-center px-6">
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

export default UstadzEdit;
