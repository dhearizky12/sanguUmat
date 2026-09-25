# design-system Specification

## Purpose
The shared visual vocabulary every Sangu Umat page is built from, and the rules
that keep it one system rather than a pile of one-off styling. `claude-design/`
is the reference the vocabulary is drawn from.

## Requirements

### Requirement: Tailwind is the only styling mechanism

All styling MUST go through Tailwind utility classes. The codebase MUST contain
no inline `style` attributes, and hand-written CSS MUST be limited to the theme
declaration and font loading.

#### Scenario: No inline styles

- **WHEN** the frontend source is searched for `style={{`
- **THEN** there are no matches

#### Scenario: A one-off value

- **WHEN** a component needs a value that no token covers
- **THEN** it uses a Tailwind arbitrary value rather than an inline style or a
  new CSS rule

#### Scenario: A value that recurs

- **WHEN** the same arbitrary value is needed in more than one place
- **THEN** it becomes a named theme token and is used as an ordinary utility

#### Scenario: A hand-written rule

- **WHEN** a rule genuinely cannot be expressed in Tailwind and is written by
  hand
- **THEN** a comment beside it says why

### Requirement: Tokens are the single source of colour, type and spacing

Every colour, font, spacing step and animation MUST come from a named token
declared in the Tailwind theme. A raw hex colour MUST NOT appear in a component.

#### Scenario: No raw colours in components

- **WHEN** the frontend components and pages are searched for a hex colour
- **THEN** there are no matches; every colour reference is a token-backed
  utility

#### Scenario: Palette matches the design

- **WHEN** a token's value is compared against the canvas it came from
- **THEN** they are identical

#### Scenario: Container width

- **WHEN** a page lays out its main column
- **THEN** it is capped at the design's container width of 1160px, from one
  shared token

#### Scenario: Animation is a token

- **WHEN** an element uses the pulsing indicator that marks a live session
- **THEN** it comes from a theme animation token, not a hand-written class and
  keyframes

### Requirement: Repeated markup becomes a component

A repeated pattern MUST be extracted into a React component. It MUST NOT be
captured as a CSS class, and its utility string MUST NOT be copied between
files.

#### Scenario: Shared primitives exist

- **WHEN** a page needs a section header, a mono label, an empty state, a
  breadcrumb, the logo mark, or a placeholder texture
- **THEN** it uses the shared component for it

#### Scenario: Same utility string in several files

- **WHEN** the same run of utility classes appears in more than one file
- **THEN** it is extracted into a component instead

### Requirement: One design system across the app

Every page and component MUST use the new design tokens. The old Material-style
tokens MUST NOT remain in use, and MUST be deleted from the theme once nothing
references them.

#### Scenario: No page is left on the old system

- **WHEN** any page is opened
- **THEN** it renders in the new design, with no old token in its markup

#### Scenario: Old tokens are removed

- **WHEN** the last reference to an old token is converted
- **THEN** that token is deleted from the theme rather than left unused

#### Scenario: Navigating between pages

- **WHEN** a visitor moves from the home page to any other page
- **THEN** the header, footer, type and palette stay continuous

### Requirement: Faithful to the design

A page whose canvas exists in `claude-design/` MUST match it: layout, spacing,
type scale, colour, and the wording of its copy.

#### Scenario: A page with a canvas

- **WHEN** a page is built and a canvas for it exists
- **THEN** its visual output matches that canvas

#### Scenario: Canvas shows a feature that has no backend

- **WHEN** a canvas shows something the backend cannot yet supply, such as
  faceted counts, a monthly quota, or WhatsApp sign-in
- **THEN** that part is left out rather than mocked with invented content
- **AND** the rest of the page is still built to the canvas

#### Scenario: The prototype bundle does not ship

- **WHEN** the application is built
- **THEN** nothing from `claude-design/` is included in the bundle

### Requirement: Bahasa Indonesia

Every piece of user-facing text MUST be in Bahasa Indonesia, including the
strings introduced or touched while restyling.

#### Scenario: Copy taken from a canvas

- **WHEN** a canvas specifies wording for a heading, button, placeholder or
  empty state
- **THEN** that exact Bahasa Indonesia wording is used

#### Scenario: An English string is found

- **WHEN** a page being restyled still carries English user-facing text
- **THEN** it is translated as part of the conversion

### Requirement: Responsive

Every page MUST work from a narrow phone viewport up, without a horizontal
scrollbar on the page body.

#### Scenario: Narrow viewport

- **WHEN** any page is viewed at 400px wide
- **THEN** its content reflows to fit and the body does not scroll sideways

#### Scenario: Navigation on a phone

- **WHEN** the header is shown below the desktop breakpoint
- **THEN** the menu collapses behind the burger control, and opening it reveals
  the same destinations the wide header offers
