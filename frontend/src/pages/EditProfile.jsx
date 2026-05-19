import { useState } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function EditProfile() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [fullName, setFullName] = useState(profile?.name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [address, setAddress] = useState(profile?.address || "");
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const uploadPicture = async () => {
    if (!selectedFile) return true;

    const formData = new FormData();
    formData.append("file", selectedFile);

    const response = await fetch("http://localhost:5236/api/auth/upload-picture", {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    return response.ok;
  };

  const saveProfile = async () => {
    try {
      const response = await fetch("http://localhost:5236/api/auth/complete-profile", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
          address,
        }),
      });

      if (!response.ok) {
        alert("Gagal menyimpan profile");
        return;
      }

      const uploadSuccess = await uploadPicture();

      if (!uploadSuccess) {
        alert("Profile tersimpan, tapi upload foto gagal");
        return;
      }

      window.location.href = "/";
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan");
    }
  };

  const handleUploadChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleFullNameChange = (e) => {
    setFullName(e.target.value);
  };

  const handlePhoneChange = (e) => {
    setPhone(e.target.value);
  };

  const handleAddressChange = (e) => {
    setAddress(e.target.value);
  };

  return (
    <div className="font-body-md min-h-screen flex flex-col">
      <Header />
      <main className="grow z-10 relative py-section-gap px-margin-mobile md:px-gutter">
        <div className="max-w-container-max mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-headline-lg text-primary mb-2">Edit Profile</h1>
            <p className="text-on-surface-variant">Lengkapi data pribadi anda</p>
          </div>
          <div className="bg-surface-container-lowest rounded-xl shadow-xl p-8">
            <div className="flex flex-col items-center mb-12">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border border-primary shadow-md">
                  <img
                    className="w-full h-full object-cover"
                    data-alt="photo_profile"
                    src={
                      preview ||
                      profile.picture ||
                      "https://upload.wikimedia.org/wikipedia/commons/b/bc/Unknown_person.jpg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original"
                    }
                  />
                </div>
                <label
                  className="absolute bottom-0 right-0 bg-primary text-on-primary p-2 rounded-full cursor-pointer shadow-lg active:scale-90 transition-transform flex items-center justify-center"
                  htmlFor="photo-upload"
                >
                  <span className="material-symbols-outlined text-base">photo_camera</span>
                </label>
                <input className="hidden" id="photo-upload" accept="image/*" type="file" onChange={handleUploadChange} />
              </div>
            </div>
            <form className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-label-sm text-label-sm text-on-surface-variant ml-1">Nama Lengkap</label>
                  <input
                    className="bg-surface-container-low focus:border-primary-container rounded-xl px-4 py-3 outline-none transition-all font-body-md text-on-surface"
                    type="text"
                    placeholder="Nama Lengkap"
                    value={fullName}
                    onChange={handleFullNameChange}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-label-sm text-label-sm text-on-surface-variant ml-1">Email Address</label>
                  <input
                    className="rounded-xl px-4 py-3 outline-none transition-all font-body-md text-on-surface disabled:bg-gray-200 disabled:cursor-not-allowed disabled:text-gray-500"
                    type="email"
                    placeholder="example@example.com"
                    value={profile.email}
                    disabled
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-label-sm text-label-sm text-on-surface-variant ml-1">Nomer Telephone</label>
                  <input
                    className="bg-surface-container-low focus:border-primary-container rounded-xl px-4 py-3 outline-none transition-all font-body-md text-on-surface"
                    value={phone}
                    type="tel"
                    name="phone"
                    placeholder="081234567890"
                    onChange={handlePhoneChange}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center px-1">
                  <label className="font-label-sm text-label-sm text-on-surface-variant">Alamat</label>
                </div>
                <textarea
                  className="bg-surface-container-low focus:border-primary-container rounded-xl px-4 py-3 outline-none transition-all font-body-md text-on-surface resize-none"
                  rows="4"
                  placeholder="Tulis alamat lengkap anda."
                  value={address}
                  onChange={handleAddressChange}
                ></textarea>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/profile"
                  className="border border-primary-container text-primary px-6 py-3 rounded-full font-label-sm text-label-sm shadow-sm active:scale-95"
                >
                  Batal
                </Link>
                <button
                  onClick={saveProfile}
                  className="bg-primary-container text-white px-6 py-3 rounded-full font-label-sm text-label-sm hover:bg-tertiary-container transition-colors shadow-sm active:scale-95 flex items-center gap-2"
                  type="button"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default EditProfile;
