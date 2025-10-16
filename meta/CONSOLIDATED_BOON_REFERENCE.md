# 🎲 Consolidated Boon Reference Guide
**AI Learning Reference - Complete Boon Implementation System**

> **Purpose:** Comprehensive reference for AI assistants working on Dice of Dionysus  
> **Consolidates:** BOON_MECHANICS_GUIDE.md + BOON_IMPLEMENTATION_GUIDE.md + BOON_IMPLEMENTATION_PATTERNS.md  
> **Location:** meta/ (for AI metadata learning)  
> **Last Updated:** October 16, 2025

---

## 🎯 Quick Reference

### Timing System (Execution Order)
1. **turn_start** - Beginning of turn (ONCE per turn, in nextTurn() ONLY)
2. **before_roll** - Before dice roll animation
3. **after_roll** - After dice are rolled
4. **before_score** - Before calculating final score (main phase for bonuses)
5. **after_score** - After score is added
6. **turn_end** - End of turn
7. **ante_end** - End of ante (before shop)
8. **sell** - When selling cards

### Scoring Formula
```javascript
// Sequential calculation (Balatro-style):
basePips = sum of dice faces
+ enhancement bonuses (iron +5, mother of pearl, etc.)
+ category bonuses (Full House +25, Yahtzee +50, etc.)
+ boon pip bonuses (Midas, Icarus, etc.)
= totalPips

baseFavour = 1.5
+ boon favour bonuses (Hestia +3, Forge +0.5, etc.)
= additiveFavour

multiplicativeFavour = 1.0
* boon multipliers (Pandora ×2, Carillon ×2.5, etc.)
= totalMultiplier

FINAL = (totalPips) × (additiveFavour × totalMultiplier)
```

---

## 📋 Implementation Patterns

### Pattern 1: Simple Pip Bonus (Additive)
```javascript
case 'boon_id':
    result.pips += bonus;
    window.game?.showMessage?.("Boon Name: +X Pips!");
    break;
```

### Pattern 2: Conditional Favour
```javascript
case 'boon_id':
    if (condition) {
        result.favour += bonus;
        window.game?.showMessage?.("Boon Name: +X Favour!");
    }
    break;
```

### Pattern 3: Multiplicative Favour (Balatro-style)
```javascript
case 'boon_id':
    result.favourMult *= multiplier; // ×2, ×2.5, etc.
    window.game?.showMessage?.("Boon Name: ×X Favour!");
    break;
```

### Pattern 4: Gold Generation
```javascript
case 'boon_id':
    if (window.game && typeof window.game.updateGoldAnimated === 'function') {
        window.game.updateGoldAnimated(amount, "Boon Name");
    } else {
        gameState.gold += amount;
    }
    window.game?.showMessage?.("Boon Name: +X Gold!");
    break;
```

### Pattern 5: Turn Start Effect (Modify Rolls)
```javascript
// CRITICAL: Only in turn_start timing, never in executeRoll()
applyTurnStartEffect(gameState, eventData) {
    switch (this.id) {
        case 'kronos_hourglass':
            // Random rolls each turn (1-5)
            const randomRolls = Math.floor(gameState.prng.random() * 5) + 1;
            gameState.rollsLeft = randomRolls;
            window.game?.showMessage?.(`Kronos' Hourglass: ${randomRolls} rolls this turn!`);
            break;
    }
}
```

### Pattern 6: Scaling with Game State
```javascript
case 'midas_touch':
    // Pips based on gold
    const goldBonus = Math.floor(gameState.gold / BOON_EFFECTS.MIDAS_TOUCH.GOLD_PER_PIP);
    const pipBonus = goldBonus * BOON_EFFECTS.MIDAS_TOUCH.PIP_MULTIPLIER;
    result.pips += pipBonus;
    this.dynamicStats.pips = pipBonus; // Show in UI
    break;
```

### Pattern 7: Die Face Counting
```javascript
case 'ocean_depths':
    // Count specific die faces
    const eightCount = gameState.dice.filter(d => d.face === 8).length;
    if (eightCount > 0) {
        result.favour += eightCount * 0.5;
        window.game?.showMessage?.(`Ocean's Depth: +×${eightCount * 0.5} Favour!`);
    }
    break;
```

### Pattern 8: Category-Specific
```javascript
case 'boon_id':
    if (result.category === 'Yahtzee') {
        result.pips += 50;
        window.game?.showMessage?.("Boon Name: Yahtzee bonus!");
    }
    break;
