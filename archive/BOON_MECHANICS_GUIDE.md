# Complete Boon Mechanics Guide

## Bug Fix Applied ✅

**Kronos' Hourglass Bug Fixed:**
- **Problem:** Was being called every roll (gave infinite rolls)
- **Cause:** `applyJokerTurnStartEffects()` was called in `executeRoll()` instead of `nextTurn()`
- **Fix:** Moved turn_start timing to `nextTurn()` AFTER setting default rolls
- **Result:** Kronos now correctly sets random 1-5 rolls once per turn

---

## Timing System Explained

### Execution Order:
1. **turn_start** - Beginning of turn (before first roll)
2. **before_roll** - Right before dice roll animation
3. **after_roll** - After dice are rolled
4. **before_score** - Before calculating final score
5. **after_score** - After score is added
6. **turn_end** - End of turn
7. **ante_end** - End of ante (before shop)
8. **sell** - When selling cards

---

## Mechanic Categories

### 1. **Conditional Favour Bonus**
Adds favour based on conditions being met.

**Examples:**
- **Hestia's Hearth:** All odd/even check
- **Hydra's Heads:** Exactly 2 dice
- **Misery:** 0 gold check

**Code Pattern:**
```javascript
if (condition) {
    result.favour += amount;
}
```

---

### 2. **Gold Generation**
Awards gold after actions.

**Examples:**
- **Charon's Ferry Fare:** +1 gold after score
- **Early Bird (T4-5):** +2 gold

**Code Pattern:**
```javascript
gameEngine.updateGoldAnimated(amount, "source");
```

---

### 3. **Pips Bonus**
Adds to base pips before multiplication.

**Examples:**
- **Achilles' Heel:** +15 flat
- **Midas Touch:** +5 per 10 gold
- **Typhon:** +90% threshold (rare)

**Code Pattern:**
```javascript
result.pips += calculatedAmount;
```

---

### 4. **Gold-Scaling**
Effects scale with current gold.

**Examples:**
- **Midas Touch:** +5 pips per 10 gold
- **Tantalus' Curse:** +0.5 favour per gold

**Code Pattern:**
```javascript
const bonus = Math.floor(gameState.gold / 10) * 5;
result.pips += bonus;
```

---

### 5. **Unused Roll Bonus**
Rewards saving rolls.

**Examples:**
- **Icarus' Wings:** +15 pips per unused
- **Forge of Hephaestus:** +0.5 favour per unused (max 1.5)

**Code Pattern:**
```javascript
const bonus = gameState.rollsLeft * multiplier;
result.pips += bonus;
```

---

### 6. **Favour Multiplier**
Doubles or multiplies favour (additive).

**Examples:**
- **Chaos Primordial:** Doubles favour
- **Prometheus' Gift:** +3 favour

**Code Pattern:**
```javascript
// Additive
result.favour += amount;

// Doubling
result.favour += currentFavour;
```

---

### 7. **Multiplicative Favour**
Like Balatro's ×mult (applies after addition).

**Examples:**
- **Pandora's Jar:** ×2 every 3rd turn
- **Carillon (secret):** ×2.5 if all same enhancement

**Code Pattern:**
```javascript
result.favourMult *= multiplier;
```

**Formula:** `(baseFavour + additiveFavour) × multiplicativeFavour`

---

### 8. **Roll Penalty**
Reduces available rolls.

**Examples:**
- **Prometheus' Gift:** -1 roll
- **Chaos Primordial:** -1 roll
- **Midnight Oil (T12+):** -1 roll
- **Narcissus:** -2 rolls

**Code Pattern:**
```javascript
gameState.rollsLeft = Math.max(1, gameState.rollsLeft - amount);
```

---

### 9. **Roll Randomizer**
Changes roll count randomly.

**Example:**
- **Kronos' Hourglass:** 1-5 random

**Code Pattern:**
```javascript
const rollsThisTurn = Math.floor(prng.random() * 5) + 1;
gameState.rollsLeft = rollsThisTurn;
```

---

### 10. **Roll Counter**
Tracks number of rerolls.

**Examples:**
- **Sisyphus' Boulder:** +5 pips per reroll
- **Marathon Runner:** +1 pip per roll

**Code Pattern:**
```javascript
const rerolls = STARTING_ROLLS - gameState.rollsLeft;
result.pips += rerolls * 5;
```

---

### 11. **Permanent Modification**
Changes die face values permanently.

**Examples:**
- **Demeter's Harvest:** Random face +1 per turn
- **Elixir of Lethe:** Face value -1
- **Chalice of Helios:** Face value +1

**Code Pattern:**
```javascript
die.faces[faceKey].modifiedValue = newValue;
```

---

### 12. **Auto-Hold**
Automatically holds dice.

**Example:**
- **Medusa's Gaze:** Auto-hold 6s

**Code Pattern:**
```javascript
gameState.dice.forEach(die => {
    if (die.face === 6) {
        die.held = true;
    }
});
```

---

### 13. **Auto-Reroll**
Automatically rerolls specific values.

