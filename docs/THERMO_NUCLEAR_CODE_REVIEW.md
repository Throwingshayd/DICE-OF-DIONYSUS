# Thermo-Nuclear Code Quality Review

**Branch:** `audit/thermo-nuclear-review`  
**Baseline:** `main` @ `852f6f3` (UI consistency + Morris theme + checklist e2e)  
**Reviewer:** Cursor Agent (Team Kit `thermo-nuclear-code-quality-review` skill)  
**Date:** 2026-06-03

---

## Verdict

**NOT APPROVED** for continued growth in monolith files without a decomposition plan.

Behavior and recent UI work are directionally good (card contract, `card-present.css`, drag surface, tests). The codebase is **accumulating structural debt** in a few files that already exceed healthy size boundaries. Further feature work should **extract before expand**, especially around live score and `GameEngine`.

---

## Size snapshot (game/js)

| Lines | File | Status |
|------:|------|--------|
| 3188 | `game/js/game/GameEngine.js` | **Critical** — far past 1k |
| 1030 | `game/js/classes/Boon.js` | **Over 1k** |
| 1028 | `game/js/ui/UIManager.js` | **Over 1k** (recent UI pass +422 lines) |
| 781 | `game/js/ui/ShopUI.js` | High but bounded |
| 767 | `game/js/ui/BalatroEffects.js` | High; tooltip system owns complexity |
| 766 | `game/js/Main.js` | App + `CollectionManager` combined |

Recent `main` UI work (`main~5..main`): net +1k lines across JS/CSS with **`UIManager.js` and `card-present.css` as largest growth centers**.

---

## P0 — Structural regressions / blockers

### 1. `GameEngine.js` is a god object

**Finding:** One class owns run state, scoring math entry, sequential scoring animation, live-score preview, cashout ticker, shop open/close, dice roll, ante flow, save hooks, and DOM orchestration.

**Why it blocks:** Every new feature (Gnosis preview, cashout beats, shop timing) adds branches to an already unreadable file. Tests cannot target subsystems without booting the full engine.

**Code judo (preferred):** Extract focused modules with stable APIs:

| Extract | Owns | GameEngine keeps |
|---------|------|------------------|
| `LiveScoreController` | `scheduleLiveScorePreview`, `updateLiveScoreDisplay`, `updateLiveScoreValues`, cashout ticker in `showInterestThenOpenShop` | Delegation + `dom` refs |
| `ScoringAnimation` | `animateSequentialScoring`, popups, jiggle, count-up | `confirmScore` / `finalizeScoring` calls |
| `ShopFlow` (or use `ShopUI` only) | `openShop`, `closeShop`, interest → shop transition | State flags only |

**Target:** `GameEngine.js` under **~1,800 lines** after first pass; second pass can push scoring wrapper out entirely.

---

### 2. `UIManager.js` crossed 1k during UI consistency work

**Finding:** Recent diff added substantial drag/zone logic while retaining restore/rebind, shop facade, consumable horizon, and boon reorder.

**Why it blocks:** Skill rule — PRs should not push files from under 1k to over 1k without strong justification. UI consistency **improved** product quality but **worsened** file cohesion.

**Code judo:**

- Move **all pointer-drag policies** to `game/js/ui/drag/` (`ConsumableDragController`, `BoonDragController`) using existing `CardDragSurface` + `PointerDragGhost`.
- `UIManager` becomes: bind DOM, delegate to renderers, wire shop facade.
- **Delete** duplicate shop-drag patterns where `ShopUI` and `UIManager` both implement “point in rect” / glow classes.

---

### 3. Live score has **three** scoring-adjacent paths (drift risk)

**Finding:**

1. `calculateScore()` — pipeline + legacy fallback + large defensive preamble (~200 lines).
2. `updateLiveScoreDisplay()` — calls `calculateScore`, then **re-runs** `before_score` boon loop when `!fromPipeline` (lines ~2847–2854).
3. `animateSequentialScoring()` — rebuilds dice/boon contributions via `getDiceContributions` / `getBoonContributions`, not the pipeline output.

**Symptom history:** Double pips/favour labels, layout shift on hover vs commit — classic “two sources of truth” bugs.

**Code judo:** One canonical preview result:

```text
ScoringEngine.runPipeline(category, state, opts)
  → { pips, favour, isValid, breakdown }  // breakdown for animation + gnosis
```

`updateLiveScoreDisplay` and `animateSequentialScoring` both consume **breakdown**, never re-derive. Delete the `!fromPipeline` boon loop in preview.

**Approval bar:** Do not add more Gnosis/cashout branches inside `GameEngine` until breakdown exists.

---

## P1 — Missed simplification / spaghetti growth

### 4. `calculateScore` defensive wall vs canonical layer

**Finding:** ~35 lines of per-die validation and trace logging on every hover (debounced, but still heavy). `ScoringEngine` already exists (`game/js/engine/ScoringEngine.js`).

