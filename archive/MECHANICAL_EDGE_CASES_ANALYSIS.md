# 🔍 Mechanical Edge Cases Analysis
**Generated:** October 16, 2025

---

## 🎯 Purpose
This document identifies potential edge cases and bugs in the game mechanics that should be monitored and tested regularly.

---

## 🚨 CRITICAL EDGE CASES

### 1. **Mother of Pearl Enhancement - Multiple Instances**
**Location:** `js/classes/Die.js:339-355`

**Issue:** When multiple dice have Mother of Pearl, adjacency logic could create circular dependencies.

**Scenario:**
```
Die 1: Mother of Pearl (selects Die 2)
Die 2: Mother of Pearl (selects Die 1)
Die 3: Mother of Pearl (selects Die 2)
```

**Current Implementation:**
- Uses `Math.random()` instead of seeded `prng` ❌
- No protection against circular references
- Processed sequentially, so earlier dice affect later ones

**Potential Bug:**
- Non-deterministic behavior (breaks seeded RNG)
- Infinite value amplification with stacked Mother of Pearls

**Test Case:**
```javascript
// All dice with Mother of Pearl
allDice.forEach((die, i) => {
    die.addFaceEnhancement(die.currentFace, 'mother_of_pearl');
});
```

**Fix Required:**
```javascript
// Line 351 in Die.js should use prng
const randomAdjacent = adjacentDice[Math.floor(window.game.prng.random() * adjacentDice.length)];
```

**Priority:** 🔴 **HIGH** (breaks determinism)

---

### 2. **Wild Enhancement - Race Condition During Scoring**
**Location:** `js/classes/Die.js:325-332`

**Issue:** Wild value selection requires user input during scoring calculation.

**Scenario:**
```
1. User confirms score
2. Wild die prompts for +1/-1 selection
3. Sequential animator starts
4. User hasn't chosen yet
5. Score calculates with undefined wildValue
```

**Current Protection:**
- Wild selection UI appears before scoring
- `wildValue` persists until die is rolled again

**Potential Bug:**
- Rapid clicking could skip wild selection
- Multiple wild dice = multiple prompts (confusing UX)

**Test Case:**
```javascript
// 3 wild dice, confirm score immediately
dice[0].addFaceEnhancement(4, 'wild');
dice[1].addFaceEnhancement(3, 'wild');
dice[2].addFaceEnhancement(5, 'wild');
game.confirmScore('Yahtzee'); // Before selecting wild values
```

**Priority:** 🟡 **MEDIUM** (functional but UX issue)

---

### 3. **Bellows of War - Virtual Die Value Overflow**
**Location:** `js/game/GameEngine.js:1722-1736, 1748-1771`

**Issue:** Bellows adds virtual die to pips calculation, could cause score overflow.

**Scenario:**
```
Four 6's + Bellows (treated as Yahtzee)
Base pips: 24 (4×6)
Virtual die: +6
Category bonus: +50 (Yahtzee)
Total: 80 pips base

With stacking boons, this could exceed safe integer limits.
```

**Current Protection:**
- None - pips can grow indefinitely

**Potential Bug:**
- Score overflow with extreme combos
- Bellows message spams if multiple valid categories

**Test Case:**
```javascript
// Bellows + Midas + Icarus + other pip boons
game.state.gold = 1000;
// Roll four 6's
// Check if score > Number.MAX_SAFE_INTEGER
```

**Priority:** 🟢 **LOW** (unlikely in normal play)

---

### 4. **Dionysus' Revelry - Two Pairs Logic**
**Location:** `js/game/GameEngine.js:1774-1794`

**Issue:** Two pairs counting as Full House could conflict with other boons.

**Scenario:**
```
Roll: [2, 2, 3, 3, 5]
- Dionysus' Revelry: Valid Full House
- Ocean's Depth (Eights boon): Requires actual 3-of-kind
```

**Current Implementation:**
- Checks both normal Full House AND two pairs
- Message shown only if not a real Full House

**Potential Bug:**
- Boons that count specific cards might not recognize "fake" Full House
- Edge case with Bellows + Dionysus (pair + Bellows = Full House?)

**Test Case:**
```javascript
game.state.jokers = [
    new Joker({id: 'dionysus_revelry'}),
    new Joker({id: 'ocean_depths'}) // May expect real Full House
];
// Roll two pairs, score as Full House
```

**Priority:** 🟢 **LOW** (works as intended, just document)

---

### 5. **Parchment Enhancement - Probability Edge Cases**
**Location:** `js/game/GameEngine.js:1854-1900`

**Issue:** Recently fixed (Oct 12) but should be monitored for balance.

**Scenario:**
```
Multiple dice with parchment on same face
- Each triggers independently
- Could generate massive gold/favour with luck
```