**Example:**
- **Lucky Dice Bag:** Reroll 1s once

**Code Pattern:**
```javascript
if (die.face === 1 && !die.hasBeenRerolled) {
    die.roll();
    die.hasBeenRerolled = true;
}
```

---

### 14. **Dice Transformation**
Changes die values during turn.

**Examples:**
- **Smog of Morpheus:** 2s and 4s → 3s on final roll
- **Dionysus' Revelry:** Randomize all faces on one die

**Code Pattern:**
```javascript
if (condition) {
    die.face = newValue;
}
```

---

### 15. **Dice Counter**
Counts specific dice values/states.

**Examples:**
- **Pegasus' Flight:** Count 6+ dice
- **Cerberus' Watch:** Count held dice

**Code Pattern:**
```javascript
const count = gameState.dice.filter(d => condition).length;
result.favour += count * multiplier;
```

---

### 16. **Hold Tracker**
Tracks how long dice are held.

**Example:**
- **The Locksmith:** +1 pip per roll held

**Code Pattern:**
```javascript
// after_roll
if (die.held) {
    die.rollsHeld = (die.rollsHeld || 0) + 1;
}

// before_score
let bonus = 0;
dice.forEach(die => bonus += die.rollsHeld || 0);
```

---

### 17. **Turn Accumulator**
Builds up over turns.

**Examples:**
- **The Heretic:** +2 pips per turn
- **Symmetry:** +0.5 favour per palindrome

**Code Pattern:**
```javascript
// turn_start
gameState.hereticStacks = (gameState.hereticStacks || 0) + 2;

// before_score
result.pips += gameState.hereticStacks;
```

---

### 18. **Turn-Based Effects**
Different effects at different turns.

**Example:**
- **Early Bird:** T1-3: +20 pips, T4-5: +2 gold, T6-13: -5 pips

**Code Pattern:**
```javascript
if (turn >= 1 && turn <= 3) {
    result.pips += 20;
} else if (turn >= 6 && turn <= 13) {
    result.pips -= 5;
}
```

---

### 19. **Matching Counter**
Counts matching elements.

**Examples:**
- **The Symposium:** 4+ matching dice
- **Divine Synergy:** Matching rarities

**Code Pattern:**
```javascript
const counts = {};
items.forEach(item => {
    counts[item.property] = (counts[item.property] || 0) + 1;
});

if (Object.values(counts).some(c => c >= 4)) {
    result.favour += 1;
}
```

---

### 20. **Slot Checker**
Checks inventory capacity.

**Examples:**
- **Assembly of Heroes:** All slots full
- **Ascetic's Vow:** Empty slots

**Code Pattern:**
```javascript
const filledSlots = gameState.jokers.length;
const maxSlots = gameState.boonSlots;

if (filledSlots >= maxSlots) {
    result.pips += bonus;
}
```

---

### 21. **Destruction**
Removes boons/cards.

**Examples:**
- **Icarus' Wings:** 1/8 break chance
- **Pandora's Jar:** Destroy random boon every 3 turns
- **Marathon Runner:** Destroy at 42 pips or 3 scratches

**Code Pattern:**
```javascript
const jokerIndex = gameState.jokers.findIndex(j => j.id === targetId);
if (jokerIndex !== -1) {
    gameState.jokers.splice(jokerIndex, 1);
}
```

---

### 22. **Pattern Detector**
Detects specific patterns.

**Example:**
- **Symmetry:** Palindrome detector

**Code Pattern:**
```javascript
const values = dice.map(d => d.face);
const isPalindrome = values.every((val, idx) => 
    val === values[values.length - 1 - idx]
);
```

---

### 23. **Dual-Value Modifier**
Die counts as two values.

**Example:**
- **Parmenides Die:** Die counts as both value and opposite

**Code Pattern:**
```javascript
// turn_start
die.isParmenidesDie = true;
die.oppositeValue = 7 - die.face;

// scoring
if (die.isParmenidesDie) {
    counts[die.oppositeValue] = (counts[die.oppositeValue] || 0) + 1;
}
```

---

### 24. **Global Multiplier**
Affects all boons.

**Example:**
- **The Trojan Horse:** Turn 10+ doubles all boons

**Code Pattern:**
```javascript
// In GameEngine
if (gameState.turn >= 11) {
    gameState.boonMultiplier = 2;
}

// In Joker.applyTimingEffect
if (multiplier !== 1) {
    processedResult.pips = Math.floor(processedResult.pips * multiplier);
    processedResult.favour = processedResult.favour * multiplier;
}
```

---

### 25. **Boon Mimic**
Copies another boon's effect.

**Example:**
- **Proteus' Disguise:** Mimic random boon each turn

**Code Pattern:**
```javascript
// turn_start
const randomBoon = otherBoons[Math.floor(Math.random() * otherBoons.length)];
gameState.proteusMimicId = randomBoon.id;

// When triggering
const mimickedBoon = gameState.jokers.find(b => b.id === gameState.proteusMimicId);
return mimickedBoon.applyTimingEffect(timingEvent, gameState, eventData);
```

