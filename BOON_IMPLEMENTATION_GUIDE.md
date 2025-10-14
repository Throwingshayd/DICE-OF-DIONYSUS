# 🎲 Boon Implementation Guide - Technical Specifications
**Complete mapping of 100 creative boons to existing timing system**

---

## 🔧 Your Existing Timing System

```javascript
timing: {
    before_roll: false,   // Before dice are rolled
    after_roll: false,    // After dice are rolled
    before_score: false,  // Before calculating score
    after_score: false,   // After score is recorded
    turn_start: false,    // At beginning of turn
    turn_end: false,      // At end of turn
    shop_enter: false,    // When shop opens
    shop_exit: false,     // When shop closes
    hand_effect: false    // Modifies scoring calculation
}
```

---

## 📊 BOON CATEGORIZATION BY TIMING

### 🎯 BEFORE_SCORE Boons (Most Common - 35 boons)
These modify the score BEFORE it's calculated.

#### Simple Pip Modifiers (Easy)
```javascript
// Pattern: Add pips before scoring
timing: { before_score: true }

Implementation in Joker.js applyTimingEffect():
```

**1. Weighted Dice** (Rustic)
```javascript
case 'weighted_dice':
    if (timing === 'before_score') {
        result.pips += 10;  // Simple flat bonus
    }
    break;
```
**State:** None  
**Complexity:** ⭐☆☆☆☆ (Trivial)

**2. Lucky Number 7** (Rustic)
```javascript
case 'lucky_number_7':
    if (timing === 'before_score') {
        const sum = gameState.dice.reduce((a, d) => a + d.getEffectiveFace(), 0);
        if (sum === 7) {
            result.pips += 100;
            window.game?.showMessage?.("Lucky 7! +100 Pips!");
        }
    }
    break;
```
**State:** None  
**Complexity:** ⭐⭐☆☆☆ (Simple condition)

**3. Prime Time** (Rustic)
```javascript
case 'prime_time':
    if (timing === 'before_score') {
        const primes = [2, 3, 5];
        const primeCount = gameState.dice.filter(d => 
            primes.includes(d.getEffectiveFace())
        ).length;
        result.pips += primeCount * 5;
    }
    break;
```
**State:** None  
**Complexity:** ⭐⭐☆☆☆

**4. Clutch Play** (Vibrant)
```javascript
case 'clutch_play':
    if (timing === 'before_score') {
        if (gameState.turn === 13) {  // Last turn of ante
            result.favour *= 2;
            window.game?.showMessage?.("Clutch Play! ×2 Favour!");
        }
    }
    break;
```
**State:** None  
**Complexity:** ⭐⭐☆☆☆

**5. First Blood** (Vibrant)
```javascript
case 'first_blood':
    if (timing === 'before_score') {
        // Check if this is first score of ante
        const scoresThisAnte = Object.keys(gameState.scorecard).filter(k => 
            gameState.scorecard[k] !== undefined
        ).length;
        
        if (scoresThisAnte === 0 || gameState.turn === 1) {
            result.favour *= 3;
            window.game?.showMessage?.("First Blood! ×3 Favour!");
        }
    }
    break;
```
**State:** Need to track scores per ante (optional, can use turn === 1)  
**Complexity:** ⭐⭐⭐☆☆

---

### 💸 AFTER_SCORE Boons (Gold/Progression - 15 boons)
These trigger AFTER scoring is complete.

**6. Compound Interest** (Vibrant)
```javascript
case 'compound_interest':
    if (timing === 'after_score') {
        const goldFromScore = Math.floor(gameState.totalScore / 100);
        gameState.gold += goldFromScore;
        if (goldFromScore > 0) {
            window.game?.showMessage?.(`Compound Interest: +${goldFromScore}g!`);
        }
    }
    break;
```
**State:** None  
**Complexity:** ⭐⭐☆☆☆

