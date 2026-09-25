// The sentence-case mono line that credits a person ("Dijawab oleh …", "Ditanyakan oleh …").
export default function Byline({ className = "", children }) {
  return (
    <div className={`flex items-center flex-wrap gap-x-2 gap-y-1 font-mono text-mono-label tracking-[0.08em] text-ink-muted ${className}`}>
      {children}
    </div>
  );
}
