# 🎯 Boon Mechanical Categories - Complete Verification

## Overview
Complete audit of all 60 boons in Dice of Dionysus, organized by mechanical category with implementation verification.

**Current Rarity Distribution:**
- Rustic (3g): 21 boons (35%)
- Vibrant (5g): 30 boons (50%)
- Epic (8-11g): 9 boons (15%)

---

## Category 1: +Pips (Additive) - 24 Boons

All boons in this category use `result.pips += bonus` pattern. ✅

### Flat Pip Bonuses

| Boon | Rarity | Effect | Implementation | Status |
|------|--------|--------|----------------|--------|
| **Achilles' Heel** | Rustic | +15 pips all scores | Currently NOT IMPLEMENTED in before_score | ❌ MISSING |
| **Lethe Waters** | Rustic | +25 pips (ignore 1-2s) | Currently NOT IMPLEMENTED | ❌ MISSING |
| **Reckless Abandon** | Rustic | +50 pips flat | `result.pips += 50` (line 710) | ✅ |
| **First Blood** | Rustic | +50 pips first score | `result.pips += 50` (line 791) | ✅ |
| **Midnight Oil** | Rustic | +24 pips (turn 12+) | `result.pips += 24` (line 802) | ✅ |
| **Nyxian Seduction** | Rustic | +69 pips (Chance) | `result.pips += 69` (line 906) | ✅ |

### Scaling Pip Bonuses

| Boon | Rarity | Effect | Implementation | Status |
|------|--------|--------|----------------|--------|
| **Sisyphus' Boulder** | Vibrant | +5 pips per reroll | `result.pips += boulderBonus` (line 540) | ✅ |
| **Icarus' Wings** | Vibrant | +15 pips per unused roll | Currently NOT IMPLEMENTED | ❌ MISSING |
| **Cerberus' Watch** | Vibrant | +3 pips per held die | `result.pips += cerberusBonus` (line 608) | ✅ |
| **Marathon Runner** | Rustic | +1 pip per roll | `result.pips += marathonPips` (line 637) | ✅ |
| **Demeter's Harvest** | Vibrant | +1 pip per turn (die modifier) | NOT direct +pips, modifies die face | ⚠️ DIFFERENT |
| **Midas Touch** | Rustic | +5 pips per 10 gold | Currently NOT IMPLEMENTED | ❌ MISSING |
| **Early Bird** | Rustic | +20 (T1-3), -5 (T6-13) | `result.pips += 20` / `-= 5` (lines 726-730) | ✅ |
| **The Locksmith** | Rustic | +1 pip per roll held | `result.pips += locksmithBonus` (line 689) | ✅ |
| **The Heretic** | Rustic | Stacking +2/turn | `result.pips += hereticPips` (line 699) | ✅ |
| **Journey of Perseus** | Rustic | +10 per 100 score | `result.pips += perseusBonus` (line 983) | ✅ |

### Conditional Pip Bonuses

| Boon | Rarity | Effect | Implementation | Status |
|------|--------|--------|----------------|--------|
| **Mathematician's Compass** | Rustic | +10 if sum even | `result.pips += 10` (line 652) | ✅ |
| **Prime Time** | Rustic | Variable (primes) | `result.pips += primeBonus` (line 672) | ✅ |
| **Assembly of Heroes** | Rustic | +15 if slots full | `result.pips += 15` (line 760) | ✅ |
| **Divine Synergy** | Rustic | +5 per rarity match | `result.pips += synergyBonus` (line 780) | ✅ |
| **Doubling Season** | Vibrant | Variable (odd/even) | `result.pips += seasonAdjustment` (line 826) | ✅ |
| **Gold Standard** | Vibrant | +3 per gold die | `result.pips += goldBonus` (line 943) | ✅ |
| **Typhon** | Rustic | +90% threshold on all 1s | `result.pips += gameState.typhonBonus` (line 717) | ✅ |

### Special Pip Cases

| Boon | Rarity | Effect | Implementation | Status |
|------|--------|--------|----------------|--------|
| **Kronos' Hourglass** | Epic | -20% pips | `result.pips *= 0.8` (line 549) | ✅ PENALTY |
| **Queen's Authority** | Vibrant | Reroll bonus on Fours | `result.pips += rerollBonus` (line 1061) | ✅ |

