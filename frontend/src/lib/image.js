// Relative so it resolves against <base href> when the app runs under a path prefix.
export const DEFAULT_AVATAR = "default-avatar.png";

export function handleAvatarError(e) {
  e.currentTarget.onerror = null;
  e.currentTarget.src = DEFAULT_AVATAR;
}
