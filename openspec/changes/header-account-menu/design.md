# Design

## Context

`Header.jsx` renders role buttons inline (a User sees "Ajukan Pertanyaan", a Guru or Admin
"Jawab Pertanyaan" with a count, an Admin "Panel Admin") beside the bell and an avatar
that links straight to Profil. The phone menu already lists everything as rows.

## Goals / Non-Goals

**Goals:**
- A count-based rule that keeps the bar short for any role mix.
- No extra network calls: the pending count is already fetched for "Jawab Pertanyaan".

**Non-Goals:**
- Measuring available width. A count is deterministic and never flickers or reflows.
- Changing the phone menu.

## Decisions

**One list of actions, one constant.** The header builds
`[{ key, label, to, count? }]` for the visitor and compares its length with
`MAX_INLINE_ACTIONS = 1`. At or below it they render as buttons; above it none do and the
whole list goes into the account menu. Moving only the extras would leave an odd mix, and
all-or-none reads consistently. Changing the limit is one number.

**The avatar always opens the menu.** For consistency (and so everyone gets "Keluar"
without visiting Profil) it is a button for every signed-in visitor, labelled "Menu akun"
with `aria-expanded` and `aria-haspopup`. Cost: Profil is one click further; "Profil saya"
is the first fixed item.

**A dedicated `AccountMenu`.** Same pattern as the notification bell: a `useRef` root, close
on Escape and on `mousedown` outside, close after choosing. Items are links (`role="menuitem"`),
"Keluar" calls `logout()` from the auth context. Escape returns focus to the avatar.

**Pending badge.** The count already lives in `Header` (`pendingAnswerCount`). It is passed to the
menu item and, when "Jawab Pertanyaan" is in the menu, shown on the avatar so the nudge survives.

## Risks / Trade-offs

- Hiding "Jawab Pertanyaan" in a menu costs a click for ustadz → the badge on the avatar keeps
  the signal visible.
- A dropdown near the right edge can clip → it is anchored right and capped to the viewport.

## Migration Plan

Frontend build and upload only. Rollback by re-uploading the previous build.
