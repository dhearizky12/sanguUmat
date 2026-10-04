## MODIFIED Requirements

### Requirement: Article page

Each published article MUST have its own page.

#### Scenario: Reading

- **WHEN** anyone opens `/articles/{id}`
- **THEN** they see a breadcrumb Artikel › rubrik, the rubrik, title and
  summary, the author with their avatar (with the gold tick and a link to their
  ustadz page when they are an ustadz), the published date, "N menit baca" and "N
  dibaca", the cover, and the formatted body
- **AND** one read is counted

#### Scenario: Managing from the page

- **WHEN** the author or an Admin views the article
- **THEN** it offers "Ubah artikel" and "Hapus", which asks to confirm first
- **WHEN** they view a draft
- **THEN** a notice says "Draf — belum diterbitkan" and no read is counted

#### Scenario: Missing article

- **WHEN** the id does not exist or is a draft the viewer may not see
- **THEN** the page shows "Artikel tidak ditemukan." with a link back to Artikel

#### Scenario: The old placeholder link

- **WHEN** anyone opens `/detail-article/{anything}`
- **THEN** they are redirected to `/articles`