**Current Implementation:**
```javascript
// Gold check: 6.67% per die
if (prng.random() < ENHANCEMENT_BONUSES.PARCHMENT.goldChance) {
    gold += ENHANCEMENT_BONUSES.PARCHMENT.gold;
}
// Favour check: 10% per die (mutually exclusive with gold)
else if (prng.random() < ENHANCEMENT_BONUSES.PARCHMENT.favourChance) {
    favour += ENHANCEMENT_BONUSES.PARCHMENT.favour;
}
```

**Potential Bug:**
- Multiple parchments with good RNG = exponential growth
- Balance issue, not mechanical bug

**Test Case:**
```javascript
// All 5 dice with parchment on face 6
// Roll Yahtzee (5 sixes)
// Check gold/favour generation over 100 turns
```

**Priority:** 🟡 **MEDIUM** (balance monitoring)

---

### 6. **Narcissus Reflection - Infinite Loop Protection**
**Location:** `js/classes/Joker.js:81-86`

**Issue:** Double-application could cause infinite loops if flag isn't set correctly.

**Scenario:**
```
1. Narcissus applies
2. Sets narcissusDoubling = true
3. Calls applyTimingEffect again
4. If Narcissus checks itself, could recurse
5. Stack overflow
```

**Current Protection:**
```javascript
if (hasNarcissus && this.id !== 'reflection_of_narcissus' && !gameState.narcissusDoubling) {
    gameState.narcissusDoubling = true;
    result = this.applyTimingEffect(timingEvent, gameState, result);
    gameState.narcissusDoubling = false;
}
```

**Potential Bug:**
- If `narcissusDoubling` flag isn't cleared (exception thrown), permanent lock
- Multiple Narcissus boons (should be unique but not enforced)

**Test Case:**
```javascript
// Force two Narcissus boons
game.state.jokers.push(new Joker({id: 'reflection_of_narcissus'}));
game.state.jokers.push(new Joker({id: 'reflection_of_narcissus'}));
// Try to score
```

**Priority:** 🟡 **MEDIUM** (unlikely but catastrophic)

---

### 7. **Proteus Mimic - Error Handling**
**Location:** `js/classes/Joker.js:339-358`

**Issue:** Mimicking boons could cause unexpected behavior if mimicked boon is removed.

**Scenario:**
```
1. Proteus set to mimic "Midas Touch"
2. Player sells Midas Touch
3. Proteus still has proteusMimicId set
4. Tries to find boon that doesn't exist
```

**Current Protection:**
```javascript
const mimickedBoon = gameState.jokers?.find(b => b.id === gameState.proteusMimicId);
if (!mimickedBoon || !mimickedBoon.timing[timingEvent]) {
    return eventData; // Gracefully fails
}
```

**Potential Bug:**
- Mimic ID persists across turns even if boon is sold
- No UI feedback that Proteus has no target

**Test Case:**
```javascript
// Buy Proteus + Midas
// Set Proteus to mimic Midas
// Sell Midas
// Proteus should show "No target" in UI
```

**Priority:** 🟢 **LOW** (gracefully handled, UX issue)

---

### 8. **Trojan Horse Activation - Timing Check**
**Location:** `js/game/GameEngine.js:2238-2242`

**Issue:** Activates at turn 11, but only shows message once.

**Scenario:**
```
- Player reaches turn 11
- Message shows "TROJAN HORSE ACTIVATES"
- But effect applies every turn after turn 10
- Confusing UX: is it permanent or one-time?
```

**Current Implementation:**
```javascript
if (gameState.turn === 11) {
    window.game?.showMessage?.("🐴 THE TROJAN HORSE ACTIVATES! All boons now ×2!", 5000);
}
```

**Potential Bug:**
- None mechanically (works correctly)
- UX: unclear if it's permanent

**Test Case:**
```javascript
// Buy Trojan Horse early
// Fast-forward to turn 11
// Verify ×2 multiplier activates
// Continue to turn 12, 13 - still ×2?
```

**Priority:** 🟢 **LOW** (cosmetic documentation)

---

### 9. **Kronos' Hourglass - Turn Start Timing**
**Location:** `js/game/GameEngine.js:1615-1621`

**Issue:** Fixed Oct 16 (moved from executeRoll to nextTurn), monitor for regressions.

**Scenario:**
```
- Kronos gives +1 roll per turn
- If called in executeRoll() instead of nextTurn():
  - Each roll triggers turn_start
  - Infinite rolls
```

**Current Protection:**
```javascript
// In nextTurn(), AFTER setting default rolls:
this.state.rollsLeft = GAME_BALANCE.STARTING_ROLLS;
// Then apply turn_start timing (Kronos adds +1)
this.applyJokerEffects('turn_start', this.state);
```

