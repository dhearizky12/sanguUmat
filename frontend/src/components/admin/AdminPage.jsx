import Footer from "../Footer";
import Header from "../Header";
import AdminNav from "../AdminNav";
import Breadcrumb from "../Breadcrumb";
import { PageBody, PageHeader, PageLead, PageTitle } from "../Page";

// The frame every Panel Admin page shares: breadcrumb, title, lead, the tabs, and whatever
// the page puts in the header band (a search box) above its body.
export default function AdminPage({ crumb, lead, header, children }) {
  return (
    <div className="min-h-screen flex flex-col bg-cream font-serif text-ink">
      <Header />
      <main className="grow">
        <PageHeader>
          <Breadcrumb items={[{ label: "Panel Admin", to: "/admin" }, { label: crumb }]} />
          <div className="flex flex-col gap-2.5">
            <PageTitle>Panel Admin</PageTitle>
            <PageLead>{lead}</PageLead>
          </div>
          <AdminNav />
          {header}
        </PageHeader>
        <PageBody>{children}</PageBody>
      </main>
      <Footer />
    </div>
  );
}
