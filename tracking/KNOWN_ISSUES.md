# Known Issues

**Single source of truth** for current bugs, incomplete features, and technical debt.  
Update this file when fixing or discovering issues. See also: `BUGS_FIXED_LOG.md` (historical).

**Last deep scan:** 2026-04-10 — module sizes, tests, `GameEngine` assessment, and `isAwaitingApi` removal synced with repo.

---

## Repository snapshot (engineering)

Line counts are **approximate** (include blanks); rerun `(Get-Content path).Count` on Windows when updating.

| Module | Path | Lines (Apr 2026) | Note |
|--------|------|------------------|------|
| Game engine | `game/js/game/GameEngine.js` | **~3,285** | Primary god object; ~90+ public methods |
| Boon class | `game/js/classes/Boon.js` | ~1,076 | Timing hooks + helpers |
| `before_score` hub | `game/js/classes/boonTimingHandlers.js` | ~620 | Extracted switch; see dice-ship SKILL |
| Main / app shell | `game/js/Main.js` | ~771 | Entry, menus, wiring |
| Libation | `game/js/classes/LibationCard.js` | ~758 | |
| Shop UI | `game/js/ui/ShopUI.js` | ~670 | Stock via `ShopStockGenerator` |
| Balatro-style FX | `game/js/ui/BalatroEffects.js` | ~690 | |
| UI coordinator | `game/js/ui/UIManager.js` | **~381** | Delegates shop to `ShopUI`; renderers under `ui/renderers/` |
| Die | `game/js/classes/Die.js` | ~490 | |
| Shop stock | `game/js/engine/ShopStockGenerator.js` | ~285 | |
| Scoring | `game/js/engine/ScoringEngine.js` | ~170 | Orchestrator |
| Hand evaluation | `game/js/engine/HandEvaluator.js` | ~122 | Pure category logic |

**Automated tests (Vitest):** `npm run test` → `vitest run`  
- `tests/unit/dice-roll.test.js` — roll formula / max face  
- `tests/unit/seeded-rng-determinism.test.js` — same-seed reproducibility  
- `tests/unit/shop-expulsion-dom-guard.test.js` — expulsion DOM precondition (soft-lock regression)  
- `tests/unit/info-bar-roll-button.test.js` — roll button disable rules  
- `tests/unit/game-timing.test.js` — `GameTiming.scaleDelay` contract (mirrors `game/js/utils/GameTiming.js`)  
- `tests/unit/scoring-engine-context.test.js` — `buildContext` shape (mirrors `ScoringEngine.buildContext`)  

**E2E (Playwright):** `npm run playtest:boons` — `tests/e2e/boon-playtest.spec.js` (each test clears `diceOfDionysus_*` `localStorage` so auto-save does not leak between specs; **68** cases as of 2026-04-10).

---

## Soft-lock triage (process)

When a player or tester reports a **stuck** run (cannot roll, score, leave shop, or close expulsion):

1. Capture **seed**, **URL/query** (`?test=`), and **last action** (shop buy, pack, cashout).
2. Add a row under **Player-Facing** or a new table here with **Open** / **Repro OK** until fixed.
3. Cross-check [`SOFT_LOCK_SWEEP.md`](SOFT_LOCK_SWEEP.md); if the flow changed, append a sweep note or new row there.
4. Fix → [`BUGS_FIXED_LOG.md`](BUGS_FIXED_LOG.md); remove from this file when closed.

**As of last review (2026-04-10):** no new repros beyond documented expulsion / `isAwaitingApi` cleanup — monitor **cashout timers**, **pack + expulsion**, **full grid + ante end**.

**PWA:** Service worker registration in `Main.js`; manifest linked in `game/index.html` (HTTPS / localhost).

---

## Mechanics Not Implemented

| Issue                  | Status      | Notes                                                                                |
| ---------------------- | ----------- | ------------------------------------------------------------------------------------ |
| **Mirror enhancement** | Implemented | Scores twice (Balatro Red Seal), including iron/mother-of-pearl.                     |
| **Parmenides Die**     | Implemented | Pantheon swap: scores go to corresponding upper↔lower slot (Ones↔3oK, etc.).         |
| **The Heretic**        | Implemented | +2 pips/turn (stacks); resets at ante_end or when worship used; pip tooltip on card. |

---

## Boons to Verify

| Boon                | Status      |
| ------------------- | ----------- |
| Tantalus' Curse     | Implemented |
| Golden Touch        | Verified    |
| Message in a Bottle | Implemented |
| Apollo's Oracle     | Implemented |

---

## Technical Debt

| Item | Status / notes |
|------|----------------|
| **`GameEngine.js` monolith** | **High** — single file owns state, DOM binding, roll/score pipeline, shop handoff, cashout timers, save/load, many animations. Splitting requires explicit design (see `.cursor/context/ARCHITECTURE.md` § GameEngine). |
| **`isAwaitingApi` flag** | **Removed (2026-04-10)** — was never set `true`; dropped from `GameEngine.state`, roll/score gates, `canSave()`, and `InfoBarRenderer`. If async scoring returns later, introduce an explicit `processingPhase` or similar with a documented state machine. |
| **`UIManager.js` size** | **Improved** — ~380 lines; shop/expulsion live in `ShopUI.js`. Further splits are optional. |
| **Boon timing surface** | **Medium** — `Boon.js` + `boonTimingHandlers.js` + `GameEngine` still interleave; see `BOON_INTERACTION_MATRIX.md`. |
| **Console logging** | Core paths use **Logger**; routine `console.*` should stay confined to `Logger.js`. |
| **Test coverage** | **Medium** — unit tests cover RNG, roll math, and two UI invariants; E2E is one boon playtest spec. Multi-boon combos remain manual / protocol-driven. |

---

## Player-Facing

| Item                | Status                                                    |
| ------------------- | --------------------------------------------------------- |
| No in-game tutorial | Fixed — first-run overlay when showTutorial enabled       |
| Mobile              | Fixed — game scales to viewport; works in any window size |
| Settings options    | Fixed — docs/SETTINGS.md documents all options            |

---

## GameEngine (concise assessment)

See **`.cursor/context/ARCHITECTURE.md`** for the full “Monolithic GameEngine” subsection. In short: `GameEngine` is the authoritative run loop and state holder; risk is **regression surface** on any change (roll → score → ante → shop → save). Preferred future direction: extract **pure** helpers (already partly done with `ScoringEngine` / `HandEvaluator` / `ShopStockGenerator`) before any large file split.

---

## When Updating

- **Fix a bug** → Add to BUGS_FIXED_LOG.md, remove from here if listed
- **Implement Mirror** → Remove from "Mechanics Not Implemented" (already implemented — keep table in sync if mechanics change)
- **Add tests** → Update the “Automated tests” table above
- **New known issue** → Add to appropriate section above
