import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Topics cycled through the search placeholder via a typewriter effect, so the copy itself
// demonstrates the site covers more than just Fiqh.
const SEARCH_TOPICS = ["fiqih", "waris", "shalat", "Al-Qur'an", "hadis", "zakat", "pernikahan", "muamalah", "akhlak", "isu sosial"];

const SUGGESTIONS = ["menjamak sholat", "zakat penghasilan", "saham syariah", "wudhu"];

function useTypewriterPlaceholder(paused) {
  const [topicIndex, setTopicIndex] = useState(0);
  const [typedLength, setTypedLength] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    // Paused once the user is actually typing a search — the placeholder is invisible
    // anyway once the input has a value, no point animating in the background.
    if (paused) return;

    const topic = SEARCH_TOPICS[topicIndex];
    const atFullWord = !deleting && typedLength === topic.length;
    const atEmptyWord = deleting && typedLength === 0;
    const delay = atFullWord ? 1400 : deleting ? 40 : 70;

    const timeout = setTimeout(() => {
      if (atFullWord) {
        setDeleting(true);
      } else if (atEmptyWord) {
        setDeleting(false);
        setTopicIndex((i) => (i + 1) % SEARCH_TOPICS.length);
      } else {
        setTypedLength((len) => len + (deleting ? -1 : 1));
      }
    }, delay);

    return () => clearTimeout(timeout);
  }, [paused, topicIndex, typedLength, deleting]);

  return `Cari pertanyaan, misalnya: ${SEARCH_TOPICS[topicIndex].slice(0, typedLength)}`;
}

function HeroSearch({ answeredCount }) {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const placeholder = useTypewriterPlaceholder(search.trim() !== "");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = search.trim();
    navigate(trimmed ? `/questions?search=${encodeURIComponent(trimmed)}` : "/questions");
  };

  return (
    <section className="relative girih-pattern-gold border-b border-forest-darker">
      <div className="max-w-container-max mx-auto px-gutter py-16 md:py-24 flex flex-col items-center text-center gap-6">
        <div className="label-mono tracking-[0.2em] text-gold-muted">Tanya Jawab Islam &middot; Terverifikasi Ustadz</div>

        <h1 className="font-serif font-normal text-cream-text max-w-[16ch] text-[clamp(38px,6.4vw,68px)] leading-[1.04] tracking-tight text-balance">
          Temukan kejelasan dalam <em className="italic text-gold">setiap pertanyaan</em> tentang Islam.
        </h1>

        <p className="max-w-2xl text-[17px] leading-relaxed text-sage">
          Mulai dengan mencari. Ribuan pertanyaan seputar Al-Qur'an, hadis, fiqih, dan muamalah sudah dijawab dan ditelaah oleh para ustadz.
        </p>

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-2xl mt-2 flex flex-wrap items-stretch bg-cream border border-gold-deep shadow-[0_18px_44px_-24px_rgba(0,0,0,0.6)]"
        >
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={placeholder}
            className="flex-1 min-w-[200px] border-0 outline-none bg-transparent px-4 md:px-5 h-[54px] md:h-[62px] text-base md:text-lg text-ink"
          />
          <button
            type="submit"
            className="shrink-0 label-mono bg-forest text-cream-text px-5 md:px-6 hover:bg-ink transition-colors"
          >
            Cari
          </button>
        </form>

        <div className="flex flex-wrap justify-center items-center gap-x-5 gap-y-2">
          <span className="label-mono text-sage-dim">Sering dicari</span>
          {SUGGESTIONS.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => setSearch(label)}
              className="text-[15px] text-cream-link border-b border-gold/40 hover:text-gold hover:border-gold transition-colors"
            >
              {label}
            </button>
          ))}
        </div>

        {answeredCount > 0 && (
          <div className="mt-2 label-mono text-sage-dark">{answeredCount} jawaban terverifikasi &nbsp;/&nbsp; diperbarui hari ini</div>
        )}
      </div>
    </section>
  );
}

export default HeroSearch;
