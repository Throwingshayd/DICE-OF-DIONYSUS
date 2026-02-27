# Gameplay Loop, Economy & Boon Mechanism Analysis

**Date:** February 17, 2026  
**Scope:** Pure analysis from codebase review, mechanics audit, and playtest reports  
**Method:** Static analysis + existing test/audit data; no new code changes

---

## Executive Summary

| Area | Status | Summary |
|------|--------|---------|
| **Gameplay Loops** | ✅ Solid | Turn/ante structure, timing system, scoring flow work correctly |
| **Economy** | ⚠️ Tight | Gold scarce; interest/packs create tension but may frustrate |
| **Functionality** | ⚠️ Gaps | Several boons broken, dead conditions, or missing wiring |
| **Boons Lacking Mechanism** | 🔴 10+ | Dead conditions, wrong execution order, missing state |

---

## 1. Gameplay Loops

### 1.1 Core Loop (Verified ✅)

```
Ante Start → [Turn 1..13] → End Ante Check → [Shop @ 4,8,end] → Next Ante
     ↓
  Turn: roll → (hold) → score → nextTurn
     ↓
  nextTurn: turn_end → turn++ → turn_start → [shop @ 4,8]
```

- **Turn order:** `turn_end` (before advance) → default rolls → `turn_start` (Kronos overrides)
- **Scoring:** `before_score` → runPipeline → `after_score` → gold on score
- **Ante end:** `areAllCategoriesFilled && totalScore >= threshold` (AND logic)
- **Shop triggers:** Turns 4, 8, and end-of-ante (when threshold met)

**Strengths:**
- Timing phases follow Balatro-style order
- Ante requires both full scorecard and threshold (fixed Oct 2025)
- Turn structure prevents common bugs (e.g. Kronos)

### 1.2 Loop Pain Points

| Issue | Location | Impact |
|-------|----------|--------|
| **Ante-end order bug** | `finishAnteAndOpenShop()` | `scorecard` and `totalScore` reset **before** `ante_end` effects. The Odyssey and any scorecard-dependent ante_end boons see empty state |
| **13 turns strict** | `MAX_TURNS_PER_ANTE: 13` | No flexibility; failing threshold = instant game over |
| **Scratch penalty** | No gold on scratch | Combined with tight economy, scratches hurt a lot |

---

## 2. Economy

### 2.1 Gold Sources

| Source | Amount | Trigger |
|--------|--------|---------|
| Start | 6 | Game start |
| Scoring | 1/score | Per valid score (no scratch) |
| Interest | floor(gold/5), max 5 | Turns 4, 8, end-ante shop |
| Golden Touch | floor(gold/3), max 5 | Same, if boon owned |
| Charon's Ferry Fare | +1 | After each score |
| Parchment enhancement | +5 | 15% chance when scoring |
| Gold enhancement | +1 | When scoring that face |
| Betrayal by Paris | +10 | End of ante (destroys boon) |
| Early Bird | +2 | Turns 4–5 only |

### 2.2 Gold Sinks

| Sink | Cost | Notes |
|------|------|-------|
| Boons | 3–12 | Rustic 3, Vibrant 5, Epic 8 |
| Worship | 3 | Consumable |
| Libations | 2–3 | Consumable |
| Packs | 4–6 | Boon/Worship/Libation 4, Chaos 6 |
| Artifacts | 12–20 | Major investment |
| Shop reroll | 4 | Per reroll |
| Achilles' Heel | 1/roll | Per roll (costly over time) |
| Gambler's Charm | -1 | 50% on score |

### 2.3 Economy Analysis

- **Net gold:** ~1 per score, up to +5 interest per shop. Early ante thresholds (300–600) require many scores; gold grows slowly
- **Shop reroll (4g):** High relative to income; rerolling is a serious decision
- **Packs (4g):** Risk/reward vs direct buys; Chaos at 6g is a luxury
- **Interest:** Strong incentive to save; Golden Touch (1 per 3) is very valuable
- **Tension:** Economy creates real pressure but may feel harsh if RNG is unkind
- **Sell value (25%):** Strong gold sink; selling is last resort

**Recommendation:** Consider a small baseline gold bump (e.g. +1–2 per ante) or slightly lower pack/reroll costs for smoother progression.

---

## 3. Boons Lacking or Broken Mechanism

### 3.1 Critical – Never Trigger or Wrong Order

| Boon | Issue | Cause |
|------|-------|-------|
| **The Odyssey** | Bonus never applies | `ante_end` runs **after** `scorecard = {}` and `totalScore = 0`. All checks see empty state |
| **Hydra's Heads** | Effect never triggers | Condition is `diceUsedCount === 2`. In standard play all 5 dice have face > 0, so count is always 5 |
| **Message in a Bottle** | Always grants bonus | `hadOtherBoonsThisAnte` is never set to `true`; only reset to `false`. So `hadOnlyBottle` is always true |

