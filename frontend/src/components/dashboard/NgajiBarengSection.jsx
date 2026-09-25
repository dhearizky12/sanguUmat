import { NavLink } from "react-router-dom";
import SessionRow from "./SessionRow";
import MonoLabel from "../MonoLabel";
import SectionHeading from "../SectionHeading";
import AutoGrid from "../AutoGrid";
import PlaceholderTexture from "../PlaceholderTexture";

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
      <div className="max-w-container-max mx-auto px-page py-10 md:py-16">
        <SectionHeading tone="dark" title="Ngaji Bareng" meta="Kajian langsung & rekaman" className="mb-9" />

        <AutoGrid min={320} className="gap-8 md:gap-11 items-start">
          <div className="flex flex-col gap-[18px]">
            <PlaceholderTexture as="div" tone="dark" className="relative aspect-video w-full flex items-center justify-center">
              <MonoLabel className="text-sage-dim">video kajian langsung</MonoLabel>
              <MonoLabel className="absolute top-3.5 left-3.5 flex items-center gap-2 bg-live text-cream-text px-2.5 py-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cream-text animate-live-pulse" />
                Live
              </MonoLabel>
            </PlaceholderTexture>
            <div className="flex flex-col gap-2.5">
              <MonoLabel as="div" className="text-gold-muted">Sedang berlangsung &middot; 214 jamaah</MonoLabel>
              <h3 className="font-serif text-[27px] font-normal leading-tight text-cream-text">
                Tafsir Surah Al-Kahfi, ayat 32&ndash;45
              </h3>
              <p className="text-base leading-relaxed text-sage max-w-[48ch]">
                Ustadz Abdul Hakim membahas kisah dua pemilik kebun dan pelajaran tentang kesombongan harta. Pertanyaan dibuka di akhir
                sesi.
              </p>
              <MonoLabel
                as="a"
                href="#"
                className="self-start mt-2 bg-gold text-forest-darker px-[22px] py-3 hover:bg-cream-text transition-colors"
              >
                Gabung kajian
              </MonoLabel>
            </div>
          </div>

          <div className="flex flex-col">
            <MonoLabel as="div" className="text-sage-dim pb-3.5">Rekaman terbaru</MonoLabel>
            {SESSIONS.map((session) => (
              <SessionRow key={session.title} session={session} />
            ))}
            <MonoLabel
              as={NavLink}
              to="/live"
              className="mt-[22px] self-start text-cream-link border-b border-gold/50 hover:text-gold transition-colors"
            >
              Semua rekaman kajian
            </MonoLabel>
          </div>
        </AutoGrid>
      </div>
    </section>
  );
}

export default NgajiBarengSection;
