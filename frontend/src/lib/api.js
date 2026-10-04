import { BASE_PATH } from "./basePath";

// In production this resolves to the path prefix the app is mounted under (""
// at the domain root, "/sanguumat" behind that prefix), so "/api/..." lands on
// the right route and the auth cookie stays first-party on one origin.
// frontend/.env.development points VITE_API_URL at a locally running backend,
// which takes precedence.
//
// Note `||` rather than `??`: VITE_API_URL is defined-but-empty in
// .env.production, and `?? ` would keep that empty string and drop the prefix.
export const API_URL = import.meta.env.VITE_API_URL || BASE_PATH;

// The sign-in token. The API hands it over once, in the URL fragment of
// /masuk/selesai (#token=…); captureTokenFromUrl() stores it and strips it from the
// address bar, and every request to the API then carries it as a Bearer header.
// localStorage can be unavailable (private windows, blocked site data), so every
// access is guarded and the app simply behaves as signed out.
const TOKEN_KEY = "sangu.token";

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Signed out for this visit; nothing else to do.
  }
}

// Runs once before React renders, so the very first /api/auth/me already has the token.
export function captureTokenFromUrl() {
  const match = /^#token=([^&]+)/.exec(window.location.hash);
  if (!match) return;
  setToken(decodeURIComponent(match[1]));
  window.history.replaceState(null, "", window.location.pathname + window.location.search);
}

// Every API call in the app is a plain fetch(`${API_URL}/api/...`). Rather than touch
// each one, wrap fetch once: requests to the API get the Authorization header, and a
// 401 for a request that carried a token means it expired or is invalid, so drop it.
const API_PREFIX = `${API_URL}/api/`;
const nativeFetch = window.fetch.bind(window);

window.fetch = async (input, init) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : "";
  const token = getToken();
  if (!token || !url.startsWith(API_PREFIX)) return nativeFetch(input, init);

  const headers = new Headers(init?.headers);
  if (!headers.has("Authorization")) headers.set("Authorization", `Bearer ${token}`);
  const response = await nativeFetch(input, { ...init, headers });
  if (response.status === 401) setToken(null);
  return response;
};

// Profile pictures come from two places: Google, which gives an absolute
// https:// URL, and our own uploads, which give a server-relative "/uploads/x".
// Only the second needs the API origin in front — and prefixing an already
// absolute URL, or joining with an extra slash, produces a broken src.
export function pictureUrl(picture) {
  if (!picture) return null;
  if (/^https?:\/\//i.test(picture)) return picture;
  return API_URL + (picture.startsWith("/") ? picture : "/" + picture);
}
