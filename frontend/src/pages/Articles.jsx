import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Breadcrumb from "../components/Breadcrumb";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import FacetPanel from "../components/FacetPanel";
import LoadingState from "../components/LoadingState";
import MonoLabel from "../components/MonoLabel";
import Pagination from "../components/Pagination";
import ArticleRow, { ArticleLead } from "../components/article/ArticleRow";
import { Select } from "../components/Field";
import { OneColumnIcon, TwoColumnIcon } from "../components/Icons";
import { PageBody, PageHeader, PageLead, PageTitle } from "../components/Page";
import { useAuth } from "../hooks/useAuth";
import { API_URL } from "../lib/api";
import { canWriteArticles } from "../lib/article";
import { SORTS, readArticleParams, wantsLead, writeArticleParams } from "../lib/articleParams";

const nf = new Intl.NumberFormat("id-ID");

// Artikel, after its canvas: search in the header band; beside the results, a facet panel
// for Rubrik and Penulis; above them the count, sort and column toggle; the active filters
// as chips; the Sorotan on the plain first page; and numbered pages. All of it lives in the
// URL (lib/articleParams). There is no membership, so every article is open.
function Articles() {
  const [params, setParams] = useSearchParams();
  const state = readArticleParams(params);
  const { me } = useAuth();
  const [inputValue, setInputValue] = useState(state.search);
  const [syncedSearch, setSyncedSearch] = useState(state.search);
  const [result, setResult] = useState(null);
  const [columns, setColumns] = useState(1);
  const canWrite = canWriteArticles(me);

  const update = (patch) => setParams(writeArticleParams(state, patch));

  // Keep the box in sync when the URL's search changes from outside (back/forward).
  if (state.search !== syncedSearch) {
    setSyncedSearch(state.search);
    setInputValue(state.search);
  }

  // Debounce typing into the URL, which drives the fetch below.
  useEffect(() => {
    if (inputValue === state.search) return;
    const timeout = setTimeout(() => setParams(writeArticleParams(state, { search: inputValue.trim() }), { replace: true }), 400);
    return () => clearTimeout(timeout);
  }, [inputValue, state, setParams]);

  const lead = wantsLead(state, columns);
  const query = params.toString();
  const request = [query, lead ? "lead=1" : ""].filter(Boolean).join("&");
  useEffect(() => {
    let cancelled = false;
    fetch(`${API_URL}/api/articles${request ? `?${request}` : ""}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data) => !cancelled && setResult({ request, data }))
      .catch((err) => {
        console.error(err);
        if (!cancelled) setResult({ request, data: null });
      });
    return () => {
      cancelled = true;
    };
  }, [request]);

  // While the next page or filter loads, keep showing the current results, dimmed.
  const loading = !result;
  const stale = result && result.request !== request;
  const data = result?.data;

  const toggle = (key, value) => {
    const list = state[key];
    update({ [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value] });
  };

  const submitSearch = (e) => {
    e.preventDefault();
    update({ search: inputValue.trim() });
  };

  const categoryItems = (data?.facets.categories ?? []).map((c) => ({ value: c.key, label: c.name, count: c.count }));
  const authorItems = (data?.facets.authors ?? []).map((a) => ({ value: String(a.id), label: a.name, count: a.count }));
  const labelOf = (items, value) => items.find((it) => it.value === value)?.label ?? value;

  const chips = [
    ...state.categories.map((v) => ({ key: `c-${v}`, label: labelOf(categoryItems, v), remove: () => toggle("categories", v) })),
    ...state.authors.map((v) => ({ key: `a-${v}`, label: labelOf(authorItems, v), remove: () => toggle("authors", v) })),
    ...(state.search ? [{ key: "q", label: `“${state.search}”`, remove: () => update({ search: "" }) }] : []),
  ];
  const resetAll = () => {
    setInputValue("");
    setParams(new URLSearchParams());
  };

  // The lead's count joins the list's, so "N dari M" still counts every match.
  const shownTotal = data ? data.total + (data.lead ? 1 : 0) : 0;
  const leadArticle = data?.page === 1 ? data.lead : null;

  return (
    <div className="min-h-screen flex flex-col bg-cream font-serif text-ink">
      <Header />
      <main className="grow">
        <PageHeader>
          <Breadcrumb items={[{ label: "Artikel" }]} />
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
            <div className="flex flex-col gap-2.5">
              <PageTitle>Artikel</PageTitle>
              <PageLead>
                Pembahasan mendalam dari dewan ustadz. Saring berdasarkan rubrik, penulis, atau urutkan sesuai kebutuhanmu.
              </PageLead>
            </div>
            {canWrite && (
              <div className="flex flex-wrap gap-3">
                <Button as={Link} to="/articles/saya" variant="outline" className="px-5 py-3">
                  Artikel saya
                </Button>
                <Button as={Link} to="/articles/tulis" className="px-5 py-3">
                  Tulis artikel
                </Button>
              </div>
            )}
          </div>
          <form
            role="search"
            onSubmit={submitSearch}
            className="w-full flex flex-wrap items-stretch bg-cream border border-stone-border focus-within:border-forest transition-colors"
          >
            <input
              type="text"
              aria-label="Cari artikel"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Cari artikel, misalnya: zakat profesi"
              className="flex-[1_1_220px] min-w-0 bg-transparent outline-none px-[clamp(14px,4vw,20px)] h-14 text-[17px] text-ink placeholder:text-ink-faint"
            />
            {inputValue && (
              <button
                type="button"
                onClick={() => {
                  setInputValue("");
                  update({ search: "" });
                }}
                aria-label="Hapus pencarian"
                className="shrink-0 px-3.5 text-[17px] text-ink-faint hover:text-ink cursor-pointer transition-colors"
              >
                &#x2715;
              </button>
            )}
            <Button type="submit" className="shrink-0 tracking-[0.16em] px-[clamp(18px,5vw,26px)]">
              Cari
            </Button>
          </form>
        </PageHeader>

        <PageBody className="grid grid-cols-1 min-[900px]:grid-cols-[232px_minmax(0,1fr)] gap-x-[clamp(32px,5vw,60px)] gap-y-[34px] items-start">
          <aside className="flex flex-col gap-[30px] min-[900px]:sticky min-[900px]:top-[88px]">
            <FacetPanel
              title="Rubrik"
              items={categoryItems}
              selected={state.categories}
              onToggle={(v) => toggle("categories", v)}
              onClear={() => update({ categories: [] })}
              searchLabel="Cari rubrik"
            />
            <FacetPanel
              title="Penulis"
              items={authorItems}
              selected={state.authors}
              onToggle={(v) => toggle("authors", v)}
              onClear={() => update({ authors: [] })}
              searchLabel="Cari penulis"
            />
          </aside>

          <div className="flex flex-col min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3 pb-3 border-b border-ink">
              <MonoLabel className="text-ink-muted">
                {data ? `${nf.format(shownTotal)} dari ${nf.format(data.totalPublished)} artikel` : "Memuat…"}
              </MonoLabel>
              <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2.5">
                <MonoLabel as="label" size="sm" className="flex items-center gap-2.5 tracking-[0.13em] text-ink-muted">
                  Urutkan
                  <span className="w-[210px]">
                    <Select compact value={state.sort} onChange={(e) => update({ sort: e.target.value })}>
                      {SORTS.map((s) => (
                        <option key={s.key} value={s.key}>
                          {s.label}
                        </option>
                      ))}
                    </Select>
                  </span>
                </MonoLabel>
                <div className="hidden min-[900px]:flex items-stretch border border-stone-border">
                  {[
                    { n: 1, label: "Satu kolom", icon: <OneColumnIcon /> },
                    { n: 2, label: "Dua kolom", icon: <TwoColumnIcon /> },
                  ].map((c) => (
                    <button
                      key={c.n}
                      type="button"
                      aria-label={c.label}
                      aria-pressed={columns === c.n}
                      onClick={() => {
                        setColumns(c.n);
                        // The Sorotan comes and goes with the layout, which reshuffles the pages.
                        if (state.page > 1) update({ page: 1 });
                      }}
                      className={`px-2.5 py-2 flex items-center justify-center cursor-pointer transition-colors ${
                        columns === c.n ? "bg-forest text-cream-text" : "text-ink-muted hover:bg-cream-hover"
                      }`}
                    >
                      {c.icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {chips.length > 0 && (
              <div className="flex flex-wrap items-center gap-2.5 pt-4 pb-0.5">
                <MonoLabel size="sm" className="tracking-[0.13em] text-ink-faint">
                  Saringan aktif
                </MonoLabel>
                {chips.map((chip) => (
                  <MonoLabel
                    as="button"
                    type="button"
                    size="sm"
                    key={chip.key}
                    onClick={chip.remove}
                    className="flex items-center gap-2 px-[11px] py-[7px] tracking-[0.1em] bg-gold-tint border border-gold-line text-gold-ink hover:bg-gold-tint-hover cursor-pointer transition-colors"
                  >
                    {chip.label}
                    <span aria-hidden="true">&#x2715;</span>
                  </MonoLabel>
                ))}
                <MonoLabel
                  as="button"
                  type="button"
                  size="sm"
                  onClick={resetAll}
                  className="tracking-[0.13em] text-ink-muted border-b border-stone-border hover:text-ink cursor-pointer transition-colors"
                >
                  Hapus semua
                </MonoLabel>
              </div>
            )}

            {loading ? (
              <LoadingState message="Memuat artikel…" />
            ) : data && data.totalPublished === 0 ? (
              <EmptyState
                className="mt-6"
                title="Belum ada artikel."
                message="Artikel dari para ustadz akan tampil di sini. Sementara itu, telusuri jawaban singkat di Tanya Jawab."
                action={{ label: "Buka Tanya Jawab", to: "/questions", variant: "outline" }}
              />
            ) : !data || (data.items.length === 0 && !leadArticle) ? (
              <EmptyState
                className="mt-6"
                title="Belum ada artikel yang cocok."
                message="Coba longgarkan saringan atau telusuri jawaban singkat di halaman Tanya Jawab."
                action={{ label: "Atur ulang saringan", onClick: resetAll, variant: "outline" }}
              />
            ) : (
              <div aria-busy={stale || undefined} className={`transition-opacity ${stale ? "opacity-50" : ""}`}>
                {leadArticle && <ArticleLead article={leadArticle} />}
                <div
                  className={
                    columns === 2 ? "grid grid-cols-1 min-[900px]:grid-cols-2 min-[900px]:gap-x-[clamp(28px,4vw,44px)]" : "flex flex-col"
                  }
                >
                  {data.items.map((a) => (
                    <ArticleRow key={a.id} article={a} card={columns === 2} />
                  ))}
                </div>
                <Pagination
                  page={data.page}
                  totalPages={data.totalPages}
                  onChange={(page) => {
                    update({ page });
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              </div>
            )}
          </div>
        </PageBody>
      </main>
      <Footer />
    </div>
  );
}

export default Articles;
