# Dice of Dionysus — Playtest Report

**Date:** February 16, 2026  
**Scope:** Scoring, shop, packs, visual display (no new game items added)

---

## Summary

**All 7 automated playtest tests passed.**

| Test | Status |
|------|--------|
| Start screen displays correctly | ✅ Pass |
| Game start - play button launches game with seed | ✅ Pass |
| Roll and score - Chance category (always valid) | ✅ Pass |
| Shop opens after 3 scored turns (turn 4) | ✅ Pass |
| Shop - close and return to game | ✅ Pass |
| Visual display - dice, scorecard, live score (Gnosis) | ✅ Pass |
| Packs visible in shop when affordable | ✅ Pass |

---

## What Was Verified

- **Scoring:** Dice roll → category click → score confirmation (or direct score fallback) → turn advances
- **Shop:** Opens at turn 4 after 3 scored turns; Temple Market overlay visible with gold, reroll, continue
- **Packs:** Packs section visible in shop with heading
- **Visual display:** 5 dice, all 13 scorecard categories, live score (Gnosis) display
- **End-to-end:** Start → play → roll → score ×3 → shop → close → game continues

---

## How to Run

```bash
npm run playtest
```

Or with Playwright directly:

```bash
npx playwright test e2e/playtest.spec.js
```

---

## Notes

- Uses deterministic seed `playtest42` for reproducibility
- Scoring confirmation overlay may be skipped when `confirmOverlay` is not bound (fallback scores directly)
- Test uses categories Chance, Ones, Twos for the 3 turns to avoid reusing a filled category
