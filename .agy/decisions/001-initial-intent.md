# Decision 001: Initial Intent & Tech Stack

**Date:** 2026-10-10
**Status:** Confirmed
**Decided by:** User (via interview-me)

## Context

Starting a new recreational project called "kaskopalo" — a chore turn-tracker for flatmates.

## Decision

- Build a multi-tenant chore turn-tracker with combination-mode round-robin queues
- Use React for frontend, hosted on GitHub Pages (static)
- Use Firebase (Auth + Firestore) as the only backend — no custom server
- MVP scope: auth, household management, chore CRUD, turn tracking with skip/debt
- Defer PWA, notifications, analytics to post-MVP

## Rationale

- Firebase eliminates the need for a backend server, keeping hosting free on GitHub Pages
- React is the user's preferred frontend framework
- Combination modes ensure fair turn tracking regardless of which flatmates are present
- MVP-first approach to get something usable before adding polish

## Alternatives Considered

- Custom backend → rejected (unnecessary complexity for this use case)
- Other frontend frameworks → user chose React explicitly
- Realtime Database vs Firestore → Firestore chosen for better querying and offline support
