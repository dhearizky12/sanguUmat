import MonoLabel from "./MonoLabel";

const TONES = {
  light: { rule: "border-ink", title: "text-ink", meta: "text-ink-muted" },
  dark: { rule: "border-forest-line", title: "text-cream-text", meta: "text-sage-dim" },
};

// A section title with mono meta on the right and a rule beneath.
// `meta` may be a string or any node (e.g. a view toggle beside a count).
export default function SectionHeading({ title, meta, tone = "light", as: Tag = "h2", className = "" }) {
  const t = TONES[tone];
  return (
    <div className={`flex items-baseline justify-between gap-5 flex-wrap border-b pb-3 ${t.rule} ${className}`}>
      <Tag className={`font-serif text-2xl md:text-[32px] font-normal tracking-tight ${t.title}`}>{title}</Tag>
      {typeof meta === "string" ? <MonoLabel className={t.meta}>{meta}</MonoLabel> : meta}
    </div>
  );
}
