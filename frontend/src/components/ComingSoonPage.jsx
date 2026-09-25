import Footer from "./Footer";
import Header from "./Header";
import Breadcrumb from "./Breadcrumb";
import EmptyState from "./EmptyState";
import { PageBody, PageHeader, PageLead, PageTitle } from "./Page";

// A page whose feature has no backend yet: the real page shell with an honest
// "not open yet" state, never placeholder content. Used until each feature's own
// roadmap change lands.
export default function ComingSoonPage({ breadcrumb, title, lead, emptyTitle, emptyMessage }) {
  return (
    <div className="min-h-screen flex flex-col bg-cream font-serif text-ink">
      <Header />
      <main className="grow">
        <PageHeader>
          <Breadcrumb items={breadcrumb} />
          <div className="flex flex-col gap-2.5">
            <PageTitle>{title}</PageTitle>
            <PageLead>{lead}</PageLead>
          </div>
        </PageHeader>
        <PageBody>
          <EmptyState title={emptyTitle} message={emptyMessage} action={{ label: "Buka Tanya Jawab", to: "/questions" }} />
        </PageBody>
      </main>
      <Footer />
    </div>
  );
}