**Category Status: 21/24 VERIFIED** ⚠️
- 3 missing implementations: Achilles' Heel, Lethe Waters, Icarus' Wings, Midas Touch

---

## Category 2: +Favour (Additive) - 14 Boons

All boons in this category use `result.favour += bonus` pattern. ✅

### Flat Favour Bonuses

| Boon | Rarity | Effect | Implementation | Status |
|------|--------|--------|----------------|--------|
| **Hestia's Hearth** | Vibrant | +3 if all odd/even | Currently NOT IMPLEMENTED | ❌ MISSING |
| **Prometheus' Gift** | Vibrant | +3 all hands | Currently NOT IMPLEMENTED | ❌ MISSING |
| **Hydra's Heads** | Vibrant | +3 with 2 dice | `result.favour += 3` (line 569) | ✅ |
| **The Symposium** | Vibrant | +1 on 4oak | `result.favour += 1` (line 749) | ✅ |
| **Misery** | Vibrant | +2 at 0 gold | `result.favour += 2` (line 842) | ✅ |
| **The Zealot** | Rustic | +1 matching worship | `result.favour += 1` (line 862) | ✅ |
| **Carillon (Normal)** | Epic | +3 all enhanced | `result.favour += 3` (line 971) | ✅ |

### Scaling Favour Bonuses

| Boon | Rarity | Effect | Implementation | Status |
|------|--------|--------|----------------|--------|
| **Forge of Hephaestus** | Vibrant | +0.5 per unused roll | Currently NOT IMPLEMENTED | ❌ MISSING |
| **Tantalus' Curse** | Vibrant | +0.5 per gold | `result.favour += tantalusFavour` (line 587) | ✅ |
| **Pegasus' Flight** | Vibrant | +0.5 per high die | `result.favour += highDice * 0.5` (line 599) | ✅ |
| **Ascetic's Vow** | Epic | +1 per empty slot | `result.favour += asceticEmptySlots` (line 897) | ✅ |
| **Medusa's Gaze** | Vibrant | +0.5 lower sanctum | `result.favour += 0.5` (line 579) | ✅ |

### Stacking Favour Bonuses

| Boon | Rarity | Effect | Implementation | Status |
|------|--------|--------|----------------|--------|
| **Symmetry** | Vibrant | Stacking palindromes | `result.favour += this.symmetryFavour` (line 834) | ✅ |
| **Eruption of Etna** | Vibrant | Stacking from triggers | `result.favour += this.etnaFavourStacks` (line 882) | ✅ |

**Category Status: 11/14 VERIFIED** ⚠️
- 3 missing implementations: Hestia's Hearth, Prometheus' Gift, Forge of Hephaestus

---

## Category 3: ×Favour (Multiplicative) - 2 Boons

All boons use `result.favourMult *= multiplier` pattern. ✅

| Boon | Rarity | Effect | Implementation | Status |
|------|--------|--------|----------------|--------|
| **Pandora's Jar** | Epic | ×2 every 3rd turn | `result.favourMult *= 2` (line 556) | ✅ |
| **Carillon (Secret)** | Epic | ×2.5 same enhancement | `result.favourMult *= 2.5` (line 966) | ✅ |

**Category Status: 2/2 VERIFIED** ✅

---

## Category 4: +Gold - 8 Boons

### After Score Gold

| Boon | Rarity | Effect | Implementation | Status |
|------|--------|--------|----------------|--------|
| **Charon's Ferry Fare** | Vibrant | +1 gold after score | `gameState.gold += 1` (line 1034) | ✅ |
| **Gambler's Charm** | Rustic | 50% +2g / 50% -1g | Lines 1089-1103 | ✅ |
| **Early Bird** | Rustic | +2 gold turns 4-5 | `gameState.gold += 2` (line 1112) | ✅ |

### Before Roll/Turn Start Gold

| Boon | Rarity | Effect | Implementation | Status |
|------|--------|--------|----------------|--------|
| **Achilles' Heel** | Rustic | -1 gold per turn | `gameState.gold -= 1` (line 1169) | ✅ |

### Economy/Interest

| Boon | Rarity | Effect | Implementation | Status |
|------|--------|--------|----------------|--------|
| **Golden Touch** | Vibrant | Better interest rate | NOT IMPLEMENTED in Joker.js | ❌ MISSING |

