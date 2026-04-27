# Agentic Operating System

Purpose: maximize delivery speed between chats while keeping quality high.

Use this as the single source of truth for how work is selected, executed, verified, and handed off.

## 1) Core Loop (always)

1. Pick one concrete outcome from `STATUS.md` (single session target).
2. Implement the smallest vertical slice that achieves it.
3. Run verification commands from `NEXT_SESSION.md`.
4. Update `STATUS.md`, `DECISIONS.md`, and `NEXT_SESSION.md` before ending.

No evidence, no done.

## 2) Session Types

- Stability: regressions, bugs, soft locks, broken UI behavior.
- UX/Feel: clarity, responsiveness, readability, friction removal.
- Balance/Content: tuning values, content interactions, game feel.

Priority order: Stability -> UX/Feel -> Balance/Content.

## 3) Hard Constraints

- Keep dev server standard on port `3000`.
- Prefer small diffs over broad refactors.
- If same subsystem gets patched 3 times, switch to focused rebuild.
- Add a test when fixing a recurring bug.
- Delete dead code/docs as part of housework.

## 4) Definition of Done

A task is done only when all are true:

- The requested behavior works in-game.
- Relevant tests pass (or explicit reason recorded).
- Any notable risk is documented in `STATUS.md`.
- Next action is pre-written in `NEXT_SESSION.md`.

## 5) Chat Bootstrap (copy/paste)

Use this at start of any new chat:

1) Read `OPERATING_SYSTEM.md`, `STATUS.md`, `NEXT_SESSION.md`, and `DECISIONS.md`.
2) Execute the first task in `NEXT_SESSION.md`.
3) Apply smallest viable change.
4) Run listed verification commands.
5) Update all three files with outcomes and next step.

