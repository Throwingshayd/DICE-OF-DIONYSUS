# 🧪 COMPREHENSIVE TESTING GUIDE - 56 Boons

**Date:** October 14, 2025  
**Build:** v1.04 - All Bug Fixes Complete  
**Status:** Ready for Testing

---

## ✅ PRE-FLIGHT CHECK

### Fixed Issues:
1. ✅ Duplicate boon triggers removed
2. ✅ Array naming fixed (gameState.jokers standardized)
3. ✅ Infinite loops protected (Narcissus try-finally)
4. ✅ Face corruption fixed (Dionysus resets properly)
5. ✅ Dynamic stats reset each turn
6. ✅ Marathon Runner 3-scratch system
7. ✅ Pandora's Jar can't destroy itself
8. ✅ Trojan Horse double-multiply exploit fixed
9. ✅ Duplicate method definitions removed
10. ✅ Better UX feedback for 10+ boons

---

## 🎮 MANUAL TESTING CHECKLIST

### Phase 1: Individual Boon Testing (Priority)

Test each boon in isolation:

#### EPIC TIER (10 boons):
- [ ] **Pandora's Jar** - Verify destroys boon on turn 3/6/9, can't destroy itself
- [ ] **Hephaestus' Forge** - Pairs count as Three of Kind
- [ ] **Kronos' Hourglass** - +2 rolls, -20% score penalty applies
- [ ] **The Fates' Loom** - Consecutive dice → ×3 favour
- [ ] **The Pantheon** - Counts unique gods correctly
- [ ] **Parmenides Die** - Dual-value die marked (NOTE: Not integrated with scoring yet)
- [ ] **Ascetic's Vow** - Empty slots give favour correctly
- [ ] **Bellows of War** - Three of Kind → Four of Kind scoring
- [ ] **Carillon of the Muses** - All 5 enhanced → ×3 favour, same type → ×5
- [ ] **Reflection of Narcissus** - Boons trigger twice, -2 rolls

#### VIBRANT TIER (23 boons):
- [ ] **Sisyphus' Boulder** - Shows dynamic "+X Pips" for rerolls
- [ ] **Demeter's Harvest** - One random die face +1 each turn
- [ ] **Medusa's Gaze** - Auto-holds 6s, +×0.5 favour on lower sanctum
- [ ] **Dionysus' Revelry** - Randomizes one die's faces, resets next turn
- [ ] **Apollo's Oracle** - Preview next roll (NOTE: Check if implemented)
- [ ] **Hydra's Heads** - Scoring with exactly 2 dice → +3 favour
- [ ] **Tantalus' Curse** - +0.5 favour per gold, blocks spending
- [ ] **Pegasus' Flight** - Dice 6+ → +0.5 favour each
- [ ] **Cerberus' Watch** - First 3 held dice → +3 pips each
- [ ] **Orpheus' Lyre** - Same category twice → ×2 favour
- [ ] **Trojan Horse** - Turn 11: Big activation message, ×2 all boons
- [ ] **The Symposium** - 4+ of a kind → +×1 favour
- [ ] **Golden Touch** - Interest rate 1 per 3 gold (NOTE: Check GameEngine)
- [ ] **Doubling Season** - Even dice ×2, odd dice -1
- [ ] **Symmetry** - Palindrome adds +0.5 favour (stacks)
- [ ] **Misery** - 0 gold → ×2 favour
- [ ] **Smog of Morpheus** - Final roll: 2s & 4s → 3s
- [ ] **Mortal Vineyard** - Sell boon → random libation (NOTE: Check shop code)
- [ ] **Proteus' Disguise** - Shows "→[Boon Name]" on card
- [ ] **Cornucopia of Ploutos** - Ante end: gold ×1.5 (NOTE: Check GameEngine)
- [ ] **The Odyssey** - All categories scored → +500 pips
- [ ] **Message in a Bottle** - Solo ante → +50% threshold (NOTE: Check condition)
- [ ] **Betrayal by Paris** - Ante end: destroy boon, +10 gold
- [ ] **Eruption of Etna** - Shows "🎴X" trigger count, 3+ → +×1 favour
- [ ] **Cycle of Seasons** - Worship triggers another god (NOTE: Check implementation)
- [ ] **Gold Standard** - Gold enhancements → +3 pips each
- [ ] **Nyxian Seduction** - Chance: +69 pips, seduce random god

