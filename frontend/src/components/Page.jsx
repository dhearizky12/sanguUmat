// The page skeleton every inner canvas shares: a warm header band (breadcrumb, title,
// lead paragraph and whatever else the page puts there) and the content container below.

export function PageHeader({ children }) {
  return (
    <section className="bg-cream-warm border-b border-stone-line">
      <div className="max-w-container-max mx-auto px-page pt-[clamp(26px,4vw,44px)] pb-[clamp(24px,4vw,38px)] flex flex-col gap-5">
        {children}
      </div>
    </section>
  );
}

export function PageTitle({ children }) {
  return <h1 className="text-[clamp(34px,5vw,52px)] leading-[1.06] font-normal tracking-[-0.02em]">{children}</h1>;
}

export function PageLead({ children }) {
  return <p className="max-w-[52ch] text-base leading-relaxed text-ink-soft">{children}</p>;
}

// `bottom={false}` drops the bottom padding when another block follows directly.
export function PageBody({ as: Tag = "section", bottom = true, className = "", children }) {
  return (
    <Tag
      className={`max-w-container-max mx-auto px-page pt-[clamp(28px,4vw,48px)] ${bottom ? "pb-[clamp(48px,7vw,84px)]" : ""} ${className}`}
    >
      {children}
    </Tag>
  );
}
