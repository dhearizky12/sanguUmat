import Brand from "./Brand";
import MonoLabel from "./MonoLabel";

// Full-screen loader shown while the session is being resolved.
function Loading() {
  return (
    <div role="status" className="min-h-screen bg-cream flex flex-col items-center justify-center gap-4 px-page text-center">
      <Brand link={false} />
      <MonoLabel className="flex items-center gap-2 text-ink-muted">
        <span className="size-1.5 rounded-full bg-gold-deep animate-live-pulse" />
        Mencari hikmah untuk perjalanan Anda&hellip;
      </MonoLabel>
    </div>
  );
}

export default Loading;