**Potential Bug:**
- Future refactoring could move turn_start back to wrong location
- Need regression test

**Test Case:**
```javascript
// Buy Kronos
// Start new turn
// Verify rollsLeft = 4 (not infinite)
// Roll all 4 times
// Verify can't roll again
```

**Priority:** 🔴 **HIGH** (monitor for regressions)

---

### 10. **Tantalus' Curse - Gold Blocking**
**Location:** `js/ui/UIManager.js:1754-1810`

**Issue:** Fixed Oct 16, but needs testing in all purchase contexts.

**Scenario:**
```
- Player has Tantalus' Curse
- Has 100 gold
- Tries to buy:
  1. Artifact from shop
  2. Boon from shop
  3. Libation from shop
  4. Pack from shop
  5. Reroll shop
```

**Current Protection:**
```javascript
// Added to 4 purchase methods:
const hasTantalusCurse = this.engine.state.jokers?.some(j => j.id === 'tantalus_curse');
if (hasTantalusCurse) {
    this.engine.showMessage("Tantalus' Curse prevents spending gold!", 2000);
    return;
}
```

**Potential Bug:**
- Future shop features might not include check
- Gold generation still works (intended)

**Test Case:**
```javascript
// Buy Tantalus' Curse
// Accumulate gold naturally
// Try all purchase methods
// All should be blocked
```

**Priority:** 🟡 **MEDIUM** (needs coverage testing)

---

## 🧮 SCORING FORMULA EDGE CASES

### 11. **Zero or Negative Favour**
**Location:** `js/game/GameEngine.js:672-900`

**Issue:** Division by zero or negative multipliers could break scoring.

**Current Protection:**
```javascript
favour = Math.max(0.1, favour); // Minimum 0.1x multiplier
```

**Potential Bug:**
- Boons that subtract favour could go negative without this check
- Boons that multiply favour by 0 would break scoring

**Test Case:**
```javascript
// Stack boons that reduce favour
// Verify favour never < 0.1
```

**Priority:** 🟢 **LOW** (well protected)

---

### 12. **Negative Pips**
**Location:** `js/game/GameEngine.js:672-900`

**Issue:** Pips subtraction could go negative.

**Current Protection:**
```javascript
pips = Math.max(0, pips); // Floor at 0
```

**Potential Bug:**
- Boons that subtract pips might need this check at multiple stages

**Test Case:**
```javascript
// Roll low values
// Apply pip-reducing boons
// Verify pips never negative
```

**Priority:** 🟢 **LOW** (well protected)

---

### 13. **Sequential Animation - Hover Interruption**
**Location:** `js/game/GameEngine.js:245-256, 858, 1006`

**Issue:** Fixed Oct 16 with `isScoring` flag, monitor for regressions.

**Current Protection:**
```javascript
if (this.state.isScoring) {
    return; // Block hover events during scoring
}
```

**Potential Bug:**
- If exception thrown during scoring, flag never cleared
- Player permanently locked out of scorecard interaction

**Test Case:**
```javascript
// Start scoring animation
// Rapidly hover over scorecard
// Force exception mid-animation
// Verify flag is cleared
```

**Priority:** 🟡 **MEDIUM** (needs exception handling)

---

## 🎲 DICE SYSTEM EDGE CASES

### 14. **Die Face Validation - Out of Range**
**Location:** `js/classes/Die.js:93-111`

**Issue:** Die face values should be 1-6, but enhancements allow 0-9.

**Current Protection:**
```javascript
isValidFace(faceValue) {
    const parsedFace = parseInt(faceValue, 10);
    return !isNaN(parsedFace) && 
           parsedFace >= 1 && 
           parsedFace <= 6;
}
```

**Potential Bug:**
- Enhanced faces (7, 8, 9) might fail validation when adding enhancements
- `MAX_DIE_FACE_WITH_ENHANCEMENTS` = 9, but validation checks 1-6

**Test Case:**
```javascript
// Modify face to 7 with Chalice of Helios
die.modifyFaceValue(6, +1); // Should become 7
die.addFaceEnhancement(7, 'gold'); // Will this fail validation?
```

**Priority:** 🟡 **MEDIUM** (inconsistent range checks)

---

### 15. **Die Serialization - Enhancement Sets**
**Location:** `js/classes/Die.js:376-415`

**Issue:** Sets are serialized to arrays, could cause issues on load.

**Current Implementation:**
```javascript
toJSON() {
    enhancements: Array.from(faceData.enhancements)
}
fromJSON(data) {
    face.enhancements = new Set(faceData.enhancements || []);
}
```

**Potential Bug:**
- Old save files without enhancements field
- Corrupted save with non-array enhancements

**Test Case:**
```javascript
// Save game with enhancements
// Load game
// Verify all enhancements preserved
```

**Priority:** 🟢 **LOW** (well handled)