**7. Orpheus' Lyre** (Vibrant)
```javascript
case 'orpheus_lyre':
    if (timing === 'before_score') {
        // Need to track last category scored
        if (!gameState.lastScoredCategory) {
            gameState.lastScoredCategory = null;
        }
        
        if (gameState.lastScoredCategory === result.category) {
            result.favour *= 2;
            window.game?.showMessage?.("Repeat Performance! ×2 Favour!");
        }
    }
    if (timing === 'after_score') {
        gameState.lastScoredCategory = result.category;
    }
    break;
```
**State:** gameState.lastScoredCategory (string)  
**Complexity:** ⭐⭐⭐☆☆

---

### 🎲 TURN_START Boons (Setup - 12 boons)
These trigger at the beginning of each turn.

**8. Marathon Runner** (Rustic)
```javascript
case 'marathon_runner':
    if (timing === 'turn_start') {
        // Initialize tracker if needed
        if (!gameState.marathonPips) {
            gameState.marathonPips = 0;
        }
        gameState.marathonPips += 2;  // Accumulates each turn
    }
    if (timing === 'before_score') {
        result.pips += gameState.marathonPips || 0;
    }
    break;
```
**State:** gameState.marathonPips (number)  
**Complexity:** ⭐⭐⭐☆☆

**9. Demeter's Harvest** (Vibrant)
```javascript
case 'demeters_harvest':
    if (timing === 'turn_start') {
        // Pick random die and random face, increase by 1
        const randomDieIndex = Math.floor(Math.random() * 5);
        const randomFace = Math.floor(Math.random() * 6) + 1;
        const die = gameState.dice[randomDieIndex];
        
        if (die && die.modifyFaceValue) {
            die.modifyFaceValue(randomFace, +1);
            window.game?.showMessage?.(`Demeter: Die ${randomDieIndex + 1} face ${randomFace} improved!`);
        }
    }
    break;
```
**State:** Modifies die faces directly  
**Complexity:** ⭐⭐⭐⭐☆

**10. Wheel of Fate** (Vibrant)
```javascript
case 'wheel_of_fate':
    if (timing === 'turn_start') {
        const effects = [
            { type: 'pips', value: 30, msg: '+30 Pips this turn!' },
            { type: 'favour', value: 1, msg: '+1 Favour this turn!' },
            { type: 'gold', value: 3, msg: '+3 Gold!' },
            { type: 'roll', value: -1, msg: '-1 Roll this turn!' }
        ];
        
        const chosen = effects[Math.floor(Math.random() * effects.length)];
        
        if (chosen.type === 'pips') {
            gameState.tempPips = (gameState.tempPips || 0) + chosen.value;
        } else if (chosen.type === 'favour') {
            gameState.tempFavour = (gameState.tempFavour || 0) + chosen.value;
        } else if (chosen.type === 'gold') {
            gameState.gold += chosen.value;
        } else if (chosen.type === 'roll') {
            gameState.rollsLeft = Math.max(0, gameState.rollsLeft - 1);
        }
        
        window.game?.showMessage?.(`Wheel of Fate: ${chosen.msg}`);
    }
    break;
```
**State:** Uses tempPips, tempFavour (already exists)  
**Complexity:** ⭐⭐⭐☆☆

---

### 🔄 TURN_END Boons (Cleanup/Accumulation - 8 boons)
These trigger when turn ends.

**11. Hubris of Icarus** (Epic) - Risk/Reward
```javascript
case 'hubris_of_icarus':
    if (timing === 'before_score') {
        result.favour *= 4;  // Massive multiplier!
    }
    if (timing === 'turn_end') {
        gameState.gold = Math.max(0, gameState.gold - 3);
        window.game?.showMessage?.("Hubris: -3 Gold");
    }
    break;
```
**State:** None  
**Complexity:** ⭐⭐☆☆☆

