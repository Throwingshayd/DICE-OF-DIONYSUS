---
name: dice-ship
description: >-
  Default workflow for Dice of Dionysus changes—verify, RNG/save guardrails, and
  where to edit. Use for features, fixes, cleanup, or deslop passes on game/js.
---

# Dice of Dionysus — ship / change workflow

## When to use

- Any change under `game/js/`, `game/css/`, tests, or tooling that affects the playable game.
- Cleanup, deslop, refactors, or new content (cards, UI, scoring, shop).

## Before you edit

1. Read **SOUL.md** § “For Cursor” + **RNG** + **Routing** (one pass).
2. Open **`.cursor/PATHWAYS.md`** if you need a path map.
3. Load the **smallest** set of `.cursor/rules/*.mdc` files for the task (see SOUL routing table).

## Guardrails

- **State:** `GameEngine.state` remains the single source of truth for the run.
- **RNG:** Gameplay/outcome → run `prng`. Cosmetic-only jitter may use `Math.random()` (see SOUL).
- **Saves:** If you change persisted shape, bump `dataManager` version and handle migration or document reset—do not silently corrupt saves.
- **Cards:** New data in `game/js/data/gameData.js`; effects in the matching class (`Boon`, `LibationCard`, `WorshipCard`).
- **Scoring:** Go through `ScoringEngine` / `HandEvaluator` / constants—don’t bypass for feature logic.

## Workflow

1. Touch the **smallest** set of files that solves the task.
2. Match existing style; avoid drive-by rewrites unrelated to the request.
3. Run verification (below); fix lint/tests before handing off.

## Verification

```bash
npm run lint:fix
npm run test
npm run build
```

- **`npm run dev`** — smoke load after UI/game flow changes.
- **`npm run playtest:boons`** — after boon timing, shop, or consumable flow changes.

Deep testing notes: `.cursor/tester/TESTING.md`, rule **3-automation.mdc**.

## Output

- Short summary of what changed and **which commands you ran** (and results).
- If you skipped `playtest:boons`, say why (e.g. CSS-only change).

## Boon `before_score` layout

- **`game/js/classes/boonTimingHandlers.js`** — `BoonTimingHandlers.runBeforeScore(boon, gameState, result)` holds the big `before_score` switch (loaded before `Boon.js` in `game/index.html`). Add or edit boon behavior there for `before_score`; keep `Boon.js` for other timings and helpers.
- Regenerate from source if needed: `node tools/extract-boon-before-score.mjs` then `node tools/assemble-boon-handlers.mjs` (after restoring a monolithic switch in `Boon.js`).

## Follow-ups (optional / larger)

- Extract **`after_roll`**, **`turn_start`**, **`ante_end`**, etc. into the same module (or sibling files) the same way when maintainability wins.
- **Cosmetic RNG:** Threading `prng` through particles/SFX is optional for replay-identical VFX; not required by SOUL.
