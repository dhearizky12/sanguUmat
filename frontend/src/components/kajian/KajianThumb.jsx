import { shortDuration } from "../../lib/wib";

// A kajian's YouTube thumbnail at 16:9 with its duration in the corner, and the red Live
// mark while it runs.
export function LiveMark({ className = "" }) {
  return (
    <span className={`inline-flex items-center gap-2 bg-live text-white font-mono text-[10px] tracking-[0.18em] uppercase px-2.5 py-1.5 ${className}`}>
      <span aria-hidden="true" className="size-1.5 rounded-full bg-white animate-live-pulse" />
      Live
    </span>
  );
}

export default function KajianThumb({ kajian, showDuration = true, className = "" }) {
  return (
    <span className={`relative block aspect-video overflow-hidden bg-parchment border border-stone-line ${className}`}>
      <img src={kajian.thumbnail} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
      {kajian.status === "live" && <LiveMark className="absolute top-2.5 left-2.5" />}
      {showDuration && (
        <span className="absolute bottom-2 right-2 bg-ink/85 text-cream-text font-mono text-[10.5px] tracking-[0.06em] px-1.5 py-0.5">
          {shortDuration(kajian.durationMinutes)}
        </span>
      )}
    </span>
  );
}
