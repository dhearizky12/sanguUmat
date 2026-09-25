import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Breadcrumb from "../components/Breadcrumb";
import Button from "../components/Button";
import MonoLabel from "../components/MonoLabel";
import { FieldLabel, Input, TextArea, FormError } from "../components/Field";
import { useAuth } from "../hooks/useAuth";
import { API_URL } from "../lib/api";
import { BASE_PATH } from "../lib/basePath";
import { safeNext } from "../lib/next";
import Avatar from "../components/Avatar";
import { PageBody, PageHeader, PageLead, PageTitle } from "../components/Page";

const WHY = [
  { label: "Nama", text: "Dipakai untuk menyapa Anda, dan tampil di pertanyaan serta komentar Anda." },
  { label: "Email", text: "Dari akun Google Anda; tidak dapat diubah di sini." },
  { label: "Nomor telepon · opsional", text: "Agar ustadz dapat menghubungi Anda bila sebuah jawaban perlu penjelasan lebih lanjut." },
  { label: "Alamat · opsional", text: "Boleh dikosongkan." },
];

function EditProfile() {
  const { me, profile } = useAuth();
  const [params] = useSearchParams();
  // Sign-in sends an incomplete profile here once (see SignInComplete), with the page to
  // continue to as ?next=.
  const next = safeNext(params.get("next"));
  const isCompleting = !me?.hasCompletedProfile;

  const [fullName, setFullName] = useState(profile?.name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [address, setAddress] = useState(profile?.address || "");
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const uploadPicture = async () => {
    if (!selectedFile) return true;

    const formData = new FormData();
    formData.append("file", selectedFile);

    const response = await fetch(`${API_URL}/api/auth/upload-picture`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    return response.ok;
  };

  const saveProfile = async (e) => {
    e.preventDefault();

    // Only the name is required; phone and address are optional.
    if (!fullName.trim()) {
      setError("Nama harus diisi.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/complete-profile`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: fullName,
          phone,
          address,
        }),
      });

      if (!response.ok) {
        setError("Gagal menyimpan profil. Silakan coba lagi.");
        return;
      }

      const uploadSuccess = await uploadPicture();

      if (!uploadSuccess) {
        setError("Profil tersimpan, tetapi unggah foto gagal.");
        return;
      }

      // A full reload so AuthProvider picks up the saved profile; through BASE_PATH so it
      // lands correctly under a path prefix too.
      window.location.href = `${BASE_PATH}${next}`;
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  const handleUploadChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const edit = (setter) => (e) => {
    setter(e.target.value);
    setError("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream font-serif text-ink">
      <Header />
      <main className="grow">
        <PageHeader>
          <Breadcrumb
            items={isCompleting ? [{ label: "Lengkapi profil" }] : [{ label: "Profil saya", to: "/profile" }, { label: "Ubah profil" }]}
          />
          <PageTitle>
            {isCompleting ? "Lengkapi profil" : "Ubah profil"}
          </PageTitle>
          <PageLead>
            {isCompleting
              ? "Satu langkah lagi. Isi nama Anda untuk mulai memakai Sangu Umat."
              : "Perbarui nama, foto, nomor telepon dan alamat Anda."}
          </PageLead>
        </PageHeader>

        <PageBody className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-x-[clamp(32px,5vw,60px)] gap-y-10 items-start">
          <form onSubmit={saveProfile} className="flex flex-col gap-6 min-w-0">
            <MonoLabel as="h2" className="block tracking-[0.14em] text-ink pb-2.5 border-b border-ink">
              Data diri
            </MonoLabel>

            <div className="flex items-center gap-5">
              {/* profile.picture is already resolved by AuthProvider — no pictureUrl() here. */}
              <Avatar src={preview || profile?.picture} name={profile?.name} size={88} />
              <div className="flex flex-col items-start gap-1.5">
                <Button as="label" htmlFor="photo-upload" variant="outline" className="px-4 py-2.5">
                  Ganti foto
                </Button>
                <span className="text-sm text-ink-faint">{selectedFile ? selectedFile.name : "JPG atau PNG"}</span>
              </div>
              <input className="hidden" id="photo-upload" accept="image/*" type="file" onChange={handleUploadChange} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-6">
              <div className="flex flex-col gap-2.5">
                <FieldLabel htmlFor="profile-name">Nama lengkap</FieldLabel>
                <Input
                  id="profile-name"
                  type="text"
                  placeholder="Nama lengkap"
                  value={fullName}
                  onChange={edit(setFullName)}
                  invalid={!!error && !fullName.trim()}
                />
              </div>
              <div className="flex flex-col gap-2.5">
                <FieldLabel htmlFor="profile-email">Email</FieldLabel>
                <Input id="profile-email" type="email" value={profile?.email ?? ""} disabled />
              </div>
              <div className="flex flex-col gap-2.5">
                <FieldLabel htmlFor="profile-phone">
                  Nomor telepon <span className="text-ink-hint">opsional</span>
                </FieldLabel>
                <Input
                  id="profile-phone"
                  type="tel"
                  name="phone"
                  placeholder="081234567890"
                  value={phone}
                  onChange={edit(setPhone)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <FieldLabel htmlFor="profile-address">
                Alamat <span className="text-ink-hint">opsional</span>
              </FieldLabel>
              <TextArea
                id="profile-address"
                rows="4"
                placeholder="Tulis alamat lengkap Anda."
                value={address}
                onChange={edit(setAddress)}
              />
            </div>

            {error && (
              <FormError>{error}</FormError>
            )}

            <div className="flex flex-wrap gap-3 pt-1">
              <Button type="submit" disabled={saving} className="min-h-14 px-[26px] tracking-[0.16em]">
                {saving ? "Menyimpan…" : "Simpan"}
              </Button>
              {!isCompleting && (
                <Button as={Link} to="/profile" variant="outline" className="min-h-14 inline-flex items-center px-6">
                  Batal
                </Button>
              )}
            </div>
          </form>

          <aside className="flex flex-col lg:sticky lg:top-24">
            <MonoLabel as="h2" className="block tracking-[0.14em] text-ink pb-2.5 border-b border-ink">
              Mengapa kami meminta data ini?
            </MonoLabel>
            {WHY.map((row) => (
              <div key={row.label} className="flex flex-col gap-1 py-4 border-b border-stone-line-soft">
                <MonoLabel size="sm" className="tracking-[0.12em] text-forest">
                  {row.label}
                </MonoLabel>
                <span className="text-[15px] leading-relaxed text-ink-soft text-pretty">{row.text}</span>
              </div>
            ))}
            <p className="pt-4 text-[15px] leading-relaxed text-ink-faint text-pretty">
              Nomor telepon dan alamat tidak ditampilkan di halaman publik mana pun.
            </p>
          </aside>
        </PageBody>
      </main>
      <Footer />
    </div>
  );
}

export default EditProfile;
