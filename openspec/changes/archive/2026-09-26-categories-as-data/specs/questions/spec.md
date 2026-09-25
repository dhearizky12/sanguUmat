## REMOVED Requirements

### Requirement: Categories

**Reason**: The category set is no longer fixed in code. It is data an Admin
manages, specified by the new `categories` capability.
**Migration**: The five existing keys are kept and seeded into the categories
table, and every question's category is backfilled, so questions and
`?category=` filters behave as before. `backend/Models/Categories.cs` and the
hard-coded list in `frontend/src/lib/category.js` are removed.
