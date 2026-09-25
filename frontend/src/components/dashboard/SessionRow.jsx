import MonoLabel from "../MonoLabel";
import PlaceholderTexture from "../PlaceholderTexture";
function SessionRow({ session }) {
  return (
    <a href="#" className="flex items-center gap-[18px] py-4 border-t border-forest-line hover:bg-cream-text/5 transition-colors">
      <PlaceholderTexture tone="dark" size="sm" className="shrink-0 w-[76px] h-[50px]" />
      <span className="flex-1 min-w-0 flex flex-col gap-1">
        <span className="text-lg text-cream-text leading-snug">{session.title}</span>
        <MonoLabel className="tracking-normal text-sage-dim">
          {session.ustadz} &middot; {session.length}
        </MonoLabel>
      </span>
    </a>
  );
}

export default SessionRow;
