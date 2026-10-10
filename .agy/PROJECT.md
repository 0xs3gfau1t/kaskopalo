# Kaskopalo — Project Definition

## Name
Kaskopalo

## One-Liner
Multi-tenant chore turn-tracker for flatmates with combination-mode round-robin queues.

## Intent (Confirmed 2026-10-10)

- **Outcome:** A multi-tenant chore turn-tracker — flatmates log in, see whose turn it is for each chore, and mark done or skip. Turns rotate round-robin. Every chore tracks independent queues per combination-mode of participating members. Skipped turns pile up as debt for the skipped person.
- **User:** Groups of flatmates/housemates sharing a living space and chores.
- **Why now:** End the "whose turn was it?" argument; build something useful as a recreational project.
- **Success:** Flatmates open it on phone browsers, see whose turn it is, mark done / skip. Fair and undisputed.
- **Constraint:** Firebase only (auth + Firestore). Static frontend on GitHub Pages. MVP scope only.
- **Out of scope (MVP):** PWA, push notifications, scheduling/reminders, history/analytics, any custom backend.

## Core Mechanics

- **Round-robin rotation** per chore, per combination-mode.
- **Combination modes:** For N flatmates, every subset of size ≥ 2 is a mode (C(N,2) + C(N,3) + … + C(N,N)). Each mode maintains its own independent turn queue. Modes are auto-generated from the roster.
- **Skip / debt:** If a flatmate is unavailable, they can be skipped. Their owed turn goes to the front of the queue for when they return.
- **Manual override:** "Choose who did it" — assign a completed chore to a specific person.
- **Editable roster:** Number and identity of flatmates can change over time.

## Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend framework | React (via Vite or CRA) | Static SPA |
| Hosting | GitHub Pages | Static files only |
| Auth | Firebase Authentication | Email/password for MVP |
| Database | Cloud Firestore | NoSQL, real-time sync |
| Backend | None | Firebase SDK client-side only |
| Future | PWA + push notifications | Post-MVP |

## MVP Scope

1. User registration and login (Firebase Auth)
2. Create / join a household (invite code mechanism)
3. Add / remove members from a household
4. Add / remove chores
5. View whose turn it is (per chore, per active mode)
6. Mark a chore as done (advances the turn)
7. Skip a turn (debt accumulates)
8. Choose who did it (manual assignment)

## Assumptions

1. Firestore (not Realtime Database) for data storage
2. Firebase Auth with email/password for MVP (no social logins)
3. "Join a household" uses an invite code or link
4. Combination modes are auto-generated from the roster
5. UI is mobile-first (flatmates use phones primarily)
6. Firebase project not yet created — setup is part of the work
