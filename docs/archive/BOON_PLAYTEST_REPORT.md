# Boon, Die Face & Libation Playtest Report

**Date:** 2026-02-16  
**Scope:** Systematic playtesting of boons, die face functions, and libations per user request.

## Test Infrastructure

- **Boon injection:** `?test=boon:boonid` (e.g. `/?test=boon:the_gambler`)
- **Libation injection:** `?test=libation:libationid` (e.g. `/?test=libation:kyphi_mead`)
- **Viewport:** 1920×1080 (game native resolution)

## Boons Tested (16 total – all passing)

| Boon | Effect | Status |
|------|--------|--------|
| Golden Six | +4 pips per 6 die | ✅ Pass |
| Hestia's Hearth | +3 Favour when all odd or all even | ✅ Pass |
| The Gambler | +10 pips per reroll remaining | ✅ Pass |
| Charon's Ferry Fare | +1 Gold after scoring | ✅ Pass |
| Achilles' Heel | +15 pips, -1 Gold per roll | ✅ Pass |
| Midas Touch | +1 pip per 5 Gold when scoring | ✅ Pass |
| Straight Flush | ×1.5 Mult on Large Straight | ✅ Pass |
| Lethe Waters | Dice ≤2 not counted, +25 pips | ✅ Pass |
| Icarus' Wings | +10 pips per unused reroll | ✅ Pass |
| Forge of Hephaestus | ×0.5 Favour per unused reroll (max ×1.5) | ✅ Pass |
| Prometheus' Gift | +3 Favour, -1 reroll | ✅ Pass |
| Sisyphus Boulder | +5 pips per reroll this turn | ✅ Pass |
| Mathematician Compass | +10 pips if sum divisible by 10 | ✅ Pass |
| The Heretic | +2 pips per turn (stacks) | ✅ Pass |
| The Zealot | +1 Favour if scoring matches last worship god | ✅ Pass |

**Test flow:** For each boon – inject → verify card visible → roll dice → score Chance → verify turn advances.

## Die Face Tests

| Test | Status |
|------|--------|
| 5 dice render after roll | ✅ Pass |
| Dice display values or ? | ✅ Pass |

## Libation Tests

| Test | Status |
|------|--------|
| Libation overlay present in DOM | ✅ Pass |
| Kyphi Mead injected via ?test=libation:kyphi_mead, consumable slot shows card | ✅ Pass |

## Running the Tests

```bash
npx playwright test e2e/boon-playtest.spec.js
```

To test a specific boon manually: open `http://localhost:3000/?test=boon:boonid`, enter a seed, click Play.

## Boons Not Yet Covered

~50+ boons remain untested in this pass. If any boon behaves incorrectly, please note:

1. Boon ID  
2. Expected effect  
3. Actual behavior  

Then the implementation can be adjusted.
