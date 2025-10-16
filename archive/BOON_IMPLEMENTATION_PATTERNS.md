# 🛠️ Boon Implementation Patterns Guide

## Overview

This guide provides code patterns for implementing boons in each mechanical category. All examples are based on verified, working implementations from the codebase.

---

## Pattern 1: +Pips (Additive)

**Use for:** Boons that add points to the base score
**Timing:** `before_score`
**Pattern:** `result.pips += bonus`

### Simple Flat Bonus

```javascript
case 'reckless_abandon':
    // +50 Pips flat bonus
    result.pips += 50;
    window.game?.showMessage?.("Reckless Abandon: +50 Pips!");
    break;
```

### Conditional Bonus

```javascript
case 'mathematicians_compass':
    // +10 Pips if dice sum to even number
    const diceSum = gameState.dice.reduce((sum, die) => sum + die.face, 0);
    if (diceSum % 2 === 0) {
        result.pips += 10;
        window.game?.showMessage?.(`Mathematician's Compass: +10 Pips (sum: ${diceSum})!`);
    }
    break;
```

### Scaling with Game State

```javascript
case 'sisyphus_boulder':
    // +5 Pips for every time you've rerolled this turn
    const totalRerolls = (GAME_BALANCE.STARTING_ROLLS - gameState.rollsLeft);
    const boulderBonus = totalRerolls * BOON_EFFECTS.SISYPHUS_BOULDER.PIPS_PER_REROLL;
    result.pips += boulderBonus;
    this.dynamicStats.pips = boulderBonus; // For display
    if (boulderBonus > 0) {
        window.game?.showMessage?.(`Sisyphus' Boulder: +${boulderBonus} Pips!`);
    }
    break;
```

### With Instance Variables (Stacking)

```javascript
case 'marathon_runner':
    // Gain +1 Pips per roll taken (stacks)
    const marathonPips = this.marathonPips || 0;
    
    if (marathonPips > 0) {
        result.pips += marathonPips;
        this.dynamicStats.pips = marathonPips;
        window.game?.showMessage?.(`Marathon Runner: +${marathonPips} Pips!`);
    }
    break;
```

---

## Pattern 2: +Favour (Additive)

**Use for:** Boons that add to the multiplier
**Timing:** `before_score`
**Pattern:** `result.favour += bonus`

### Simple Flat Bonus

```javascript
case 'misery':
    // If you have 0 gold, gain ×2 Favour
    if (gameState.gold === 0) {
        result.favour += 2;
        window.game?.showMessage?.("Misery: ×2 Favour (broke!)");
    }
    break;
```

### Scaling with Game State

```javascript
case 'tantalus_curse':
    // +0.5 Favour for each gold, but cannot spend gold
    const tantalusFavour = gameState.gold * 0.5;
    result.favour += tantalusFavour;
    this.dynamicStats.favour = tantalusFavour;
    if (tantalusFavour > 0) {
        window.game?.showMessage?.(`Tantalus' Curse: +${tantalusFavour} Favour from gold!`);
    }
    // Gold blocking handled in shop
    break;
```

### Stacking Favour (Permanent)

```javascript
case 'symmetry':
    // Apply accumulated favour from palindromes
    if (this.symmetryFavour > 0) {
        result.favour += this.symmetryFavour;
        this.dynamicStats.favour = this.symmetryFavour;
    }
    break;
```

---

## Pattern 3: ×Favour (Multiplicative)

**Use for:** Powerful boons that multiply the total favour
**Timing:** `before_score`
**Pattern:** `result.favourMult *= multiplier`

### Simple Multiplier

```javascript
case 'pandoras_jar':
    // Every 3rd turn, randomly destroy a Boon and gain ×2 Favour (MULTIPLICATIVE!)
    if (gameState.turn % 3 === 0 && gameState.jokers && gameState.jokers.length > 1) {
        result.favourMult *= 2;  // ×2 MULTIPLICATIVE (like Balatro's ×mult)
        window.game?.showMessage?.("Pandora's Jar: ×2 Favour! (Boon destroyed)");
        // Destruction handled in turn_start
    }
    break;
