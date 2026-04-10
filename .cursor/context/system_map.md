# Dice of Dionysus — System Map & Architecture Audit

**Document Type:** Senior Architect Audit  
**Date:** February 16, 2026  
**Line counts refreshed:** April 10, 2026 (see `tracking/KNOWN_ISSUES.md`)  
**Status:** Reference audit (historical narrative + updated metrics)  
**Constraint:** Original pass was documentation-only; metrics updated with repo

---

## Executive Summary

This document maps the current (messy) architecture of Dice of Dionysus, a Balatro-style Yahtzee hybrid. It identifies God Objects, redundant logic, inconsistent handling of Blessings (Boons/Jokers) and Dice, and technical debt that prevents Balatro-grade polish. It concludes with a proposed modular **Registry Pattern** architecture for future refactoring.

---

## Part 1: Data Flow (Current Implementation)

### 1.1 High-Level Flow

```
User Action (Roll / Score)
    ↓
GameEngine (single entry point)
    ↓
[DOM binding, state mutation, effect application]
    ↓
UIManager.updateAllUI()
    ↓
DOM
```

### 1.2 Dice Roll → Hand Validation → Multiplier Stack → Final Score

#### Phase A: Dice Roll Flow

```
rollDice() [GameEngine]
    → Pre-roll jiggle (DOM)
    → setTimeout 250ms
    → executeRoll()
        → applyBoonRollEffects()     [GameEngine switch: achilles_heel only]
        → state.rollsLeft--
        → state.hasRolled = true
        → Balatro effects (window.balatroEffects)
        → shuffleDicePositions()
        → Forced values (forcedDiceValues.allThrees)?
        → state.dice.forEach: die.roll(prng)
        → diceTransformations.onesBecomeSixes?
        → processMotherOfPearl() [each Die]
        → state.boons.forEach: boon.applyDiceRollEffect() [if affectsDiceRoll]
        → checkTriggerEffects() [fourFoursReroll, goldPerDie]
        → previewUnlockBonusCategoriesOnRoll()
        → updateAllUI()
```

**Observations:**
- `applyBoonRollEffects()` in GameEngine only handles `achilles_heel`, but Achilles' Heel is also in `Boon.applyBeforeRollEffect` — **duplication / split logic**.
- Dice roll effects are split: some in GameEngine (switch), some via `boon.affectsDiceRoll()` + `applyDiceRollEffect`.
- `checkTriggerEffects()` reads from `state.triggerEffects`, `state.goldPerDie` — boons populate these elsewhere.

#### Phase B: Hand Validation (refactored → js/engine/)

```
calculateScore(category, isActualScoring)
    → Validate category, state, dice
    → faces = dice.map(d => d.getEffectiveFace())  [with diceSubstitutions]
    → counts = reduce faces to {value: count}
    → context = ScoringEngine.buildContext(state)
    → { pips, isValid } = ScoringEngine.evaluateCategory(category, faces, counts, context)
        [HandEvaluator: pure logic, extensible CATEGORY_HANDLERS]
    → [Side-effect messages for Bellows/Dionysus when isActualScoring]
    → favour = getFavourForCategory() + worshipLevels
    → consumables.forEach: applyBasicWorshipEffect
    → dice.forEach: gold, parchment enhancements (if isActualScoring)
    → if isValid: dice.forEach: iron, parchment, mother_of_pearl, wild enhancements
    → return { pips, favour, isValid }
```

**Refactor (Surgical — Feb 2026):**
- **HandEvaluator.js** — Pure category evaluation; faces + counts + context → { pips, isValid }. All 13 Yahtzee categories in a single extensible `CATEGORY_HANDLERS` object. Boons (bellows_of_war, dionysus_revelry) are passed in context; no side effects.
- **ScoringEngine.js** — Thin orchestrator: `buildContext(state)`, `evaluateCategory()`. Single entry point for hand logic.
- **ScoringEngine** — Pips × Favour formula; additive then multiplicative mult (Balatro order).

#### Phase C: Multiplier Stack (Scoring Confirmation)

```
confirmScore()
    → { pips, favour, isValid } = calculateScore(category, true)
    → pips += tempPips, favour += tempFavour
    → eventData = { category, pips, favour, favourMult: 1 }
    → state.boons.forEach: eventData = boon.onTimingEvent('before_score', state, eventData)
    → pips = eventData.pips
    → favour = eventData.favour * (eventData.favourMult || 1)   [BALATRO: additive then multiplicative]
    → globalBonuses.fivesToAll?
    → finalScore = pips * favour
    → animateScoreUpdate() → finalizeScoring()
```

