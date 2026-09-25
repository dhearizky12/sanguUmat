// The diagonal-stripe fill the design uses where an image or video is missing.
// Stripe width and opacity are the canvases' own: finer stripes on thumbnails,
// wider ones on large frames.
const TEXTURES = {
  light: {
    sm: "bg-parchment border-stone-line [background-image:repeating-linear-gradient(135deg,--alpha(var(--color-ink)/5%)_0_8px,transparent_8px_16px)]",
    lg: "bg-parchment border-stone-line [background-image:repeating-linear-gradient(135deg,--alpha(var(--color-ink)/5%)_0_9px,transparent_9px_18px)]",
  },
  dark: {
    sm: "bg-forest border-forest-line [background-image:repeating-linear-gradient(135deg,--alpha(var(--color-cream-text)/6%)_0_8px,transparent_8px_16px)]",
    lg: "bg-forest border-forest-line [background-image:repeating-linear-gradient(135deg,--alpha(var(--color-cream-text)/5%)_0_10px,transparent_10px_20px)]",
  },
};

export default function PlaceholderTexture({ as: Tag = "span", tone = "light", size = "lg", className = "", children }) {
  return <Tag className={`border ${TEXTURES[tone][size]} ${className}`}>{children}</Tag>;
}
