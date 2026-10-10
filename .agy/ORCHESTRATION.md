# Kaskopalo — Agent Orchestration Model

## Communication
All agents follow `.agy/CAVEMAN.md` — terse output, answer first, no filler. Specs stay full-fidelity.

## Principle

Use right model tier for right task. Optimize cost and quality.

## Tiers

| Tier | Model | Used For |
|---|---|---|
| **Opus** (orchestrator) | Claude Opus 4.6 | Design, architecture, spec authoring, critical thinking, code review, debugging complex issues |
| **Flash** (flash-coder) | Flash | Code generation, boilerplate, config files, mechanical implementation from specs |
| **Flash** (flash-writer) | Flash | Documentation, README, markdown writing, non-design docs |

## Routing Rules

### Opus handles:
- Capability map design
- Module spec authoring (design thinking)
- Data model design (Firestore schema)
- Algorithm design (turn-engine logic)
- Security rules design (Firestore rules)
- Code review of flash output
- Debugging complex issues
- Architecture decisions

### Flash-coder handles:
- Implementing code from approved specs
- Writing React components from detailed briefs
- Writing Firebase config/setup code
- Writing tests from test plans
- Scaffolding project structure
- Writing boilerplate (package.json, vite config, etc.)

### Flash-writer handles:
- Writing README.md
- Writing non-design documentation
- Formatting/polishing markdown docs
- Writing inline code comments from briefs

## Workflow

```
User request
    │
    ▼
Opus (orchestrator)
    │
    ├── Design work? → Opus does it directly
    │
    ├── Code generation? → Opus writes detailed brief → flash-coder implements
    │
    └── Doc writing? → Opus writes outline → flash-writer writes it
```

## Quality Gate

Opus reviews all flash-coder output before marking tasks complete.
