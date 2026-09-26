import { Link } from "react-router-dom";
import MonoLabel from "../MonoLabel";
import VerifiedBadge from "../VerifiedBadge";
import { formatCount } from "../../lib/format";
import { wibFullDate } from "../../lib/wib";
import KajianThumb from "./KajianThumb";

// One recording in the archive, after the canvas: a row with the thumbnail on the left
// (stacked on phones), or a card with it on top (`card`, the two-column view).
export default function KajianRow({ kajian, card = false }) {
  return (
    <Link
      to={`/live/${kajian.id}`}
      className={`flex gap-[clamp(14px,2.5vw,24px)] py-[clamp(18px,3vw,26px)] border-b border-stone-line border-l-2 border-l-transparent hover:bg-cream-hover hover:border-l-gold-deep transition-colors ${
        card ? "flex-col px-[clamp(12px,2vw,16px)]" : "flex-col min-[640px]:flex-row items-start pl-[clamp(12px,3vw,18px)] pr-2"
      }`}
    >
      <KajianThumb kajian={kajian} className={card ? "w-full" : "w-full min-[640px]:w-[clamp(130px,20vw,208px)] shrink-0"} />
      <span className="flex-1 min-w-0 flex flex-col gap-2.5">
        <MonoLabel as="span" className="flex flex-wrap items-baseline gap-x-3.5 gap-y-1.5 tracking-[0.12em]">
          <span className="text-forest">{kajian.series}</span>
          <span className="text-ink-faint">{wibFullDate(kajian.startsAt)}</span>
          {kajian.hasNotes && (
            <span className="px-2 py-0.5 tracking-[0.1em] bg-sage-tint border border-sage-line text-forest">Catatan ngaji</span>
          )}
        </MonoLabel>
        <span
          className={`font-serif font-normal leading-[1.26] tracking-[-0.012em] text-ink max-w-[42ch] text-pretty ${
            card ? "text-[clamp(19px,2.1vw,22px)]" : "text-[clamp(20px,2.3vw,24px)]"
          }`}
        >
          {kajian.title}
        </span>
        <span className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-mono-label tracking-[0.08em] text-ink-muted">
          <span className="inline-flex items-center gap-1.5 text-forest">
            <VerifiedBadge size={15} />
            {kajian.ustadz?.name}
          </span>
          <span className="text-ink-faint">&middot; {formatCount(kajian.views)} disimak</span>
        </span>
      </span>
    </Link>
  );
}
