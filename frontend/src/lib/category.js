// Category keys match the real `Category` field on Question (see BE_PLAN.md Phase 4) so
// categoryLabel() below works directly against backend data.
export const CATEGORIES = [
  { key: "semua", label: "Semua" },
  { key: "sholat", label: "Sholat" },
  { key: "puasa", label: "Puasa" },
  { key: "zakat", label: "Zakat" },
  { key: "keluarga", label: "Keluarga & Pernikahan" },
  { key: "muamalah", label: "Keuangan & Muamalah" },
];

export function categoryLabel(key) {
  return CATEGORIES.find((c) => c.key === key)?.label ?? "Lainnya";
}