**Order of operations (correct Balatro-style):**
1. Base pips from hand
2. Additive bonuses (pips += X, favour += Y)
3. Multiplicative bonuses (favour *= favourMult)
4. Final = pips × favour

---

## Part 2: God Objects & Structural Problems

### 2.1 GameEngine.js (~3,285 lines, Apr 2026)

**Responsibilities (too many):**
- Game state (single source of truth)
- DOM binding (bindDOMElements, setupDOMEventListeners)
- Dice roll (rollDice, executeRoll, shuffleDicePositions)
- Boon roll effects (applyBoonRollEffects — switch)
- Trigger effects (checkTriggerEffects)
- Scoring (promptScore, confirmScore, calculateScore)
- Hand validation (inside calculateScore — 250+ lines)
- Turn/ante progression (nextTurn, endAnte)
- Shop coordination (openShop, closeShop, rerollShop)
- Animations (animateScoreUpdate, animateSequentialScoring)
- Live score display (updateLiveScoreDisplay, getDiceContributions, getBoonContributions)
- Artifact effects (applyArtifactEffects)
- Bonus categories (unlockBonusCategories, checkAndAwardUpperBonus, etc.)

**Verdict:** Classic God Object. ~40+ state buckets (`diceEffects`, `pipsBonuses`, `rerollAbilities`, `diceSubstitutions`, `abilities`, `doubleScoringAllowed`, `goldPerDie`, `forcedDiceValues`, `triggerEffects`, `globalBonuses`, `winConditions`, `yahtzeeEffects`, `prophecyEffects`, `flexibleScoring`, `diceTransformations`, etc.) are ad-hoc namespaces for boon effects. No single source of truth for “what effects exist.”

### 2.2 Boon.js + boonTimingHandlers.js (~1,076 + ~620 lines, Apr 2026)

**Structure:**
- `Boon.onTimingEvent(timing, state, eventData)` → timing handlers; **`before_score`** heavy logic lives in **`boonTimingHandlers.js`** (loaded before `Boon.js` in `index.html`).
- Other timings still use large `switch`/`case` sets on `this.id` inside `Boon.js`.

**Verdict:** Adding a boon still touches multiple code paths; `before_score` is partially extracted. No registry / plugin system.

### 2.3 UIManager.js (~380 lines) + ShopUI.js (~670 lines)

**Responsibilities:**
- **UIManager:** DOM binding, coordination, delegates shop/packs/expulsion to **ShopUI**; dice/scorecard often via **`ui/renderers/`**.
- **ShopUI:** Stock display, buy/sell, pack flow, **expulsion** (inventory full).

**Verdict:** UI monolith split from 2025-era layout; **GameEngine** is now the larger structural concern than UIManager alone.

### 2.4 Redundant Scoring Categories / Logic

- **Upper vs Lower:** Categories are split, but logic is interleaved (e.g. Upper Bonus check in calculateScore flow).
- **Sevens, Eights, Nines:** Unlocked by bonus Yahtzees. Logic scattered across `unlockBonusCategories`, `previewUnlockBonusCategoriesOnRoll`, `calculateScore` (category lock check).
- **Upper Bonus / Lower Bonus:** Pandora's Box theme; checked in `checkAndAwardUpperBonus`, `checkAndAwardLowerBonus` — separate methods, similar pattern.

---

## Part 3: Inconsistent Handling of Blessings & Dice

### 3.1 Blessings (Boons — UI term “joker”)

| Aspect | Where | Problem |
|--------|-------|---------|
| Roll effects | `GameEngine.applyBoonRollEffects()` | Only achilles_heel; duplicated with `Boon` |
| Roll effects | `Boon.applyBeforeRollEffect()` | Achilles also here |
| Dice roll | `boon.affectsDiceRoll()` + `applyDiceRollEffect()` | Different code path from timing |
| Hand validation | Inside `GameEngine.calculateScore()` | Bellows, Dionysus Revelry checked via `state.boons.some()` paths — not only via timing |
| Pip/favour | `BoonTimingHandlers` + `Boon` (`before_score`, etc.) | Large switches; `before_score` hub in `boonTimingHandlers.js` |
| State mutation | `state.pipsBonuses`, `state.diceSubstitutions`, etc. | Boons write to shared state buckets; order of execution matters; no isolation |

**Inconsistency:** Some boons use timing (`before_score`), others mutate `state` in `applyDiceRollEffect`, others are hardcoded in GameEngine (`applyBoonRollEffects`, `calculateScore`).

