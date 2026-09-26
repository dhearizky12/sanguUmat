import { Link } from "react-router-dom";
import MonoLabel from "../MonoLabel";

const TAG = "px-2 py-1 tracking-[0.1em] border";
const TONES = {
  gold: "bg-gold-tint border-gold-line text-gold-ink",
  plain: "border-stone-border text-ink-muted",
};

function Tag({ tone = "plain", children }) {
  return (
    <MonoLabel size="xs" className={`${TAG} ${TONES[tone]}`}>
      {children}
    </MonoLabel>
  );
}

// The asker's choices on a question, as small tags: who it is directed to, anonymous and
// private (answer not published). Only what applies is shown. `meId` turns a question
// directed to the viewer into "Ditujukan kepada Anda"; `linkUstadz` links the name (not
// inside another link).
export default function QuestionFlags({ question, meId, linkUstadz = false, className = "" }) {
  const directed = question.directedTo;
  const toMe = directed && meId != null && String(directed.id) === String(meId);
  const anonymous = question.isAnonymous;
  const isPrivate = question.allowPublish === false;
  if (!directed && !anonymous && !isPrivate) return null;

  return (
    <span className={`flex flex-wrap items-center gap-2 ${className}`}>
      {directed &&
        (toMe ? (
          <Tag tone="gold">Ditujukan kepada Anda</Tag>
        ) : linkUstadz ? (
          <MonoLabel as={Link} size="xs" to={`/ustadz/${directed.id}`} className={`${TAG} ${TONES.plain} hover:text-forest hover:border-forest transition-colors`}>
            Ditujukan kepada {directed.name}
          </MonoLabel>
        ) : (
          <Tag>Ditujukan kepada {directed.name}</Tag>
        ))}
      {anonymous && <Tag>Anonim</Tag>}
      {isPrivate && <Tag>Privat</Tag>}
    </span>
  );
}
