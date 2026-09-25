import { NavLink } from "react-router-dom";
import Byline from "./Byline";
import MonoLabel from "./MonoLabel";

// The canvases' question row: mono meta line, serif title, two-line excerpt
// and a byline. Callers map their own data onto these slots.
export default function QuestionRow({ to, meta, title, excerpt, byline }) {
  return (
    <NavLink
      to={to}
      className="flex flex-col gap-2.5 py-6 md:pl-4 border-b border-stone-line border-l-2 border-l-transparent hover:bg-cream-hover hover:border-l-gold-deep transition-colors"
    >
      <MonoLabel as="div" className="flex flex-wrap items-baseline gap-x-3.5 gap-y-1.5">
        {meta}
      </MonoLabel>

      <h3 className="font-serif text-xl md:text-2xl font-normal leading-snug tracking-tight text-ink max-w-[40ch] text-pretty">
        {title}
      </h3>

      {excerpt && <p className="text-base leading-relaxed text-ink-soft max-w-[74ch] text-pretty line-clamp-2">{excerpt}</p>}

      {byline && (
        <Byline>{byline}</Byline>
      )}
    </NavLink>
  );
}
