import { Link } from "react-router-dom";
import KajianThumb from "../kajian/KajianThumb";
import { absoluteAppUrl } from "../../lib/basePath";
import { calendarLink, wibDate, wibDay, wibTime } from "../../lib/wib";

function length(minutes) {
  if (minutes < 60) return `${minutes} menit`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} jam` : `${h} jam ${m} menit`;
}

// Ngaji Bareng on the home page's dark band: the live kajian (or else the next one this
// week) beside the four newest recordings. Shown only when there is something in it.
export default function NgajiSection({ now, recordings }) {
  const live = now?.live;
  const featured = live ?? now?.schedule?.[0] ?? null;
  const list = recordings ?? [];
  if (!featured && list.length === 0) return null;

  return (
    <section id="ngaji" className="girih-pattern-gold-soft">
      <div className="max-w-container-max mx-auto px-page py-[clamp(40px,6vw,80px)]">
        <div className="flex flex-wrap items-baseline justify-between gap-5 pb-3 mb-9 border-b border-forest-line">
          <h2 className="font-serif text-[clamp(24px,3vw,32px)] font-normal tracking-[-0.015em] text-cream-text">Ngaji Bareng</h2>
          <span className="font-mono text-mono-label tracking-[0.12em] uppercase text-sage-dim">Kajian langsung &amp; rekaman</span>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] gap-[clamp(28px,4vw,44px)] items-start">
          {featured && (
            <div className="flex flex-col gap-[18px]">
              <Link to={`/live/${featured.id}`} className="block">
                <KajianThumb kajian={featured} showDuration={!live} className="w-full border-forest-line" />
              </Link>
              <div className="flex flex-col gap-2.5">
                <span className="font-mono text-mono-label tracking-[0.14em] uppercase text-gold-muted">
                  {live
                    ? "Sedang berlangsung"
                    : `Berikutnya · ${wibDay(featured.startsAt)}, ${wibDate(featured.startsAt)} · ${wibTime(featured.startsAt)} WIB`}
                </span>
                <h3 className="font-serif text-[27px] font-normal leading-[1.25] text-cream-text text-pretty">{featured.title}</h3>
                <p className="text-base leading-relaxed text-sage max-w-[48ch] text-pretty">
                  {featured.ustadz?.name}
                  {featured.description ? ` · ${featured.description}` : ""}
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  {live ? (
                    <Link
                      to={`/live/${featured.id}`}
                      className="font-mono text-mono-label tracking-[0.16em] uppercase bg-gold text-forest-darker px-[22px] py-[13px] hover:bg-cream-text transition-colors"
                    >
                      Gabung kajian
                    </Link>
                  ) : (
                    <>
                      <a
                        href={calendarLink(featured, absoluteAppUrl(`/live/${featured.id}`))}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-mono-label tracking-[0.16em] uppercase bg-gold text-forest-darker px-[22px] py-[13px] hover:bg-cream-text transition-colors"
                      >
                        Tambah ke kalender
                      </a>
                      <Link
                        to={`/live/${featured.id}`}
                        className="font-mono text-mono-label tracking-[0.16em] uppercase text-parchment border border-forest-line px-5 py-[13px] hover:text-gold transition-colors"
                      >
                        Lihat kajian
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {list.length > 0 && (
            <div className="flex flex-col">
              <span className="font-mono text-mono-label tracking-[0.14em] uppercase text-sage-dim pb-3.5">Rekaman terbaru</span>
              {list.map((k) => (
                <Link
                  key={k.id}
                  to={`/live/${k.id}`}
                  className="flex items-center gap-[18px] py-4 border-t border-forest-line hover:bg-cream-text/5 transition-colors"
                >
                  <span className="shrink-0 w-[76px] h-[50px] overflow-hidden border border-forest-line bg-forest">
                    <img src={k.thumbnail} alt="" loading="lazy" className="size-full object-cover" />
                  </span>
                  <span className="flex-1 min-w-0 flex flex-col gap-[5px]">
                    <span className="text-lg leading-[1.3] text-cream-text text-pretty">{k.title}</span>
                    <span className="font-mono text-mono-label tracking-[0.08em] text-sage-dim">
                      {k.ustadz?.name} &middot; {length(k.durationMinutes)}
                    </span>
                  </span>
                </Link>
              ))}
              <Link
                to="/live"
                className="self-start mt-[22px] font-mono text-mono-label tracking-[0.16em] uppercase text-parchment border-b border-gold/50 hover:text-gold transition-colors"
              >
                Semua rekaman kajian
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
