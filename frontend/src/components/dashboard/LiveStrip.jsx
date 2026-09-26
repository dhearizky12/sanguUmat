import { Link } from "react-router-dom";

// The strip under the hero while a kajian is live, after the home canvas.
export default function LiveStrip({ kajian }) {
  return (
    <section className="bg-forest-darker border-b border-forest">
      <div className="max-w-container-max mx-auto px-page py-4 flex flex-wrap items-center gap-x-[22px] gap-y-3.5">
        <span className="flex items-center gap-2.5 font-mono text-mono-label tracking-[0.16em] uppercase text-gold">
          <span aria-hidden="true" className="size-[7px] rounded-full bg-gold animate-live-pulse" />
          Ngaji berlangsung
        </span>
        <span className="flex-[1_1_320px] min-w-0 text-lg text-cream-text">
          {kajian.title}
          <span className="text-[15px] text-sage-dim"> &nbsp;bersama {kajian.ustadz?.name}</span>
        </span>
        <Link
          to={`/live/${kajian.id}`}
          className="shrink-0 font-mono text-mono-label tracking-[0.16em] uppercase bg-gold text-forest-darker px-[18px] py-2.5 hover:bg-cream-text transition-colors"
        >
          Gabung sekarang
        </Link>
      </div>
    </section>
  );
}
