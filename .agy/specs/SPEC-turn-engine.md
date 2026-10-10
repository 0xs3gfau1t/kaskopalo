# Spec: turn-engine

## Objective

Core algorithmic module. For every chore × every combination-mode of household members, maintain an independent round-robin turn queue with skip/debt support and manual assignment. This is the module that answers "whose turn is it?"

### User Stories

1. **As a member**, I select a chore and a mode (which flatmates are participating) → I see whose turn it is.
2. **As a member**, I mark a chore as done → turn advances to next person in the rotation.
3. **As a member**, I skip someone's turn because they're unavailable → their turn becomes debt, next person takes over.
4. **As a member**, I manually assign "who did it" to a specific person → that person's debt decreases or queue adjusts.
5. **As a member**, when a skipped person becomes available, their owed turns are at the front of the queue.
6. **As a member**, I see the current debt count for each person (how many turns they owe).
7. **As a member**, modes are auto-generated when the roster changes (add/remove member).

### Acceptance Criteria

- For N members, all subsets of size ≥ 2 are valid modes. Count = C(N,2) + C(N,3) + … + C(N,N) = 2^N - N - 1.
- Each (chore, mode) pair has its own independent queue.
- Queue is a round-robin ordered by member join order within that mode.
- "Mark done" by current-turn person → advances pointer to next in rotation.
- "Mark done" by someone NOT current-turn → treated as manual assignment, adjusts that person's debt.
- "Skip" → current person's debt increments by 1, pointer moves to next non-skipped person.
- Debt resolution: when a person with debt > 0 comes up in rotation, they stay as "current turn" until debt is cleared (they do consecutive turns equal to their debt + 1 regular turn).
- Mode labels are auto-generated from member display names, sorted alphabetically. E.g., for members Alice, Bob, Charlie: mode "Alice, Bob" = the AB mode.
- Modes regenerate when roster changes. New member → new modes appear. Removed member → their modes become inactive (not deleted — historical data preserved).

## Core Algorithm

### Data Structures

```
TurnQueue {
  choreId: string,
  modeKey: string,          // sorted member UIDs joined by "+"
  modeLabel: string,        // sorted display names joined by ", "
  rotation: string[],       // ordered UIDs in round-robin sequence
  currentIndex: number,     // pointer into rotation
  debt: { [uid]: number },  // owed turns per member
  history: not in MVP,      // deferred
}
```

### Round-Robin Logic

```
function getWhoseTurn(queue):
  uid = queue.rotation[queue.currentIndex]
  // If this person has debt, they remain current until debt cleared
  return uid

function markDone(queue, doneByUid):
  currentUid = queue.rotation[queue.currentIndex]

  if doneByUid == currentUid:
    // Regular completion
    if queue.debt[currentUid] > 0:
      queue.debt[currentUid] -= 1
      // Stay at same index — still owes turns
    else:
      queue.currentIndex = (queue.currentIndex + 1) % queue.rotation.length
  else:
    // Manual assignment — someone else did it
    if queue.debt[doneByUid] > 0:
      queue.debt[doneByUid] -= 1
    // Don't advance pointer — current person still needs to do their turn

function skip(queue, skipUid):
  if skipUid == queue.rotation[queue.currentIndex]:
    queue.debt[skipUid] = (queue.debt[skipUid] || 0) + 1
    queue.currentIndex = (queue.currentIndex + 1) % queue.rotation.length
```

### Mode Generation

```
function generateModes(memberUids):
  modes = []
  for size from 2 to memberUids.length:
    for each combination of memberUids of that size:
      modeKey = combination.sort().join("+")
      modes.push({ modeKey, members: combination })
  return modes
```

For practical limits:
- 2 members → 1 mode
- 3 members → 4 modes
- 4 members → 11 modes
- 5 members → 26 modes
- 6 members → 57 modes

Cap at 8 members per household for MVP (247 modes). Beyond that, UI becomes unwieldy.

## Firestore Data Model

```
households/{householdId}/chores/{choreId}/turnQueues/{modeKey}
├── modeKey: string           // "uid1+uid2+uid3" (sorted)
├── modeLabel: string         // "Alice, Bob, Charlie"
├── rotation: string[]        // [uid1, uid2, uid3] in join order
├── currentIndex: number      // pointer
├── debt: map { [uid]: number }  // { "uid1": 0, "uid2": 2 }
├── active: boolean           // false if a member was removed from household
├── createdAt: timestamp
├── updatedAt: timestamp
```

### Why subcollection under chores?

- Natural hierarchy: household → chore → turn queues per mode.
- Each turn queue is independent — subcollection avoids bloating chore doc.
- `modeKey` as document ID = natural unique key, no index needed for lookup.

### Scaling note

For 5 members × 10 chores = 260 turn queue docs. Each doc is tiny (~200 bytes). Well within Firestore limits. Reads are targeted (one doc per chore+mode view).

## Firestore Security Rules

