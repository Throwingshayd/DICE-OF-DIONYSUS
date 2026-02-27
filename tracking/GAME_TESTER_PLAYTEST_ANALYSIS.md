# Game Tester Playtest Analysis — Dice of Dionysus

**Date:** 2026-02-19  
**Scope:** Errors, edge cases, win rate, and actionable data for improving the game  
**Sources:** `.cursor/rules`, `tracking/*_REPORT.md`, `e2e/`, `BUGS_FIXED_LOG.md`

---

## Executive Summary

| Metric | Value | Status |
|--------|-------|--------|
| **Winning playtest error rate** | 100% (100/100 runs) | Critical |
| **First-ante win rate** | 0% (0/3 cleared) | Critical |
| **Core playtest pass rate** | 100% (7/7 tests) | Good |
| **Boon playtest pass rate** | 100% (16/16 boons) | Good |
| **Stress test** | PASS (no crashes, no NaN) | Good |
| **Game overs (winning mode)** | 0 | OK |

---

## 1. Errors — Blocking Issues

### 1.1 Winning Playtest: Roll Button Disabled After Shop Close

**Frequency:** 100/100 runs  
**Location:** Ante 2, Turn 4 (Threes) — first turn after first mid-ante shop  
**Error:**  
`locator.click: Timeout 15000ms exceeded` — `getByRole('button', { name: /cast the bones/i })` — **element is not enabled**

**Root cause:**  
The "Cast the Bones" roll button stays **disabled** after closing the shop that opens at turn 4. The button is disabled when `rollsLeft <= 0`, `gameOver`, or `isAwaitingApi` (see `UIManager.js:274`).

**Likely sequence:**
1. Ante 1 completes (13 turns, threshold met)
2. End-of-ante tally + shop
3. Test closes shop, advances to Ante 2
4. Ante 2 turns 1–3 run normally
5. After scoring turn 3, `nextTurn()` runs → turn 4 → shop opens
6. Test closes shop
7. Roll button remains disabled — play state not fully restored

**Action for dev:**  
- Inspect `closeShop` / stage swap: ensure `rollsLeft` and turn state are correct when returning from shop  
- Ensure `turn_start` timing (default rolls) runs after shop close when returning to play  
- Add a short delay or wait for `rollButton` to be enabled before asserting in E2E

---

### 1.2 First-Ante: Ante Never Cleared

**Frequency:** 3/3 runs (0% win rate on first ante)  
**Threshold:** 300 points  
**Observed scores:** 54, 102, 104 (all below 300)

**Root cause:**  
Economy and scoring don’t reliably reach 300 in 13 turns. First-ante difficulty is too high for unseeded play.

**Action for dev:**  
- Lower first-ante threshold (e.g. 250) or raise early scoring bonuses  
- Recheck `GAME_BALANCE.STARTING_GOLD`, `GOLD_PER_SCORE`, and early shop affordability

---

## 2. Edge Cases — Identified Gaps

### 2.1 Shop–Turn Transition (Blocking E2E)

| Scenario | Expected | Actual |
|----------|---------|--------|
| Shop opens at turn 4 | Player can roll after closing | Roll button disabled |
| Shop opens at turn 8 | Same | Not yet validated (test fails at turn 4) |

### 2.2 Boons With Broken or Unclear Logic

| Boon | Issue | Severity |
|------|-------|----------|
| The Odyssey | `ante_end` runs after `scorecard` reset; sees empty state | Critical |
| Hydra's Heads | Condition "exactly 2 dice" — standard play uses 5 | High |
| Message in a Bottle | `hadOtherBoonsThisAnte` never set → always grants bonus | High |
| Cerberus' Watch | Hold state at score time may be inconsistent | Medium |
| Reckless Abandon | Hold blocking | Fixed |
| Medusa's Gaze | 6s reroll block needs verification | Medium |

### 2.3 Non-Determinism (Seeded Play)

These use `Math.random()` instead of `prng`:

| Boon / System | File |
|--------------|------|
| Gambler's Charm | Joker.js |
| Pandora's Jar | Joker.js |
| Demeter's Harvest | Joker.js |
| Parmenides Die | Joker.js |
| Proteus Disguise | Joker.js |
| Icarus' Wings (break chance) | Joker.js |
| Mortal Vineyard | Joker.js |
| Betrayal by Paris | Joker.js |
| Mother of Pearl (enhancement) | Die.js |

---

## 3. Win Rate & Progression

### 3.1 Winning Playtest (100 runs, forced valid hands)