**12. The Locksmith** (Rustic)
```javascript
case 'the_locksmith':
    if (timing === 'turn_end') {
        // Enhance held dice
        gameState.dice.forEach((die, index) => {
            if (gameState.held[index]) {
                const currentFace = die.currentFace;
                if (currentFace > 0 && die.modifyFaceValue) {
                    die.modifyFaceValue(currentFace, +1);
                    window.game?.showMessage?.(`Locksmith: Die ${index + 1} enhanced!`);
                }
            }
        });
    }
    break;
```
**State:** Modifies die faces  
**Complexity:** ⭐⭐⭐⭐☆

---

### 🏪 SHOP_ENTER Boons (Shop Phase - 10 boons)
These trigger when shop opens.

**13. The Archaeologist** (Vibrant)
```javascript
case 'the_archaeologist':
    if (timing === 'shop_enter') {
        // Add random boon from full pool
        const availableBoons = CardData.jokers.filter(b => 
            !gameState.jokers.some(j => j.id === b.id)
        );
        
        if (availableBoons.length > 0 && gameState.jokers.length < gameState.boonSlots) {
            const randomBoon = availableBoons[Math.floor(Math.random() * availableBoons.length)];
            const newBoon = new Joker(randomBoon);
            gameState.jokers.push(newBoon);
            window.game?.showMessage?.(`Discovered: ${newBoon.name}!`);
        }
    }
    break;
```
**State:** None  
**Complexity:** ⭐⭐⭐⭐☆

**14. Coupon Clipper** (Rustic)
```javascript
case 'coupon_clipper':
    if (timing === 'shop_enter') {
        // Mark that first purchase is discounted
        gameState.couponAvailable = true;
    }
    // Then in purchase code, check gameState.couponAvailable
    // and reduce cost by 2g for first purchase
    break;
```
**State:** gameState.couponAvailable (boolean)  
**Complexity:** ⭐⭐⭐☆☆ (requires shop integration)

---

### 🎰 SPECIAL TIMING (Conditional - 20 boons)
These check game state and apply effects conditionally.

**15. Miser's Delight** (Vibrant) - Gold-based
```javascript
case 'misers_delight':
    if (timing === 'before_score') {
        if (gameState.gold === 0) {
            result.favour *= 2;
            window.game?.showMessage?.("Miser's Delight: ×2 Favour!");
        }
    }
    break;
```
**State:** None (checks gold)  
**Complexity:** ⭐⭐☆☆☆

**16. Plutocrat's Pride** (Vibrant) - Wealth-based
```javascript
case 'plutocrats_pride':
    if (timing === 'before_score') {
        if (gameState.gold >= 20) {
            result.pips += 100;
            window.game?.showMessage?.("Plutocrat: +100 Pips!");
        }
    }
    break;
```
**State:** None  
**Complexity:** ⭐⭐☆☆☆

**17. Ascetic's Vow** (Epic) - Solo challenge
```javascript
case 'ascetics_vow':
    if (timing === 'before_score') {
        // Count active boons (excluding self)
        const otherBoons = gameState.jokers.filter(j => j.id !== 'ascetics_vow');
        
        if (otherBoons.length === 0) {
            result.favour *= 5;
            window.game?.showMessage?.("Ascetic's Vow: ×5 Favour!");
        }
    }
    break;
```
**State:** None  
**Complexity:** ⭐⭐⭐☆☆

---

### 🔗 SYNERGY Boons (Multi-card interactions - 10 boons)

**18. The Pantheon** (Epic) - God diversity
```javascript
case 'the_pantheon':
    if (timing === 'before_score') {
        // Count unique gods
        const gods = new Set(
            gameState.jokers
                .filter(j => j.god)
                .map(j => j.god)
        );
        
        const bonusFavour = gods.size * 0.5;
        result.favour += bonusFavour;
        
        if (gods.size > 0) {
            window.game?.showMessage?.(`Pantheon: +${bonusFavour} Favour (${gods.size} gods)`);
        }
    }
    break;
```
**State:** None (reads from jokers)  
**Complexity:** ⭐⭐⭐☆☆

