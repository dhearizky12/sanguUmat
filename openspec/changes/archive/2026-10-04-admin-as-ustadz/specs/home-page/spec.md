## MODIFIED Requirements

### Requirement: Home summary

Anyone MUST be able to read the numbers the home hero shows, counting published
questions only.

#### Scenario: Summary

- **WHEN** anyone requests `GET /api/home/summary`
- **THEN** the response is 200 with `publishedAnswers`, the number of published
  questions (answered with the asker's consent), `ustadz`, the number of ustadz (Gurus
  and Admins not hidden as ustadz), and `lastAnsweredAt`, when the newest answer on a
  published question was posted, or null when there is none
- **AND** private answers are never counted, and never set `lastAnsweredAt`