```

### Conditional Secret Bonus

```javascript
case 'carillon_of_the_muses':
    // If all 5 dice have enhancements, gain ×3 Favour (×5 if all same)
    let carillonEnhancedCount = 0;
    const carillonEnhancementTypes = new Set();
    
    gameState.dice.forEach(die => {
        const currentFace = die.face;
        if (die.faces[currentFace] && die.faces[currentFace].enhancements.size > 0) {
            carillonEnhancedCount++;
            const firstEnhancement = Array.from(die.faces[currentFace].enhancements)[0].enhancement;
            carillonEnhancementTypes.add(firstEnhancement);
        }
    });
    
    if (carillonEnhancedCount === 5) {
        if (carillonEnhancementTypes.size === 1) {
            // SECRET BONUS: All same enhancement! (MULTIPLICATIVE!)
            result.favourMult *= 2.5;  // ×2.5 MULTIPLICATIVE (Balatro-style)
            window.game?.showMessage?.("🎵 Carillon of the Muses: PERFECT HARMONY! ×2.5 Favour!", 5000);
            Logger.info("Carillon secret bonus triggered: All same enhancement - MULTIPLICATIVE!");
        } else {
            // All enhanced but different (ADDITIVE)
            result.favour += 3;
            window.game?.showMessage?.("Carillon of the Muses: +3 Favour!");
        }
    }
    break;
```

---

## Pattern 4: +Gold

**Use for:** Boons that provide economic benefits
**Timing:** Varies (`after_score`, `turn_start`, `before_roll`)

### After Scoring

```javascript
// In applyAfterScoreEffect()
case 'charons_ferry_fare':
    // Gain +1 Gold after scoring any hand (does not trigger on a scratch)
    if (result.pips > 0) {
        gameState.gold += 1;
        window.game?.showMessage?.("Charon's Ferry Fare: +1 Gold!");
    }
    break;
```

### Randomized Outcome

```javascript
case 'gamblers_charm':
    // 50% chance +2 Gold, 50% chance lose 1 gold
    if (Math.random() < 0.5) {
        if (window.game && typeof window.game.updateGoldAnimated === 'function') {
            window.game.updateGoldAnimated(2, "Gambler's Charm");
        } else {
            gameState.gold += 2;
        }
        window.game?.showMessage?.("Gambler's Charm: +2 Gold! Lucky!");
    } else {
        if (window.game && typeof window.game.updateGoldAnimated === 'function') {
            window.game.updateGoldAnimated(-1, "Gambler's Charm");
        } else {
            gameState.gold = Math.max(0, gameState.gold - 1);
        }
        window.game?.showMessage?.("Gambler's Charm: -1 Gold! Unlucky!");
    }
    break;
```

### Turn-Based Cost

```javascript
// In applyTurnStartEffect()
case 'achilles_heel':
    // Achilles Heel: lose 1 Gold at the start of each roll
    if (gameState.gold > 0) {
        gameState.gold -= 1;
        window.game?.showMessage?.("Achilles' Heel: -1 Gold!");
    }
    break;
```

---

## Pattern 5: Dice Manipulation

### Reroll Effects

```javascript
// In applyAfterRollEffect()
case 'lucky_dice_bag':
    // Reroll any 1s automatically (once per die per turn)
    gameState.dice.forEach(die => {
        if (die.face === 1 && !die.rerolledBy1sBag) {
            die.face = Math.floor(Math.random() * 6) + 1;
            die.rerolledBy1sBag = true;
            window.game?.showMessage?.("Lucky Dice Bag: Rerolled a 1!");
        }
    });
    break;
```

### Auto-Hold

```javascript
case 'medusas_gaze':
    // Any die showing 6 cannot be rerolled (auto-hold)
    let medusaSixes = 0;
    gameState.dice.forEach(die => {
        if (die.face === 6 && !die.held) {
            die.held = true;
            medusaSixes++;
        }
    });
    if (medusaSixes > 0) {
        window.game?.showMessage?.(`Medusa's Gaze: ${medusaSixes} six(es) auto-held!`);
    }
    break;
```

### Face Transformation

```javascript
case 'smog_of_morpheus':
    // After final roll, transform 2s and 4s to 3s
    if (gameState.rollsLeft === 0) {
        let transformedCount = 0;
        
        gameState.dice.forEach(die => {
            if (die.face === 2 || die.face === 4) {
                die.face = 3;
                transformedCount++;
            }
        });
        
        if (transformedCount > 0) {
            window.game?.showMessage?.(`Smog of Morpheus: ${transformedCount} dice → 3!`);
        }
    }
    break;
```

### Permanent Die Modification

```javascript
// In applyTurnStartEffect()
case 'demeters_harvest':
    // Each turn, one random die permanently gains +1 (max 9)
    const harvestDie = gameState.dice[Math.floor(Math.random() * gameState.dice.length)];
    const faceKeys = Object.keys(harvestDie.faces);
    const randomFaceKey = faceKeys[Math.floor(Math.random() * faceKeys.length)];
    const currentValue = harvestDie.faces[randomFaceKey].modifiedValue || harvestDie.faces[randomFaceKey].value;
    
    if (currentValue < 9) {
        harvestDie.faces[randomFaceKey].modifiedValue = currentValue + 1;
        window.game?.showMessage?.(`Demeter's Harvest: Die face ${randomFaceKey} → ${currentValue + 1}!`);
    }
    break;
