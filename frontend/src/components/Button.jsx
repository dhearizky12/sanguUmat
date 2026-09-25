import MonoLabel from "./MonoLabel";

// The design's mono-label buttons. Padding is left to the caller because the
// canvases size each button to its context. `as` renders a Link, <a> or
// <button> (the default); a <button> defaults to type="button".
const VARIANTS = {
  solid: "bg-forest text-cream-text hover:bg-ink",
  outline: "border border-stone-border text-forest hover:bg-cream-hover",
  gold: "bg-gold text-forest-darker hover:bg-cream-text",
  // Underlined text actions (Ubah, Hapus) that sit inline with content.
  link: "text-forest border-b border-stone-border hover:text-gold-dark",
  danger: "text-rust border-b border-rust-line hover:text-rust-deep",
};

export default function Button({ as = "button", variant = "solid", className = "", ...props }) {
  const typeProps = as === "button" ? { type: "button" } : {};
  return (
    <MonoLabel
      as={as}
      {...typeProps}
      className={`cursor-pointer transition-colors disabled:opacity-60 disabled:cursor-default ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}
