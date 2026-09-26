import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import EmptyState from "../EmptyState";
import LoadingState from "../LoadingState";
import MonoLabel from "../MonoLabel";
import Pagination from "../Pagination";
import { FilterChip, FilterRow } from "../Filters";
import { Input } from "../Field";
import { API_URL } from "../../lib/api";

const nf = new Intl.NumberFormat("id-ID");

// A Panel Admin list: search, status chips and pages, all in the URL (?search=&status=
// &page=), over one of the /api/admin list endpoints. `renderRow(item, remove)` draws a
// row; `remove(url, message)` confirms, deletes through an existing endpoint and refetches.
// `keep` lists extra URL params the list must preserve (the Konten page's ?jenis=).
export default function AdminList({ endpoint, statuses, searchLabel, placeholder, noun, emptyTitle, renderRow, keep = [] }) {
  const [params, setParams] = useSearchParams();
  const search = params.get("search") ?? "";
  const status = params.get("status") ?? "";
  const page = Math.max(1, Number.parseInt(params.get("page") ?? "1", 10) || 1);
  const [input, setInput] = useState(search);
  const [synced, setSynced] = useState(search);
  const [result, setResult] = useState(null);
  const [reload, setReload] = useState(0);
  const [error, setError] = useState("");

  if (search !== synced) {
    setSynced(search);
    setInput(search);
  }

  const write = (patch) => {
    const next = { search, status, ...patch, page: "page" in patch ? patch.page : 1 };
    const p = new URLSearchParams();
    keep.forEach((k) => params.get(k) && p.set(k, params.get(k)));
    if (next.search) p.set("search", next.search);
    if (next.status) p.set("status", next.status);
    if (next.page > 1) p.set("page", String(next.page));
    setParams(p, { replace: "search" in patch });
  };

  useEffect(() => {
    if (input.trim() === search) return;
    const t = setTimeout(() => write({ search: input.trim() }), 400);
    return () => clearTimeout(t);
  });

  const query = new URLSearchParams({ ...(search && { search }), ...(status && { status }), page: String(page) }).toString();
  const url = `${API_URL}${endpoint}?${query}`;
  useEffect(() => {
    let cancelled = false;
    fetch(url, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .catch(() => null)
      .then((data) => !cancelled && setResult({ url, data }));
    return () => {
      cancelled = true;
    };
  }, [url, reload]);

  const remove = async (deleteUrl, message) => {
    if (!window.confirm(message)) return;
    setError("");
    try {
      const res = await fetch(`${API_URL}${deleteUrl}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error(String(res.status));
      setReload((n) => n + 1);
    } catch (err) {
      console.error(err);
      setError("Gagal menghapus. Silakan coba lagi.");
    }
  };

  const data = result?.data;
  const stale = result && result.url !== url;

  return (
    <div className="flex flex-col gap-5">
      <Input type="search" size="lg" aria-label={searchLabel} placeholder={placeholder} value={input} onChange={(e) => setInput(e.target.value)} />
      {statuses && (
        <FilterRow label="Status">
          {[{ key: "", label: "Semua" }, ...statuses].map((s) => (
            <FilterChip key={s.key || "semua"} active={status === s.key} onClick={() => write({ status: s.key })}>
              {s.label}
            </FilterChip>
          ))}
        </FilterRow>
      )}
      <div className="flex flex-col">
        <div className="pb-3 border-b border-ink flex flex-wrap justify-between gap-3">
          <MonoLabel className="text-ink-muted">{data ? `${nf.format(data.total)} ${noun}` : "Memuat…"}</MonoLabel>
          {error && (
            <MonoLabel size="sm" className="text-rust">
              {error}
            </MonoLabel>
          )}
        </div>
        {!result ? (
          <LoadingState message="Memuat…" />
        ) : !data || data.items.length === 0 ? (
          <EmptyState className="mt-6" title={emptyTitle} message="Coba kata kunci atau saringan yang lain." />
        ) : (
          <div aria-busy={stale || undefined} className={`transition-opacity ${stale ? "opacity-50" : ""}`}>
            {data.items.map((item) => renderRow(item, remove))}
            <Pagination page={data.page} totalPages={data.totalPages} onChange={(p) => write({ page: p })} />
          </div>
        )}
      </div>
    </div>
  );
}

// One row: main content on the left, meta and actions on the right, stacking on phones.
export function AdminRow({ children, actions }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3 py-4 border-b border-stone-line-soft">
      <div className="flex-[1_1_320px] min-w-0 flex flex-col gap-1.5">{children}</div>
      <div className="flex flex-wrap items-center gap-5 pt-1">{actions}</div>
    </div>
  );
}

export function Tag({ tone = "plain", children }) {
  const tones = {
    plain: "border-stone-border text-ink-muted",
    gold: "bg-gold-tint border-gold-line text-gold-ink",
    forest: "bg-forest border-forest text-cream-text",
    live: "bg-live border-live text-white",
  };
  return (
    <MonoLabel size="xs" className={`px-2 py-0.5 border tracking-[0.1em] ${tones[tone]}`}>
      {children}
    </MonoLabel>
  );
}