### 3.2 Dice

| Aspect | Where | Problem |
|--------|-------|---------|
| Face value | `Die.currentFace` | Canonical |
| Face value | `Die.getEffectiveFace()` | Correct for scoring (includes wild, mother of pearl) |
| Face value | `die.face` in boon code | **Inconsistent:** Die has no stable `face` property. Code uses `die.face` in several places. Some assign `die.face = 3` (Smog) — ad-hoc; does not update `currentFace`. Risk of bugs. |
| Held state | `state.held[]` | GameEngine owns |
| Held state | `die.held` from boons | Some boons (Medusa, Reckless) set `die.held` — Die may not have `.held`; state.held is the source of truth |
| Roll | `die.roll(prng)` | Correct |

**Inconsistency:** Mix of `currentFace`, `getEffectiveFace()`, and `die.face`. `die.face` is undefined unless a boon assigns it (e.g. Smog), and assigning it does not affect `getEffectiveFace()`.

---

## Part 4: Technical Debt (Prevents Balatro-Grade)

### 4.1 Hardcoded Values

- **BoonConstants.js:** Good centralization for effect values.
- **ScoringConstants.js, GameConstants.js:** Used, but `calculateScore` and some boons still reference literals (e.g. `35` for bonuses, `0.9` for Typhon).
- **Hand validation:** Thresholds in `SCORING_THRESHOLDS`, but Bellows/Dionysus logic uses magic `-1` for threshold.

### 4.2 Nested If/Else and Switch Chains

- `calculateScore`: Single 250+ line switch for categories.
- `boonTimingHandlers.js` / `Boon` `before_score` and other timings: large switches with many cases.
- `Boon.applyAfterRollEffect`: 100+ lines.
- `Boon.applyTurnStartEffect`, `applyAnteEndEffect`: Large switches.
- `GameEngine.applyArtifactEffects`: Switch on artifact ids.
- `GameEngine.applyBoonRollEffects`: Switch (only 1 case currently).

### 4.3 Tight Coupling

- GameEngine imports/calls UIManager, window.uiManager, window.game.
- Boon code may use `window.game?.showMessage?.()` — global coupling.
- Shop **UI** in ShopUI / shopManager; GameEngine owns shop flow (openShop, closeShop, cashout).
- Dice rendering (renderers) depends on GameEngine state shape.

### 4.4 State Explosion

- `state` has 40+ ad-hoc effect buckets. Adding a boon often means adding a new bucket or extending an existing one.
- No schema or documentation for which boon writes to which bucket.
- Order of boon application matters; not explicit.

### 4.5 Duplication

- Achilles' Heel: GameEngine + Boon timing.
- Hand-validation boons (Bellows, Dionysus) live in GameEngine, not only in timing handlers.
- God mapping centralized in GameConstants (GOD_TO_CATEGORY, GOD_METADATA, GodUtils).

### 4.6 Missing Abstractions

- No `HandValidator` — validation is inline in calculateScore.
- No `MultiplierStack` or `ScorePipeline` — favour/pips modified in-place.
- No event bus — boons are invoked by GameEngine looping and calling `onTimingEvent`.

---

## Part 5: Proposed "Balatro" Architecture — Registry Pattern

### 5.1 Overview

Every **Boon** is a **standalone object** that **subscribes** to game events. No monolithic switch. The game emits events; the registry routes them to interested boons.

### 5.2 Event Types (Replaces Timing Flags)

| Event | When | Payload |
|-------|------|---------|
| `dice.roll.start` | Before rolling | `{ dice, held }` |
| `dice.roll.land` | After dice land | `{ dice, counts }` |
| `hand.validate` | When validating category | `{ category, faces, counts }` → `{ pips, isValid }` |
| `score.calc` | Before final score | `{ pips, favour, favourMult }` |
| `score.confirm` | After score applied | `{ category, pips, favour, finalScore }` |
| `turn.start` | Start of turn | `{ turn, rollsLeft }` |
| `turn.end` | End of turn | `{ turn }` |
| `ante.end` | End of ante | `{ ante }` |
| `shop.enter` / `shop.exit` | Shop flow | `{ gold }` |

### 5.3 Boon Registry

```javascript
// Conceptual
const BoonRegistry = {
  boons: new Map(),  // id -> BoonDef
  
  register(boonDef) {
    boonDef.subscriptions.forEach(sub => {
      this.on(sub.event, (payload) => boonDef.handlers[sub.handler](payload));
    });
    this.boons.set(boonDef.id, boonDef);
  },
  
  emit(event, payload) {
    this.listeners.get(event)?.forEach(fn => fn(payload));
  }
};
```

