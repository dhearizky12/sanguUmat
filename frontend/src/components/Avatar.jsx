import { useState } from "react";

// Sizes in px → box and letter size, so the initials stay in proportion.
const SIZES = {
  20: "size-5 text-[10px]",
  28: "size-7 text-xs",
  32: "size-8 text-sm",
  36: "size-9 text-[15px]",
  40: "size-10 text-base",
  88: "size-[88px] text-[34px]",
};

// "Budi Santoso" → "BS", "Siti" → "S": the first letters of the first two words.
function initialsOf(name) {
  const words = (name ?? "").trim().split(/\s+/).filter(Boolean);
  return words.slice(0, 2).map((w) => w.charAt(0).toUpperCase()).join("") || "?";
}

// A person's picture, or — when there is none or it fails to load — their initials on
// the same forest circle for everyone, the way Google does it.
// `src` must already be resolved (pictureUrl(), or AuthProvider's own profile.picture).
export default function Avatar({ src, name, size = 32, className = "" }) {
  const [failedSrc, setFailedSrc] = useState(null);
  const base = `${SIZES[size]} shrink-0 rounded-full ${className}`;

  if (src && src !== failedSrc) {
    return <img src={src} alt="" onError={() => setFailedSrc(src)} className={`${base} object-cover border border-stone-line`} />;
  }

  const initials = initialsOf(name);
  return (
    <span aria-hidden="true" className={`${base} flex items-center justify-center bg-forest text-cream-text font-serif font-medium leading-none select-none`}>
      {/* Trim the line box to cap height so flex centring centres the letter itself, not the
          font's ascender/descender space (which sits the capital visibly high). */}
      <span className="[text-box:trim-both_cap_alphabetic]">{initials}</span>
    </span>
  );
}
