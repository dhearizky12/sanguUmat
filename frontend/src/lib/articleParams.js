import { SORTS } from "./browseParams";

// Artikel's state lives in the URL — ?search=&category=a&author=3&sort=&page= — the same
// way Tanya Jawab's does (lib/browseParams), with authors in place of ustadz.
export { SORTS };

export function readArticleParams(params) {
  const sort = params.get("sort");
  const page = Number.parseInt(params.get("page") ?? "", 10);
  return {
    search: params.get("search") ?? "",
    categories: params.getAll("category"),
    authors: params.getAll("author"),
    sort: SORTS.some((s) => s.key === sort) ? sort : "terbaru",
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

// Builds the query string for a state. Anything but a page change returns to page 1.
export function writeArticleParams(state, patch) {
  const next = { ...state, ...patch, page: "page" in patch ? patch.page : 1 };
  const params = new URLSearchParams();
  if (next.search) params.set("search", next.search);
  next.categories.forEach((c) => params.append("category", c));
  next.authors.forEach((a) => params.append("author", a));
  if (next.sort !== "terbaru") params.set("sort", next.sort);
  if (next.page > 1) params.set("page", String(next.page));
  return params;
}

// Whether the list is plain enough to open with the Sorotan (the server adds the rest of
// the rule: more than three articles and a cover on the newest).
export function wantsLead(state, columns) {
  return columns === 1 && state.sort === "terbaru" && !state.search && state.categories.length === 0 && state.authors.length === 0;
}
