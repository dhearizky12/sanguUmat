// Static preview content — mirrors how the Articles section already ships placeholder
// content ahead of a real backend. Swap for real session data once Ngaji Bareng is wired up.
function LiveBanner() {
  return (
    <section className="bg-forest-darker border-b border-forest">
      <div className="max-w-container-max mx-auto px-gutter py-4 flex flex-wrap items-center gap-x-6 gap-y-3.5">
        <span className="flex items-center gap-2 label-mono text-gold">
          <span className="w-1.5 h-1.5 rounded-full bg-gold animate-sg-pulse" />
          Ngaji berlangsung
        </span>
        <span className="flex-1 min-w-[280px] text-lg text-cream-text">
          Tafsir Surah Al-Kahfi, ayat 32&ndash;45{" "}
          <span className="text-[15px] text-sage-dim">bersama Ustadz Abdul Hakim &middot; 214 jamaah</span>
        </span>
        <a
          href="#ngaji"
          className="shrink-0 label-mono bg-gold text-forest-darker px-[18px] py-2.5 hover:bg-cream-text transition-colors"
        >
          Gabung sekarang
        </a>
      </div>
    </section>
  );
}

export default LiveBanner;