#### RUSTIC TIER (23 boons):
- [ ] **Achilles' Heel** - +15 pips, -1 gold per turn
- [ ] **Midas Touch** - +5 pips per 10 gold
- [ ] **Icarus' Wings** - +15 pips per unused roll, 1/8 break chance
- [ ] **Lethe Waters** - Dice ≤2 ignored, +25 pips
- [ ] **Forge of Hephaestus** - +×0.5 favour per unused roll (max ×1.5)
- [ ] **Prometheus' Gift** - +3 favour, -1 roll
- [ ] **Chaos Primordial** - ×1.5 favour, pips randomized 1-40
- [ ] **Charon's Ferry Fare** - +1 gold per score (not scratch)
- [ ] **Lucky Dice Bag** - Auto-reroll 1s
- [ ] **Weighted Dice** - +1 pip per die
- [ ] **Philosopher's Stone** - 3 favour → 1 gold
- [ ] **Gambler's Charm** - 50% +2g, 50% -1g
- [ ] **Marathon Runner** - Shows "X/42" and "💀X/3" scratches
- [ ] **Mathematician's Compass** - Even sum → +10 pips
- [ ] **Prime Time** - Primes (2,3,5,7) → +1 pip each
- [ ] **The Locksmith** - Held dice gain +1 pip per roll held
- [ ] **The Merchant** - Sell cards → +1 extra gold
- [ ] **The Heretic** - Shows stacks, resets on worship
- [ ] **Reckless Abandon** - +50 pips, can't hold dice
- [ ] **Typhon** - All 1s first roll → +90% threshold
- [ ] **Early Bird** - Shows phase: ☀️ Morning / 💰 Midday / 🌙 Evening
- [ ] **Assembly of Heroes** - Full slots → +15 pips
- [ ] **Divine Synergy** - Matching rarities → +5 pips per match
- [ ] **The Zealot** - Match last worship god → +×1 favour
- [ ] **Journey of Perseus** - Every 100 score → +10 pips

---

## 🧪 EDGE CASE TESTING

### Critical Edge Cases:
1. **Empty Arrays:**
   - [ ] Buy first boon (The Pantheon should work with empty god set)
   - [ ] Proteus with no other boons (should show "No target")
   
2. **Self-Reference:**
   - [ ] Pandora's Jar with only itself (should NOT destroy self)
   - [ ] Message in a Bottle solo run (should work with itself only)
   
3. **Stack Overflow:**
   - [ ] Narcissus + Narcissus (should prevent infinite loop)
   - [ ] 10+ boons triggering simultaneously
   
4. **State Persistence:**
   - [ ] Marathon Runner scratches survive save/load
   - [ ] Heretic stacks reset at ante end
   - [ ] Symmetry favour persists across turns
   - [ ] Eruption of Etna stacks survive save/load
   
5. **Destruction/Removal:**
   - [ ] Sell boon that Proteus is mimicking (should handle gracefully)
   - [ ] Marathon Runner auto-destroys at 42 pips (victory message)
   - [ ] Marathon Runner destroys after 3 scratches
   - [ ] Pandora destroys random boon (verify removed from UI)
   - [ ] Icarus breaks (1/8 chance after turn 1)

---

## 🎯 COMBO TESTING

### Synergy Combinations:
- [ ] **The Pantheon + multiple gods** - Verify unique count
- [ ] **Divine Synergy + same rarity boons** - Verify stacking
- [ ] **Assembly of Heroes + full slots** - Verify triggers
- [ ] **Trojan Horse + any boon** - Verify ×2 after turn 10
- [ ] **Narcissus + high-value boon** - Verify double-trigger
- [ ] **Proteus + powerful boon** - Verify mimics correctly
- [ ] **Eruption of Etna + 5 boons** - Count triggers correctly

### Anti-Synergy (Should Work):
- [ ] **The Heretic + Worship cards** - Verify resets
- [ ] **Tantalus + Shop** - Verify can't buy (NOTE: Needs implementation)
- [ ] **Reckless Abandon + any hold strategy** - Verify unholds
- [ ] **Ascetic's Vow + full boon slots** - Verify low favour

---

## 📊 PERFORMANCE TESTING

- [ ] 5 boons active (normal gameplay)
- [ ] 10 boons active (with artifacts)
- [ ] All 56 boons in collection
- [ ] Long session (3+ hours)
- [ ] Multiple save/load cycles
- [ ] Rapid boon buy/sell spam

---

## 🎲 SPECIFIC SCENARIOS