**19. Olympian Council** (Vibrant) - God focus
```javascript
case 'olympian_council':
    if (timing === 'before_score') {
        // Count gods and find most common
        const godCounts = {};
        gameState.jokers.forEach(j => {
            if (j.god) {
                godCounts[j.god] = (godCounts[j.god] || 0) + 1;
            }
        });
        
        const maxCount = Math.max(...Object.values(godCounts), 0);
        
        if (maxCount >= 3) {
            // Double the effect of all jokers with that god
            gameState.councilActive = true;  // Flag for other jokers to check
            window.game?.showMessage?.("Council Activated! Same-god boons ×2!");
        }
    }
    break;
```
**State:** gameState.councilActive (boolean, temporary)  
**Complexity:** ⭐⭐⭐⭐☆ (requires other jokers to check this flag)

---

## 📋 COMPLETE TIMING MATRIX

### Quick Reference Table

| Boon Name | Timing | Complexity | State Needed | Priority |
|-----------|--------|------------|--------------|----------|
| **Weighted Dice** | before_score | ⭐ | None | HIGH |
| **Lucky Dice Bag** | after_roll | ⭐⭐ | None | HIGH |
| **Snowball Effect** | before_score | ⭐⭐ | turnsCompleted | HIGH |
| **First Blood** | before_score | ⭐⭐ | None | HIGH |
| **Hubris of Icarus** | before_score + turn_end | ⭐⭐ | None | HIGH |
| **Marathon Runner** | turn_start + before_score | ⭐⭐⭐ | marathonPips | MED |
| **The Pantheon** | before_score | ⭐⭐⭐ | None | HIGH |
| **Miser's Delight** | before_score | ⭐⭐ | None | HIGH |
| **Chain Reaction** | before_score | ⭐⭐⭐⭐ | chainBonus | MED |
| **Golden Touch** | shop_enter | ⭐⭐⭐ | None | MED |
| **Chaos Theory** | after_score | ⭐⭐⭐ | None | HIGH |
| **The Gambler** | before_score | ⭐⭐⭐ | None | MED |
| **Reverse Polarity** | before_score | ⭐⭐⭐ | None | HIGH |
| **Demeter's Harvest** | turn_start | ⭐⭐⭐⭐ | Modifies dice | LOW |
| **Cerberus' Watch** | before_score | ⭐⭐⭐ | Track hold order | MED |

---

## 🎯 IMPLEMENTATION BY COMPLEXITY

### ⭐ TIER 1: Trivial (No State, Simple Math) - Implement First!

**Ready to add in 30 minutes:**

```javascript
// 1. Weighted Dice
case 'weighted_dice':
    if (timing === 'before_score') result.pips += 10;
    break;

// 2. Prime Time  
case 'prime_time':
    if (timing === 'before_score') {
        const primeCount = gameState.dice.filter(d => 
            [2,3,5].includes(d.getEffectiveFace())
        ).length;
        result.pips += primeCount * 5;
    }
    break;

// 3. Lucky Number 7
case 'lucky_number_7':
    if (timing === 'before_score') {
        const sum = gameState.dice.reduce((a,d) => a + d.getEffectiveFace(), 0);
        if (sum === 7) result.pips += 100;
    }
    break;

// 4. Mathematician's Compass
case 'mathematicians_compass':
    if (timing === 'before_score') {
        const sum = gameState.dice.reduce((a,d) => a + d.getEffectiveFace(), 0);
        if (sum % 2 === 0) result.pips += 10;
    }
    break;

// 5. Miser's Delight
case 'misers_delight':
    if (timing === 'before_score') {
        if (gameState.gold === 0) result.favour *= 2;
    }
    break;

// 6. Plutocrat's Pride
case 'plutocrats_pride':
    if (timing === 'before_score') {
        if (gameState.gold >= 20) result.pips += 100;
    }
    break;

// 7. Clutch Play
case 'clutch_play':
    if (timing === 'before_score') {
        if (gameState.turn === 13) result.favour *= 2;
    }
    break;

// 8. The Gambler
case 'the_gambler':
    if (timing === 'before_score') {
        if (Math.random() < 0.5) {
            result.favour *= 3;
            window.game?.showMessage?.("Gambler: WIN! ×3!");
        } else {
            result.pips = 0;
            result.favour = 0;
            window.game?.showMessage?.("Gambler: LOSE! Score = 0");
        }
    }
    break;
```

