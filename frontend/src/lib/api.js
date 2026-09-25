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

// Profile pictures come from two places: Google, which gives an absolute
// https:// URL, and our own uploads, which give a server-relative "/uploads/x".
// Only the second needs the API origin in front — and prefixing an already
// absolute URL, or joining with an extra slash, produces a broken src.
export function pictureUrl(picture) {
  if (!picture) return null;
  if (/^https?:\/\//i.test(picture)) return picture;
  return API_URL + (picture.startsWith("/") ? picture : "/" + picture);
}
