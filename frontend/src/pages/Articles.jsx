import ComingSoonPage from "../components/ComingSoonPage";

// Artikel arrives with the `articles` roadmap change.
function Articles() {
  return (
    <ComingSoonPage
      breadcrumb={[{ label: "Artikel" }]}
      title="Artikel"
      lead="Tulisan pembahasan mendalam dari para ustadz."
      emptyTitle="Artikel belum dibuka."
      emptyMessage="Rubrik artikel sedang disiapkan. Sementara itu, telusuri jawaban para ustadz di Tanya Jawab."
    />
  );
}

export default Articles;
