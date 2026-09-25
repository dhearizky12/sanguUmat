import MonoLabel from "./MonoLabel";

// Inline "loading…" placeholder for a list or section.
function LoadingState({ message = "Memuat…" }) {
  return (
    <MonoLabel as="div" role="status" className="py-16 text-center text-ink-muted">
      {message}
    </MonoLabel>
  );
}

export default LoadingState;