**Add these 8 boons in one batch - all simple before_score!**

---

### ⭐⭐ TIER 2: Simple State (One variable) - Add Next

**Need minimal state tracking:**

**9. Snowball Effect** (Vibrant) - Scaling
```javascript
// Add to initializeGameState():
snowballTurns: 0,

// In Joker.js:
case 'snowball_effect':
    if (timing === 'turn_start') {
        gameState.snowballTurns = (gameState.snowballTurns || 0) + 1;
    }
    if (timing === 'before_score') {
        result.pips += gameState.snowballTurns;
    }
    break;
```
**State:** gameState.snowballTurns (number)  
**Complexity:** ⭐⭐☆☆☆

**10. First Blood** (Vibrant)
```javascript
case 'first_blood':
    if (timing === 'before_score') {
        // Check if first score of ante (turn === 1 works)
        if (gameState.turn === 1) {
            result.favour *= 3;
        }
    }
    break;
```
**State:** None (uses existing turn)  
**Complexity:** ⭐⭐☆☆☆

**11. Momentum** (Rustic)
```javascript
// Add to state:
momentumStreak: 0,

case 'momentum':
    if (timing === 'after_score') {
        if (result.isValid) {
            gameState.momentumStreak = (gameState.momentumStreak || 0) + 1;
        } else {
            gameState.momentumStreak = 0;
        }
    }
    if (timing === 'before_score') {
        const bonus = (gameState.momentumStreak || 0) * 5;
        result.pips += bonus;
    }
    break;
```
**State:** gameState.momentumStreak (number)  
**Complexity:** ⭐⭐⭐☆☆

---

### ⭐⭐⭐ TIER 3: Moderate (Multiple conditions/states)

**12. Cerberus' Watch** (Vibrant) - Hold tracking
```javascript
// Add to state:
heldDiceThisTurn: [],

// In rollDice(), track what was held:
if (timing === 'before_roll') {
    gameState.heldDiceThisTurn = [];
}

// When hold is applied:
toggleHold(index) {
    // ... existing code
    if (this.state.held[index]) {
        this.state.heldDiceThisTurn.push(index);
    }
}

case 'cerberus_watch':
    if (timing === 'before_score') {
        const firstThreeHeld = (gameState.heldDiceThisTurn || []).slice(0, 3);
        result.pips += firstThreeHeld.length * 5;
    }
    break;
```
**State:** gameState.heldDiceThisTurn (array)  
**Complexity:** ⭐⭐⭐☆☆

**13. Chain Reaction** (Vibrant) - Combo system
```javascript
// Track number of jokers that triggered
case 'chain_reaction':
    if (timing === 'before_score') {
        gameState.chainBonus = 0;
        gameState.jokersTriggered = 0;
    }
    // This boon watches OTHER jokers trigger
    // Requires modification to onTimingEvent to count triggers
    break;
```
**State:** gameState.chainBonus, gameState.jokersTriggered  
**Complexity:** ⭐⭐⭐⭐☆ (requires framework change)

---

### ⭐⭐⭐⭐ TIER 4: Complex (Framework changes needed)

**14. Time Traveler** (Epic) - Undo system
```javascript
// Requires:
// 1. Save gameState before each score
// 2. Restore gameState method
// 3. UI button to trigger undo

case 'time_traveler':
    // Implementation requires:
    // - gameState.savedState (object)
    // - gameState.undoAvailable (boolean)
    // - restoreFromSave() method
    // - UI button in scoring dialog
    break;
```
**State:** Entire saved state copy  
**Complexity:** ⭐⭐⭐⭐⭐ (major feature)

