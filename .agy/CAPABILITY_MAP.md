# Kaskopalo — Capability Map

> **Status:** APPROVED (2026-10-10)

## Modules

| Module id | Responsibility | Depends on |
|---|---|---|
| `identity` | Firebase Auth — register, login, logout, session management | — |
| `household` | Create household, invite/join via code, add/remove members, edit roster | `identity` |
| `chores` | Create/edit/delete chores within a household | `household` |
| `turn-engine` | Combination-mode generation, round-robin queues per mode, skip/debt tracking, manual assignment, "mark done" | `household`, `chores` |
| `ui-shell` | React app shell, routing, responsive mobile-first views, connecting all modules | `identity`, `household`, `chores`, `turn-engine` |

## Build Order

```
identity → household → chores → turn-engine → ui-shell
```

## Dependency Graph

```
identity
   │
   ▼
household
   │
   ├──────────┐
   ▼           ▼
chores    turn-engine ← chores
   │           │
   └─────┬─────┘
         ▼
      ui-shell
```

## Module Boundaries

- **identity** owns all Firebase Auth interactions. Other modules call identity's hooks/context, never Firebase Auth directly.
- **household** owns the Firestore `households` collection and member management. Provides the current household context to downstream modules.
- **chores** owns the chore CRUD within a household. Does NOT own turn logic.
- **turn-engine** owns all turn-rotation logic: generating combination modes from roster, maintaining per-mode queues, skip/debt accounting, advancing turns. This is the core algorithmic module.
- **ui-shell** owns routing, layout, and page composition. It imports components/hooks from other modules but contains no business logic of its own.

## Notes

- Each module will get its own spec (`SPEC-{module-id}.md`) written and approved in build order.
- Interfaces between modules are defined in the provider module's spec.