**Code judo:** `calculateScore` → 15-line wrapper: validate category → `ScoringEngine.runPipeline` → map result. Move die validation to `buildContext` once per roll, not per hover.

---

### 5. `Boon.js` at 1,030 lines

**Finding:** `boonTimingHandlers.js` (615 lines) split timing, but `Boon.js` still holds large instance surface.

**Code judo:** Boon = data + thin `onTimingEvent` dispatch only; all handler tables live in `boonTimingHandlers` / registry. Stop adding methods on `Boon` class.

---

### 6. `Main.js` embeds `CollectionManager` (~140 lines)

**Finding:** Anthology logic in same file as app bootstrap.

**Code judo:** `game/js/ui/CollectionManager.js` — zero behavior change, instant file-size win for `Main.js`.

---

### 7. Global `window.*` coupling

**Finding:** `window.game`, `window.shopManager`, `window.balatroEffects`, `window.uiManager` used across cards, shop, renderers (100+ references).

**Why it matters:** Blocks unit tests without browser; encourages feature logic in “whatever can reach window.game”.

**Code judo (incremental):** Introduce `RunServices` bag set once at run start; cards receive `services` at render time. Deprecate new `window.game` reads in UI layer.

---

## P2 — Boundary / abstraction / maintainability

### 8. `ShopUI` vs `UIManager` drag duplication

**Finding:** Shop artifact/ware drag (`_shopPointIn`, glow classes, RAF move) parallels consumable drag in `UIManager` but does not share a single `DropTargetController`.

**Prefer:** One helper: `toggleDropHot(zone, pointer, active)` + shared threshold (14px) from `CardDragSurface` constants.

---

### 9. `BalatroEffects` tooltip system (767 lines)

**Finding:** Hover + pin + card/shop/die modes in one class. Legitimate complexity, but card rules now spread across `BalatroEffects`, `card-present.css`, and `Card.render()`.

**Prefer:** Document “tooltip contract” in `UIConstants.js` (delays, classes, placement). Keep logic in `BalatroEffects`, but **no new card-type branches** — use `data-tooltip` shape + CSS only.

---

### 10. CSS architecture (post UI pass)

**Good:** `card-present.css`, `card-sizes.css`, `tooltips.css` extractions.  
**Risk:** `styles.css` still a large grab bag; `greek-theme.css` (770 lines) mixes layout + theme tokens.

**Code judo:** `greek-theme.css` = tokens + semantic classes only; layout dimensions stay in `styles.css` or `visual-tokens.css`.

---

## P3 — What’s working (do not churn blindly)

- **`ScoringEngine` + `ShopStockGenerator`** — correct direction (logic without DOM).
- **Renderers** (`DiceRenderer`, `ScorecardRenderer`, `InfoBarRenderer`, `PlayAreaRenderer`) — keep expanding this pattern.
- **Card surface contract** (`data-card-surface`, `card-present.css`, `UIConstants.CARD_SURFACE`) — good “code judo” that removed shop/owned CSS exceptions.
- **`CardDragSurface` / `PointerDragGhost`** — reuse everywhere; delete bespoke drag math.
- **Tests added on `main`** — `ui-checklist-playtest.spec.js`, `card-sizes`, `greek-theme-wired` — guard regressions while refactoring.

---

## Recommended execution order (behavior-preserving)

1. ~~**Live score canonical breakdown**~~ — **Done** on `refactor/live-score`: `GnosisDisplay.buildPreviewSplit`, removed duplicate `before_score` preview loop and legacy `!fromPipeline` confirm path.  
2. ~~**Extract `LiveScoreController`**~~ — **Done**: `game/js/ui/LiveScoreController.js`; `GameEngine` delegates preview/cashout.  
3. ~~**Extract drag controllers** from `UIManager`~~ — **Done**: `BoonSlotDrag`, `ConsumableDrag`, `PointerGeometry`; `UIManager` ~374 lines.  
4. ~~**Extract `CollectionManager.js`**~~ — **Done**: `game/js/ui/CollectionManager.js`.  
5. ~~**Thin `calculateScore` wrapper**~~ — **Done**: `ScoringEngine.validateRun`.  
6. **Extract `ScoringAnimation`** (largest animation block in `GameEngine`).  

Each step: `npm run test` + targeted e2e (`ui-checklist-playtest`, `playtest:boons` if scoring touched).

---

## PR approval checklist (for future work)

- [ ] No file grows past 1k without decomposition PR first  
- [ ] No new `!fromPipeline` / duplicate boon loops in preview paths  
- [ ] Scoring UI uses single pipeline output  
- [ ] Drag/drop uses `CardDragSurface` + shared drop-target helper  
- [ ] Feature logic not added to `GameEngine` without extraction home identified  

---

## References

- Team Kit skill: `thermo-nuclear-code-quality-review`
- UI contract: `docs/UI_CONSISTENCY_CHECKLIST.md` (complete on `main`)
- Architecture notes: `.cursor/context/`, `SOUL.md`
