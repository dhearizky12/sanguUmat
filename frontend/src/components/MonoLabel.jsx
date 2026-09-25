// md is 11px, sm 10.5px, xs 10px — the three sizes the canvases use.
const SIZES = {
  md: "text-mono-label",
  sm: "text-mono-label-sm",
  xs: "text-mono-label-xs",
};

// The uppercase IBM Plex Mono label the design uses for kickers, meta, nav
// and buttons. `as` renders it as any element or component (Link, button…).
export default function MonoLabel({ as: Tag = "span", size = "md", className = "", ...props }) {
  return <Tag className={`font-mono uppercase ${SIZES[size]} ${className}`} {...props} />;
}
