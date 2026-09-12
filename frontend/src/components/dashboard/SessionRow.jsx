function SessionRow({ session }) {
  return (
    <a href="#" className="flex items-center gap-[18px] py-4 border-t border-forest-line hover:bg-cream-text/5 transition-colors">
      <span className="shrink-0 w-[76px] h-[50px] bg-forest border border-forest-line [background-image:repeating-linear-gradient(135deg,rgba(247,243,232,.06)_0_8px,transparent_8px_16px)]" />
      <span className="flex-1 min-w-0 flex flex-col gap-1">
        <span className="text-lg text-cream-text leading-snug">{session.title}</span>
        <span className="label-mono tracking-normal text-sage-dim">
          {session.ustadz} &middot; {session.length}
        </span>
      </span>
    </a>
  );
}

export default SessionRow;