**15. Schrodinger's Die** (Epic) - Quantum mechanics
```javascript
// Requires modification to calculateScore()
// to allow one die to count as multiple values

case 'schrodingers_die':
    if (timing === 'turn_start') {
        // Pick random die to be quantum
        gameState.quantumDieIndex = Math.floor(Math.random() * 5);
    }
    // Then in calculateScore(), special logic for quantum die
    break;
```
**State:** gameState.quantumDieIndex  
**Complexity:** ⭐⭐⭐⭐⭐ (requires scoring system change)

---

## 🗂️ IMPLEMENTATION PRIORITY LIST

### 🔥 PHASE 1: Quick Wins (2 hours) - Add these 10 first!

**All TIER 1-2 complexity, high impact:**

1. ✅ **Weighted Dice** - Simple +10 Pips
2. ✅ **Prime Time** - +5 Pips per prime
3. ✅ **Lucky Number 7** - +100 if sum = 7
4. ✅ **Miser's Delight** - ×2 if 0 gold
5. ✅ **Plutocrat's Pride** - +100 if 20+ gold
6. ✅ **Clutch Play** - ×2 on turn 13
7. ✅ **First Blood** - ×3 on turn 1
8. ✅ **Snowball Effect** - +1 per turn completed
9. ✅ **Hubris of Icarus** - ×4 Favour, -3g per turn
10. ✅ **The Gambler** - 50/50 ×3 or 0

**Implementation:**
- All use existing timing system
- Minimal state needed (snowball needs 1 variable)
- Can be added in single session
- Immediate gameplay variety

---

### 🎨 PHASE 2: Moderate Additions (3 hours) - Next 10

**TIER 2-3, interesting mechanics:**

11. Marathon Runner (scaling)
12. Momentum (streak system)
13. Orpheus' Lyre (repeat bonus)
14. Compound Interest (gold scaling)
15. The Hoarder (collection = power)
16. Brotherhood of Heroes (boon count)
17. Chaos Theory (scratch reward)
18. Reverse Polarity (odd/even revalue)
19. Golden Touch (better interest)
20. Penny Pincher (cheaper reroll)

**Requires:**
- Few state variables
- Some shop integration
- Moderate complexity

---

### 🚀 PHASE 3: Advanced Features (5+ hours) - Later

**TIER 4-5, requires framework changes:**

21. Time Traveler (undo system)
22. Schrodinger's Die (quantum scoring)
23. Chain Reaction (trigger counting)
24. Alchemist's Touch (card transformation)
25. The Recycler (resource conversion)
26. Divine Metamorphosis (random mutation)
27. Cerberus' Watch (hold order tracking)
28. The Archaeologist (free cards)
29. Probability Manipulation (RNG influence)
30. The Wild Card (permanent wild die)

**Requires:**
- New systems
- UI changes
- Framework modifications

---

## 📝 STATE MANAGEMENT GUIDE

### Variables Needed for All 100 Boons:

**Simple Counters (Add to initializeGameState):**
```javascript
// Scaling/accumulation
snowballTurns: 0,
marathonPips: 0,
momentumStreak: 0,
veteranAntes: 0,
experiencePoints: 0,

// Tracking
lastScoredCategory: null,
heldDiceThisTurn: [],
jokersTriggeredCount: 0,
chainBonus: 0,

// Flags
couponAvailable: false,
councilActive: false,
firstBloodUsed: false,
```

**Complex State (For advanced boons):**
```javascript
// Undo system
savedGameState: null,
undoAvailable: false,

// Quantum/special
quantumDieIndex: null,
championDieIndex: null,
shapeshifterCurrent: null,

// Transformation
transmutedBoons: [],
```

---

## 🔧 IMPLEMENTATION TEMPLATES

