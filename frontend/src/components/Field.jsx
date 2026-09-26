import MonoLabel from "./MonoLabel";

// Form controls in the design's style: a paper field with a stone border that turns
// forest on focus, under an uppercase mono label. `invalid` swaps the border to the
// error red. Text size is a prop, never a className, so two font sizes never compete.
const CONTROL =
  "w-full bg-paper border text-ink placeholder:text-ink-faint outline-none transition-colors disabled:bg-cream-warm disabled:text-ink-faint disabled:cursor-not-allowed";

const border = (invalid) => (invalid ? "border-live" : "border-stone-border focus:border-forest");

// md is the default form field; lg is the canvases' tall 17px field (title, search).
const TEXT = { md: "text-base", lg: "text-[17px]" };

export function FieldLabel({ className = "", ...props }) {
  return <MonoLabel as="label" size="sm" className={`tracking-[0.14em] text-ink ${className}`} {...props} />;
}

export function Input({ invalid = false, size = "md", className = "", ...props }) {
  const box = size === "lg" ? "h-14 px-4" : "px-4 py-3";
  return <input aria-invalid={invalid || undefined} className={`${CONTROL} ${border(invalid)} ${TEXT[size]} ${box} ${className}`} {...props} />;
}

export function TextArea({ invalid = false, size = "md", className = "", ...props }) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      className={`${CONTROL} ${border(invalid)} ${TEXT[size]} px-4 py-3 resize-y leading-relaxed ${className}`}
      {...props}
    />
  );
}

// `compact` is the short select that sits inside a list row.
export function Select({ invalid = false, compact = false, className = "", ...props }) {
  return (
    <select
      aria-invalid={invalid || undefined}
      className={`${CONTROL} ${border(invalid)} ${compact ? "h-10 px-3 text-[15px]" : "h-14 px-4 text-base"} cursor-pointer ${className}`}
      {...props}
    />
  );
}

// The error line under a form: red rule, rust tint, mono text.
export function FormError({ children }) {
  return (
    <div role="alert" className="border-l-2 border-live bg-rust-tint px-3.5 py-2.5 font-mono text-mono-label leading-[1.7] tracking-[0.05em] text-rust">
      {children}
    </div>
  );
}

// The small sentence-case mono line under a field: a hint, or (`error`) what is wrong.
// Not a MonoLabel, which is always uppercase — hints can carry ids and addresses.
export function FieldHint({ error = false, className = "", children }) {
  return (
    <span className={`font-mono text-mono-label-xs leading-[1.6] tracking-[0.04em] ${error ? "text-rust" : "text-ink-hint"} ${className}`}>
      {children}
    </span>
  );
}