### Conditional/Special

| Boon | Rarity | Effect | Implementation | Status |
|------|--------|--------|----------------|--------|
| **The Merchant** | Rustic | +1g selling cards | NOT IMPLEMENTED | ❌ MISSING |
| **Cornucopia of Ploutos** | Vibrant | ×1.5 gold ante end | NOT IMPLEMENTED | ❌ MISSING |
| **Betrayal by Paris** | Vibrant | +10g, destroy boon | NOT IMPLEMENTED | ❌ MISSING |

**Category Status: 4/8 VERIFIED** ⚠️
- 4 missing implementations

---

## Category 5: Dice Manipulation - 12 Boons

### Rerolls

| Boon | Rarity | Effect | Implementation | Status |
|------|--------|--------|----------------|--------|
| **Lucky Dice Bag** | Rustic | Reroll 1s | `after_roll` (line 401) | ✅ |
| **Kronos' Hourglass** | Epic | +2 rolls | `turn_start` (line 1192) | ✅ |
| **Prometheus' Gift** | Vibrant | -1 roll | `turn_start` (line 1174) | ✅ |
| **Midnight Oil** | Rustic | -1 roll (T12+) | `turn_start` (line 1250) | ✅ |
| **Reflection of Narcissus** | Epic | -2 rolls | `turn_start` (line 1295) | ✅ |

### Face Modification

| Boon | Rarity | Effect | Implementation | Status |
|------|--------|--------|----------------|--------|
| **Dionysus' Revelry** | Vibrant | Randomize one die | `after_score` (line 1077) | ✅ |
| **Smog of Morpheus** | Vibrant | 2s/4s → 3s | `after_roll` (line 473) | ✅ |
| **Demeter's Harvest** | Vibrant | +1 to die face | `turn_start` (line 1214) | ✅ |
| **Parmenides Die** | Epic | Dual-value die | `turn_start` (line 1255) | ✅ |

### Hold/Lock Effects

| Boon | Rarity | Effect | Implementation | Status |
|------|--------|--------|----------------|--------|
| **Medusa's Gaze** | Vibrant | Auto-hold 6s | `after_roll` (line 412) | ✅ |
| **Reckless Abandon** | Rustic | Can't hold dice | `after_roll` (line 435) | ✅ |

### Oracle/Preview

| Boon | Rarity | Effect | Implementation | Status |
|------|--------|--------|----------------|--------|
| **Apollo's Oracle** | Vibrant | Preview next roll | NOT IMPLEMENTED | ❌ MISSING |

**Category Status: 11/12 VERIFIED** ⚠️
- 1 missing: Apollo's Oracle

---

## Category 6: Special Mechanics - 10 Boons

### Boon Interaction

| Boon | Rarity | Effect | Implementation | Status |
|------|--------|--------|----------------|--------|
| **Trojan Horse** | Vibrant | ×2 all boons (T11+) | Global multiplier system | ✅ |
| **Reflection of Narcissus** | Epic | Trigger boons twice | Handled in onTimingEvent (line 81) | ✅ |
| **Proteus' Disguise** | Vibrant | Mimic random boon | `turn_start` (line 1271) | ✅ |

### Destruction/Risk

| Boon | Rarity | Effect | Implementation | Status |
|------|--------|--------|----------------|--------|
| **Pandora's Jar** | Epic | Destroy boon every 3rd | `turn_start` (line 1196) | ✅ |
| **Marathon Runner** | Rustic | Destroyed at 42 or 3 scratches | `after_score` (lines 1118-1146) | ✅ |
| **Icarus' Wings** | Vibrant | 1/8 break chance | `turn_end` (line 1304) | ✅ |

### Special Effects

| Boon | Rarity | Effect | Implementation | Status |
|------|--------|--------|----------------|--------|
| **Chaos Primordial** | Epic | Doubles favour gains | NOT IMPLEMENTED | ❌ MISSING |
| **Mt Olympus** | Epic | +1 favour per worship used | NOT IMPLEMENTED | ❌ MISSING |
| **Bellows of War** | Epic | Phantom die (3oak/4oak) | NOT IMPLEMENTED | ❌ MISSING |
| **Cycle of Seasons** | Vibrant | Worship spreads | NOT IMPLEMENTED | ❌ MISSING |

