// The "page to return to" that travels through sign-in as ?next=. Only a path within the
// app is accepted — one leading "/", never "//" or "/\" (another host) — mirroring the
// backend's check on returnUrl, so it can never become an open redirect.
export function safeNext(value) {
  if (typeof value !== "string" || value[0] !== "/") return "/";
  if (value[1] === "/" || value[1] === "\\") return "/";
  return value;
}

// The /login link for the current page, so signing in comes back here.
export function loginPath(next) {
  const target = safeNext(next);
  return target === "/" ? "/login" : `/login?next=${encodeURIComponent(target)}`;
}