```

---

## Pattern 6: Roll Modification

### Adding Rolls

```javascript
// In applyTurnStartEffect()
case 'kronos_hourglass':
    // +2 Rolls permanently
    gameState.rollsLeft = (GAME_BALANCE.STARTING_ROLLS + 2);
    window.game?.showMessage?.("Kronos' Hourglass: +2 rolls!");
    break;
```

### Removing Rolls

```javascript
case 'prometheus_gift':
    // Prometheus' Gift: one less re-roll each turn
    gameState.rollsLeft = Math.max(1, gameState.rollsLeft - 1);
    window.game?.showMessage?.("Prometheus' Gift: -1 re-roll!");
    break;
```

---

## Pattern 7: Destruction/Self-Destruct

### Conditional Self-Destruct

```javascript
// In applyAfterScoreEffect()
case 'marathon_runner':
    // Track scratches (3 strikes, you're out!) or reaching 42km
    if (!result.isValid) {
        // Increment scratch count
        this.marathonScratches = (this.marathonScratches || 0) + 1;
        
        if (this.marathonScratches >= 3) {
            // 3 scratches = destroyed!
            const marathonIndex = gameState.jokers.findIndex(j => j.id === 'marathon_runner');
            if (marathonIndex !== -1) {
                gameState.jokers.splice(marathonIndex, 1);
                window.game?.showMessage?.("💀 Marathon Runner: 3 scratches! Exhausted and destroyed!", 4000);
                Logger.info("Marathon Runner destroyed - 3 scratches");
            }
        } else {
            window.game?.showMessage?.(`⚠️ Marathon Runner: Scratch ${this.marathonScratches}/3!`, 3000);
            this.marathonPips = 0;
        }
    } else if (this.marathonPips >= 42) {
        // Reached 42km - destroy with fanfare!
        const marathonIndex = gameState.jokers.findIndex(j => j.id === 'marathon_runner');
        if (marathonIndex !== -1) {
            gameState.jokers.splice(marathonIndex, 1);
            window.game?.showMessage?.("🏅 Marathon Runner: 42km complete! Mission accomplished!", 5000);
            Logger.info("Marathon Runner destroyed - 42km (marathon) reached");
        }
    }
    break;
```

### Random Destruction

```javascript
// In applyTurnStartEffect()
case 'pandoras_jar':
    // Every 3rd turn, randomly destroy a Boon
    if (gameState.turn % 3 === 0 && gameState.jokers && gameState.jokers.length > 1) {
        // Don't destroy Pandora's Jar itself
        const otherJokers = gameState.jokers.filter(j => j.id !== 'pandoras_jar');
        if (otherJokers.length > 0) {
            const randomIndex = Math.floor(Math.random() * otherJokers.length);
            const destroyed = otherJokers[randomIndex];
            // Remove from main array
            const mainIndex = gameState.jokers.findIndex(j => j.id === destroyed.id);
            if (mainIndex !== -1) {
                gameState.jokers.splice(mainIndex, 1);
                window.game?.showMessage?.(`💔 Pandora's Jar: ${destroyed.name} destroyed!`, 3000);
            }
        }
    }
    break;
```

### Break Chance

```javascript
// In applyTurnEndEffect()
case 'icarus_wings':
    // Chance to break after turn 1 in 8
    if (gameState.turn > 1 && Math.random() < 1/8) {
        // Break the joker (remove it)
        const jokerIndex = gameState.jokers.findIndex(j => j.id === this.id);
        if (jokerIndex !== -1) {
            gameState.jokers.splice(jokerIndex, 1);
            window.game?.showMessage?.("Icarus' Wings: The wings broke!");
        }
    }
    break;
```

---

## Pattern 8: Boon Interaction/Mimicry

### Mimic Another Boon

```javascript
// In applyTurnStartEffect()
case 'proteus_disguise':
    // Pick a random boon to mimic (cannot repeat last turn's choice)
    const proteusOtherBoons = (gameState.jokers || []).filter(b => 
        b.id !== 'proteus_disguise' && b.id !== gameState.proteusLastMimicId
    );
    
    if (proteusOtherBoons.length > 0) {
        const randomBoon = proteusOtherBoons[Math.floor(Math.random() * proteusOtherBoons.length)];
        gameState.proteusLastMimicId = gameState.proteusMimicId;
        gameState.proteusMimicId = randomBoon.id;
        
        window.game?.showMessage?.(`🎭 Proteus' Disguise: Transforming into ${randomBoon.name}!`, 3500);
        Logger.info(`Proteus mimicking: ${randomBoon.name}`);
        
        this.dynamicStats.other = `→${randomBoon.name}`;
    } else {
        gameState.proteusMimicId = null;
        this.dynamicStats.other = 'No target';
    }
    break;

