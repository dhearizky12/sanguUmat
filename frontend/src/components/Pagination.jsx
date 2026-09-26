import MonoLabel from "./MonoLabel";

// Page numbers to show: all of them when there are few, otherwise the first, the last and
// the ones around the current page, with gaps marked "…".
function pageList(page, totalPages) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  const list = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  return list.flatMap((p, i) => (i > 0 && p - list[i - 1] > 1 ? ["gap-" + p, p] : [p]));
}

function PageButton({ active = false, disabled = false, onClick, children, label }) {
  return (
    <MonoLabel
      as="button"
      type="button"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={`tracking-[0.13em] px-3.5 py-2.5 border transition-colors ${
        active
          ? "bg-forest border-forest text-cream-text"
          : disabled
            ? "border-stone-border text-ink-disabled"
            : "border-stone-border text-ink hover:bg-cream-hover cursor-pointer"
      }`}
    >
      {children}
    </MonoLabel>
  );
}

// "Halaman X dari Y" with Sebelumnya, the page numbers and Berikutnya, after the canvas.
export default function Pagination({ page, totalPages, onChange }) {
  return (
    <nav aria-label="Halaman" className="flex flex-wrap items-center justify-between gap-4 pt-[30px]">
      <MonoLabel className="text-ink-faint">
        Halaman {page} dari {totalPages}
      </MonoLabel>
      <div className="flex flex-wrap items-stretch gap-2">
        <PageButton disabled={page === 1} onClick={() => onChange(page - 1)}>
          Sebelumnya
        </PageButton>
        {pageList(page, totalPages).map((p) =>
          typeof p === "string" ? (
            <span key={p} aria-hidden="true" className="self-center px-1 font-mono text-ink-faint">
              …
            </span>
          ) : (
            <PageButton key={p} active={p === page} onClick={() => onChange(p)} label={`Halaman ${p}`}>
              {p}
            </PageButton>
          ),
        )}
        <PageButton disabled={page === totalPages} onClick={() => onChange(page + 1)}>
          Berikutnya
        </PageButton>
      </div>
    </nav>
  );
}
