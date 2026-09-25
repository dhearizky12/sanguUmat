import ComingSoonPage from "../components/ComingSoonPage";

// The per-ustadz profile page arrives with the `ustadz-profiles` roadmap change.
function DetailAdmin() {
  return (
    <ComingSoonPage
      breadcrumb={[{ label: "Profil ustadz" }]}
      title="Profil ustadz"
      lead="Halaman profil para ustadz sedang disiapkan."
      emptyTitle="Halaman ini belum tersedia."
      emptyMessage="Profil lengkap setiap ustadz akan tampil di sini. Sementara itu, telusuri jawaban mereka di Tanya Jawab."
    />
  );
}

export default DetailAdmin;
