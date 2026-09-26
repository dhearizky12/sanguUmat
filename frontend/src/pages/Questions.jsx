import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Breadcrumb from "../components/Breadcrumb";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import FacetPanel from "../components/FacetPanel";
import LoadingState from "../components/LoadingState";
import MonoLabel from "../components/MonoLabel";
import Pagination from "../components/Pagination";
import QuestionCard from "../components/QuestionCard";
import { Select } from "../components/Field";
import { OneColumnIcon, TwoColumnIcon } from "../components/Icons";
import { PageBody, PageHeader, PageLead, PageTitle } from "../components/Page";
import { API_URL } from "../lib/api";
import { SORTS, readBrowseParams, writeBrowseParams } from "../lib/browseParams";

const nf = new Intl.NumberFormat("id-ID");

// Tanya Jawab, after its canvas: search in the header band; beside the results, a facet
// panel for Kategori and Ustadz; above them the count, sort and column toggle; the active
// filters as chips; and numbered pages. All of it lives in the URL (lib/browseParams).
function Questions() {
  const [params, setParams] = useSearchParams();
  const state = readBrowseParams(params);
  const [inputValue, setInputValue] = useState(state.search);
  const [syncedSearch, setSyncedSearch] = useState(state.search);
  const [result, setResult] = useState(null);
  const [columns, setColumns] = useState(2);

  const update = (patch) => setParams(writeBrowseParams(state, patch));

  // Keep the box in sync when the URL's search changes from outside (the home hero search,
  // back/forward) — adjusted during render, React's documented pattern for this.
  if (state.search !== syncedSearch) {
    setSyncedSearch(state.search);
    setInputValue(state.search);
  }

  // Debounce typing into the URL, which drives the fetch below.
  useEffect(() => {
    if (inputValue === state.search) return;
    const timeout = setTimeout(() => setParams(writeBrowseParams(state, { search: inputValue.trim() }), { replace: true }), 400);
    return () => clearTimeout(timeout);
  }, [inputValue, state, setParams]);

  const query = params.toString();
  useEffect(() => {
    let cancelled = false;
    fetch(`${API_URL}/api/question/browse${query ? `?${query}` : ""}`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data) => !cancelled && setResult({ query, data }))
      .catch((err) => {
        console.error(err);
        if (!cancelled) setResult({ query, data: null });
      });
    return () => {
      cancelled = true;
    };
  }, [query]);

  // While the next page or filter loads, keep showing the current results, dimmed.
  const loading = !result;
  const stale = result && result.query !== query;
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
  const ustadzItems = (data?.facets.ustadz ?? []).map((u) => ({ value: String(u.id), label: u.name, count: u.count }));
  const labelOf = (items, value) => items.find((it) => it.value === value)?.label ?? value;

  const chips = [
    ...state.categories.map((v) => ({ key: `c-${v}`, label: labelOf(categoryItems, v), remove: () => toggle("categories", v) })),
    ...state.ustadz.map((v) => ({ key: `u-${v}`, label: labelOf(ustadzItems, v), remove: () => toggle("ustadz", v) })),
    ...(state.search ? [{ key: "q", label: `“${state.search}”`, remove: () => update({ search: "" }) }] : []),
  ];
  const resetAll = () => {
    setInputValue("");
    setParams(new URLSearchParams());
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream font-serif text-ink">
      <Header />
      <main className="grow">
        <PageHeader>
          <Breadcrumb items={[{ label: "Tanya Jawab" }]} />
          <div className="flex flex-col gap-2.5">
            <PageTitle>Tanya Jawab</PageTitle>
            <PageLead>
              Telusuri {data ? nf.format(data.totalPublished) : ""} jawaban yang sudah ditelaah para ustadz. Saring berdasarkan
              kategori atau ustadz, atau urutkan sesuai kebutuhanmu.
            </PageLead>
          </div>
          <form
            role="search"
            onSubmit={submitSearch}
            className="w-full flex flex-wrap items-stretch bg-cream border border-stone-border focus-within:border-forest transition-colors"
          >
            <input
              type="text"
              aria-label="Cari pertanyaan"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Cari pertanyaan, misalnya: menjamak sholat"
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
              title="Kategori"
              items={categoryItems}
              selected={state.categories}
              onToggle={(v) => toggle("categories", v)}
              onClear={() => update({ categories: [] })}
              searchLabel="Cari kategori"
              capacity={8}
            />
            <FacetPanel
              title="Ustadz"
              items={ustadzItems}
              selected={state.ustadz}
              onToggle={(v) => toggle("ustadz", v)}
              onClear={() => update({ ustadz: [] })}
              searchLabel="Cari ustadz"
              capacity={5}
            />
          </aside>

          <div className="flex flex-col min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3 pb-3 border-b border-ink">
              <MonoLabel className="text-ink-muted">
                {data ? `${nf.format(data.total)} dari ${nf.format(data.totalPublished)} jawaban` : "Memuat…"}
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
                      onClick={() => setColumns(c.n)}
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
              <LoadingState message="Memuat jawaban…" />
            ) : !data || data.items.length === 0 ? (
              <EmptyState
                className="mt-6"
                title="Belum ada jawaban yang cocok."
                message="Coba longgarkan saringan atau ajukan pertanyaanmu langsung kepada para ustadz."
                action={{ label: "Atur ulang saringan", onClick: resetAll, variant: "outline" }}
              />
            ) : (
              <>
                <div
                  aria-busy={stale || undefined}
                  className={`transition-opacity ${stale ? "opacity-50" : ""} ${
                    columns === 2 ? "grid grid-cols-1 min-[900px]:grid-cols-2 min-[900px]:gap-x-10" : "flex flex-col"
                  }`}
                >
                  {data.items.map((q) => (
                    <QuestionCard key={q.id} slug={q.id} question={q} />
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
              </>
            )}
          </div>
        </PageBody>
      </main>
      <Footer />
    </div>
  );
}

export default Questions;
