import { NavLink } from "react-router-dom";
import SessionRow from "./SessionRow";

// Static preview content — mirrors how the Articles section already ships placeholder
// content ahead of a real backend. Swap for real session data once Ngaji Bareng is wired up.
const SESSIONS = [
  { title: "Fiqih Muamalah Kontemporer #7", ustadz: "Ustadz Faiz Rahman", length: "58 menit" },
  { title: "Riyadhus Shalihin: Bab Sabar", ustadz: "Ustadz Abdul Hakim", length: "1 jam 12 menit" },
  { title: "Tanya Jawab Zakat Penghasilan", ustadz: "Ustadzah Nur Aisyah", length: "44 menit" },
  { title: "Sirah Nabawiyah: Piagam Madinah", ustadz: "Ustadz Zainal Muttaqin", length: "1 jam 3 menit" },
];

function NgajiBarengSection() {
  return (
    <section id="ngaji" className="girih-pattern-gold-soft">
      <div className="max-w-container-max mx-auto px-gutter py-10 md:py-16">
        <div className="flex items-baseline justify-between gap-5 flex-wrap border-b border-forest-line pb-3 mb-9">
          <h2 className="font-serif text-2xl md:text-[32px] font-normal tracking-tight text-cream-text">Ngaji Bareng</h2>
          <span className="label-mono text-sage-dim">Kajian langsung &amp; rekaman</span>
        </div>

        <div
          className="grid gap-8 md:gap-11 items-start"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(320px, 100%), 1fr))" }}
        >
          <div className="flex flex-col gap-[18px]">
            <div className="relative aspect-video w-full bg-forest border border-forest-line flex items-center justify-center [background-image:repeating-linear-gradient(135deg,rgba(247,243,232,.05)_0_10px,transparent_10px_20px)]">
              <span className="label-mono text-sage-dim">video kajian langsung</span>
              <span className="absolute top-3.5 left-3.5 flex items-center gap-2 bg-live text-cream-text label-mono px-2.5 py-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cream-text animate-sg-pulse" />
                Live
              </span>
            </div>
            <div className="flex flex-col gap-2.5">
              <div className="label-mono text-gold-muted">Sedang berlangsung &middot; 214 jamaah</div>
              <h3 className="font-serif text-[27px] font-normal leading-tight text-cream-text">
                Tafsir Surah Al-Kahfi, ayat 32&ndash;45
              </h3>
              <p className="text-base leading-relaxed text-sage max-w-[48ch]">
                Ustadz Abdul Hakim membahas kisah dua pemilik kebun dan pelajaran tentang kesombongan harta. Pertanyaan dibuka di akhir
                sesi.
              </p>
              <a
                href="#"
                className="self-start mt-2 label-mono bg-gold text-forest-darker px-[22px] py-3 hover:bg-cream-text transition-colors"
              >
                Gabung kajian
              </a>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="label-mono text-sage-dim pb-3.5">Rekaman terbaru</div>
            {SESSIONS.map((session) => (
              <SessionRow key={session.title} session={session} />
            ))}
            <NavLink
              to="/live"
              className="mt-[22px] self-start label-mono text-cream-link border-b border-gold/50 hover:text-gold transition-colors"
            >
              Semua rekaman kajian
            </NavLink>
          </div>
        </div>
      </div>
    </section>
  );
}

export default NgajiBarengSection;
