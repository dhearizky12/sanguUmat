import { Link } from "react-router-dom";
import { LiveMark } from "./KajianThumb";

// The dark band at the top of Ngaji Bareng while a kajian is live, after the canvas. The
// viewer count is left out: YouTube gives none without an API key.
export default function LiveBand({ kajian, previousWithNotes, now }) {
  const minutes = Math.max(1, Math.floor((now - new Date(kajian.startsAt).getTime()) / 60000));
  return (
    <section className="girih-pattern-gold-soft">
      <div className="max-w-container-max mx-auto px-page py-[clamp(32px,5vw,60px)] grid grid-cols-[repeat(auto-fit,minmax(min(340px,100%),1fr))] gap-[clamp(26px,4vw,46px)] items-center">
        <Link to={`/live/${kajian.id}`} className="relative block aspect-video overflow-hidden bg-forest border border-forest-line group">
          <img src={kajian.thumbnail} alt="" className="absolute inset-0 size-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
          <LiveMark className="absolute top-3.5 left-3.5" />
        </Link>
        <div className="flex flex-col gap-3 min-w-0">
          <span className="flex items-center gap-2.5 font-mono text-mono-label tracking-[0.14em] uppercase text-gold">
            <span aria-hidden="true" className="size-[7px] rounded-full bg-gold animate-live-pulse" />
            Sedang berlangsung
          </span>
          <h2 className="font-serif text-[clamp(25px,3vw,33px)] font-normal leading-[1.22] tracking-[-0.015em] text-cream-text max-w-[26ch] text-pretty">
            {kajian.title}
          </h2>
          <p className="text-base leading-relaxed text-sage max-w-[50ch] text-pretty">
            {kajian.ustadz?.name}
            {kajian.description ? ` · ${kajian.description}` : ""}
          </p>
          <div className="flex flex-wrap items-center gap-x-[22px] gap-y-3 font-mono text-mono-label tracking-[0.1em] text-sage-dim">
            <span>Seri {kajian.series}</span>
            <span>Berjalan {minutes} menit</span>
            <span>Sesi ke-{kajian.sessionNumber}</span>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to={`/live/${kajian.id}`}
              className="font-mono text-mono-label tracking-[0.16em] uppercase bg-gold text-forest-darker px-6 py-3.5 hover:bg-cream-text transition-colors"
            >
              Gabung kajian
            </Link>
            {previousWithNotes && (
              <Link
                to={`/live/${previousWithNotes.id}`}
                className="font-mono text-mono-label tracking-[0.16em] uppercase text-parchment border border-forest-line px-5 py-3.5 hover:bg-cream-text/5 hover:text-gold transition-colors"
              >
                Catatan sesi lalu
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