### Scenario 1: Marathon Runner Full Lifecycle
1. Buy Marathon Runner
2. Roll 3 times (should show "3/42")
3. Score (should apply +3 pips)
4. Next turn: Roll 3 more times (should show "6/42")
5. Scratch (should show "💀1/3")
6. Scratch again (should show "💀2/3")
7. Scratch third time (should DESTROY with message)

### Scenario 2: Trojan Horse Power Spike
1. Buy Trojan Horse + 2 other boons
2. Play through turns 1-10 normally
3. Turn 11: Verify BIG activation message
4. Check if other boons ×2 (verify pips doubled)

### Scenario 3: Eruption of Etna Stacking
1. Buy Eruption of Etna + 3+ other boons
2. Score a hand (4+ boons should trigger)
3. Check card shows "🎴4" trigger count
4. Verify +×1 favour added
5. Next turn: verify favour STACKS (doesn't reset)

### Scenario 4: Symmetry Permanent Growth
1. Buy Symmetry
2. Roll palindrome: 1-2-3-2-1 (should add +0.5 favour)
3. Next turn: roll another palindrome (should add +0.5 MORE)
4. Check card shows cumulative favour bonus

### Scenario 5: First Blood + Midnight Oil Timing
1. Buy both boons ante 1
2. Turn 1: Score (First Blood should trigger)
3. Turns 2-11: First Blood shows "✗ Next Ante"
4. Turn 12: Midnight Oil shows "✓ ACTIVE"

---

## 🐛 KNOWN ISSUES (Not Yet Fixed)

### NOT IMPLEMENTED:
1. **Parmenides Die** - Dual-value NOT integrated with scoring logic
2. **The Heretic** - Ante-end reset not implemented (needs GameEngine)
3. **Tantalus' Curse** - Shop blocking not implemented
4. **Golden Touch** - Interest calculation needs GameEngine check
5. **Message in a Bottle** - Condition logic needs verification
6. **Apollo's Oracle** - Preview mechanic needs verification

### DEFERRED:
1. Lower sanctum categories list should use BOON_CONSTANTS
2. God-to-category mapping should use GOD_CATEGORY_MAP
3. More magic numbers should be converted to constants

---

## 📝 TESTING NOTES

### What to Watch For:
1. **Console Errors** - Any red errors in F12 console
2. **Double Messages** - Same boon message appearing twice
3. **Incorrect Values** - Pips/favour not matching expected
4. **UI Glitches** - Cards not updating, stats not showing
5. **Crash on Edge Cases** - Empty arrays, null values
6. **Save/Load Bugs** - State not persisting correctly

### How to Test Efficiently:
1. Open console (F12) and watch for errors
2. Use `console.log(window.game.state)` to inspect state
3. Force trigger rare events (edit code temporarily if needed)
4. Take screenshots of any bugs found
5. Note down exact reproduction steps

---

## 🎯 SUCCESS CRITERIA

**Game is "Amazing" when:**
- [ ] All 56 boons trigger correctly without bugs
- [ ] No duplicate triggers or crashes
- [ ] Dynamic stats update in real-time
- [ ] All conditional boons show status clearly
- [ ] Messages are informative, not spammy
- [ ] Edge cases handled gracefully
- [ ] Save/load preserves all boon state
- [ ] Performance smooth with 10+ boons

---

## 🚀 READY TO TEST!

**Start with:** Buy a few common boons and play normally for 3-4 antes.

**Then:** Try specific boons from the priority list above.

**Finally:** Test edge cases and combos.

**Report back any bugs found!** 🎲✨

---

## 📞 DEBUGGING TIPS

### Console Commands:
```javascript
// Inspect game state
console.log(window.game.state);

// Check current boons
console.log(window.game.state.jokers);

// Force trigger Marathon at 42
const marathon = window.game.state.jokers.find(j => j.id === 'marathon_runner');
if (marathon) marathon.marathonPips = 42;

// Force trigger Typhon
window.game.state.typhonBonus = 300;

// Force all 1s (testing Typhon trigger)
window.game.state.dice.forEach(d => d.face = 1);
```

### Quick Tests:
```javascript
// Test Pandora's Jar destruction
window.game.state.turn = 3;

// Test Trojan Horse activation  
window.game.state.turn = 11;

// Test First Blood reset
window.game.state.scorecard = {};

// Test Marathon scratch count
const marathon = window.game.state.jokers.find(j => j.id === 'marathon_runner');
console.log('Scratches:', marathon?.marathonScratches);
console.log('Pips:', marathon?.marathonPips);
```

---

**Happy Testing!** 🎮

