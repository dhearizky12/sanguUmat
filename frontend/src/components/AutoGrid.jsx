// A responsive grid that fits as many columns of at least `min` px as the row
// allows, collapsing to one column on narrow screens. Class names must be
// literal for Tailwind to see them, so each minimum the canvases use is listed.
const COLUMNS = {
  200: "grid-cols-[repeat(auto-fit,minmax(min(200px,100%),1fr))]",
  240: "grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))]",
  280: "grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))]",
  300: "grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))]",
  320: "grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))]",
  340: "grid-cols-[repeat(auto-fit,minmax(min(340px,100%),1fr))]",
  420: "grid-cols-[repeat(auto-fit,minmax(min(420px,100%),1fr))]",
};

export default function AutoGrid({ as: Tag = "div", min, className = "", children }) {
  return <Tag className={`grid ${COLUMNS[min]} ${className}`}>{children}</Tag>;
}
