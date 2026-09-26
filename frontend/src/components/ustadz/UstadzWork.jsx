import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import EmptyState from "../EmptyState";
import LoadingState from "../LoadingState";
import MonoLabel from "../MonoLabel";
import Pagination from "../Pagination";
import QuestionCard from "../QuestionCard";
import SectionHeading from "../SectionHeading";
import ArticleRow from "../article/ArticleRow";
import KajianRow from "../kajian/KajianRow";
import { API_URL } from "../../lib/api";
import { formatCount } from "../../lib/format";
import { wibDay, wibTime } from "../../lib/wib";

const TABS = ["jawaban", "artikel", "kajian"];

// One list endpoint, refetched when its page changes; null until it answers.
function useList(url) {
  const [state, setState] = useState({ url: null, data: null });
  useEffect(() => {
    let cancelled = false;
    fetch(url)
      .then((res) => (res.ok ? res.json() : null))
      .catch(() => null)
      .then((data) => !cancelled && setState({ url, data }));
    return () => {
      cancelled = true;
    };
  }, [url]);
  return { data: state.data, stale: state.url !== url };
}

// An ustadz's work on their page: answers, articles and kajian as tabs, each with its count
// and its own pages, the tab in the URL (?tab=, ?page=). Empty tabs are hidden; with only
// answers there are no tabs at all. `stack` lays answer cards in one column (beside the
// profile the column is too narrow for two).
export default function UstadzWork({ ustadz, stack }) {
  const [params, setParams] = useSearchParams();
  const requested = TABS.includes(params.get("tab")) ? params.get("tab") : "jawaban";
  const page = Math.max(1, Number.parseInt(params.get("page") ?? "1", 10) || 1);
  const pageOf = (tab) => (requested === tab ? page : 1);

  const answers = useList(`${API_URL}/api/question/browse?ustadz=${ustadz.id}&page=${pageOf("jawaban")}`);
  const articles = useList(`${API_URL}/api/articles?author=${ustadz.id}&page=${pageOf("artikel")}`);
  const recordings = useList(`${API_URL}/api/kajian?ustadz=${ustadz.id}&page=${pageOf("kajian")}`);
  const now = useList(`${API_URL}/api/kajian/now`);

  const mine = (k) => String(k.ustadz?.id) === String(ustadz.id);
  const upcoming = now.data ? [now.data.live, ...now.data.schedule].filter((k) => k && mine(k)) : [];
  const counts = {
    jawaban: answers.data?.total ?? 0,
    artikel: articles.data?.total ?? 0,
    kajian: (recordings.data?.total ?? 0) + upcoming.length,
  };
  const loaded = answers.data && articles.data && recordings.data && now.data;
  const tabs = TABS.filter((t) => t === "jawaban" || counts[t] > 0);
  const tab = loaded && !tabs.includes(requested) ? "jawaban" : requested;

  const go = (next) => {
    const p = new URLSearchParams();
    if (next.tab && next.tab !== "jawaban") p.set("tab", next.tab);
    if (next.page > 1) p.set("page", String(next.page));
    setParams(p);
  };
  const toPage = (p) => {
    go({ tab, page: p });
    document.getElementById("karya")?.scrollIntoView({ behavior: "smooth" });
  };
  const labels = { jawaban: "Jawaban", artikel: "Artikel", kajian: "Kajian" };

  const list = { jawaban: answers, artikel: articles, kajian: recordings }[tab];
  const data = list.data;

  return (
    <section id="karya" className="flex flex-col min-w-0 scroll-mt-24">
      {tabs.length > 1 ? (
        <div role="tablist" aria-label="Karya ustadz" className="flex flex-wrap items-end gap-x-7 gap-y-2 border-b border-ink">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => go({ tab: t, page: 1 })}
              className={`-mb-px pb-3 flex items-baseline gap-2 border-b-2 cursor-pointer transition-colors ${
                tab === t ? "border-gold-deep text-ink" : "border-transparent text-ink-muted hover:text-ink"
              }`}
            >
              <span className="font-serif text-[clamp(20px,2.4vw,26px)] tracking-tight">{labels[t]}</span>
              <MonoLabel size="sm" className="text-ink-faint">
                {formatCount(counts[t])}
              </MonoLabel>
            </button>
          ))}
        </div>
      ) : (
        <SectionHeading title={`Jawaban dari ${ustadz.name}`} meta={answers.data ? `${formatCount(counts.jawaban)} jawaban` : ""} />
      )}

      {tab === "kajian" && page === 1 && upcoming.length > 0 && (
        <div className="flex flex-col pt-2">
          {upcoming.map((k) => (
            <div key={k.id} className="relative">
              {/* A live one is already marked on its thumbnail; a scheduled one gets its time. */}
              {k.status === "scheduled" && (
                <MonoLabel size="xs" className="absolute top-4 right-2 z-10 px-2 py-1 tracking-[0.12em] bg-gold-tint border border-gold-line text-gold-ink">
                  Jadwal &middot; {wibDay(k.startsAt)}, {wibTime(k.startsAt)} WIB
                </MonoLabel>
              )}
              <KajianRow kajian={k} />
            </div>
          ))}
        </div>
      )}

      {!data ? (
        <LoadingState message="Memuat…" />
      ) : data.items.length === 0 ? (
        tab === "jawaban" ? (
          <EmptyState className="mt-6" title="Belum ada jawaban." message="Jawaban ustadz ini akan tampil di sini." />
        ) : tab === "kajian" && upcoming.length > 0 ? null : (
          <EmptyState className="mt-6" title="Belum ada isi." message="Karya ustadz ini akan tampil di sini." />
        )
      ) : (
        <div aria-busy={list.stale || undefined} className={`transition-opacity ${list.stale ? "opacity-50" : ""}`}>
          {tab === "jawaban" && (
            <div className={stack ? "flex flex-col" : "grid grid-cols-1 min-[900px]:grid-cols-2 min-[900px]:gap-x-10"}>
              {data.items.map((q) => (
                <QuestionCard key={q.id} slug={q.id} question={q} />
              ))}
            </div>
          )}
          {tab === "artikel" && (
            <div className="flex flex-col">
              {data.items.map((a) => (
                <ArticleRow key={a.id} article={a} />
              ))}
            </div>
          )}
          {tab === "kajian" && (
            <div className="flex flex-col">
              {data.items.map((k) => (
                <KajianRow key={k.id} kajian={k} />
              ))}
            </div>
          )}
          <Pagination page={data.page} totalPages={data.totalPages} onChange={toPage} />
        </div>
      )}
    </section>
  );
}
