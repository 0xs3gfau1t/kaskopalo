# Spec: household

## Objective

Manage multi-tenant households. Users create a household, invite others via code, join existing ones. Household provides the member roster that `chores` and `turn-engine` depend on. One user can belong to multiple households.

### User Stories

1. **As a logged-in user**, I can create a new household with a name.
2. **As a household creator**, I get an invite code to share with flatmates.
3. **As a logged-in user**, I can join a household using an invite code.
4. **As a household member**, I can see all members and their display names.
5. **As a household admin** (creator), I can remove a member.
6. **As a household member**, I can leave a household.
7. **As a user in multiple households**, I can switch between them.
8. **As an admin**, I can regenerate the invite code (invalidates old one).

### Acceptance Criteria

- Household name required, 1–50 chars.
- Invite code: 8-char alphanumeric, unique, generated server-side (Cloud Function or client-generated UUID-based).
- Joining with invalid/expired code shows clear error.
- Creator is auto-assigned `admin` role. Others get `member` role.
- Removing a member does NOT delete their auth account.
- A household with 0 members is soft-deleted (or cleaned up).
- Member list updates in real-time (Firestore `onSnapshot`).
- Minimum 2 members to use chore/turn features (enforced in UI, not DB).

## Firestore Data Model

```
households/{householdId}
├── name: string
├── inviteCode: string (unique, 8-char)
├── createdBy: string (uid)
├── createdAt: timestamp
├── memberCount: number (denormalized for queries)
└── members: {  // map, keyed by uid
      [uid]: {
        displayName: string,
        role: "admin" | "member",
        joinedAt: timestamp
      }
    }

users/{uid}
├── displayName: string
├── email: string
└── households: string[]  // array of householdId refs
```

### Why members as a map inside household doc (not subcollection)?

- MVP will have ≤10 members per household. Map is simpler, fewer reads.
- Entire household + members in one read.
- Real-time listener on one doc covers roster changes.
- If scale needed later, migrate to subcollection.

### Why `users/{uid}.households` array?

- Query "which households does this user belong to?" without scanning all households.
- Kept in sync: write to both on join/leave.

## Firestore Security Rules (household module)

```javascript
match /households/{householdId} {
  // Any authenticated user can create
  allow create: if request.auth != null
                && request.resource.data.members[request.auth.uid] != null;

  // Only members can read
  allow read: if request.auth != null
              && resource.data.members[request.auth.uid] != null;

  // Only members can update (role-specific checks in app logic)
  allow update: if request.auth != null
                && resource.data.members[request.auth.uid] != null;

  // Only admin can delete
  allow delete: if request.auth != null
                && resource.data.members[request.auth.uid].role == "admin";
}

match /users/{uid} {
  allow read, write: if request.auth != null && request.auth.uid == uid;
}
```

### Invite code join — special case

Joining by invite code requires reading a household doc the user isn't a member of yet. Options:
1. **Client queries by `inviteCode` field** — requires a Firestore index and a rule that allows reading by invite code.
2. **Separate `inviteCodes/{code}` collection** mapping code → householdId. Public-readable, tiny doc.

**Decision: Option 2.** Cleaner security boundary. Invite code lookup doesn't expose household data.

```
inviteCodes/{code}
├── householdId: string
├── createdAt: timestamp

// Security rule:
match /inviteCodes/{code} {
  allow read: if request.auth != null;  // any authenticated user can look up
  allow write: if false;  // only written by household create/regenerate logic
}
```

Invite code writes happen in a batched write alongside household creation — atomic.

## Interface Contract (provided to downstream modules)

```jsx
// HouseholdContext provides:
{
  currentHousehold: {
    id: string,
    name: string,
    inviteCode: string,
    members: { [uid]: { displayName, role, joinedAt } },
    memberCount: number,
  } | null,
  households: { id, name }[],  // all user's households (summary)
  loading: boolean,
  error: string | null,
}

// useHousehold() hook provides:
{
  ...context,                                    // everything above
  createHousehold(name),                         // → Promise<householdId>
  joinHousehold(inviteCode),                     // → Promise<void>
  leaveHousehold(),                              // → Promise<void>
  removeMember(uid),                             // → Promise<void> (admin only)
  regenerateInviteCode(),                        // → Promise<string> (admin only)
  switchHousehold(householdId),                  // → void (local state)
  getMembersList(),                              // → { uid, displayName, role }[]
}
```

## Project Structure (household module)

```
src/modules/household/
├── HouseholdContext.jsx    # React context for current household
├── useHousehold.js         # Hook: CRUD, join, leave, switch
├── householdService.js     # Firestore operations (read/write)
├── inviteCodeUtils.js      # Generate/validate invite codes
├── HouseholdListPage.jsx   # List user's households, create/join
├── HouseholdSettingsPage.jsx  # Members list, invite code, remove/leave
└── index.js                # Public exports
```

## Testing Strategy

| Level | What | How |
|---|---|---|
| Unit | `inviteCodeUtils`, `householdService` logic | Vitest, mock Firestore |
| Integration | Create → join → leave flows | Vitest + React Testing Library, mock Firestore |
| Manual | Real-time member list updates, multi-household switching | Browser test |

Tests in `src/modules/household/__tests__/`.

## Boundaries

### Always
- Batch writes when updating both `households` and `users` docs (atomic)
- Validate invite code format before Firestore query
- Show clear error on invalid/expired invite code
- Update `memberCount` on every join/leave

### Ask First
- Changing max members per household
- Adding household deletion feature
- Adding member roles beyond admin/member

### Never
- Let non-members read household data
- Delete user auth account when removing from household
- Store invite codes in plain text in client-side storage

## Success Criteria

1. User creates household → gets invite code → shares with flatmate.
2. Flatmate joins with code → appears in member list in real-time.
3. Admin removes member → member disappears, their `users` doc updated.
4. Member leaves → removed from household, `users` doc updated.
5. User with multiple households can switch between them.
6. Invalid invite code → clear error message.
7. All Firestore writes are batched (household + user docs atomic).
8. Security rules prevent non-member access.

## Open Questions

None.

## Dependencies

- **Consumes from identity:** `user.uid`, `user.displayName` via `useAuth()`.
- **Provides to chores:** `currentHousehold.id`, `currentHousehold.members`.
- **Provides to turn-engine:** `getMembersList()` for combo-mode generation.