// Special handling in onTimingEvent()
if (this.id === 'proteus_disguise' && gameState.proteusMimicId) {
    return this.applyProteusMimicEffect(timingEvent, gameState, eventData);
}
```

---

## Common Patterns Summary

### 1. Always Initialize favourMult

```javascript
applyBeforeScoreEffect(gameState, result) {
    // Ensure favourMult is initialized (for Balatro-style multiplicative favour)
    if (result.favourMult === undefined) {
        result.favourMult = 1;
    }
    
    // ... rest of your code
}
```

### 2. Use Dynamic Stats for Display

```javascript
case 'my_boon':
    const bonus = calculateBonus();
    result.pips += bonus;
    this.dynamicStats.pips = bonus;  // Shows on boon card
    this.dynamicStats.other = 'Active';  // Custom status text
    break;
```

### 3. Check Game State Before Accessing

```javascript
// Good: Safe access
if (gameState.jokers && gameState.jokers.length > 1) {
    // Do something
}

// Bad: Can crash
gameState.jokers.forEach(...); // Crashes if jokers is undefined
```

### 4. Use Logger for Debugging

```javascript
Logger.info("Marathon Runner destroyed - 42km reached");
Logger.warn("Unknown joker effect:", this.id);
Logger.error("Failed to apply effect:", error);
```

### 5. Always Show User Feedback

```javascript
// Good: Always show message when effect triggers
window.game?.showMessage?.("Effect triggered!");

// Bad: Silent effects confuse players
result.pips += 10; // No message
```

---

## Testing Checklist

When implementing a new boon:

- [ ] Added to `gameData.js` with correct timing tags
- [ ] Implemented in appropriate timing method in `Joker.js`
- [ ] Uses correct pattern for category (+pips, +favour, ×favour, etc.)
- [ ] Shows user message when triggered
- [ ] Updates dynamicStats for display
- [ ] Handles edge cases (0 gold, no other boons, etc.)
- [ ] Tested in game with various scenarios
- [ ] Verified description matches implementation
- [ ] No console errors or crashes

---

## Anti-Patterns to Avoid

### ❌ Don't Mix Additive and Multiplicative

```javascript
// BAD: Mixing patterns
case 'confusing_boon':
    result.pips += 10;  // Additive
    result.pips *= 2;   // Multiplicative - DON'T DO THIS
    break;
```

### ❌ Don't Modify result Directly

```javascript
// BAD: Side effects on original object
result.category = 'Yahtzee';  // Don't modify non-numeric fields

// GOOD: Only modify pips, favour, favourMult
result.pips += 10;
result.favour += 2;
result.favourMult *= 1.5;
```

### ❌ Don't Use Math.random() Directly

```javascript
// BAD: Breaks determinism
if (Math.random() < 0.5) { ... }

// GOOD: Use seeded RNG (when available)
if (this.prng.random() < 0.5) { ... }
```

### ❌ Don't Forget Edge Cases

```javascript
// BAD: Assumes array exists
gameState.jokers.forEach(...); // Crashes if undefined

// GOOD: Check first
if (gameState.jokers && gameState.jokers.length > 0) {
    gameState.jokers.forEach(...);
}
```

---

## Quick Reference

| Effect Type | Timing | Pattern | Example |
|-------------|--------|---------|---------|
| +Pips | `before_score` | `result.pips += X` | Marathon Runner |
| +Favour | `before_score` | `result.favour += X` | Tantalus' Curse |
| ×Favour | `before_score` | `result.favourMult *= X` | Pandora's Jar |
| +Gold | `after_score` | `gameState.gold += X` | Charon's Ferry Fare |
| Reroll | `after_roll` | Modify `die.face` | Lucky Dice Bag |
| Hold | `after_roll` | Set `die.held = true` | Medusa's Gaze |
| Roll Mod | `turn_start` | Modify `gameState.rollsLeft` | Kronos' Hourglass |
| Die Mod | `turn_start` | Modify `die.faces[X]` | Demeter's Harvest |
| Destroy | `after_score`/`turn_end` | Remove from `gameState.jokers` | Marathon Runner |

---

## Need Help?

1. Find a similar boon in the codebase
2. Copy its pattern
3. Modify the values and conditions
4. Test thoroughly
5. Check this guide for best practices

**Remember:** When in doubt, keep it simple and follow existing patterns!

