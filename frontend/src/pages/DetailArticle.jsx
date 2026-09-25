import ComingSoonPage from "../components/ComingSoonPage";

// Artikel arrives with the `articles` roadmap change; until then no article exists to show.
function DetailArticle() {
  return (
    <ComingSoonPage
      breadcrumb={[{ label: "Artikel", to: "/articles" }, { label: "Belum tersedia" }]}
      title="Artikel"
      lead="Tulisan pembahasan mendalam dari para ustadz."
      emptyTitle="Artikel ini belum tersedia."
      emptyMessage="Rubrik artikel sedang disiapkan. Sementara itu, telusuri jawaban para ustadz di Tanya Jawab."
    />
  );
}

export default DetailArticle;
