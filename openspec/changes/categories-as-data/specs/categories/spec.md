## Purpose

The topics questions are filed under, kept as data an Admin manages from Panel
Admin rather than a list fixed in code, so the taxonomy can grow without a
deploy.

## ADDED Requirements

### Requirement: Reading categories

Anyone MUST be able to read the category list, in the order an Admin set.

#### Scenario: Listing categories

- **WHEN** anyone, signed in or not, requests `GET /api/categories`
- **THEN** the response is 200 with `[{ key, name, sortOrder, questionCount }]`
  ordered by `sortOrder`
- **AND** `questionCount` is the number of questions filed under that category

#### Scenario: Initial categories

- **WHEN** the app is first deployed with this change
- **THEN** the list holds, in this order: Sholat, Puasa, Zakat, Thaharah,
  Keluarga & Pernikahan, Keuangan & Muamalah, Makanan & Minuman, Haji & Umrah,
  Akhlak, Aqidah, Jenazah, Isu Kontemporer
- **AND** the five existing keys are unchanged: `sholat`, `puasa`, `zakat`,
  `keluarga`, `muamalah`
- **AND** every question keeps the category it had, and uncategorised questions
  stay uncategorised

#### Scenario: Categories shown in the app

- **WHEN** a page shows categories — the home topic index, the Tanya Jawab and
  Jawab Pertanyaan filters, the Ajukan category picker, or a question's label
- **THEN** it shows the current list and names from `GET /api/categories`
- **AND** a question with no category is labelled "Lainnya"

### Requirement: Managing categories

An Admin MUST be able to add, rename, reorder and delete categories from Panel
Admin. Nobody else may change them.

#### Scenario: Adding a category

- **WHEN** an Admin posts `{ name }` to `POST /api/admin/categories`
- **THEN** a category is created at the end of the list, with a key derived from
  the name (lower case, words joined by hyphens, e.g. "Haji & Umrah" →
  `haji-umrah`), and the response is 201 with the category

#### Scenario: Empty or duplicate name

- **WHEN** the name is empty
- **THEN** the response is 400 with the message "Nama kategori harus diisi"
- **WHEN** another category already has that name, ignoring case, or the derived
  key is taken
- **THEN** the response is 409 with the message "Kategori dengan nama ini sudah ada"

#### Scenario: Renaming keeps the key

- **WHEN** an Admin puts `{ name }` to `PUT /api/admin/categories/{key}`
- **THEN** the name changes and the key does not, so existing links and filters
  keep working

#### Scenario: Reordering

- **WHEN** an Admin puts `{ sortOrder }` to `PUT /api/admin/categories/{key}`
- **THEN** the category takes that position and the list is read back in the new
  order

#### Scenario: Deleting a category in use

- **WHEN** an Admin sends `DELETE /api/admin/categories/{key}`
- **THEN** the category is removed and the response is 204
- **AND** every question that used it becomes uncategorised and is labelled
  "Lainnya"

#### Scenario: Confirming a delete

- **WHEN** an Admin deletes a category on the Kategori page
- **THEN** they are asked to confirm first, and the prompt says how many
  questions will become "Lainnya"

#### Scenario: Unknown category

- **WHEN** a `PUT` or `DELETE` names a key that does not exist
- **THEN** the response is 404

#### Scenario: Not an Admin

- **WHEN** a signed-out caller uses any `/api/admin/categories` endpoint
- **THEN** the response is 401
- **WHEN** a signed-in caller who is not an Admin uses one
- **THEN** the response is 403 and nothing changes

#### Scenario: The Kategori page

- **WHEN** an Admin opens Panel Admin
- **THEN** they can switch between "Pengguna" and "Kategori"
- **AND** the Kategori page lists every category with its question count, and
  lets them add, rename, move up or down, and delete