### 5.4 Standalone Boon Object

```javascript
// Each boon is self-contained
const HestiasHearth = {
  id: 'hestias_hearth',
  name: "Hestia's Hearth",
  rarity: 'vibrant',
  cost: 5,
  
  subscriptions: [
    { event: 'score.calc', handler: 'onScoreCalc' }
  ],
  
  handlers: {
    onScoreCalc(payload) {
      const { gameState } = payload;
      const faces = gameState.dice.map(d => d.getEffectiveFace());
      const allOdd = faces.every(f => f % 2 === 1);
      const allEven = faces.every(f => f % 2 === 0);
      if (allOdd || allEven) {
        payload.favour += 3;
        showMessage("Hestia's Hearth: +3 Favour!");
      }
      return payload;
    }
  }
};
```

### 5.5 Decoupled Pipeline

```
Dice Roll:
  emit('dice.roll.start') → boons may modify dice/held
  perform roll
  emit('dice.roll.land') → boons may transform dice
  update UI

Hand Validation:
  validator = createHandValidator(category, gameState)
  emit('hand.validate', { validator }) → boons may adjust thresholds
  pips, isValid = validator.evaluate(faces, counts)

Multiplier Stack:
  emit('score.calc', { pips, favour, favourMult })
  boons mutate payload
  finalScore = pips * favour
  emit('score.confirm', { ... })
```

### 5.6 Benefits

1. **Add boon without editing core files** — register new object.
2. **Clear event flow** — one place to see order of execution.
3. **Testable** — boons can be unit-tested in isolation.
4. **No God Object** — GameEngine orchestrates, doesn't implement.
5. **Hand validation separate** — HandValidator can be extended or replaced.

### 5.7 Migration Path (Future)

1. Introduce event emitter and BoonRegistry.
2. Migrate one boon (e.g. Hestia's Hearth) to registry pattern.
3. Run both paths in parallel; compare outputs; verify determinism.
4. Migrate boons one-by-one.
5. Remove switch statements from `Boon.js` / `boonTimingHandlers.js` (or replace with registry).
6. Extract HandValidator from calculateScore.
7. Slim down GameEngine to orchestration only.

---

## Part 6: File Inventory & Line Counts

| File | Lines | Role |
|------|-------|------|
| GameEngine.js | ~2,561 | God Object |
| UIManager.js | ~380 | Coordinator; renderers + ShopUI |
| GameEngine.js | ~3,285 | Primary god object |
| Boon.js + boonTimingHandlers.js | ~1,076 + ~620 | Boon timing |
| gameData.js | ~837 | Card definitions |
| Die.js | ~436 | Dice model |
| LibationCard.js | ~450 | Consumables |
| WorshipCard.js | ~200 | Worship |
| Artifact.js | ~200 | Artifacts |
| BoonConstants.js | ~355 | Boon effect values |
| ScoringConstants.js | ~84 | Scoring config |
| GameConstants.js | ~222 | Balance config |

---

## Part 7: Critical Inconsistencies to Fix (When Refactoring)

1. **Die.face vs currentFace:** Standardize on `getEffectiveFace()` for scoring; add `face` getter as alias to `currentFace` if needed for legacy, or migrate all boon code to `getEffectiveFace()`.
2. **die.held vs state.held:** Single source of truth — use `state.held[index]`; remove any `die.held`.
3. **Achilles' Heel duplication:** Single implementation in Boon roll timing.
4. **Hand-validation boons:** Move Bellows, Dionysus into event/hand-validator extension, not inline in calculateScore.
5. **confirmOverlay binding:** Template vs body — ensure overlay is bound when game uses template (known playtest issue).

---

## Conclusion

The game works but has accumulated **architectural drift** from iterative AI coding. The main blockers for Balatro-grade polish are:

- **God Object** GameEngine with 40+ ad-hoc state buckets
- **Monolithic switches** in `Boon.js` / `boonTimingHandlers.js` (many cases)
- **Coupled hand validation** inside calculateScore
- **Inconsistent Die API** (face vs currentFace)
- **Scattered boon logic** across GameEngine, `Boon` / handlers, and state mutation

The proposed **Registry Pattern** with event-driven boons and a decoupled HandValidator provides a clear path to modular, testable, maintainable architecture without breaking the game's feel.

---

**Document ready for review.** Terminology and metrics updated Apr 2026 to match live `Boon` / `GameEngine` naming; use `tracking/KNOWN_ISSUES.md` for current line counts.