| Stat | Value |
|------|-------|
| Max ante reached | 2 |
| Avg ante | 2.0 |
| Antes played (per run) | 1 |
| Game overs | 0 |
| Runs with errors | 100 |

**Score distribution (Ante 1 end):**

| Score | Count | % |
|-------|-------|---|
| 60 | 4 | 4% |
| 86 | 19 | 19% |
| 95 | 1 | 1% |
| 96 | 16 | 16% |
| 111 | 42 | 42% |
| 121 | 2 | 2% |
| 140 | 1 | 1% |
| 146 | 14 | 14% |
| 195 | 1 | 1% |

- **Median score:** ~111  
- **Mean score:** ~112  
- **Range:** 60–195

### 3.2 First-Ante Playtest (3 runs, no forced hands)

| Seed | Cleared | Score | Gold at shops |
|------|---------|-------|---------------|
| ante1_iter0 | ✗ | 102 | [10, 14] |
| ante1_iter1 | ✗ | 104 | [9, 13] |
| ante1_iter2 | ✗ | 54 | [8, 9] |

- **Win rate:** 0%  
- **Avg score:** 87 (vs threshold 300)

---

## 4. Economy Analysis

| Source | Amount |
|--------|--------|
| Start | 6 |
| Per score | 1 |
| Interest | floor(gold/5), max 5 |
| First-shop gold (typical) | ~10 |

| Sink | Cost |
|------|------|
| Rustic boon | 3 |
| Vibrant boon | 5 |
| Pack | 4–6 |
| Shop reroll | 4 |

**Takeaway:** Economy is tight; interest and pack cost make early purchases punishing. Consider small baseline gold increase or lower pack/reroll costs.

---

## 5. Test Coverage Summary

| Test Suite | Status | Notes |
|-------------|--------|------|
| Core playtest (`playtest.spec.js`) | ✅ 7/7 pass | Start, roll, score, shop, visuals |
| Boon playtest (`boon-playtest.spec.js`) | ✅ 16/16 pass | Golden Six, Hestia, Gambler, etc. |
| First-ante (`first-ante-playtest.spec.js`) | ⚠️ 0/3 clear | Threshold 300 never met |
| Winning playtest (`winning-playtest.spec.js`) | ❌ 100/100 error | Roll disabled after shop |
| Stress test (unit) | ✅ Pass | No crashes, no NaN |
| Boons not yet tested | ~50+ | Need systematic playtest |

---

## 6. Actionable Recommendations (Priority Order)

### P0 — Blocking

1. **Shop–play transition:** Fix roll button staying disabled after closing the turn 4/8 shop. Trace `closeShop` → stage swap → `rollsLeft` and `turn_start` reset.
2. **Winning playtest timing:** Increase E2E wait after closing shop, or wait for roll button enabled before clicking.

### P1 — Balance & Progression

3. **First-ante threshold:** Reduce from 300 or increase early scoring rewards.
4. **Economy:** Slightly raise baseline gold or lower pack/reroll costs for smoother early runs.

### P2 — Boon Correctness

5. **The Odyssey:** Run `ante_end` before resetting `scorecard` and `totalScore`.
6. **Message in a Bottle:** Set `hadOtherBoonsThisAnte = true` when other boons trigger.
7. **Hydra's Heads:** Redefine or implement condition so it can trigger in standard play.
8. **Determinism:** Replace `Math.random()` with `prng` in listed boons.

### P3 — Quality

9. Broaden boon playtest coverage beyond the 16 already tested.
10. Add regression tests for `ante_end` ordering, Message in a Bottle, and The Odyssey.

---

## 7. Cursor Rules Alignment

| Rule | Relevance |
|------|------------|
| **1-mechanics** | Hand validation, multiplier order, blessing system — core logic OK |
| **4-master-architect** | Bug-hunting, polish, self-healing — use for P0/P1 fixes |
| **6-translator** | Balatro mapping — `G.jokers` → `state.jokers`, timing order |
| **7-translator-playtest** | Improvement template for ante/economy — use for P1 |

---

## 8. Data for Game Tester Follow-Up

| Metric | How to Measure |
|--------|----------------|
| Win rate by ante | `antesPlayed` / runs where ante cleared |
| Score distribution | Per-run `totalScore` histograms |
| Gold at shops | `goldAtShops` from first-ante report |
| Error rate | `runs with errors / total runs` |
| Failure points | Error message + ante + turn + category |
| Economy health | Gold at shop 1 vs pack price (4g) |

---

*Generated from playtest data and `.cursor/rules` analysis. Re-run playtests after fixes to validate.*
