import MonoLabel from "../MonoLabel";
import SectionHeading from "../SectionHeading";
import AutoGrid from "../AutoGrid";
// "Daftar Isi Pembahasan" — lets a visitor jump straight to a category instead of scrolling
// through everything. Selecting the active topic again clears the filter.
function TopicIndex({ topics, activeKey, onSelect }) {
  return (
    <section className="max-w-container-max mx-auto px-page pt-10 md:pt-16">
      <SectionHeading title="Daftar Isi Pembahasan" meta="Pilih kategori untuk menyaring jawaban" />
      <AutoGrid min={280} className="gap-x-10 pt-2">
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
              <MonoLabel className="text-ink-faint w-[22px] shrink-0">{String(i + 1).padStart(2, "0")}</MonoLabel>
              <span className="text-[17px] shrink-0">{topic.label}</span>
              <span className="flex-1 border-b border-dotted border-stone-dotted -translate-y-1" />
              <MonoLabel className="text-ink-muted shrink-0">{topic.count}</MonoLabel>
            </button>
          );
        })}
      </AutoGrid>
    </section>
  );
}

export default TopicIndex;
