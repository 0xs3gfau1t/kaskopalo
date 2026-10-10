# Kaskopalo — Project State

> This directory maintains portable project state for agent continuity.
> Any agent or model can read these files to understand where the project is
> and resume work from the current checkpoint.

## Directory Structure

```
.agy/
├── README.md              # This file
├── PROJECT.md             # Project concept, intent, tech stack, constraints
├── STATUS.md              # Current phase, checkpoint, what's done, what's next
├── CAPABILITY_MAP.md      # Module boundaries, dependencies, build order
├── CHECKLIST.md           # Master checklist across all phases
├── decisions/             # Key decisions log (one file per decision)
│   └── 001-initial-intent.md
├── specs/                 # Module specs (one per module)
└── plans/                 # Implementation plans
```

## How to Use

1. **Start here:** Read `STATUS.md` to know where you are.
2. **Understand the project:** Read `PROJECT.md` for full context.
3. **See module structure:** Read `CAPABILITY_MAP.md` for boundaries and build order.
4. **Track progress:** Read `CHECKLIST.md` for what's done and what's pending.
5. **Check decisions:** Read `decisions/` for the reasoning behind key choices.
6. **Read specs:** Read `specs/` for approved module specifications.
7. **Read plans:** Read `plans/` for implementation plans.
