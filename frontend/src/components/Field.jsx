import MonoLabel from "./MonoLabel";

// Form controls in the design's style: a paper field with a stone border that turns
// forest on focus, under an uppercase mono label.
const CONTROL =
  "w-full bg-paper border border-stone-border px-4 py-3 text-base text-ink placeholder:text-ink-faint outline-none focus:border-forest transition-colors";

export function FieldLabel({ className = "", ...props }) {
  return <MonoLabel as="label" size="sm" className={`tracking-[0.14em] text-ink ${className}`} {...props} />;
}

export function Input({ className = "", ...props }) {
  return <input className={`${CONTROL} ${className}`} {...props} />;
}

export function TextArea({ className = "", ...props }) {
  return <textarea className={`${CONTROL} resize-y leading-relaxed ${className}`} {...props} />;
}
