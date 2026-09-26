// The video id in a pasted YouTube link — the same forms the server accepts
// (backend/Kajians/YouTubeLink.cs). Used only to preview the thumbnail while typing.
const BARE = /^[A-Za-z0-9_-]{11}$/;
const URL_FORM =
  /^(?:https?:\/\/)?(?:(?:www|m|music)\.)?(?:youtube\.com\/(?:watch\?(?:[^#]*&)?v=|live\/|embed\/|shorts\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})(?:[?&#/].*)?$/i;

export function youtubeIdOf(input) {
  const value = (input ?? "").trim();
  if (BARE.test(value)) return value;
  return URL_FORM.exec(value)?.[1] ?? null;
}

export const youtubeThumbnail = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
export const youtubeWatchUrl = (id) => `https://www.youtube.com/watch?v=${id}`;
