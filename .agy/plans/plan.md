# Implementation Plan: Kaskopalo MVP

**Status:** Awaiting Approval  
**Date:** 2026-10-10  
**References:** SPEC-identity, SPEC-household, SPEC-chores, SPEC-turn-engine, SPEC-ui-shell

---

## 1. Architecture & Component Dependencies

```
[Vite + React Scaffolding]
         │
         ▼
[Identity Module (Firebase Auth)]
         │
         ▼
[Household Module (Firestore households + inviteCodes)]
         │
         ├──────────────────────────┐
         ▼                          ▼
[Chores Module (CRUD)]      [Turn Engine (Algo + Firestore Queues)]
         │                          │
         └─────────────┬────────────┘
                       ▼
             [UI Shell Integration]
                       │
                       ▼
             [Verification & Build]
```

---

## 2. Implementation Order

### Step 1: Base Scaffolding & Configuration
- Initialize Vite + React project in root.
- Add dependencies: `firebase`, `react-router-dom`, `lucide-react` (or simple SVG icons).
- Add testing framework: `vitest`, `@testing-library/react`.
- Configure `firebase/config.js` with environment variable support (`.env.example`).
- Setup base responsive CSS and theme tokens.

### Step 2: Identity Module
- Create `AuthContext.jsx` and `useAuth.js`.
- Create `LoginPage.jsx` and `RegisterPage.jsx`.
- Implement `ProtectedRoute.jsx`.
- Add unit tests for auth error mapping and hook state transitions.

### Step 3: Household Module
- Implement `inviteCodeUtils.js` (generation and validation).
- Implement `householdService.js` (Firestore operations: create, join, leave, remove, regenerate invite).
- Create `HouseholdContext.jsx` and `useHousehold.js`.
- Build `HouseholdSetupPage.jsx` (create/join flow) and `HouseholdSettingsPage.jsx`.
- Unit tests for invite code generation and join validation.

### Step 4: Chores Module
- Implement `choreService.js` (Firestore CRUD under `households/{id}/chores`).
- Implement `useChores.js` with real-time listener (`onSnapshot`).
- Build `ChoreListPage.jsx` and `ChoreForm.jsx`.
- Unit tests for chore name validation and deduplication logic.

### Step 5: Turn Engine Module
- Implement `modeGenerator.js` (pure function combination generator C(N,2)..C(N,N)).
- Implement `turnEngine.js` (pure functions for `getWhoseTurn`, `markDone`, `skip`, debt tracking).
- Write extensive unit tests for `turnEngine.js` and `modeGenerator.js`.
- Implement `turnQueueService.js` (Firestore transaction-safe writes to `turnQueues/{modeKey}`).
- Implement `useTurnEngine.js` and `useTurnSummary.js`.
- Build UI components: `TurnDashboard.jsx`, `TurnActions.jsx`, `ModeSelector.jsx`, `DebtBadge.jsx`.

### Step 6: UI Shell & Integration
- Configure `HashRouter` with routes in `App.jsx`.
- Implement `HouseholdGuard.jsx` to enforce household setup.
- Build responsive layout (`Navbar.jsx`, `Layout.jsx`) optimized for mobile viewport.
- Assemble `DashboardPage.jsx` linking chores with turn-engine components.
- Configure build scripts for GitHub Pages.

---

## 3. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Firestore rules blocking invite lookup | High | Use separate `inviteCodes/{code}` lookup collection with open read rule |
| Combination explosion for large households | Medium | Limit roster to max 8 members in UI validation |
| Concurrent turn advances | Medium | Use Firestore transactions inside `turnQueueService.js` |
| GitHub Pages 404 on refresh | High | Use `HashRouter` as agreed in SPEC-ui-shell |

---

## 4. Verification Checkpoints

1. **Checkpoint A:** Project builds cleanly (`npm run build`), test runner runs.
2. **Checkpoint B:** User can register, login, logout; protected routes redirect.
3. **Checkpoint C:** User can create household, generate invite code; second user can join with code.
4. **Checkpoint D:** Member can create chore; appears on chore list in real-time.
5. **Checkpoint E:** Turn engine computes correct modes, advances turns, records debt on skip, resolves debt on done.
6. **Checkpoint F:** End-to-end user flow working on mobile viewport simulator.
