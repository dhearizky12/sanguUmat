// The recording archive's state lives in the URL — ?search=&series=tafsir&ustadz=3&notes=1&
// sort=&page= — like Tanya Jawab and Artikel.
export const KAJIAN_SORTS = [
  { key: "terbaru", label: "Terbaru" },
  { key: "terlama", label: "Terlama" },
  { key: "populer", label: "Paling banyak disimak" },
  { key: "singkat", label: "Durasi tersingkat" },
  { key: "abjad", label: "Judul A–Z" },
];

export function readKajianParams(params) {
  const sort = params.get("sort");
  const page = Number.parseInt(params.get("page") ?? "", 10);
  return {
    search: params.get("search") ?? "",
    series: params.getAll("series"),
    ustadz: params.getAll("ustadz"),
    notes: params.get("notes") === "1",
    sort: KAJIAN_SORTS.some((s) => s.key === sort) ? sort : "terbaru",
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

// Builds the query string for a state. Anything but a page change returns to page 1.
export function writeKajianParams(state, patch) {
  const next = { ...state, ...patch, page: "page" in patch ? patch.page : 1 };
  const params = new URLSearchParams();
  if (next.search) params.set("search", next.search);
  next.series.forEach((s) => params.append("series", s));
  next.ustadz.forEach((u) => params.append("ustadz", u));
  if (next.notes) params.set("notes", "1");
  if (next.sort !== "terbaru") params.set("sort", next.sort);
  if (next.page > 1) params.set("page", String(next.page));
  return params;
}
