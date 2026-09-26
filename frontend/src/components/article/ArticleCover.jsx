import PlaceholderTexture from "../PlaceholderTexture";
import { pictureUrl } from "../../lib/api";

// An article's cover at a fixed aspect ratio, or the design's hatched placeholder when it
// has none (only where a caller asks for one, via `placeholder`).
export default function ArticleCover({ cover, placeholder = false, className = "" }) {
  if (cover) {
    return <img src={pictureUrl(cover)} alt="" loading="lazy" className={`block object-cover border border-stone-line bg-parchment ${className}`} />;
  }
  if (!placeholder) return null;
  return <PlaceholderTexture size="sm" className={`block ${className}`} />;
}
