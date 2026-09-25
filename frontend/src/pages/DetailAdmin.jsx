import Footer from "../components/Footer";
import Header from "../components/Header";
import Breadcrumb from "../components/Breadcrumb";
import EmptyState from "../components/EmptyState";
import { PageBody, PageHeader, PageLead, PageTitle } from "../components/Page";

// Placeholder for the per-ustadz profile page, which arrives with the `ustadz-profiles`
// change on the roadmap. Shown honestly as not open yet rather than with invented content.
function DetailAdmin() {
  return (
    <div className="min-h-screen flex flex-col bg-cream font-serif text-ink">
      <Header />
      <main className="grow">
        <PageHeader>
          <Breadcrumb items={[{ label: "Profil ustadz" }]} />
          <div className="flex flex-col gap-2.5">
            <PageTitle>Profil ustadz</PageTitle>
            <PageLead>Halaman profil para ustadz sedang disiapkan.</PageLead>
          </div>
        </PageHeader>
        <PageBody>
          <EmptyState
            title="Halaman ini belum tersedia."
            message="Profil lengkap setiap ustadz akan tampil di sini. Sementara itu, telusuri jawaban mereka di Tanya Jawab."
            action={{ label: "Buka Tanya Jawab", to: "/questions" }}
          />
        </PageBody>
      </main>
      <Footer />
    </div>
  );
}

export default DetailAdmin;
