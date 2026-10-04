# home-page Specification

## Purpose

Beranda, the home page: the search hero, and a window onto each part of the
site. It shows the latest answers, what is live in Ngaji Bareng, and the newest
articles, so a first visit shows the whole site at a glance.

## Requirements

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

### Requirement: Hero

The hero MUST offer search, the "Sering dicari" suggestions, and the site's
numbers.

#### Scenario: Stats line

- **WHEN** the summary has loaded and at least one question is published
- **THEN** below the suggestions the hero reads "{N} jawaban terverifikasi /
  {M} ustadz / diperbarui {when}", where `when` is "hari ini", "kemarin" or "{D}
  hari lalu" by the WIB calendar date of `lastAnsweredAt`
- **WHEN** nothing is published
- **THEN** the line is not shown

#### Scenario: Searching

- **WHEN** a visitor submits the search box
- **THEN** they go to Tanya Jawab with that search, as before
- **AND** choosing a "Sering dicari" suggestion puts it in the box

### Requirement: Live strip

While a kajian is live, the home page MUST say so right under the hero.

#### Scenario: A kajian is live

- **WHEN** `GET /api/kajian/now` has a live kajian
- **THEN** a dark strip reads "Ngaji berlangsung" with a pulsing dot, the
  kajian's title, "bersama {ustadz}", and "Gabung sekarang", which opens its
  page
- **WHEN** nothing is live
- **THEN** there is no strip

### Requirement: Latest answers

The home page MUST show the newest published questions in the same form as Tanya
Jawab, without fetching each one separately.

#### Scenario: Jawaban Terbaru

- **WHEN** the home page loads
- **THEN** "Jawaban Terbaru" shows the first 8 items of
  `GET /api/question/browse` as question cards, with "{shown} dari {total}
  jawaban", the one/two-column toggle, and "Lihat semua jawaban" to Tanya Jawab
- **AND** no request is made per question
- **WHEN** nothing is published
- **THEN** it shows "Belum ada jawaban." with "Ajukan Pertanyaan"

### Requirement: Ngaji Bareng section

The home page MUST feature Ngaji Bareng on the canvas's dark band whenever any
kajian exists.

#### Scenario: Featured kajian

- **WHEN** a kajian is live
- **THEN** the section features it: its thumbnail marked "Live", "Sedang
  berlangsung", title, ustadz and description, and "Gabung kajian"
- **WHEN** nothing is live but a kajian is scheduled this week
- **THEN** it features the next one: its thumbnail, "Berikutnya · {day},
  {date} · {time} WIB", title, ustadz and description, and "Tambah ke kalender"
  beside a link to its page
- **WHEN** neither
- **THEN** the featured side is left out and the recordings fill the section

#### Scenario: Rekaman terbaru

- **WHEN** there are recordings
- **THEN** "Rekaman terbaru" lists the four newest, each with a small thumbnail,
  title, and "{ustadz} · {duration}", linking to its page, followed by "Semua
  rekaman kajian" to Ngaji Bareng

#### Scenario: Nothing yet

- **WHEN** there is no live, scheduled or recorded kajian
- **THEN** the section is not shown

### Requirement: Artikel Pilihan

The home page MUST feature the newest articles whenever any is published.

#### Scenario: Articles

- **WHEN** articles are published
- **THEN** "Artikel Pilihan" · "Pembahasan mendalam" shows a lead article
  (the newest with a cover, or the newest if none has one) with its cover,
  "{rubrik} · {N} menit baca", title and summary, and beside it the next three
  newest, each with a small cover or hatched placeholder, rubrik, title and
  summary, then "Semua artikel" to Artikel
- **WHEN** none is published
- **THEN** the section is not shown

### Requirement: Page order and language

The home page MUST follow the canvas's order, in the design system and Bahasa
Indonesia.

#### Scenario: Order

- **WHEN** the home page is shown
- **THEN** its sections are, top to bottom: hero, live strip, Jawaban Terbaru,
  Ngaji Bareng, Artikel Pilihan, and the "Tidak menemukan jawabannya?" call to
  action
- **AND** every section works at a 400px width without sideways scrolling
