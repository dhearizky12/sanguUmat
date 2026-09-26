import { useState } from "react";
import MonoLabel from "./MonoLabel";

const SCROLL_AT = 9;
const nf = new Intl.NumberFormat("id-ID");

// One facet of the Tanya Jawab panel: type-to-search and every value, most-used first,
// in a list that scrolls once it grows past nine rows. `items` is [{ value, label, count }].
export default function FacetPanel({ title, items, selected, onToggle, onClear, searchLabel }) {
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const matched = items
    .filter((it) => !q || it.label.toLowerCase().includes(q))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "id"));
  const scrolls = matched.length > SCROLL_AT;
  const meta = `${nf.format(matched.length)} pilihan`;

  return (
    <section className="flex flex-col">
      <div className="flex items-baseline justify-between gap-3 pb-2.5 border-b border-ink">
        <MonoLabel as="h2" className="tracking-[0.14em] text-ink">
          {title}
        </MonoLabel>
        <MonoLabel
          as="button"
          type="button"
          size="sm"
          onClick={onClear}
          disabled={selected.length === 0}
          className={`tracking-[0.13em] border-b transition-colors ${
            selected.length > 0 ? "text-gold-dark border-stone-border cursor-pointer" : "text-ink-disabled border-transparent"
          }`}
        >
          Semua
        </MonoLabel>
      </div>

      <div className="flex items-stretch border border-stone-line bg-paper mt-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={searchLabel}
          aria-label={searchLabel}
          className="flex-1 min-w-0 bg-transparent outline-none px-3 h-10 text-[15px] text-ink placeholder:text-ink-faint"
        />
        {q && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label={`Hapus ${searchLabel.toLowerCase()}`}
            className="px-2.5 text-sm text-ink-faint hover:text-ink cursor-pointer"
          >
            &#x2715;
          </button>
        )}
      </div>

      <div
        className={`flex flex-col pt-1 ${
          scrolls
            ? "max-h-[323px] overflow-y-auto border-b border-stone-line-soft [mask-image:linear-gradient(to_bottom,black_calc(100%-26px),transparent)]"
            : ""
        }`}
      >
        {matched.map((it) => {
          const active = selected.includes(it.value);
          return (
            <button
              key={it.value}
              type="button"
              role="checkbox"
              aria-checked={active}
              onClick={() => onToggle(it.value)}
              className={`flex items-center gap-2.5 py-2.5 pr-2 pl-1.5 border-b border-stone-line-soft text-left cursor-pointer transition-colors hover:bg-cream-hover ${
                active ? "text-gold-dark bg-cream-hover" : "text-ink"
              }`}
            >
              <span
                aria-hidden="true"
                className={`shrink-0 size-3.5 flex items-center justify-center border text-[10px] leading-none text-cream-text ${
                  active ? "border-forest bg-forest" : "border-stone-border"
                }`}
              >
                {active ? "✓" : ""}
              </span>
              <span className="flex-1 min-w-0 text-base">{it.label}</span>
              <span className="shrink-0 font-mono text-mono-label text-ink-faint">{nf.format(it.count)}</span>
            </button>
          );
        })}
      </div>

      {matched.length === 0 && <p className="py-3.5 px-1.5 text-[15px] text-ink-faint">Tidak ditemukan.</p>}

      <span className="pt-3 font-mono text-mono-label-xs tracking-[0.1em] text-ink-hint">{meta}</span>
    </section>
  );
}