```javascript
match /households/{householdId}/chores/{choreId}/turnQueues/{modeKey} {
  // Only household members
  allow read, write: if request.auth != null
    && get(/databases/$(database)/documents/households/$(householdId))
       .data.members[request.auth.uid] != null;
}
```

## Interface Contract

```jsx
// useTurnEngine(householdId, choreId) hook provides:
{
  modes: [
    {
      modeKey: string,
      modeLabel: string,
      memberCount: number,
    }
  ],
  loading: boolean,
  error: string | null,

  // Get queue for specific mode
  getQueue(modeKey),            // → TurnQueue | null

  // Actions
  markDone(modeKey, doneByUid), // → Promise<void>
  skip(modeKey, skipUid),       // → Promise<void>
  initializeQueues(members),    // → Promise<void> (called when roster changes)
}

// useTurnSummary(householdId) — convenience hook for dashboard
{
  // For each chore × selected mode, who's up?
  summaries: [
    {
      choreId: string,
      choreName: string,
      modeKey: string,
      modeLabel: string,
      currentTurnUid: string,
      currentTurnName: string,
      debt: { [uid]: number },
    }
  ],
  loading: boolean,
}
```

## Mode Selection UX

Modes are auto-generated but user must SELECT which mode is active for a chore:
- Default mode on chore creation = all members (full household mode).
- User can switch mode per chore (e.g., "tonight only Alice and Bob are eating").
- Selected mode is a UI concern stored in `localStorage` or user preferences, NOT in Firestore (it changes constantly per session).

Wait — rethinking. The user said modes represent different subsets for when different people are present. Each mode has its own independent history. So it's not "switch mode" but "pick which mode applies right now." All modes coexist. The dashboard would show the current-turn person for EACH mode, and the user picks the relevant one.

**Decision: Show all modes for a chore. User taps the relevant mode to mark done/skip. No "active mode" state needed.**

## Queue Initialization

When a new chore is created OR household roster changes:

1. Generate all valid modes from current roster.
2. For each mode, check if turn queue doc exists:
   - Exists → leave it (preserve history/position).
   - Doesn't exist → create with `currentIndex: 0`, all debt = 0, rotation = sorted UIDs.
3. For modes that reference removed members → set `active: false`.

This runs client-side on roster change detection (listener on household doc).

## Project Structure

```
src/modules/turn-engine/
├── turnEngine.js            # Core algorithm (pure functions, no Firebase)
├── modeGenerator.js         # Combination generation
├── useTurnEngine.js         # Hook: per-chore turn management
├── useTurnSummary.js        # Hook: dashboard summary across all chores
├── turnQueueService.js      # Firestore operations
├── TurnDashboard.jsx        # Main view: all chores × modes
├── TurnActions.jsx          # Mark done / skip / assign UI
├── ModeSelector.jsx         # Mode picker within a chore
├── DebtBadge.jsx            # Shows debt count per member
└── index.js                 # Public exports
```

## Testing Strategy

| Level | What | How |
|---|---|---|
| Unit | `turnEngine.js` — markDone, skip, debt logic | Vitest, pure functions, no mocks needed |
| Unit | `modeGenerator.js` — combination generation | Vitest, pure functions |
| Integration | Full flow: init → markDone → skip → debt resolution | Vitest, mock Firestore |
| Edge cases | Single debt, multi-debt, skip-all-but-one, roster change mid-rotation | Vitest |
| Manual | Two users marking done concurrently | Browser test |

Tests in `src/modules/turn-engine/__tests__/`.

**`turnEngine.js` and `modeGenerator.js` are pure functions — most testable module in the project.**

## Boundaries

### Always
- Keep turn logic in pure functions (testable without Firebase)
- Validate modeKey contains only valid member UIDs
- Handle concurrent writes (Firestore transactions for markDone/skip)
- Preserve existing queue state on roster change (don't reset positions)

### Ask First
- Adding turn history/log
- Changing debt resolution strategy
- Adding turn swap between members
- Raising member cap above 8

### Never
- Store turn logic inside chore docs (separation of concerns)
- Reset queue position when roster changes (unfair)
- Allow negative debt
- Delete turn queue docs on roster change (mark inactive instead)

## Success Criteria

1. 3 members (A, B, C), chore "Garbage", mode ABC: A's turn → mark done → B's turn → mark done → C's turn → mark done → back to A.
2. Skip B → B gets debt=1, C's turn. Next time B comes up, B stays for 2 consecutive turns (1 debt + 1 regular).
3. B manually does chore while it's A's turn → B's debt decreases, A still needs to do their turn.
4. Add member D → new modes appear (AD, BD, CD, ABD, ACD, BCD, ABCD). Existing modes unchanged.
5. Remove member C → modes containing C become inactive. Other modes unchanged.
6. Modes for 4 members = 11. Verify all generated correctly.
7. Concurrent markDone from two users → no data corruption (Firestore transaction).

## Open Questions

None.

## Dependencies

- **Consumes from household:** member list (`getMembersList()`) for mode generation.
- **Consumes from chores:** chore IDs to scope turn queues.
- **Provides to ui-shell:** `useTurnSummary()` for dashboard.
