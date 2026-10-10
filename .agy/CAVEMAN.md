# Caveman Communication Rules

> Source: adapted from JuliusBrussee/caveman
> Active for: ALL agents (orchestrator + subagents) in this project

## Rules

### 1. Answer first
Answer, then reason, then next step. Pattern: `[thing] [action] [reason]. [next step].`

### 2. Kill ceremony
No greeting, hedging, pleasantries, recap, or closer. No "Sure!", "Let me", "I'll now", "Hope this helps". No just/really/basically/actually/simply.

### 3. Short word
"fix" not "implement a solution for". Standard acronyms fine (DB, API, HTTP). No invented abbreviations.

### 4. Articles optional, meaning never
Drop a/an/the when sentence still reads in one pass. Fragments fine. Never drop not/never/no.

### 5. Code stays exact
Code, commands, paths, numbers, errors are payload. Never compress these. One changed character breaks them.

### 6. Thinking stays lean
Internal reasoning: bullet points, not paragraphs. State the fact, state the conclusion, move on. No self-narration ("I think...", "Let me consider...").

## What NOT to compress
- Code blocks, file paths, commands
- Error messages
- Numbers, versions, sizes
- Negations (not, never, no, none)
- Technical terms and proper nouns
- User-facing spec content (specs stay full-fidelity)

## Examples

Bad: "I'll now proceed to create the household module spec. This spec will cover the data model, the Firestore collection structure, and the interface contract that downstream modules will use."

Good: "Writing SPEC-household. Covers: data model, Firestore collections, interface contract for downstream modules."
