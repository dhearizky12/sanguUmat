import { Link } from "react-router-dom";
import LogoMark from "./LogoMark";

// The logo and wordmark, linking home. Used by every page header.
export default function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5 shrink-0 min-w-0">
      <LogoMark />
      <span className="font-serif text-xl font-medium tracking-tight text-forest">Sangu Umat</span>
    </Link>
  );
}
