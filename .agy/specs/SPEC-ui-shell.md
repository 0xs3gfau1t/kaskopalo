# Spec: ui-shell

## Objective

React application shell for Kaskopalo. Provides mobile-first responsive layout, client-side routing, navigation, and page composition. Connects `identity`, `household`, `chores`, and `turn-engine`.

### User Stories

1. **As a visitor**, I land on `/login` or `/register` when unauthenticated.
2. **As an authenticated user without household**, I am prompted to create or join household.
3. **As an authenticated user with household**, I see dashboard displaying chores and whose turn it is.
4. **As a mobile user**, navigation works cleanly with bottom nav or top app bar.
5. **As a user**, I can switch households or access household settings from menu.

### Acceptance Criteria

- Built with Vite + React SPA.
- Routing via `react-router-dom` (HashRouter or BrowserRouter configured for GitHub Pages 404 redirect).
- Base path configured for GitHub Pages repository root (`/kaskopalo/`).
- Mobile-first responsive UI.
- Global toast/notification system for action errors and confirmations.
- Global loading spinner during route or auth transitions.

## Routes & Page Structure

```
/login                     -> LoginPage (identity)
/register                  -> RegisterPage (identity)
/                          -> DashboardPage (chores + turn-engine summary)
/chores                    -> ChoreListPage (chores management)
/household/new             -> Create or join household flow
/household/settings        -> HouseholdSettingsPage (members, invite code)
```

## Route Guarding

```jsx
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
  
  <Route element={<ProtectedRoute />}>
    <Route element={<HouseholdGuard />}>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/chores" element={<ChoreListPage />} />
      <Route path="/household/settings" element={<HouseholdSettingsPage />} />
    </Route>
    <Route path="/household/new" element={<HouseholdSetupPage />} />
  </Route>
</Routes>
```

- `ProtectedRoute`: checks `user` from `useAuth()`. If null, redirects to `/login`.
- `HouseholdGuard`: checks `currentHousehold` from `useHousehold()`. If null, redirects to `/household/new`.

## GitHub Pages SPA Compatibility

GitHub Pages does not support SPA fallback natively.
Choice: `HashRouter` for MVP.
Reason: Zero server-side 404 redirect hacks needed, works reliably on `username.github.io/kaskopalo/#/...`.

## Commands

```bash
Dev:    npm run dev
Build:  npm run build
Lint:   npm run lint
Test:   npm test
Deploy: npm run deploy (gh-pages)
```

## Project Directory Layout

```
src/
├── main.jsx
├── App.jsx
├── App.css
├── index.css
├── firebase/
│   └── config.js
├── components/
│   ├── Layout.jsx
│   ├── Navbar.jsx
│   ├── Toast.jsx
│   └── LoadingScreen.jsx
└── modules/
    ├── identity/
    ├── household/
    ├── chores/
    └── turn-engine/
```

## Boundaries

### Always
- Mobile-first CSS/layout.
- Use `HashRouter` to prevent GitHub Pages routing breakage.
- Keep business logic in respective modules, not in shell components.

### Ask First
- Adding CSS framework (Tailwind, CSS modules, UI component library).
- Switching from `HashRouter` to `BrowserRouter` + 404 redirect script.

### Never
- Hardcode Firebase API keys in git if repository is public (use `.env` template).
- Put Firestore data mutations directly in UI components outside hooks/services.

## Success Criteria

1. Navigating routes works on GitHub Pages without 404 on refresh.
2. Unauthenticated user blocked from app pages.
3. User without household guided to create/join.
4. User with household lands on dashboard with turn actions available.
