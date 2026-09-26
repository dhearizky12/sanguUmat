// The canvases' check box row: a bordered, full-width button with a small square mark and
// a sentence beside it. Behaves as a check box for assistive tech.
export default function CheckRow({ checked, onChange, children }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-start gap-3 px-4 py-3.5 border border-stone-line text-left text-ink cursor-pointer hover:bg-cream-hover transition-colors"
    >
      <span
        aria-hidden="true"
        className={`shrink-0 size-[18px] mt-0.5 flex items-center justify-center border text-[12px] leading-none text-cream-text ${
          checked ? "border-forest bg-forest" : "border-stone-border bg-paper"
        }`}
      >
        {checked ? "✓" : ""}
      </span>
      <span className="flex-1 text-base leading-normal">{children}</span>
    </button>
  );
}
