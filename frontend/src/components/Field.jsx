import MonoLabel from "./MonoLabel";

// Form controls in the design's style: a paper field with a stone border that turns
// forest on focus, under an uppercase mono label. `invalid` swaps the border to the
// error red.
const CONTROL =
  "w-full bg-paper border px-4 text-base text-ink placeholder:text-ink-faint outline-none transition-colors";

const border = (invalid) => (invalid ? "border-live" : "border-stone-border focus:border-forest");

export function FieldLabel({ className = "", ...props }) {
  return <MonoLabel as="label" size="sm" className={`tracking-[0.14em] text-ink ${className}`} {...props} />;
}

export function Input({ invalid = false, className = "", ...props }) {
  return <input aria-invalid={invalid || undefined} className={`${CONTROL} ${border(invalid)} py-3 ${className}`} {...props} />;
}

export function TextArea({ invalid = false, className = "", ...props }) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      className={`${CONTROL} ${border(invalid)} py-3 resize-y leading-relaxed ${className}`}
      {...props}
    />
  );
}

export function Select({ invalid = false, className = "", ...props }) {
  return <select aria-invalid={invalid || undefined} className={`${CONTROL} ${border(invalid)} h-14 cursor-pointer ${className}`} {...props} />;
}