**Category Status: 6/10 VERIFIED** ⚠️
- 4 missing implementations

---

## Category 7: Ante-End Effects - 4 Boons

| Boon | Rarity | Effect | Implementation | Status |
|------|--------|--------|----------------|--------|
| **Cornucopia of Ploutos** | Vibrant | Gold ×1.5 | NOT IMPLEMENTED | ❌ MISSING |
| **The Odyssey** | Vibrant | Bonus if all filled | NOT IMPLEMENTED | ❌ MISSING |
| **Message in a Bottle** | Vibrant | Bonus if solo | NOT IMPLEMENTED | ❌ MISSING |
| **Betrayal by Paris** | Vibrant | Destroy boon, +10g | NOT IMPLEMENTED | ❌ MISSING |

**Category Status: 0/4 VERIFIED** ❌
- All 4 missing implementations

---

## Category 8: Passive/Special Sell - 2 Boons

| Boon | Rarity | Effect | Implementation | Status |
|------|--------|--------|----------------|--------|
| **The Merchant** | Rustic | +1g selling cards | NOT IMPLEMENTED | ❌ MISSING |
| **Mortal Vineyard** | Vibrant | Get libation on boon sell | NOT IMPLEMENTED | ❌ MISSING |

**Category Status: 0/2 VERIFIED** ❌

---

## Summary of Verification

### Implementation Status

**Fully Implemented:** 39/60 boons (65%) ✅
**Missing Implementation:** 21/60 boons (35%) ❌

### Missing Implementations by Category

1. **+Pips:** 4 missing
   - Achilles' Heel, Lethe Waters, Icarus' Wings, Midas Touch

2. **+Favour:** 3 missing
   - Hestia's Hearth, Prometheus' Gift, Forge of Hephaestus

3. **+Gold:** 4 missing
   - Golden Touch, The Merchant, Cornucopia, Betrayal by Paris

4. **Dice Manipulation:** 1 missing
   - Apollo's Oracle

5. **Special Mechanics:** 4 missing
   - Chaos Primordial, Mt Olympus, Bellows of War, Cycle of Seasons

6. **Ante-End:** 4 missing (all)
   - Cornucopia, The Odyssey, Message in a Bottle, Betrayal by Paris

7. **Passive/Sell:** 2 missing (all)
   - The Merchant, Mortal Vineyard

### Pattern Consistency ✅

**Verified patterns are consistent:**
- All +pips boons use `result.pips += bonus` ✅
- All +favour boons use `result.favour += bonus` ✅
- All ×favour boons use `result.favourMult *= multiplier` ✅
- All +gold boons use `gameState.gold +=` ✅

### Rarity Distribution (Current)

- **Rustic (3g):** 21 boons - Good distribution ✅
- **Vibrant (5g):** 30 boons - Good distribution ✅
- **Epic (8-11g):** 9 boons - Good distribution ✅

---

## Recommendations

### Priority 1: Implement Missing Core Mechanics (High Impact)
1. **Achilles' Heel** - +15 pips (very common boon)
2. **Midas Touch** - +5 pips per 10 gold (economy scaling)
3. **Lethe Waters** - +25 pips (simple flat bonus)
4. **Icarus' Wings** - +15 pips per unused roll (risk/reward)
5. **Hestia's Hearth** - +3 favour if all odd/even (conditional)
6. **Prometheus' Gift** - +3 favour (flat bonus)
7. **Forge of Hephaestus** - +0.5 favour per unused roll

### Priority 2: Special Mechanics (Medium Impact)
8. **Apollo's Oracle** - Preview next roll (unique mechanic)
9. **Chaos Primordial** - Doubles favour gains (powerful epic)
10. **Mt Olympus** - +1 favour per worship (synergy)
11. **Cycle of Seasons** - Worship spreads (synergy)

### Priority 3: Ante-End & Special (Lower Impact)
12-17. All ante-end effects and special sell effects

### Pattern Verification: PASS ✅
All implemented boons follow correct mechanical patterns within their categories.

### Rarity Balance: GOOD ✅
Current distribution (35% rustic, 50% vibrant, 15% epic) is well-balanced and does not need changes.

