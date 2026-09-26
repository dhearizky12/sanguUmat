import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Breadcrumb from "../components/Breadcrumb";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
import MonoLabel from "../components/MonoLabel";
import NotificationItem from "../components/NotificationItem";
import Pagination from "../components/Pagination";
import { PageBody, PageHeader, PageLead, PageTitle } from "../components/Page";
import { announceChange, fetchNotifications, markAllRead, markRead } from "../lib/notifications";

// Notifikasi: every notification of the signed-in user, 20 a page (?page= in the URL).
function Notifications() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number.parseInt(params.get("page") ?? "1", 10) || 1);
  const [result, setResult] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchNotifications(page)
      .then((d) => !cancelled && setResult({ page, data: d }))
      .catch((err) => console.error(err));
    return () => {
      cancelled = true;
    };
  }, [page]);

  const data = result?.data;

  const choose = (n) => {
    if (!n.read) markRead(n.id).then(announceChange).catch((err) => console.error(err));
    navigate(n.link);
  };

  const readAll = () => {
    setResult((r) => r && { ...r, data: { ...r.data, unread: 0, items: r.data.items.map((n) => ({ ...n, read: true })) } });
    markAllRead().then(announceChange).catch((err) => console.error(err));
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream font-serif text-ink">
      <Header />
      <main className="grow">
        <PageHeader>
          <Breadcrumb items={[{ label: "Notifikasi" }]} />
          <div className="flex flex-col gap-2.5">
            <PageTitle>Notifikasi</PageTitle>
            <PageLead>Kabar tentang pertanyaan, jawaban, dan komentar yang melibatkanmu.</PageLead>
          </div>
        </PageHeader>

        <PageBody>
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-ink">
            <MonoLabel className="text-ink-muted">{data ? `${data.unread} belum dibaca` : "Memuat…"}</MonoLabel>
            <Button variant="link" disabled={!data || data.unread === 0} onClick={readAll}>
              Tandai semua dibaca
            </Button>
          </div>
          {!data ? (
            <LoadingState message="Memuat notifikasi…" />
          ) : data.items.length === 0 ? (
            <EmptyState
              className="mt-6"
              title="Belum ada notifikasi."
              message="Kabar tentang jawaban dan komentar untukmu akan tampil di sini."
            />
          ) : (
            <>
              <div className="flex flex-col max-w-[820px]">
                {data.items.map((n) => (
                  <NotificationItem key={n.id} notification={n} onChoose={choose} />
                ))}
              </div>
              <Pagination
                page={data.page}
                totalPages={data.totalPages}
                onChange={(p) => {
                  setParams(p > 1 ? { page: String(p) } : {});
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </>
          )}
        </PageBody>
      </main>
      <Footer />
    </div>
  );
}

export default Notifications;
