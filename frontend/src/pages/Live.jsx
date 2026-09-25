import ComingSoonPage from "../components/ComingSoonPage";

// Ngaji Bareng arrives with the `ngaji-bareng` roadmap change.
function Live() {
  return (
    <ComingSoonPage
      breadcrumb={[{ label: "Ngaji Bareng" }]}
      title="Ngaji Bareng"
      lead="Kajian langsung dan rekaman bersama para ustadz."
      emptyTitle="Ngaji Bareng belum dibuka."
      emptyMessage="Jadwal kajian langsung dan arsip rekaman sedang disiapkan. Sementara itu, telusuri jawaban para ustadz di Tanya Jawab."
    />
  );
}

export default Live;