---

## 🛒 SHOP & ECONOMY EDGE CASES

### 16. **Shop Reroll Cost Scaling**
**Location:** Not visible in current search, needs investigation

**Issue:** Reroll cost might overflow or become negative.

**Test Case:**
```javascript
// Reroll shop 100 times
// Verify cost doesn't overflow
```

**Priority:** 🟢 **LOW** (unlikely)

---

### 17. **Pack Opening - Double Claim**
**Location:** `js/ui/UIManager.js:2406-2554`

**Issue:** Double-click to claim could register twice rapidly.

**Current Protection:**
- Event listeners likely removed after claim
- Need to verify

**Test Case:**
```javascript
// Open pack
// Rapidly double-click same card
// Should only claim once
```

**Priority:** 🟡 **MEDIUM** (UX issue)

---

### 18. **Category Filtering - Empty Pools**
**Location:** `js/ui/UIManager.js:1553-1587`

**Issue:** If all cards require unlocked categories, shop might be empty.

**Current Protection:**
```javascript
if (availableCards.length === 0) {
    // Graceful handling with messages
}
```

**Potential Bug:**
- Players stuck if they can't unlock categories

**Test Case:**
```javascript
// Lock all bonus categories
// Generate shop
// Should show appropriate message
```

**Priority:** 🟢 **LOW** (gracefully handled)

---

## 📊 SAVE/LOAD EDGE CASES

### 19. **Save During Critical Operations**
**Location:** `js/game/GameEngine.js:2527-2550`

**Issue:** Auto-save could trigger during scoring or shop.

**Current Protection:**
```javascript
if (this.state.confirmationDialogOpen) return;
if (this.state.shopOpen) return;
if (this.state.isProcessing) return;
```

**Potential Bug:**
- If flags aren't set correctly, save during operation
- Could corrupt game state

**Test Case:**
```javascript
// Start scoring
// Trigger auto-save
// Should be blocked
```

**Priority:** 🟡 **MEDIUM** (critical for data integrity)

---

### 20. **Loading Old Save Versions**
**Location:** `js/utils/dataManager.js`

**Issue:** Old saves might not have new fields.

**Current Protection:**
- Needs investigation

**Test Case:**
```javascript
// Load save from v1.3
// Should migrate to v1.4 format
```

**Priority:** 🟡 **MEDIUM** (needs migration system)

---

## 🎯 TESTING PRIORITY SUMMARY

### 🔴 **Critical Priority:**
1. Mother of Pearl using Math.random() (breaks determinism)
2. Kronos' Hourglass regression testing (infinite rolls)

### 🟡 **Medium Priority:**
3. Wild enhancement race condition (UX issue)
4. Narcissus infinite loop (catastrophic if triggered)
5. Tantalus' Curse coverage (needs all purchase paths tested)
6. Sequential animation exception handling (could lock UI)
7. Die face validation ranges (0-9 vs 1-6 inconsistency)
8. Pack opening double-claim (UX issue)
9. Save during operations (data integrity)
10. Save version migration (backwards compatibility)

### 🟢 **Low Priority:**
11. All other documented edge cases (well protected or cosmetic)

---

## 🧪 RECOMMENDED TEST SUITE

### Test 1: Determinism Verification
```javascript
// Run same seed 10 times, verify identical results
const seed = 'DETERMINISM_TEST';
const results = [];
for (let i = 0; i < 10; i++) {
    app.startGame(seed);
    // Play through 5 turns
    results.push(game.state.totalScore);
}
// All results should be identical
```

### Test 2: Edge Case Stress Test
```javascript
// All dice with Mother of Pearl
// All boons that modify pips/favour
// Kronos + Apollo (max rolls)
// Score Yahtzee 100 times
// Verify no crashes, no infinite loops
```

### Test 3: Save/Load Integrity
```javascript
// Play 10 turns
// Save game
// Load game
// Continue 10 more turns
// Save again
// Verify no data loss
```

### Test 4: Shop Coverage
```javascript
// Buy Tantalus' Curse
// Try every shop interaction
// All should be blocked
```

---

## ✅ CONCLUSION

**Mechanical Health:** 🟢 **EXCELLENT**

Most edge cases are well-protected. The two critical issues are:
1. Mother of Pearl using `Math.random()` instead of seeded RNG
2. Need for comprehensive regression testing on recent fixes

All other edge cases are either:
- Already protected with safety checks
- Low probability scenarios
- UX issues rather than bugs

**Recommended Action:**
1. Fix Mother of Pearl RNG (1 line change)
2. Set up regression test suite for Kronos, Tantalus, etc.
3. Add exception handling to scoring animation
4. Document Trojan Horse permanence in UI

**Overall Assessment:** Game is production-ready with minor improvements needed.

