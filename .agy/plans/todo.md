# Task Breakdown: Kaskopalo MVP

**Status:** Awaiting Approval  
**Date:** 2026-10-10  
**References:** plans/plan.md, specs/SPEC-*.md

---

### Step 1: Base Scaffolding & Config
- [x] **Task 1.1: Initialize React + Vite project & configurations**
  - Acceptance: `package.json`, `vite.config.js`, basic directories created; `npm run build` succeeds.
  - Verify: Run `npm run build`.
  - Files: `package.json`, `vite.config.js`, `index.html`, `src/main.jsx`, `src/App.jsx`.

- [x] **Task 1.2: Install dependencies & setup test runner**
  - Acceptance: `firebase`, `react-router-dom`, `vitest` installed and configured.
  - Verify: Run `npm test`.
  - Files: `package.json`, `vite.config.js`, `tests/setup.js`.

- [x] **Task 1.3: Firebase configuration setup & environment stub**
  - Acceptance: `src/firebase/config.js` loads Firebase app, auth, and firestore singletons safely with `.env.example`.
  - Verify: Import check in test.
  - Files: `src/firebase/config.js`, `.env.example`, `.gitignore`.

---

### Step 2: Identity Module
- [x] **Task 2.1: AuthContext and useAuth hook**
  - Acceptance: Provides `user`, `loading`, `error`, `login`, `register`, `logout`, `clearError`. Handles Firebase auth state observer.
  - Verify: Unit test `useAuth` with mocked firebase auth.
  - Files: `src/modules/identity/AuthContext.jsx`, `src/modules/identity/useAuth.js`, `src/modules/identity/index.js`.

- [x] **Task 2.2: Auth UI pages (Login & Register)**
  - Acceptance: Input validation (email format, 8-char password, display name on register); friendly error messages.
  - Verify: Component render tests.
  - Files: `src/modules/identity/LoginPage.jsx`, `src/modules/identity/RegisterPage.jsx`.

- [x] **Task 2.3: ProtectedRoute component**
  - Acceptance: Redirects unauthenticated users to `/login`; handles auth loading spinner.
  - Verify: Route integration test.
  - Files: `src/modules/identity/ProtectedRoute.jsx`.

---

### Step 3: Household Module
- [x] **Task 3.1: Invite code utility & household Firestore service**
  - Acceptance: Generates 8-char alphanumeric unique codes; atomic batch write for household creation and `inviteCodes/{code}` doc.
  - Verify: Unit tests for `inviteCodeUtils.js` and `householdService.js`.
  - Files: `src/modules/household/inviteCodeUtils.js`, `src/modules/household/householdService.js`.

- [x] **Task 3.2: HouseholdContext and useHousehold hook**
  - Acceptance: Provides current household state, switch, create, join, leave, remove member functions.
  - Verify: Hook unit tests with mock Firestore.
  - Files: `src/modules/household/HouseholdContext.jsx`, `src/modules/household/useHousehold.js`, `src/modules/household/index.js`.

- [x] **Task 3.3: Household UI (Setup & Settings pages)**
  - Acceptance: UI to create/join household via code; member roster display with role badges and admin actions.
  - Verify: Component render tests.
  - Files: `src/modules/household/HouseholdSetupPage.jsx`, `src/modules/household/HouseholdSettingsPage.jsx`.

---

### Step 4: Chores Module
- [x] **Task 4.1: Chore Firestore service & useChores hook**
  - Acceptance: CRUD operations under `households/{id}/chores`; real-time updates via `onSnapshot`; deduplication check.
  - Verify: Unit tests for validation and CRUD operations.
  - Files: `src/modules/chores/choreService.js`, `src/modules/chores/useChores.js`, `src/modules/chores/index.js`.

- [x] **Task 4.2: Chore List & Form UI components**
  - Acceptance: Chore listing, add form, inline edit, delete confirmation dialog.
  - Verify: Component render tests.
  - Files: `src/modules/chores/ChoreListPage.jsx`, `src/modules/chores/ChoreForm.jsx`.

---

### Step 5: Turn Engine Module
- [x] **Task 5.1: Pure logic algorithms (modeGenerator & turnEngine)**
  - Acceptance: Generates all subsets C(N,2)..C(N,N); round-robin queue mechanics, skip with debt accumulation, debt decrement on completion.
  - Verify: Comprehensive unit test suite with 100% logic coverage on edge cases.
  - Files: `src/modules/turn-engine/modeGenerator.js`, `src/modules/turn-engine/turnEngine.js`, `src/modules/turn-engine/__tests__/turnEngine.test.js`.

- [x] **Task 5.2: Turn queue Firestore service & hooks**
  - Acceptance: Transaction-safe updates to `households/{id}/chores/{choreId}/turnQueues/{modeKey}`; initialization on roster changes.
  - Verify: Service unit tests.
  - Files: `src/modules/turn-engine/turnQueueService.js`, `src/modules/turn-engine/useTurnEngine.js`, `src/modules/turn-engine/useTurnSummary.js`, `src/modules/turn-engine/index.js`.

- [x] **Task 5.3: Turn UI components**
  - Acceptance: Mode selector, "whose turn is it" display card, mark done button, skip button, manual assign dropdown, debt badge.
  - Verify: Component integration test.
  - Files: `src/modules/turn-engine/TurnDashboard.jsx`, `src/modules/turn-engine/TurnActions.jsx`, `src/modules/turn-engine/ModeSelector.jsx`, `src/modules/turn-engine/DebtBadge.jsx`.

---

### Step 6: UI Shell & Integration
- [x] **Task 6.1: Routing & Layout shell**
  - Acceptance: Mobile-first responsive app bar, bottom navigation, route definitions via `HashRouter`.
  - Verify: Browser smoke test.
  - Files: `src/components/Layout.jsx`, `src/components/Navbar.jsx`, `src/components/LoadingScreen.jsx`, `src/App.jsx`.

- [x] **Task 6.2: HouseholdGuard & Dashboard integration**
  - Acceptance: Enforce household presence before accessing dashboard; dashboard renders chore turn cards.
  - Verify: Route guard test.
  - Files: `src/components/HouseholdGuard.jsx`, `src/pages/DashboardPage.jsx`.

- [x] **Task 6.3: Production build & GitHub Pages deploy configuration**
  - Acceptance: `npm run build` generates production assets with correct relative base paths.
  - Verify: Build output verification in `dist/`.
  - Files: `vite.config.js`, `package.json`, `README.md`.
