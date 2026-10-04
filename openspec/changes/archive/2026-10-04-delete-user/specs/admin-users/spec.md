## MODIFIED Requirements

### Requirement: Browsing users

An Admin MUST be able to list every user, sorted by name, and narrow the list by
free text or role.

#### Scenario: Listing

- **WHEN** an Admin requests `GET /api/admin/users`
- **THEN** every user who has not been deleted is returned sorted by name
- **AND** each carries `id`, `name`, `email`, `role`, `createdAt` and `lastLogin`

#### Scenario: Search

- **WHEN** `?search=` is given
- **THEN** only users whose name or email contains it are returned, matched
  case-insensitively

#### Scenario: Filtering by role

- **WHEN** `?role=` is given
- **THEN** only users holding that role are returned
