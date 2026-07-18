// Question model has no Category field yet (see BE_PLAN.md). Until the backend adds one, we
// approximate a category from title/content keywords so filters have something real to
// operate on instead of inventing fake questions. Replace with a real `?category=` query once
// the backend ships it.
export const CATEGORIES = [
  { key: "semua", label: "Semua" },
  { key: "sholat", label: "Sholat", keywords: ["sholat", "shalat", "salat", "sembahyang"] },
  { key: "puasa", label: "Puasa", keywords: ["puasa", "sawm", "shaum"] },
  { key: "zakat", label: "Zakat", keywords: ["zakat"] },
  { key: "keluarga", label: "Keluarga & Pernikahan", keywords: ["nikah", "keluarga", "suami", "istri", "cerai", "talak"] },
  { key: "muamalah", label: "Keuangan & Muamalah", keywords: ["riba", "dagang", "bisnis", "investasi", "keuangan", "muamalah", "utang", "hutang"] },
];

export function matchCategory(text) {
  const lower = text.toLowerCase();
  for (const cat of CATEGORIES.slice(1)) {
    if (cat.keywords.some((k) => lower.includes(k))) {
      return cat.key;
    }
  }
  return null;
}

export function categoryLabel(key) {
  return CATEGORIES.find((c) => c.key === key)?.label ?? "Lainnya";
}
