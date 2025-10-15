# 🎯 +Favour vs ×Favour System (Like Balatro)

## 📊 The Two Types of Favour

### +Favour (Additive)
**Adds directly to favour value**
- Most common type
- Stacks additively with base favour
- Example: Base 2, +3 favour → 2 + 3 = **5 favour**

### ×Favour (Multiplicative)  
**Multiplies total favour**
- Rare and powerful
- Applied AFTER all additive bonuses
- Example: Base 2, ×2 favour → 2 × 2 = **4 favour**

---

## 🧮 The Formula (Balatro-Style)

```
┌─────────────────────────────────────────────────────┐
│  Final Score = Pips × Favour                        │
│                                                     │
│  Where:                                             │
│    Pips = Base Pips + All Pip Bonuses              │
│    Favour = (Base Favour + All +Favour) × All ×Favour │
└─────────────────────────────────────────────────────┘
```

### Calculation Order:
1. **Calculate Base Favour** = 1 + worship levels
2. **Add all +Favour bonuses** (additive)
3. **Multiply by all ×Favour multipliers** (multiplicative)
4. **Final Score** = Pips × Total Favour

---

## 💥 Why This Matters for High Scoring

### Example 1: Just +Favour
```
Base Pips: 50
Base Favour: 5

Boons: +10 Favour (Tantalus' Curse with 20 gold)

Calculation:
  Favour = (5 + 10) = 15
  Final Score = 50 × 15 = 750
```

### Example 2: Just ×Favour
```
Base Pips: 50
Base Favour: 5

Boons: ×2 Favour (Pandora's Jar)

Calculation:
  Favour = 5 × 2 = 10
  Final Score = 50 × 10 = 500
```

### Example 3: Combined (THE POWER!)
```
Base Pips: 50
Base Favour: 5

Boons: 
  - Tantalus' Curse: +10 Favour
  - Pandora's Jar: ×2 Favour

Calculation:
  Favour = (5 + 10) × 2 = 30 ✨
  Final Score = 50 × 30 = 1,500! 🚀
```

### Example 4: Multiple of Each Type
```
Base Pips: 100
Base Favour: 8 (base 1 + 7 worship)

Boons:
  - Hydra's Heads: +3 Favour
  - Tantalus' Curse: +15 Favour (30 gold)
  - Ascetic's Vow: +2 Favour (2 empty slots)
  - Pandora's Jar: ×2 Favour
  - Carillon Perfect Harmony: ×2.5 Favour

Calculation:
  Step 1: Base = 8
  Step 2: Add +Favour = 8 + 3 + 15 + 2 = 28
  Step 3: Multiply ×Favour = 28 × 2 × 2.5 = 140 ✨✨✨
  Final Score = 100 × 140 = 14,000! 🎉
```

---

## 🎴 Boon Classification

### ✅ Additive (+Favour) Boons

These add to your favour value:

| Boon | Effect | Rarity | Notes |
|------|--------|--------|-------|
| **Hestia's Hearth** | +3 if all odd/even | Vibrant | Conditional |
| **Prometheus' Gift** | +3 all hands | Vibrant | Costs 1 roll |
| **Forge of Hephaestus** | +0.5 per unused roll | Vibrant | Max +1.5 |
| **Hydra's Heads** | +3 with 2 dice | Vibrant | Conditional |
| **Medusa's Gaze** | +0.5 lower sanctum | Vibrant | Category-specific |
| **Tantalus' Curse** | +0.5 per gold | Vibrant | Scales with gold |
| **Pegasus' Flight** | +0.5 per high die | Vibrant | 6+ faces |
| **The Symposium** | +1 on 4oak | Epic | Conditional |
| **Symmetry** | Stacking from palindromes | Epic | Accumulates |
| **Misery** | +2 at 0 gold | Epic | High risk |
| **The Zealot** | +1 matching worship | Epic | Synergy |
| **Eruption of Etna** | Stacking from boons | Epic | Accumulates |
| **Ascetic's Vow** | +1 per empty slot | Epic | Anti-synergy |
| **Carillon (Mixed)** | +3 all enhanced | Epic | Additive version |

### ⚡ Multiplicative (×Favour) Boons

These multiply your total favour:

| Boon | Effect | Rarity | Notes |
|------|--------|--------|-------|
| **Pandora's Jar** | ×2 every 3rd turn | Vibrant | Destroys boon! |
| **Carillon (Perfect)** | ×2.5 same enhancement | Epic | SECRET BONUS |

**Note:** Only 2 multiplicative boons currently! More can be added for scaling.

---

## 💻 Code Implementation

### In GameEngine.js (lines 653-670)
```javascript
// Apply BEFORE_SCORE joker effects (Balatro-inspired timing)
// Separate tracking for additive (+favour) and multiplicative (×favour)
let eventData = { 
    category, 
    pips, 
    favour,           // Additive favour (like Balatro's +mult)
    favourMult: 1     // Multiplicative favour (like Balatro's ×mult)
};

this.state.jokers.forEach(joker => {
    eventData = joker.onTimingEvent('before_score', this.state, eventData);
});

pips = eventData.pips;

// BALATRO FORMULA: (Base + Additive) × Multiplicative
favour = eventData.favour * (eventData.favourMult || 1);

finalScore = pips * favour;
```

