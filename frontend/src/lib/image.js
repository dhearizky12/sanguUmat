export function handleAvatarError(e) {
  e.currentTarget.onerror = null;
  e.currentTarget.src = "/default-avatar.png";
}
