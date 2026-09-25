import { useState } from "react";

// Sizes in px → box and letter size, so the initial stays in proportion.
const SIZES = {
  20: "size-5 text-[10px]",
  28: "size-7 text-xs",
  32: "size-8 text-sm",
  36: "size-9 text-[15px]",
  40: "size-10 text-base",
  88: "size-[88px] text-[34px]",
};

// A person's picture, or — when there is none or it fails to load — the first letter of
// their name on the same forest circle for everyone, the way Google does it.
// `src` must already be resolved (pictureUrl(), or AuthProvider's own profile.picture).
export default function Avatar({ src, name, size = 32, className = "" }) {
  const [failedSrc, setFailedSrc] = useState(null);
  const base = `${SIZES[size]} shrink-0 rounded-full ${className}`;

  if (src && src !== failedSrc) {
    return <img src={src} alt="" onError={() => setFailedSrc(src)} className={`${base} object-cover border border-stone-line`} />;
  }

  const initial = (name ?? "").trim().charAt(0).toUpperCase() || "?";
  return (
    <span aria-hidden="true" className={`${base} flex items-center justify-center bg-forest text-cream-text font-serif font-medium leading-none select-none`}>
      {initial}
    </span>
  );
}