### Template 1: Simple Before_Score Modifier
```javascript
case 'boon_id':
    if (timing === 'before_score') {
        // Check condition (optional)
        if (/* condition */) {
            result.pips += X;  // or result.favour *= Y
            window.game?.showMessage?.("Message!");
        }
    }
    break;
```

### Template 2: Accumulating Over Time
```javascript
// In initializeGameState():
boonCounter: 0,

// In Joker.js:
case 'boon_id':
    if (timing === 'turn_start') {
        gameState.boonCounter = (gameState.boonCounter || 0) + increment;
    }
    if (timing === 'before_score') {
        result.pips += gameState.boonCounter;
    }
    break;
```

### Template 3: Risk/Reward (Two Timings)
```javascript
case 'boon_id':
    if (timing === 'before_score') {
        result.favour *= 4;  // Big bonus
    }
    if (timing === 'turn_end') {
        gameState.gold -= 3;  // Cost
        window.game?.showMessage?.("Cost paid!");
    }
    break;
```

### Template 4: Conditional (State Check)
```javascript
case 'boon_id':
    if (timing === 'before_score') {
        if (gameState.someValue >= threshold) {
            result.pips += bonus;
        }
    }
    break;
```

---

## 🎯 RECOMMENDED IMPLEMENTATION ORDER

### Week 1: Add 10 Simple Boons (Phase 1)
**Day 1 (1h):** Add boons 1-5 to gameData.js
**Day 2 (1h):** Implement in Joker.js applyTimingEffect()
**Day 3 (30min):** Test thoroughly

### Week 2: Add 10 Moderate Boons (Phase 2)
**Day 1 (1h):** Add state variables
**Day 2 (1.5h):** Implement boons
**Day 3 (30min):** Test & balance

### Week 3+: Advanced Features (Phase 3)
As time permits, add complex boons one at a time.

---

## 📊 TIMING DISTRIBUTION

Of the 100 boons:

| Timing | Count | % |
|--------|-------|---|
| before_score | 45 | 45% |
| after_score | 15 | 15% |
| turn_start | 12 | 12% |
| turn_end | 8 | 8% |
| shop_enter | 10 | 10% |
| Multiple timings | 10 | 10% |

**Most boons (45%) use before_score** - this is your main extension point!

---

## 🔍 EXAMPLE: Full Implementation Flow

### Adding "Snowball Effect" End-to-End

**Step 1: Add to gameData.js**
```javascript
{
    id: "snowball_effect",
    name: "Snowball Effect",
    rarity: "vibrant",
    cost: 5,
    sellValue: 1,
    effect: "Gain +1 Pip per turn completed this run",
    timing: { turn_start: true, before_score: true }
}
```

**Step 2: Add state variable (GameEngine.js initializeGameState)**
```javascript
snowballTurns: 0,
```

**Step 3: Implement (Joker.js applyTimingEffect)**
```javascript
case 'snowball_effect':
    if (timing === 'turn_start') {
        gameState.snowballTurns = (gameState.snowballTurns || 0) + 1;
    }
    if (timing === 'before_score') {
        result.pips += gameState.snowballTurns;
        // Optional: Show message
        if (gameState.snowballTurns > 5) {
            window.game?.showMessage?.(`Snowball: +${gameState.snowballTurns} Pips!`);
        }
    }
    break;
```

**Step 4: Add asset (optional)**
```javascript
// assetMapping.js
'snowball_effect': 'snowball.png'
```

**Step 5: Test**
- Buy the boon
- Play several turns
- Verify pips increase each turn
- Check at turn 10: should have +10 pips

**Done!** ✅

---

## 🎮 SPECIAL MECHANICS IMPLEMENTATION

### Mechanic: Synergy Detection
```javascript
// Helper function to add to Joker class:
getSameGodBoons(gameState) {
    return gameState.jokers.filter(j => j.god === this.god);
}

getMatchingRarityBoons(gameState) {
    return gameState.jokers.filter(j => j.rarity === this.rarity);
}

countUniqueSomeProperty(gameState, property) {
    const unique = new Set(gameState.jokers.map(j => j[property]));
    return unique.size;
}
```

