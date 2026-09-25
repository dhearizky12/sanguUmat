import MonoLabel from "./MonoLabel";

// One toggle in a filter row: outlined, filled forest when selected.
export function FilterChip({ active, onClick, children }) {
  return (
    <MonoLabel
      as="button"
      type="button"
      role="radio"
      aria-checked={active}
      size="sm"
      onClick={onClick}
      className={`px-3 py-2 border cursor-pointer transition-colors ${
        active ? "bg-forest border-forest text-cream-text" : "border-stone-border text-ink-muted hover:bg-cream-hover hover:text-ink"
      }`}
    >
      {children}
    </MonoLabel>
  );
}

export function FilterRow({ label, children }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5">
      <MonoLabel size="sm" className="w-[72px] shrink-0 tracking-[0.13em] text-ink-faint">
        {label}
      </MonoLabel>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
        {children}
      </div>
    </div>
  );
}