```

---

## 🔧 33 Mechanical Categories

1. **Conditional Favour** - Add favour if condition met
2. **Gold Generation** - Award gold after actions
3. **Pips Bonus** - Direct pip additions
4. **Gold-Scaling** - Effects based on gold amount
5. **Unused Roll Bonus** - Rewards for unused rolls
6. **Favour Multiplier** - Multiplicative favour (Balatro-style)
7. **Multiplicative Favour** - Same as #6
8. **Roll Penalty** - Reduce rolls per turn
9. **Roll Randomizer** - Random rolls each turn
10. **Roll Counter** - Track rerolls used
11. **Permanent Modification** - Persistent changes
12. **Auto-Hold** - Automatically hold dice
13. **Auto-Reroll** - Automatically reroll dice
14. **Dice Transformation** - Change die values
15. **Dice Counter** - Count specific dice
16. **Hold Tracker** - Track held dice
17. **Turn Accumulator** - Build up over turns
18. **Turn-Based Effects** - Different each turn
19. **Matching Counter** - Count matching faces
20. **Slot Checker** - Check empty/full slots
21. **Destruction** - Remove cards
22. **Pattern Detector** - Detect dice patterns
23. **Dual-Value Modifier** - Modify multiple stats
24. **Global Multiplier** - Affect all boons
25. **Boon Mimic** - Copy other boon effects
26. **Trigger Counter** - Count boon triggers
27. **Effect Doubler** - Double effects (Narcissus)
28. **Enhancement Counter** - Count enhancements
29. **Threshold Reduction** - Lower requirements
30. **Worship Spreader** - Affect multiple gods
31. **Shop Block** - Prevent purchases
32. **Completion Bonus** - Reward for completing
33. **Solo Tracker** - Track specific patterns

---

## ⚠️ Critical Rules

### Edge Case Protections (ALWAYS REQUIRED)
```javascript
// Prevent negative pips
pips = Math.max(0, pips);

// Prevent zero/negative favour (division by zero)
favour = Math.max(0.1, favour);

// Prevent negative rolls
gameState.rollsLeft = Math.max(1, gameState.rollsLeft - penalty);

// Prevent infinite loops (Narcissus)
if (!gameState.narcissusDoubling) {
    gameState.narcissusDoubling = true;
    // Execute doubled effect
    gameState.narcissusDoubling = false;
}
```

### Timing System Rules
- **turn_start MUST be in nextTurn() ONLY** - Never in executeRoll() or rollDice()
- **Always use gameState.prng.random()** - Never Math.random() (breaks determinism)
- **Check for window.game existence** - Use optional chaining: `window.game?.showMessage?.()`
- **Update dynamicStats for UI** - Set this.dynamicStats.pips, .favour, .other for display

### State Management
```javascript
// Safe state access
const hasAbility = gameState.abilities?.abilityName || false;
const count = gameState.counters?.counterName || 0;
const jokers = gameState.jokers || [];

