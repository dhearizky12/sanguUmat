import { Link } from "react-router-dom";
import MonoLabel from "../MonoLabel";

const TAG = "px-2 py-1 border border-stone-line tracking-[0.1em] text-forest";

// An ustadz's areas of expertise as small mono tags. With `ustadzId`, each tag links to
// Tanya Jawab filtered to that category and that ustadz.
export default function ExpertiseTags({ expertise, ustadzId }) {
  if (!expertise?.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {expertise.map((e) =>
        ustadzId ? (
          <MonoLabel
            as={Link}
            key={e.key}
            size="xs"
            to={`/questions?category=${encodeURIComponent(e.key)}&ustadz=${ustadzId}`}
            className={`${TAG} hover:bg-cream-hover transition-colors`}
          >
            {e.name}
          </MonoLabel>
        ) : (
          <MonoLabel key={e.key} size="xs" className={TAG}>
            {e.name}
          </MonoLabel>
        ),
      )}
    </div>
  );
}
