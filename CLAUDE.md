# Sangu Umat

## Language — HARD RULE

This product is for Indonesian users only. **All user-facing text must be written in Bahasa
Indonesia** — labels, buttons, headings, placeholders, form field names, validation/error
messages, success/confirmation messages, empty states, tooltips, alerts, admin panel copy,
everything. No English strings in the UI, ever, including "temporary" or placeholder copy.

This applies to every page, including ones not yet built out (Articles, Live, Admin panel,
etc.) and to fixing any English text found in existing mocked/placeholder sections (e.g. parts
of `Dashboard.jsx`, `CreateQuestion.jsx`, `Profile.jsx` currently have English placeholder copy
left over from the original UI mockups — treat that as a bug to fix, not a reference to copy).

Code identifiers (variable/function/class names), code comments, and commit messages are not
covered by this rule and should stay in English per normal conventions — this rule is about
text a user actually sees in the running app.