// Safe array operations
const filteredDice = (gameState.dice || []).filter(d => d.face === 6);
```

---

## 📊 Common Boon Patterns by Category

### Category: Pip Bonuses (Simple)
- Reckless Abandon: +50 pips (flat)
- Mathematician's Compass: +10 pips (if even sum)
- Sisyphus' Boulder: +5 pips per reroll

### Category: Gold Scaling
- Midas Touch: +1 pip per 5 gold
- Tantalus' Curse: +0.1 favour per gold (can't spend)

### Category: Favour Bonuses
- Hestia's Hearth: +3 favour (all odd/even)
- Hydra's Heads: +2 favour (exactly 2 dice)
- Ocean's Depth: +0.5 favour per 8 rolled

### Category: Multiplicative (Powerful)
- Pandora's Jar: +2 additive favour per turn (stacking)
- Carillon of Muses: ×2.5 favour (all same enhancement)
- Trojan Horse: ×2 all boons (after turn 10)

### Category: Roll Modification
- Kronos' Hourglass: Random 1-5 rolls per turn
- Apollo's Oracle: +1 roll, -20% score
- Icarus' Wings: +10 pips per unused roll

### Category: Gold Generation
- Charon's Ferry Fare: +1 gold per score
- Artemis' Blessing: +1 gold when scoring Ones
- Spring's Return: +1 gold per 2 when scoring Twos

---

## 🐛 Known Bug Fixes

### Kronos' Hourglass (Oct 16, 2025)
**Problem:** Infinite rolls  
**Cause:** turn_start called in executeRoll()  
**Fix:** Moved to nextTurn() AFTER setting default rolls  
**Result:** Works correctly - random 1-5 rolls per turn

### Trojan Horse (Oct 16, 2025)
**Problem:** Never activated  
**Cause:** Checked for artifact_trojan_horse instead of boon ID  
**Fix:** Check gameState.jokers for 'trojan_horse'  
**Result:** Activates at turn 11, ×2 all boons permanently

### Mother of Pearl (Oct 16, 2025)
**Problem:** Uses Math.random() instead of prng  
**Cause:** Line 351 in Die.js uses Math.random()  
**Fix:** Change to window.game.prng.random()  
**Status:** NEEDS FIX - breaks determinism

---

## 🧪 Testing Patterns

### Test Determinism
```javascript
// Same seed should give identical results
const seed = 'TEST123';
app.startGame(seed);
// Play through scenario
// Restart with same seed - results should match
```

### Test Edge Cases
```javascript
// Test with extreme values
gameState.gold = 1000; // Test gold scaling
gameState.rollsLeft = 0; // Test roll modification
gameState.dice.forEach(d => d.face = 6); // Test Yahtzee
```

### Test Timing
```javascript
// Verify timing phases execute in order
// Add Logger.debug() in each timing phase
// Check console for correct sequence
```

---

## 📝 Adding a New Boon (Complete Workflow)

### Step 1: Define in gameData.js
```javascript
{
    id: "new_boon_id",
    name: "Greek Mythology Name",
    rarity: "vibrant", // rustic/vibrant/epic
    cost: 4,
    effect: "Clear description of what it does",
    god: "Appropriate God",
    timing: { before_score: true } // Choose appropriate timing
}
```

### Step 2: Implement in Joker.js
```javascript
// In applyBeforeScoreEffect() or appropriate method:
case 'new_boon_id':
    // Implementation
    result.pips += bonus; // or result.favour +=, etc.
    window.game?.showMessage?.("Boon Name: Effect!");
    break;
```

### Step 3: Add to assetMapping.js (if custom art)
```javascript
new_boon_id: 'ART/new_boon.png'
```

### Step 4: Test with Deterministic Seed
```javascript
window.app.startGame('NEWBOON');
// Buy the boon in shop
// Test its effect
// Verify no errors
```

### Step 5: Document
- Add to tracking/card_database.csv
- Update CHANGELOG.md
- Add to appropriate category in BOON_SPREADSHEET.csv

---

## 🎮 Balatro-Style Design Principles

### 1. Multiplicative > Additive (for late game)
- Additive: +2 favour per turn (scales linearly)
- Multiplicative: ×2 favour (scales exponentially)
- Use multiplicative for powerful late-game scaling

### 2. Synergies Create Depth
- Boons that work together are more interesting
- Example: Midas Touch + gold generation boons
- Example: Enhancement-counting boons + libations

### 3. Trade-offs Are Interesting
- Tantalus' Curse: +favour but can't spend gold
- Apollo's Oracle: +rolls but -20% score
- Chaos Primordial: +favour but -1 roll

### 4. Visual Feedback Matters
- Always show messages for boon triggers
- Use dynamicStats to display current values
- Balatro-style sequential animations enhance experience

### 5. Edge Cases Must Be Protected
- Always clamp values (no negatives, no division by zero)
- Prevent infinite loops (Narcissus flag)
- Use deterministic RNG (never Math.random())

---

## 🔍 Quick Troubleshooting

### Boon Not Triggering?
1. Check timing is correct in gameData.js
2. Verify case statement in Joker.js matches ID exactly
3. Check if condition is being met
4. Add Logger.debug() to trace execution

### Infinite Loops?
1. Check turn_start isn't in executeRoll()
2. Verify Narcissus flag is set/cleared correctly
3. Check for recursive boon calls

### Score Calculation Wrong?
1. Verify pips/favour are being added to result object
2. Check if using additive vs multiplicative correctly
3. Ensure edge case protections (Math.max) are in place

### Determinism Broken?
1. Check if Math.random() is used anywhere (use prng instead)
2. Verify Mother of Pearl uses seeded RNG
3. Test with same seed multiple times

---

## 📚 Related Files

- **This file:** meta/CONSOLIDATED_BOON_REFERENCE.md
- **Game mechanics:** meta/development_workflow.md
- **Timing system:** js/classes/Joker.js
- **Boon data:** js/data/gameData.js
- **Scoring logic:** js/game/GameEngine.js
- **Bug tracking:** tracking/BUGS_FIXED_LOG.md
- **Boon spreadsheet:** tracking/BOON_SPREADSHEET.csv

---

**AI Assistants:** Use this as primary reference for all boon-related work. All patterns here are verified and working in production code.

