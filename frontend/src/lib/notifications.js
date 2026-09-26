import { API_URL } from "./api";

// The notification endpoints, shared by the header bell and the Notifikasi page.
const opts = { credentials: "include" };

export const fetchUnread = () =>
  fetch(`${API_URL}/api/notifications/unread-count`, opts).then((r) => (r.ok ? r.json() : null));

export const fetchNotifications = (page = 1) =>
  fetch(`${API_URL}/api/notifications?page=${page}`, opts).then((r) => (r.ok ? r.json() : null));

export const markRead = (id) => fetch(`${API_URL}/api/notifications/${id}/read`, { ...opts, method: "POST" });

export const markAllRead = () => fetch(`${API_URL}/api/notifications/read-all`, { ...opts, method: "POST" });

// Tells every bell on the page that counts changed (the Notifikasi page marking things read).
export const NOTIFICATIONS_CHANGED = "notifications-changed";
export const announceChange = () => window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED));