---

### 26. **Trigger Counter**
Counts how many boons triggered.

**Example:**
- **Eruption of Etna:** 3+ boons trigger = +1 favour

**Code Pattern:**
```javascript
// In Joker.onTimingEvent before_score
gameState.boonTriggersThisTurn = (gameState.boonTriggersThisTurn || 0) + 1;

// In Eruption
if (gameState.boonTriggersThisTurn >= 3) {
    this.etnaFavourStacks += 1;
}
result.favour += this.etnaFavourStacks;
```

---

### 27. **Effect Doubler**
Triggers effects twice.

**Example:**
- **Reflection of Narcissus:** All boons trigger twice

**Code Pattern:**
```javascript
if (hasNarcissus && this.id !== 'reflection_of_narcissus' && !gameState.narcissusDoubling) {
    gameState.narcissusDoubling = true; // Prevent infinite loops
    result = this.applyTimingEffect(timingEvent, gameState, result);
    gameState.narcissusDoubling = false;
}
```

---

### 28. **Enhancement Counter**
Counts dice with enhancements.

**Examples:**
- **Gold Standard:** Gold enhancements +3 pips
- **Carillon:** All 5 enhanced bonus

**Code Pattern:**
```javascript
let enhancedCount = 0;
dice.forEach(die => {
    const currentFace = die.face;
    if (die.faces[currentFace]?.enhancements.has('gold')) {
        enhancedCount++;
    }
});
```

---

### 29. **Threshold Reduction**
Makes scoring requirements easier.

**Example:**
- **Bellows of War:** 3/4 of Kind need 1 less die

**Code Pattern:**
```javascript
let threshold = SCORING_THRESHOLDS.THREE_OF_KIND_REQUIRED;
const hasBellows = gameState.jokers?.some(j => j.id === 'bellows_of_war');
if (hasBellows) {
    threshold -= 1; // 3 becomes 2
}
```

---

### 30. **Worship Spreader**
Affects multiple gods.

**Example:**
- **Cycle of Seasons:** Worship spreads to another god

**Code Pattern:**
```javascript
// In WorshipCard.applyWorship
const hasCycle = gameState.jokers?.some(j => j.id === 'cycle_of_seasons');
if (hasCycle) {
    const otherGods = availableGods.filter(g => g !== this.god);
    const randomGod = otherGods[Math.floor(Math.random() * otherGods.length)];
    gameState.worshipLevels[randomGod] += 1;
}
```

---

### 31. **Shop Block**
Prevents purchases.

**Example:**
- **Tantalus' Curse:** Can't spend gold

**Code Pattern:**
```javascript
// In UIManager purchase methods
const hasTantalusCurse = gameState.jokers?.some(j => j.id === 'tantalus_curse');
if (hasTantalusCurse) {
    gameEngine.showMessage("Cannot spend gold!");
    return;
}
```

---

### 32. **Completion Bonus**
Rewards finishing conditions.

**Examples:**
- **The Odyssey:** All categories, no scratches
- **Message in a Bottle:** Solo ante

**Code Pattern:**
```javascript
const allFilled = categories.every(cat => scorecard[cat] !== undefined);
const noScratches = categories.every(cat => scorecard[cat] > 0);

if (allFilled && noScratches) {
    totalScore += categories.length²;
}
```

---

### 33. **Solo Tracker**
Tracks lone boon usage.

**Example:**
- **Message in a Bottle:** Bonus if no other boons all ante

**Code Pattern:**
```javascript
// When buying boons
if (gameState.jokers.length > 1) {
    gameState.hadOtherBoonsThisAnte = true;
}

// At ante end
if (!gameState.hadOtherBoonsThisAnte) {
    // Award bonus
}
```

---

## Edge Cases & Safety

### Negative Pips Protection:
```javascript
result.pips = Math.max(0, result.pips);
```

### Zero Favour Protection:
```javascript
favour = Math.max(0.1, favour);
```

### Minimum Rolls:
```javascript
gameState.rollsLeft = Math.max(1, gameState.rollsLeft - penalty);
```

### Infinite Loop Prevention:
```javascript
if (!gameState.narcissusDoubling) {
    gameState.narcissusDoubling = true;
    // Execute effect
    gameState.narcissusDoubling = false;
}
```

---

## Testing Your Changes

1. **Check timing** - Is it called at the right phase?
2. **Check state** - Does it modify the correct gameState property?
3. **Check return** - Does it return modified result or modify state directly?
4. **Check cleanup** - Does it reset flags/counters when needed?
5. **Check edge cases** - What if rolls = 0? Gold = 0? No dice?

---

## Common Mistakes

❌ **Modifying result in turn_start** - turn_start has no result, modify gameState
❌ **Forgetting to return result** - Must return modified result object
❌ **Not using Math.max for penalties** - Rolls can go negative
❌ **Calling in wrong timing** - Check when effect should trigger
❌ **Not resetting accumulators** - Reset counters at turn/ante start

---

All 59 boons documented! Check `BOON_SPREADSHEET.csv` for quick reference.

