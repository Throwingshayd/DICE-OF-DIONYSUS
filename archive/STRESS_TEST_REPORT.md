# Stress Test Report - Balatro Scoring Pipeline

**Date:** February 16, 2026  
**Status:** PASS

---

## Executive Summary

- **Build:** Passes (`npm run build`)
- **Unit Tests:** 10 passed (scoring-pipeline + stress)
- **100 Round Simulation:** No crashes, no NaN/Infinity, no invalid scores
- **Edge Cases:** 0 dice, x0 multiplier guarded

---

## 10 Most Stable Blessings (Existing Pool)

| Blessing | Rarity | Effect | Notes |
|----------|--------|--------|-------|
| Hestia's Hearth | vibrant | +3 Favour if all odd or all even | Simple condition, no state |
| Charon's Ferry Fare | vibrant | +1 Gold after score | After_score, no math |
| Achilles' Heel | rustic | +15 Pips, -1 Gold/roll | Straightforward |
| Midas Touch | rustic | +1 pip per 5 Gold | Pure math |
| Icarus' Wings | vibrant | +10 Pips per unused roll | Clear formula |
| Forge of Hephaestus | vibrant | +0.5 Favour per unused roll (max 1.5) | Capped |
| Prometheus' Gift | vibrant | +3 Favour, -1 roll | Simple |
| Lethe Waters | rustic | Low dice ignored, +25 Pips | Hand modifier |
| Golden Six | rustic | +4 Mult per 6 die | New registry pattern |
| The Gambler | rustic | +10 Chips per reroll left | New registry pattern |

---

## New Registry Blessings (Phase 2)

1. **Golden Six** - +4 Mult per '6' die (dice phase)
2. **Straight Flush** - x1.5 Mult if Large Straight (hand phase)
3. **The Gambler** - +10 Chips per reroll remaining (inventory phase)

---

## Recommendations

- Run full playtest (`npm run playtest`) for E2E validation
- Consider migrating more boons to BlessingRegistry over time
- Document triggerPhase when adding new blessings