### 3.2 Dead or Impossible Conditions

| Boon | Condition | Problem |
|------|-----------|---------|
| **Hydra's Heads** | "Score with exactly 2 dice" | No mechanic uses 2 dice; standard scoring uses 5 |
| **Assembly of Heroes** | "All boon slots full" | 5 slots; requires exactly 5 boons. Works but very narrow |
| **Ascetic's Vow** | "Empty boon slots" | Correct; favours having few boons |

### 3.3 Wiring Gaps

| Boon | Expected | Actual |
|------|----------|--------|
| **Cerberus' Watch** | "First 3 **held** dice" | Uses `dice.held` at score time. Hold state may be cleared or inconsistent by then; needs verification |
| **Reckless Abandon** | "Cannot hold dice" | Must block `toggleHold`. Not found in codebase – hold still allowed |
| **Medusa's Gaze** | "6s cannot be rerolled" | `after_roll` + `before_score`; reroll blocking for 6s not clearly enforced |
| **Golden Touch** | Interest 1 per 3 | ✅ Implemented in `calculateInterest()` |

### 3.4 Non-Determinism (Seeded Play Broken)

From MECHANICS_AUDIT_REPORT: these use `Math.random()` instead of `prng`:

| Boon / System | File | Line |
|---------------|------|------|
| Gambler's Charm | Joker.js | ~1002 |
| Pandora's Jar | Joker.js | ~1130 |
| Demeter's Harvest | Joker.js | ~1144 |
| Parmenides Die | Joker.js | ~1190 |
| Proteus Disguise | Joker.js | ~1214 |
| Icarus' Wings (break chance) | Joker.js | ~1242 |
| Mortal Vineyard | Joker.js | ~1286 |
| Betrayal by Paris | Joker.js | ~1365 |
| Mother of Pearl (enhancement) | Die.js | ~362 |

### 3.5 Special-Timing Boons (Verify Integration)

| Boon | Timing | Integration |
|------|--------|-------------|
| **Dionysus' Revelry** | HandEvaluator | ✅ HandEvaluator Full House; 2 pairs count as Full House |
| **Bellows of War** | HandEvaluator | ✅ Three/Four of a Kind threshold lowered |
| **Cycle of Seasons** | WorshipCard | ✅ WorshipCard checks and adds favour to another god |

---

## 4. Functional Gaps Summary

### 4.1 Must Fix

1. ~~**Ante-end order:** Run `ante_end` effects **before** resetting `scorecard` and `totalScore`~~ ✅ FIXED
2. ~~**Message in a Bottle:** Set `hadOtherBoonsThisAnte = true` when any boon other than Message in a Bottle triggers~~ ✅ FIXED
3. ~~**Hydra's Heads:** Redefine condition (e.g. "exactly 2 **pairs**")~~ ✅ FIXED (now triggers on 2 pairs)
4. ~~**Reckless Abandon:** Enforce "cannot hold" by disabling `toggleHold` when this boon is active~~ ✅ FIXED

### 4.2 Should Fix

5. Replace all `Math.random()` with `prng` in the listed boons
6. Verify Cerberus' Watch reads hold state at the right time
7. Verify Medusa's Gaze blocks reroll of 6s

### 4.3 Design Clarifications

8. **The Odyssey:** Description says "gain pips" but implementation adds to `totalScore`. Confirm whether this should apply to current ante (then fix order) or next ante (then document)
9. **Hydra's Heads:** Decide intended behaviour (pairs, 2-of-a-kind, etc.) and align implementation

---

## 5. Boon Coverage (From Playtest Report)

**Tested and passing:** 16 boons (Golden Six, Hestia, Gambler, Charon, Achilles, Midas, Straight Flush, Lethe, Icarus, Forge, Prometheus, Sisyphus, Mathematician, Heretic, Zealot, etc.)

**~50+ boons** not yet systematically playtested.

---

## 6. Recommendations

### Immediate

1. Move `ante_end` execution to **before** `scorecard`/`totalScore` reset
2. Track `hadOtherBoonsThisAnte` when boons trigger (excluding Message in a Bottle)
3. Fix or redesign Hydra's Heads condition
4. Implement hold blocking for Reckless Abandon

### Short-term

5. Replace `Math.random()` with `prng` in all gameplay code
6. Add regression tests for ante_end, Message in a Bottle, and The Odyssey
7. Broaden boon playtest coverage

### Design

8. Revisit economy tuning (baseline gold, pack/reroll costs)
9. Document which boons need special integration (HandEvaluator, WorshipCard, etc.)

---

**Sources:** `js/game/GameEngine.js`, `js/classes/Joker.js`, `js/engine/HandEvaluator.js`, `archive/MECHANICS_AUDIT_REPORT.md`, `archive/BOON_PLAYTEST_REPORT.md`, `tracking/BUGS_FIXED_LOG.md`, `.cursor/context/CONSOLIDATED_BOON_REFERENCE.md`
