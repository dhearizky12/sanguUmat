import { NavLink } from "react-router-dom";
import Avatar from "./Avatar";
import MonoLabel from "./MonoLabel";
import { ClockIcon, CommentIcon, EyeIcon } from "./Icons";
import { formatCount } from "../lib/format";

// One side of the row's footer: avatar beside a small mono label over the name. The
// answerer mirrors it (`alignEnd`), label and name right-aligned with the avatar last.
function Person({ label, name, picture, verified = false, alignEnd = false }) {
  return (
    <span className={`flex items-center gap-2.5 min-w-0 ${alignEnd ? "ml-auto flex-row-reverse text-right" : ""}`}>
      <Avatar src={picture} name={name} size={32} verified={verified} />
      <span className="flex flex-col min-w-0">
        <MonoLabel size="xs" className="text-ink-faint">
          {label}
        </MonoLabel>
        <span className="text-[15px] leading-snug text-ink truncate">{name}</span>
      </span>
    </span>
  );
}

function Count({ icon, value, label }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {icon}
      {formatCount(value)}
      <span className="sr-only">{label}</span>
    </span>
  );
}

// The canvases' question row. Top: category on the left; date, views and comments on the
// right. Then the serif title and a two-line excerpt. Bottom, pinned so rows sharing a grid
// line stay level: who asked (`asker` { name, picture }) on the left and who answered
// (`answerer` { name, picture, isGuru }) on the right. A post (`postedBy` { name, picture,
// isGuru }) has neither: one "Diposting oleh" credit instead. `comments` and `readMinutes` are
// optional. `asker.anonymous` marks an anonymous asker shown by name (to staff); `flags` is
// an optional node beside the category (the answer queue's QuestionFlags). `action` is a
// node set level with the asker at the card's bottom right, where the answerer would be —
// beside the link rather than in it, since a link cannot hold a button.
export default function QuestionRow({ to, category, date, views, comments, readMinutes, title, excerpt, asker, answerer, postedBy, flags, action }) {
  const link = (
    <NavLink
      to={to}
      className={`flex flex-col gap-2.5 md:px-4 ${
        action ? "flex-1 py-6" : "py-6 border-b border-stone-line border-l-2 border-l-transparent hover:bg-cream-hover hover:border-l-gold-deep transition-colors"
      }`}
    >
      <MonoLabel as="div" className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <span className="text-forest">{category}</span>
          {flags}
        </span>
        <span className="ml-auto flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-ink-faint">
          <span>{date}</span>
          {views != null && <Count icon={<EyeIcon />} value={views} label="dibaca" />}
          {comments != null && <Count icon={<CommentIcon />} value={comments} label="komentar" />}
          {readMinutes != null && (
            <span className="inline-flex items-center gap-1.5">
              <ClockIcon />
              {readMinutes} mnt
              <span className="sr-only">baca</span>
            </span>
          )}
        </span>
      </MonoLabel>

      <h3 className="font-serif text-xl md:text-2xl font-normal leading-snug tracking-tight text-ink max-w-[40ch] text-pretty">
        {title}
      </h3>

      {excerpt && <p className="text-base leading-relaxed text-ink-soft max-w-[74ch] text-pretty line-clamp-2">{excerpt}</p>}

      {postedBy && (
        <div className={`mt-auto pt-1 ${action ? "pr-28" : ""}`}>
          <Person label="Diposting oleh" name={postedBy.name} picture={postedBy.picture} verified={postedBy.isGuru} />
        </div>
      )}

      {(asker || answerer) && (
        <div className={`mt-auto flex flex-wrap items-end justify-between gap-x-4 gap-y-3 pt-1 ${action ? "pr-28" : ""}`}>
          {asker && <Person label={asker.anonymous ? "Ditanyakan · anonim" : "Ditanyakan"} name={asker.name} picture={asker.picture} />}
          {answerer && (
            <Person label="Dijawab" name={answerer.name} picture={answerer.picture} verified={answerer.isGuru} alignEnd />
          )}
        </div>
      )}
    </NavLink>
  );

  if (!action) return link;
  return (
    <div className="relative flex flex-col border-b border-stone-line border-l-2 border-l-transparent hover:bg-cream-hover hover:border-l-gold-deep transition-colors">
      {link}
      <div className="absolute right-0 md:right-4 bottom-[22px]">{action}</div>
    </div>
  );
}
