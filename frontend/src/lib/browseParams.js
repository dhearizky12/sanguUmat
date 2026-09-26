// Tanya Jawab's state lives in the URL — ?search=&category=a&category=b&ustadz=3&sort=&page=
// — so a filtered page can be shared and the back button works.
export const SORTS = [
  { key: "terbaru", label: "Terbaru" },
  { key: "terlama", label: "Terlama" },
  { key: "populer", label: "Paling banyak dibaca" },
  { key: "singkat", label: "Waktu baca tersingkat" },
  { key: "abjad", label: "Judul A–Z" },
];

export function readBrowseParams(params) {
  const sort = params.get("sort");
  const page = Number.parseInt(params.get("page") ?? "", 10);
  return {
    search: params.get("search") ?? "",
    categories: params.getAll("category"),
    ustadz: params.getAll("ustadz"),
    sort: SORTS.some((s) => s.key === sort) ? sort : "terbaru",
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

// Builds the query string for a state. Anything but a page change returns to page 1.
export function writeBrowseParams(state, patch) {
  const next = { ...state, ...patch, page: "page" in patch ? patch.page : 1 };
  const params = new URLSearchParams();
  if (next.search) params.set("search", next.search);
  next.categories.forEach((c) => params.append("category", c));
  next.ustadz.forEach((u) => params.append("ustadz", u));
  if (next.sort !== "terbaru") params.set("sort", next.sort);
  if (next.page > 1) params.set("page", String(next.page));
  return params;
}
