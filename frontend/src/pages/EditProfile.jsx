import { useState } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function EditProfile() {
  const { user } = useAuth();

  const [fullName, setFullName] = useState(user.name);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const saveProfile = async () => {
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

    if (response.ok) {
      window.location.href = "/dashboard";
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
      <main class="grow z-10 relative py-section-gap px-margin-mobile md:px-gutter">
        <div class="max-w-3xl mx-auto">
          <div class="text-center mb-12">
            <h1 class="text-headline-lg text-primary mb-2">Edit Profile</h1>
            <p class="text-on-surface-variant">Lengkapi data pribadi anda</p>
          </div>
          <div class="bg-surface-container-lowest rounded-md shadow-xl p-8">
            <div class="flex flex-col items-center mb-12">
              <div class="relative group">
                <div class="w-32 h-32 rounded-full overflow-hidden border-4 shadow-md">
                  <img
                    class="w-full h-full object-cover"
                    data-alt="photo_profile"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBBx-_SaXwjirUGWXzoNvE904Oc7ekgVNO_HammAU2oy5AmJQBYDq-B8uQgwO8DNAndYeuw9PI6Vwq15X-kn1Cbwx52hL3AxFPzb-nc8gBz7zGkflwknSE__hkft-xbfDsdXIVmJyv2kfaL6X3z-w9cACzZmLxT-nOapFDW5-8pomd3SayqLminsXf8Lier0aUGeJEXXPAmWzoa6Zmyd00h19uMAARQgZVUyZsl0VATrxw4Zxg6nIF-swNlmx1oVCcq--Tj1jz5iR8"
                  />
                </div>
                <label
                  class="absolute bottom-0 right-0 bg-primary text-on-primary p-2 rounded-full cursor-pointer shadow-lg active:scale-90 transition-transform flex items-center justify-center"
                  for="photo-upload"
                >
                  <span class="material-symbols-outlined text-base">photo_camera</span>
                </label>
                <input class="hidden" id="photo-upload" type="file" />
              </div>
            </div>
            <form class="space-y-8">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="flex flex-col gap-2">
                  <label class="font-label-sm text-label-sm text-on-surface-variant ml-1">Nama Lengkap</label>
                  <input
                    class="bg-surface-container-low focus:border-primary-container rounded-xl px-4 py-3 outline-none transition-all font-body-md text-on-surface"
                    type="text"
                    placeholder="Nama Lengkap"
                    value={fullName}
                    onChange={handleFullNameChange}
                  />
                </div>
                <div class="flex flex-col gap-2">
                  <label class="font-label-sm text-label-sm text-on-surface-variant ml-1">Email Address</label>
                  <input
                    class="rounded-xl px-4 py-3 outline-none transition-all font-body-md text-on-surface disabled:bg-gray-200 disabled:cursor-not-allowed"
                    type="email"
                    placeholder="example@example.com"
                    value={user.email}
                    disabled
                  />
                </div>
                <div class="flex flex-col gap-2">
                  <label class="font-label-sm text-label-sm text-on-surface-variant ml-1">Nomer Telephone</label>
                  <input
                    class="bg-surface-container-low focus:border-primary-container rounded-xl px-4 py-3 outline-none transition-all font-body-md text-on-surface"
                    type="text"
                    placeholder="082111222333"
                    value={phone}
                    onChange={handlePhoneChange}
                  />
                </div>
              </div>
              <div class="flex flex-col gap-2">
                <div class="flex justify-between items-center px-1">
                  <label class="font-label-sm text-label-sm text-on-surface-variant">Alamat</label>
                </div>
                <textarea
                  class="bg-surface-container-low focus:border-primary-container rounded-xl px-4 py-3 outline-none transition-all font-body-md text-on-surface resize-none"
                  rows="4"
                  placeholder="Tulis alamat lengkap anda."
                  value={address}
                  onChange={handleAddressChange}
                ></textarea>
              </div>
              <div class="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={saveProfile}
                  class="border border-primary-container text-primary px-6 py-3 rounded-full font-label-sm text-label-sm shadow-sm active:scale-95"
                  type="submit"
                >
                  Batal
                </button>
                <Link
                  to="/profile"
                  class="bg-primary-container text-white px-6 py-3 rounded-full font-label-sm text-label-sm hover:bg-tertiary-container transition-colors shadow-sm active:scale-95 flex items-center gap-2"
                >
                  Simpan
                </Link>
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
