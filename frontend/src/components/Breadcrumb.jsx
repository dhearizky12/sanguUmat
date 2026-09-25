import { Fragment } from "react";
import { Link } from "react-router-dom";
import MonoLabel from "./MonoLabel";

// The "Beranda / …" trail at the top of every inner page. Each item is
// { label, to }; the last item is the current page and is not a link.
export default function Breadcrumb({ items, className = "" }) {
  const trail = [{ label: "Beranda", to: "/" }, ...items];
  return (
    <MonoLabel
      as="nav"
      size="sm"
      aria-label="Jejak halaman"
      className={`flex items-center flex-wrap gap-2.5 tracking-[0.16em] text-ink-faint ${className}`}
    >
      {trail.map((item, i) => {
        const last = i === trail.length - 1;
        return (
          <Fragment key={item.label}>
            {i > 0 && <span aria-hidden="true">/</span>}
            {last ? (
              <span aria-current="page" className="text-ink">
                {item.label}
              </span>
            ) : (
              <Link to={item.to} className="hover:text-ink transition-colors">
                {item.label}
              </Link>
            )}
          </Fragment>
        );
      })}
    </MonoLabel>
  );
}
