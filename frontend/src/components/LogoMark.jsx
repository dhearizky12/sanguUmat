// The Sangu Umat mark. The source image is forest green on transparent;
// the "light" tone recolours it to cream for dark backgrounds like the footer.
// The src is relative so it resolves against <base href> under a path prefix.
// The artwork's weight sits low (dome and book under a thin crescent), so it is
// lifted 3px to line up optically with the wordmark's capitals.
export default function LogoMark({ tone = "forest", className = "" }) {
  const toneClass = tone === "light" ? "brightness-0 invert" : "";
  return (
    <img
      src="logo.png"
      alt=""
      aria-hidden="true"
      className={`size-8 shrink-0 object-contain -translate-y-0.75 ${toneClass} ${className}`}
    />
  );
}
