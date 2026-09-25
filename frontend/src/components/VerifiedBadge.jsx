// The mark beside a verified ustadz's name: a gold rosette — twelve even spikes around a
// true circle — with a cream check. `size` in px; 20 matches the avatar in a question row.
const ROSETTE =
  "M12.00 0.80 L14.48 2.73 L17.60 2.30 L18.79 5.21 L21.70 6.40 L21.27 9.52 L23.20 12.00 L21.27 14.48 L21.70 17.60 L18.79 18.79 L17.60 21.70 L14.48 21.27 L12.00 23.20 L9.52 21.27 L6.40 21.70 L5.21 18.79 L2.30 17.60 L2.73 14.48 L0.80 12.00 L2.73 9.52 L2.30 6.40 L5.21 5.21 L6.40 2.30 L9.52 2.73 Z";

export default function VerifiedBadge({ size = 15, className = "" }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-label="Ustadz terverifikasi" role="img" className={`shrink-0 ${className}`}>
      <path d={ROSETTE} className="fill-gold-deep stroke-gold-deep" strokeWidth="1.2" strokeLinejoin="round" />
      <path
        d="M7.6 12.3l3 3 5.8-6.1"
        fill="none"
        className="stroke-cream"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
