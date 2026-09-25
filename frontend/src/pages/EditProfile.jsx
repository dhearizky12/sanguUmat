import { useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Breadcrumb from "../components/Breadcrumb";
import Button from "../components/Button";
import MonoLabel from "../components/MonoLabel";
import { FieldLabel, Input, TextArea, FormError } from "../components/Field";
import { useAuth } from "../hooks/useAuth";
import { API_URL } from "../lib/api";
import { BASE_PATH } from "../lib/basePath";
import Avatar from "../components/Avatar";

function EditProfile() {
  const { me, profile } = useAuth();
  // A first sign-in lands here from the Dashboard until phone and address are filled in.
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

    // The backend refuses to complete a profile without both.
    if (!phone.trim() || !address.trim()) {
      setError("Nomor telepon dan alamat wajib diisi.");
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

      // A full reload so AuthProvider picks up the completed profile; through BASE_PATH so it
      // lands on the app's home under a path prefix too.
      window.location.href = `${BASE_PATH}/`;
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
        <section className="bg-cream-warm border-b border-stone-line">
          <div className="max-w-container-max mx-auto px-page pt-[clamp(26px,4vw,44px)] pb-[clamp(24px,4vw,38px)] flex flex-col gap-3.5">
            <Breadcrumb
              items={isCompleting ? [{ label: "Lengkapi profil" }] : [{ label: "Profil saya", to: "/profile" }, { label: "Ubah profil" }]}
            />
            <h1 className="text-[clamp(34px,5vw,52px)] leading-[1.06] font-normal tracking-[-0.02em]">
              {isCompleting ? "Lengkapi profil" : "Ubah profil"}
            </h1>
            <p className="max-w-[52ch] text-base leading-relaxed text-ink-soft">
              {isCompleting
                ? "Satu langkah lagi. Isi nomor telepon dan alamat Anda untuk mulai memakai Sangu Umat."
                : "Perbarui nama, foto, nomor telepon dan alamat Anda."}
            </p>
          </div>
        </section>

        <section className="max-w-container-max mx-auto px-page pt-[clamp(28px,4vw,48px)] pb-[clamp(48px,7vw,84px)]">
          <form onSubmit={saveProfile} className="max-w-[760px] flex flex-col gap-6">
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
                <Input id="profile-name" type="text" placeholder="Nama lengkap" value={fullName} onChange={edit(setFullName)} />
              </div>
              <div className="flex flex-col gap-2.5">
                <FieldLabel htmlFor="profile-email">Email</FieldLabel>
                <Input id="profile-email" type="email" value={profile?.email ?? ""} disabled />
              </div>
              <div className="flex flex-col gap-2.5">
                <FieldLabel htmlFor="profile-phone">Nomor telepon</FieldLabel>
                <Input
                  id="profile-phone"
                  type="tel"
                  name="phone"
                  placeholder="081234567890"
                  value={phone}
                  onChange={edit(setPhone)}
                  invalid={!!error && !phone.trim()}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <FieldLabel htmlFor="profile-address">Alamat</FieldLabel>
              <TextArea
                id="profile-address"
                rows="4"
                placeholder="Tulis alamat lengkap Anda."
                value={address}
                onChange={edit(setAddress)}
                invalid={!!error && !address.trim()}
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
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default EditProfile;
