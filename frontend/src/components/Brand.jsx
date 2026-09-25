import { Link } from "react-router-dom";
import LogoMark from "./LogoMark";

// The logo and wordmark. Links home unless `link` is false (e.g. a loader).
export default function Brand({ link = true }) {
  const content = (
    <>
      <LogoMark />
      <span className="font-serif text-xl font-medium tracking-tight text-forest">Sangu Umat</span>
    </>
  );
  const className = "flex items-center gap-2.5 shrink-0 min-w-0";
  return link ? (
    <Link to="/" className={className}>
      {content}
    </Link>
  ) : (
    <span className={className}>{content}</span>
  );
}
