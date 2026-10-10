# Spec: identity

## Objective

Provide user authentication for Kaskopalo using Firebase Authentication. Users can register with email/password, log in, log out, and maintain a persistent session. This module owns all Firebase Auth interactions — no other module touches Firebase Auth directly.

### User Stories

1. **As a new user**, I can register with my email and password so I have an account.
2. **As a registered user**, I can log in with my email and password so I can access my household.
3. **As a logged-in user**, I can log out.
4. **As a returning user**, my session persists across browser tabs and page reloads (until I log out).
5. **As an unauthenticated visitor**, I am redirected to the login page if I try to access any protected route.

### Acceptance Criteria

- Registration requires: email (valid format), password (≥ 8 chars), display name.
- Duplicate email registration shows a clear error.
- Login with wrong credentials shows a clear error (without leaking whether the email exists).
- After login, the user's auth state is available to all other modules via a React context.
- Session persists using Firebase's default persistence (`browserLocalPersistence`).
- Protected routes redirect to `/login` when unauthenticated.
- Auth loading state is handled (no flash of login page for authenticated users).

## Tech Stack

| Concern | Choice |
|---|---|
| Auth provider | Firebase Authentication (email/password) |
| Firebase SDK | `firebase` v10+ (modular/tree-shakeable imports) |
| React integration | Custom `AuthContext` + `useAuth` hook |
| Routing | `react-router-dom` v6+ |

## Commands

```bash
# These will be project-wide — defined here for reference, finalized in ui-shell spec
Dev:    npm run dev
Build:  npm run build
Test:   npm test
Lint:   npx eslint src/
```

## Project Structure (identity module)

```
src/
├── firebase/
│   └── config.js          # Firebase app initialization + config
├── modules/
│   └── identity/
│       ├── AuthContext.jsx     # React context providing auth state
│       ├── useAuth.js          # Hook: login, register, logout, currentUser
│       ├── ProtectedRoute.jsx  # Route wrapper that redirects if unauthenticated
│       ├── LoginPage.jsx       # Login form UI
│       ├── RegisterPage.jsx    # Registration form UI
│       └── index.js            # Public exports
```

## Code Style

```jsx
// Modular Firebase imports (tree-shakeable)
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

// Named exports, not default exports
export function useAuth() { /* ... */ }

// Hooks return clear, predictable shapes
const { user, loading, error, login, register, logout } = useAuth();

// Error handling: catch Firebase errors, map to user-friendly messages
const ERROR_MESSAGES = {
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/wrong-password': 'Invalid email or password.',
  'auth/user-not-found': 'Invalid email or password.',  // Same message — don't leak
};
```

## Data Model

This module stores **no data in Firestore**. All auth state lives in Firebase Authentication.

However, identity exposes the following shape to downstream modules:

```js
// user object shape (from Firebase Auth, subset we expose)
{
  uid: string,          // Firebase UID — used as foreign key everywhere
  email: string,
  displayName: string,  // Set during registration
}
```

## Interface Contract (provided to downstream modules)

```jsx
// AuthContext provides:
{
  user: { uid, email, displayName } | null,  // null = not logged in
  loading: boolean,                           // true while auth state resolving
  error: string | null,                       // user-friendly error message
}

// useAuth() hook provides:
{
  user,                           // same as context
  loading,                        // same as context
  error,                          // same as context
  login(email, password),         // → Promise<void>, sets error on failure
  register(email, password, displayName), // → Promise<void>, sets error on failure
  logout(),                       // → Promise<void>
  clearError(),                   // clears current error
}

// ProtectedRoute — wraps routes that require auth
<ProtectedRoute>
  <SomeProtectedPage />
</ProtectedRoute>
// Redirects to /login if user is null (after loading resolves)
```

## Testing Strategy

| Level | What | How |
|---|---|---|
| Unit | `useAuth` hook logic, error mapping | Vitest + React Testing Library, mock Firebase Auth |
| Integration | Login/register flows, redirect behavior | React Testing Library, mock Firebase |
| Manual | End-to-end auth flow | Browser test after implementation |

- Tests live in `src/modules/identity/__tests__/`
- Mock Firebase Auth — don't hit real Firebase in tests
- Coverage: all error paths, loading states, and redirect logic

## Boundaries

### Always
- Use modular Firebase imports (tree-shakeable)
- Map Firebase error codes to user-friendly messages
- Expose auth state only through `AuthContext` / `useAuth`
- Handle loading state (never render protected content before auth resolves)

### Ask First
- Adding social login providers (Google, GitHub)
- Changing password requirements
- Adding email verification flow

### Never
- Store passwords or auth tokens in Firestore
- Expose Firebase error codes directly to users
- Let other modules import from `firebase/auth` directly
- Skip the loading state check

## Success Criteria

1. A new user can register with email, password, and display name → lands on the app.
2. A registered user can log in → sees their household (or household creation).
3. A logged-in user can log out → redirected to login page.
4. Refreshing the page while logged in → stays logged in (no login flash).
5. Visiting a protected route while logged out → redirected to `/login`.
6. Wrong password → shows "Invalid email or password." (no info leak).
7. Duplicate email registration → shows clear error.
8. All auth interactions go through `useAuth` hook — no direct Firebase Auth calls elsewhere.

## Open Questions

None — this module is straightforward Firebase Auth usage.

## Security Considerations

- Password minimum length: 8 characters (Firebase default is 6, we enforce 8 client-side).
- Error messages never reveal whether an email is registered.
- No auth tokens stored in localStorage by us — Firebase SDK handles persistence.
- HTTPS enforced by GitHub Pages.
