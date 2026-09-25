import MonoLabel from "../MonoLabel";
import Button from "../Button";
// Static preview content — mirrors how the Articles section already ships placeholder
// content ahead of a real backend. Swap for real session data once Ngaji Bareng is wired up.
function LiveBanner() {
  return (
    <section className="bg-forest-darker border-b border-forest">
      <div className="max-w-container-max mx-auto px-page py-4 flex flex-wrap items-center gap-x-6 gap-y-3.5">
        <MonoLabel className="flex items-center gap-2 text-gold">
          <span className="w-1.5 h-1.5 rounded-full bg-gold animate-live-pulse" />
          Ngaji berlangsung
        </MonoLabel>
        <span className="flex-1 min-w-[280px] text-lg text-cream-text">
          Tafsir Surah Al-Kahfi, ayat 32&ndash;45{" "}
          <span className="text-[15px] text-sage-dim">bersama Ustadz Abdul Hakim &middot; 214 jamaah</span>
        </span>
        <Button
          variant="gold"
          as="a"
          href="#ngaji"
          className="shrink-0 px-[18px] py-2.5"
        >
          Gabung sekarang
        </Button>
      </div>
    </section>
  );
}

export default LiveBanner;
