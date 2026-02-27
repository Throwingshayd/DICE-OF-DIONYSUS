# First Ante Playtest Report — Translator Improvement Template

**Date:** 2026-02-27  
**Iterations:** 3  
**Ante Cleared:** 0/3  
**Avg Total Score:** 79 (threshold: 200)  
**Avg Gold End:** 14

---

## Per-Iteration Results

| Seed | Cleared | Score | Gold | Shops | Errors |
|------|---------|-------|------|-------|--------|
| ante1_iter0 | ✗ | 72 | 14 | [9,14] | 0 |
| ante1_iter1 | ✗ | 88 | 15 | [9,15] | 0 |
| ante1_iter2 | ✗ | 76 | 14 | [9,14] | 0 |

---

## Cursor Rules / Translator Improvement Template

Use this when updating `.cursor/rules/6-translator.mdc` or improving the game.

### 1. Balatro Mapping Additions

| Observation | Balatro | Dice of Dionysus | Action |
|-------------|---------|------------------|--------|
| Ante flow | Blind → rounds → shop | Ante → 13 turns → shop @ 4,8,end | Verify `nextTurn` → `endAnte` → `openShop` |
| Economy | Interest, sell 25% | `GAME_BALANCE`, `CARD_ECONOMY` | Match interest rate (1/5), sell 25% |
| First ante threshold | ~200 | 200 (AnteData) | Confirm scaling matches Balatro early antes |

### 2. Gameplay Loop Verification

- [ ] **Turn structure:** roll → hold → score → nextTurn (turn_end → turn++ → turn_start)
- [ ] **Shop triggers:** turns 4, 8, end-of-ante (when threshold met)
- [ ] **Gold:** +1 per score, interest floor(gold/5) max 5
- [ ] **Categories:** 13 standard (Ones–Chance), high (7,8,9) when unlocked

### 3. Improvement Suggestions (from playtest)

- Consider easing first-ante threshold or improving early-score bonuses (0/3 cleared)
- Economy: starting gold 6, 3 scores + interest ≈ 10g at first shop — verify affordability of rustic boons (3g)
- Timing: scoring animation 3500ms — tune for CI vs UX

### 4. State Mapping Reference

```
state.turn        → 1..13
state.ante        → 1..13+
state.scorecard   → { category: score }
state.totalScore  → sum + bonuses
state.gold        → economy
state.jokers      → boons
```

---

## Raw Data (JSON)

```json
[
  {
    "seed": "ante1_iter0",
    "cleared": false,
    "totalScore": 72,
    "gold": 14,
    "goldAtShops": [
      9,
      14
    ],
    "errors": [],
    "categoriesFilled": 13,
    "turn": 13
  },
  {
    "seed": "ante1_iter1",
    "cleared": false,
    "totalScore": 88,
    "gold": 15,
    "goldAtShops": [
      9,
      15
    ],
    "errors": [],
    "categoriesFilled": 13,
    "turn": 13
  },
  {
    "seed": "ante1_iter2",
    "cleared": false,
    "totalScore": 76,
    "gold": 14,
    "goldAtShops": [
      9,
      14
    ],
    "errors": [],
    "categoriesFilled": 13,
    "turn": 13
  }
]
```