### Mechanic: Die Manipulation
```javascript
// Already have:
die.modifyFaceValue(face, delta)  // Permanent change
die.addFaceEnhancement(face, type)  // Add enhancement

// For temporary effects:
die.tempModifier = +1  // Lasts one roll
```

### Mechanic: State Checks
```javascript
// Common patterns:
gameState.gold >= X
gameState.turn === Y
gameState.rollsLeft === Z
gameState.jokers.length >= N
gameState.dice.filter(/* condition */).length
```

---

## 💾 PERSISTENT STATE vs TEMPORARY STATE

### Persistent (Survives save/load):
```javascript
// Add to initializeGameState() and save/load
snowballTurns: 0,
marathonPips: 0,
veteranAntes: 0,
```

### Temporary (Reset each turn/ante):
```javascript
// Set at turn_start, cleared at turn_end
tempPips: 0,  // Already exists
tempFavour: 0,  // Already exists
heldDiceThisTurn: [],
jokersTriggeredCount: 0,
```

---

## 🚀 BATCH IMPLEMENTATION GUIDE

### Batch 1: Economic Boons (4 boons, 1 hour)
- Miser's Delight
- Plutocrat's Pride
- Golden Touch
- Penny Pincher

**Why together:** All modify gold/shop economy  
**Timing:** before_score + shop_enter  
**Complexity:** ⭐⭐☆☆☆

### Batch 2: Scaling Boons (5 boons, 1.5 hours)
- Snowball Effect
- Marathon Runner
- Experience Points
- The Veteran
- Momentum

**Why together:** All accumulate over time  
**Timing:** turn_start + before_score  
**Complexity:** ⭐⭐⭐☆☆

### Batch 3: Conditional Boons (6 boons, 1 hour)
- Lucky Number 7
- Prime Time
- Mathematician's Compass
- Fibonacci Sequence
- Symmetry
- All or Nothing

**Why together:** All check dice patterns  
**Timing:** before_score  
**Complexity:** ⭐⭐☆☆☆

### Batch 4: Timing Boons (5 boons, 1 hour)
- First Blood
- Clutch Play
- Early Riser
- Midnight Oil
- The Trojan Horse

**Why together:** All depend on turn/ante number  
**Timing:** before_score  
**Complexity:** ⭐⭐☆☆☆

### Batch 5: Risk/Reward (5 boons, 1.5 hours)
- Hubris of Icarus
- The Gambler
- Glass Cannon
- Reckless Abandon
- Cursed Treasure

**Why together:** All have drawbacks  
**Timing:** Multiple  
**Complexity:** ⭐⭐⭐☆☆

---

## 📋 CHECKLIST FOR EACH BOON

When adding a boon, verify:

- [ ] Added to `gameData.js` with correct timing
- [ ] Implemented in `Joker.js` applyTimingEffect()
- [ ] State variables added to `initializeGameState()` if needed
- [ ] State variables added to save/load if persistent
- [ ] Tested in game (buy it, verify effect)
- [ ] No console errors
- [ ] Effect message shows correctly
- [ ] Works with other boons (no conflicts)
- [ ] Balanced (not too weak/strong)
- [ ] Asset added (optional)

---

## 🎯 YOUR NEXT STEPS

### Option A: Implement Quick Wins (2 hours)
I can add the 10 TIER 1 boons right now:
- All simple before_score
- No state needed
- Immediate variety

### Option B: Batch by Theme (4 hours)
Implement one batch at a time:
- Economic boons first
- Then scaling
- Then conditional

### Option C: Pick Your Favorites (Custom)
Tell me which 5-10 boons you like most and I'll implement them!

---

**What would you like to implement first?** 

I can add them systematically using the templates and timing system! 🎲✨

