# Spec: chores

## Objective

CRUD for chores within a household. A chore is a named task (garbage, bathroom, cooking, etc.) that the turn-engine rotates. This module owns chore lifecycle only — turn logic belongs to `turn-engine`.

### User Stories

1. **As a household member**, I can add a new chore with a name.
2. **As a household member**, I can see all chores in my household.
3. **As a household member**, I can edit a chore's name.
4. **As a household member**, I can delete a chore (with confirmation).
5. **As a household member**, chore list updates in real-time when another member adds/removes.

### Acceptance Criteria

- Chore name required, 1–50 chars, trimmed.
- No duplicate chore names within same household (case-insensitive check).
- Deleting a chore also cleans up associated turn-engine data (turn-engine handles its own cleanup via listener or cascading delete).
- Any member can add/edit/delete chores (no admin-only restriction for MVP).
- Chore list sorted alphabetically by default.
- Real-time sync via Firestore `onSnapshot`.

## Firestore Data Model

```
households/{householdId}/chores/{choreId}
├── name: string
├── createdBy: string (uid)
├── createdAt: timestamp
├── updatedAt: timestamp
```

### Why subcollection (not array/map in household doc)?

- Chores have independent lifecycle from household metadata.
- Subcollection allows querying/listening to chores without pulling full household doc.
- Each chore will have associated turn-engine data — subcollection keeps the boundary clean.
- No document size limit concerns as chore count grows.

## Firestore Security Rules

```javascript
match /households/{householdId}/chores/{choreId} {
  // Only household members can read
  allow read: if request.auth != null
              && get(/databases/$(database)/documents/households/$(householdId))
                 .data.members[request.auth.uid] != null;

  // Only household members can create/update
  allow create, update: if request.auth != null
              && get(/databases/$(database)/documents/households/$(householdId))
                 .data.members[request.auth.uid] != null;

  // Only household members can delete
  allow delete: if request.auth != null
              && get(/databases/$(database)/documents/households/$(householdId))
                 .data.members[request.auth.uid] != null;
}
```

Note: all three rules have same condition for MVP. Split now for future differentiation (e.g., admin-only delete).

## Interface Contract (provided to downstream modules)

```jsx
// useChores(householdId) hook provides:
{
  chores: [
    { id: string, name: string, createdBy: string, createdAt: timestamp }
  ],
  loading: boolean,
  error: string | null,
  addChore(name),           // → Promise<choreId>
  updateChore(choreId, name), // → Promise<void>
  deleteChore(choreId),     // → Promise<void>
}
```

## Project Structure (chores module)

```
src/modules/chores/
├── useChores.js            # Hook: CRUD operations + real-time listener
├── choreService.js         # Firestore operations
├── ChoreListPage.jsx       # Display chores, add/edit/delete UI
├── ChoreForm.jsx           # Add/edit form component
└── index.js                # Public exports
```

## Testing Strategy

| Level | What | How |
|---|---|---|
| Unit | `choreService` CRUD, name validation/dedup | Vitest, mock Firestore |
| Integration | Add → list → edit → delete flow | Vitest + React Testing Library |
| Manual | Real-time sync across two browsers | Browser test |

Tests in `src/modules/chores/__tests__/`.

## Boundaries

### Always
- Validate chore name (non-empty, ≤50 chars, trimmed)
- Check duplicate names before create/update (case-insensitive)
- Confirm before delete (UI-level)
- Set `updatedAt` on every write

### Ask First
- Adding chore categories/tags
- Adding chore frequency/schedule
- Restricting who can delete chores

### Never
- Store turn data inside chore documents (that's turn-engine's domain)
- Allow empty chore names
- Delete chores without user confirmation

## Success Criteria

1. Member adds chore "Garbage" → appears in list immediately.
2. Another member sees "Garbage" appear in real-time.
3. Edit "Garbage" → "Take out garbage" → updates in real-time.
4. Duplicate name "Garbage" (case-insensitive) → error.
5. Delete chore → confirmation dialog → removed from list.
6. Non-member cannot read/write chores (security rules).

## Open Questions

None.

## Dependencies

- **Consumes from household:** `currentHousehold.id` to scope chore subcollection.
- **Provides to turn-engine:** chore IDs for associating turn queues.
