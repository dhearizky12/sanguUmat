// Empty in production: the SPA is served from the API's own wwwroot, so relative
// URLs ("/api/...") hit the right host and the auth cookie stays first-party.
// frontend/.env.development points this at a locally running backend instead.
export const API_URL = import.meta.env.VITE_API_URL ?? "";
