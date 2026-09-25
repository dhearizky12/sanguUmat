import { Link } from "react-router-dom";
import Button from "./Button";

// The canvases' dashed-border empty state. `action` is optional:
// { label, to } renders a link, { label, onClick } a button.
function EmptyState({ title, message, action, className = "" }) {
  return (
    <div
      className={`border border-dashed border-stone-dotted py-14 px-7 text-center flex flex-col items-center gap-2.5 ${className}`}
    >
      <div className="font-serif text-xl md:text-[22px] text-ink">{title}</div>
      {message && <p className="max-w-[46ch] text-base leading-relaxed text-ink-muted">{message}</p>}
      {action && (
        <Button
          as={action.to ? Link : "button"}
          to={action.to}
          onClick={action.onClick}
          variant={action.variant ?? "solid"}
          className="mt-2 px-5 py-3"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
