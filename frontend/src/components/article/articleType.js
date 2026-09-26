// The typography of an article body, shared by the page and the editor so what an author
// writes looks exactly like what readers see. Covers only the tags the server keeps
// (backend/Articles/ArticleHtml.cs).
export const ARTICLE_TYPE = [
  "font-serif text-[18px] leading-[1.75] text-ink-soft break-words",
  "[&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
  "[&_p]:my-4",
  "[&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-[26px] md:[&_h2]:text-[30px] [&_h2]:leading-tight [&_h2]:tracking-tight [&_h2]:font-normal [&_h2]:text-ink",
  "[&_h3]:mt-8 [&_h3]:mb-2 [&_h3]:text-[21px] md:[&_h3]:text-[23px] [&_h3]:leading-snug [&_h3]:font-normal [&_h3]:text-ink",
  "[&_strong]:font-semibold [&_strong]:text-ink",
  "[&_a]:text-forest [&_a]:underline [&_a]:decoration-stone-border [&_a]:underline-offset-4 [&_a:hover]:decoration-forest",
  "[&_blockquote]:my-7 [&_blockquote]:border-l-2 [&_blockquote]:border-gold-deep [&_blockquote]:pl-5 [&_blockquote]:text-[19px] [&_blockquote]:italic [&_blockquote]:text-ink",
  "[&_ul]:my-4 [&_ul]:pl-6 [&_ul]:list-disc [&_ol]:my-4 [&_ol]:pl-6 [&_ol]:list-decimal [&_li]:my-1.5 [&_li]:pl-1 [&_li_p]:my-0 [&_li::marker]:text-ink-faint",
  "[&_hr]:my-10 [&_hr]:border-0 [&_hr]:border-t [&_hr]:border-stone-line",
].join(" ");
