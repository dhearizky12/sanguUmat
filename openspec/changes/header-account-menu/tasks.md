# Tasks

## 1. Frontend

- [ ] 1.1 `AccountMenu` (avatar button, menu with overflow actions, "Profil saya", "Keluar", Escape / outside click / choose to close, pending badge) and `Header` building the action list and applying the overflow rule with `MAX_INLINE_ACTIONS = 1`; the phone menu unchanged. Verify in a browser at desktop width: a Member sees "Ajukan Pertanyaan" as a button, a Guru "Jawab Pertanyaan" as a button, an Admin sees no action buttons and finds "Jawab Pertanyaan" and "Panel Admin" in the menu, the count shows on the item and the avatar, Escape and an outside click close it, and "Keluar" signs out; lint and the build pass.

## 2. Wrap-up

- [ ] 2.1 Sync the `site-header`, `answers`, `admin-tools` and `admin-users` deltas into `openspec/specs/` and archive the change. Verify: `openspec validate --specs` passes.
