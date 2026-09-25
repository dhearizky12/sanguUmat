import { useEffect, useSyncExternalStore } from "react";
import { API_URL } from "./api";

// Categories are data an Admin manages (GET /api/categories), fetched once per page load
// and shared by every component through this small store. refreshCategories() re-reads
// them after an Admin changes the list.
let categories = [];
let loaded = false;
let request = null;
const listeners = new Set();

function publish(next) {
  categories = next;
  loaded = true;
  listeners.forEach((listener) => listener());
}

export function refreshCategories() {
  request = fetch(`${API_URL}/api/categories`)
    .then((res) => (res.ok ? res.json() : []))
    .then(publish)
    .catch((err) => {
      console.error(err);
      request = null;
    });
  return request;
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// [{ key, name, sortOrder, questionCount }], in the Admin's order; [] until loaded.
export function useCategories() {
  useEffect(() => {
    if (!request) refreshCategories();
  }, []);
  return useSyncExternalStore(subscribe, () => categories);
}

// Whether the list has arrived at least once (so an empty list means "none", not "loading").
export function useCategoriesLoaded() {
  useEffect(() => {
    if (!request) refreshCategories();
  }, []);
  return useSyncExternalStore(subscribe, () => loaded);
}

// A question's category name, or "Lainnya" when it has none.
export function categoryLabel(list, key) {
  return list.find((c) => c.key === key)?.name ?? "Lainnya";
}

// The "Semua" option the filter rows put in front of the list.
export const ALL_CATEGORIES = { key: "semua", name: "Semua" };
