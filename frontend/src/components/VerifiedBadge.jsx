// The check mark shown beside a verified ustadz's name.
export default function VerifiedBadge({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-label="Ustadz terverifikasi" role="img" className={`shrink-0 ${className}`}>
      <path
        d="M12 1.6l2.47 1.79 3.03-.28 1.15 2.82 2.6 1.6-.6 2.99.98 2.9-2.35 1.94-.78 2.95-3.05.28L12 22.4l-2.45-1.81-3.05-.28-.78-2.95L3.37 15.4l.98-2.9-.6-2.99 2.6-1.6L7.5 5.09l3.03.28L12 1.6z"
        className="fill-forest"
      />
      <path
        d="M8.2 12.3l2.6 2.6 5-5.2"
        fill="none"
        className="stroke-cream"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
