import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Breadcrumb from "../components/Breadcrumb";
import Button from "../components/Button";
import MonoLabel from "../components/MonoLabel";
import { useAuth } from "../hooks/useAuth";
import Avatar from "../components/Avatar";
import { formatDate } from "../lib/date";
import { PageBody, PageHeader } from "../components/Page";

const ROLE_LABELS = { User: "Anggota", Guru: "Guru", Admin: "Admin" };

function DetailRow({ label, children }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[180px_minmax(0,1fr)] gap-x-6 gap-y-1 py-4 border-b border-stone-line-soft">
      <MonoLabel as="dt" size="sm" className="tracking-[0.14em] text-ink-faint pt-1">
        {label}
      </MonoLabel>
      <dd className="text-[17px] text-ink text-pretty">{children || <span className="text-ink-faint">Belum diisi</span>}</dd>
    </div>
  );
}

function Profile() {
  const { logout, profile } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-cream font-serif text-ink">
      <Header />
      <main className="grow">
        <PageHeader>
          <Breadcrumb items={[{ label: "Profil saya" }]} />
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="flex items-center gap-5 min-w-0">
              {/* profile.picture is already resolved by AuthProvider — no pictureUrl() here. */}
              <Avatar src={profile?.picture} name={profile?.name} size={88} />
              <div className="flex flex-col gap-1.5 min-w-0">
                <MonoLabel size="sm" className="tracking-[0.16em] text-gold-dark">
                  {ROLE_LABELS[profile?.role] ?? profile?.role}
                </MonoLabel>
                <h1 className="text-[clamp(30px,4.4vw,44px)] leading-[1.1] font-normal tracking-[-0.02em] text-balance">
                  {profile?.name}
                </h1>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button as={Link} to="/edit-profile" className="px-5 py-3">
                Ubah profil
              </Button>
              <Button variant="outline" onClick={logout} className="px-5 py-3">
                Keluar
              </Button>
            </div>
          </div>
        </PageHeader>

        <PageBody>
          <div className="max-w-[760px]">
            <MonoLabel as="h2" className="block tracking-[0.14em] text-ink pb-2.5 border-b border-ink">
              Data diri
            </MonoLabel>
            <dl>
              <DetailRow label="Email">{profile?.email}</DetailRow>
              <DetailRow label="Nomor telepon">{profile?.phone}</DetailRow>
              <DetailRow label="Alamat">{profile?.address}</DetailRow>
              <DetailRow label="Bergabung sejak">{profile?.createdAt && formatDate(profile.createdAt)}</DetailRow>
            </dl>
          </div>
        </PageBody>
      </main>
      <Footer />
    </div>
  );
}

export default Profile;