### In Joker.js - Adding Favour (Additive)
```javascript
case 'hydras_heads':
    if (diceUsedCount === 2) {
        result.favour += 3;  // ✅ ADDITIVE
        window.game?.showMessage?.("Hydra's Heads: +3 Favour!");
    }
    break;
```

### In Joker.js - Multiplying Favour (Multiplicative)
```javascript
case 'pandoras_jar':
    if (gameState.turn % 3 === 0 && gameState.jokers.length > 1) {
        result.favourMult *= 2;  // ✅ MULTIPLICATIVE
        window.game?.showMessage?.("Pandora's Jar: ×2 Favour!");
    }
    break;
```

---

## 🎯 How to Create New Boons

### For +Favour (Additive) Boon:
```javascript
case 'my_new_boon':
    // Some condition
    if (condition) {
        result.favour += 5;  // Adds 5 to favour
        window.game?.showMessage?.("My Boon: +5 Favour!");
    }
    break;
```

### For ×Favour (Multiplicative) Boon:
```javascript
case 'my_powerful_boon':
    // Some condition
    if (condition) {
        result.favourMult *= 1.5;  // Multiplies favour by 1.5
        window.game?.showMessage?.("My Boon: ×1.5 Favour!");
    }
    break;
```

### Multiple Multipliers Stack Multiplicatively:
```javascript
// Pandora's Jar: ×2
result.favourMult *= 2;  // favourMult = 1 × 2 = 2

// Carillon Perfect: ×2.5
result.favourMult *= 2.5;  // favourMult = 2 × 2.5 = 5

// Final favour = baseFavour × 5!
```

---

## 🧪 Testing Examples

### Test 1: Simple Additive
```javascript
// Setup
window.game.startNewRun();
const hydra = new Joker(window.CardData.jokers.find(j => j.id === 'hydras_heads'));
window.game.state.jokers.push(hydra);

// Set 2 dice active
window.game.state.dice[0].face = 5;
window.game.state.dice[1].face = 5;
window.game.state.dice[2].face = 0;
window.game.state.dice[3].face = 0;
window.game.state.dice[4].face = 0;

// Base favour = 1
// Hydra adds +3
// Total = 1 + 3 = 4
```

### Test 2: Simple Multiplicative
```javascript
// Setup
window.game.startNewRun();
const pandora = new Joker(window.CardData.jokers.find(j => j.id === 'pandoras_jar'));
window.game.state.jokers.push(pandora);
window.game.state.turn = 3;  // Trigger on turn 3

// Base favour = 1
// Pandora multiplies ×2
// Total = 1 × 2 = 2
```

### Test 3: Combined Power
```javascript
// Setup
window.game.startNewRun();

// Add both boons
const hydra = new Joker(window.CardData.jokers.find(j => j.id === 'hydras_heads'));
const pandora = new Joker(window.CardData.jokers.find(j => j.id === 'pandoras_jar'));
window.game.state.jokers.push(hydra, pandora);
window.game.state.turn = 3;

// Set 2 dice (trigger Hydra)
window.game.state.dice[0].face = 6;
window.game.state.dice[1].face = 6;
window.game.state.dice[2].face = 0;
window.game.state.dice[3].face = 0;
window.game.state.dice[4].face = 0;

// Base favour = 1
// Hydra adds +3 → 1 + 3 = 4
// Pandora multiplies ×2 → 4 × 2 = 8
// Total = 8! (vs 4 with just additive)
```

---

## 📈 Scaling Strategy for Players

### Early Game (Antes 1-2)
- Focus on **+Favour** boons
- Build worship levels for base favour
- Stack multiple additive bonuses

### Mid Game (Antes 3-4)  
- Look for **×Favour** boons
- Combine with existing +Favour boons
- Start building synergies

### Late Game (Antes 5+)
- **MUST HAVE** at least one ×Favour boon
- Stack multiple ×Favour if possible
- Maximize both pips AND favour for exponential growth

### Endgame Strategy
```
High Score Build:
  - Base Favour: 10+ (worship stacking)
  - +Favour: 20+ (multiple boons)
  - ×Favour: 5x+ (multiple multipliers)
  - Final Favour: (10 + 20) × 5 = 150!
```

---

## ⚙️ Design Notes

### Why Only 2 Multiplicative Boons?
- Multiplicative favour is VERY powerful
- Too many would make game too easy
- Creates meaningful choices in shop

### Future Multiplicative Boons Could Include:
- Epic tier boons with high costs
- Conditional multipliers (like Carillon's secret)
- Risk/reward boons (like Pandora destroying boons)
- Artifact effects

### Balance Considerations:
- **+Favour**: Good for consistency, linear scaling
- **×Favour**: Explosive potential, requires setup
- **Combined**: Intended for late-game power scaling

---

## ✅ Summary

| Aspect | +Favour (Additive) | ×Favour (Multiplicative) |
|--------|-------------------|-------------------------|
| **Effect** | Adds to favour | Multiplies favour |
| **Rarity** | Common | Rare |
| **Scaling** | Linear | Exponential |
| **Best For** | Early game | Late game |
| **Synergy** | With worship | With +favour boons |
| **Formula** | `favour + X` | `favour × X` |
| **Example Value** | +3, +0.5 | ×2, ×2.5 |

**The key to high scoring:** *Stack +Favour boons, then multiply them with ×Favour!*

Just like Balatro's +mult and ×mult system! 🎰✨

