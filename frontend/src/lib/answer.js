// Answers written before formatting existed are plain text with newlines. The editor works in
// HTML, so a plain answer opened for editing becomes paragraphs (blank line) and line breaks.
const ESCAPE = { "&": "&amp;", "<": "&lt;", ">": "&gt;" };

export function plainToHtml(text) {
  return String(text ?? "")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => `<p>${block.replace(/[&<>]/g, (c) => ESCAPE[c]).replace(/\n/g, "<br>")}</p>`)
    .join("");
}
