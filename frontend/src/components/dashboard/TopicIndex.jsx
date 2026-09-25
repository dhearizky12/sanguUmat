// "Daftar Isi Pembahasan" — lets a visitor jump straight to a category instead of scrolling
// through everything. Selecting the active topic again clears the filter.
function TopicIndex({ topics, activeKey, onSelect }) {
  return (
    <section className="max-w-container-max mx-auto px-gutter pt-10 md:pt-16">
      <div className="flex items-baseline justify-between gap-5 flex-wrap border-b border-ink pb-3">
        <h2 className="font-serif text-2xl md:text-[32px] font-normal tracking-tight text-ink">Daftar Isi Pembahasan</h2>
        <span className="label-mono text-ink-muted">Pilih kategori untuk menyaring jawaban</span>
      </div>
      <div className="grid gap-x-10 pt-2" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))" }}>
        {topics.map((topic, i) => {
          const active = activeKey === topic.key;
          return (
            <button
              key={topic.key}
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(active ? "semua" : topic.key)}
              className={`flex items-baseline gap-3 py-3.5 px-2.5 -mx-2.5 border-b border-stone-line-soft text-left transition-colors hover:bg-cream-hover ${
                active ? "bg-cream-hover text-gold-dark" : "text-ink"
              }`}
            >
              <span className="label-mono text-ink-faint w-[22px] shrink-0">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-[17px] shrink-0">{topic.label}</span>
              <span className="flex-1 border-b border-dotted border-stone-dotted -translate-y-1" />
              <span className="label-mono text-ink-muted shrink-0">{topic.count}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default TopicIndex;
