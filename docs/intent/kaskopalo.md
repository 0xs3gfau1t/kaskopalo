# Kaskopalo — Statement of Intent

**Confirmed:** 2026-10-10

## Intent

- **Outcome:** A multi-tenant chore turn-tracker — flatmates log in, see whose turn it is for each chore, and mark done or skip. Turns rotate round-robin. Every chore tracks independent queues per combination-mode of participating members. Skipped turns pile up as debt for the skipped person.
- **User:** Groups of flatmates/housemates sharing a living space and chores.
- **Why now:** End the "whose turn was it?" argument; build something useful as a recreational project.
- **Success:** Flatmates open it on phone browsers, see whose turn it is, mark done / skip. Fair and undisputed.
- **Constraint:** Firebase only (auth + Firestore). Static frontend on GitHub Pages. MVP scope only.
- **Out of scope:** PWA, push notifications, scheduling/reminders, history/analytics, any custom backend — all post-MVP.

## Core Mechanics

- **Round-robin rotation** per chore, per combination-mode.
- **Combination modes:** For N flatmates, every subset of size ≥ 2 is a mode (C(N,2) + C(N,3) + … + C(N,N)). Each mode maintains its own independent turn queue.
- **Skip / debt:** If a flatmate is unavailable, they can be skipped. Their owed turn goes to the front of the queue for when they return.
- **Manual override:** "Choose who did it" — assign a completed chore to a specific person.
- **Editable roster:** Number and identity of flatmates can change over time.

## Tech Stack

- **Frontend:** Static site hosted on GitHub Pages
- **Backend:** Firebase (Authentication + Firestore) — no custom server
- **Future:** PWA conversion + Android push notifications (post-MVP)

## MVP Scope

1. User registration and login (Firebase Auth)
2. Create / join a household (multi-tenant)
3. Add / remove flatmates from a household
4. Add / remove chores
5. View whose turn it is (per chore, per active mode)
6. Mark a chore as done (advances the turn)
7. Skip a turn (debt accumulates)
8. Choose who did it (manual assignment)
