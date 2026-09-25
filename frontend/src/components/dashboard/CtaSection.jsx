import { NavLink } from "react-router-dom";
import MonoLabel from "../MonoLabel";
import Button from "../Button";

function CtaSection() {
  return (
    <section className="bg-cream-warm border-t border-stone-line">
      <div className="max-w-container-max mx-auto px-page py-12 md:py-16 flex flex-wrap items-center justify-between gap-6">
        <div className="flex flex-col gap-2 max-w-[46ch]">
          <MonoLabel as="div" className="text-gold-dark">Tidak menemukan jawabannya?</MonoLabel>
          <h2 className="font-serif text-2xl md:text-[34px] font-normal tracking-tight text-ink">
            Ajukan pertanyaanmu, ustadz kami akan menjawab.
          </h2>
          <p className="text-base leading-relaxed text-ink-soft">Rata-rata dijawab dalam 2 hari kerja, lengkap dengan rujukan dalil.</p>
        </div>
        <Button
          as={NavLink}
          to="/question/create"
          className="shrink-0 px-7 py-4"
        >
          Ajukan Pertanyaan
        </Button>
      </div>
    </section>
  );
}

export default CtaSection;
