import MonoLabel from "./MonoLabel";

// Questions/answers here are plain text (backend only has a single Content field — see
// BE_PLAN.md), but authors write them WhatsApp-style: an all-caps title, section labels like
// PERTANYAAN/JAWABAN/PENJELASAN/REFERENSI/KESIMPULAN, numbered points, blank-line paragraph
// breaks. A bare <p>{content}</p> collapses all of that into one run-on paragraph since CSS
// ignores newlines by default. This renders each line as its own block so structure the author
// already wrote survives, plus a light heuristic to bold section-heading-looking lines.

const SECTION_LABELS = new Set([
  "PERTANYAAN",
  "JAWABAN",
  "PENJELASAN",
  "REFERENSI",
  "KESIMPULAN",
  "DALIL",
  "HUKUM",
  "CATATAN",
  "KETERANGAN",
]);

function isSectionLabel(line) {
  return SECTION_LABELS.has(line.replace(/:$/, "").trim().toUpperCase());
}

function isHeadingLine(line) {
  if (!line) {
    return false;
  }

  if (isSectionLabel(line)) {
    return true;
  }

  // A short line the author wrote entirely in caps (their own ad-hoc heading/title).
  // Scripts without letter casing (Arabic, etc.) would trivially pass an "all uppercase"
  // check since .toUpperCase() is a no-op for them — require actual case contrast first.
  const letters = line.replace(/[^\p{L}]/gu, "");
  const hasCasing = letters.toLowerCase() !== letters.toUpperCase();
  return hasCasing && letters.length >= 4 && letters === letters.toUpperCase() && line.length <= 80;
}

function isNumberedLine(line) {
  // Covers both ASCII (1.) and Arabic-Indic (١.) numbering, both show up in these answers.
  return /^[0-9٠-٩]+\./.test(line);
}

function RichContent({ text, className = "" }) {
  const lines = (text ?? "").split("\n");

  return (
    <div className={className}>
      {lines.map((line, i) => {
        const trimmed = line.trim();

        // An opening all-caps line is the author's title, unless it is itself a section
        // label (JAWABAN, REFERENSI…); section labels are set as the design's mono label.
        if (isHeadingLine(trimmed)) {
          return i === 0 && !isSectionLabel(trimmed) ? (
            <p key={i} dir="auto" className="font-serif text-[22px] leading-snug text-ink mb-2">
              {trimmed}
            </p>
          ) : (
            <MonoLabel as="p" key={i} dir="auto" className="mt-5 mb-1 text-forest">
              {trimmed}
            </MonoLabel>
          );
        }

        if (isNumberedLine(trimmed)) {
          return (
            <p key={i} dir="auto" className="mt-3">
              {line}
            </p>
          );
        }

        return (
          <p key={i} dir="auto">
            {line || " "}
          </p>
        );
      })}
    </div>
  );
}

export default RichContent;
