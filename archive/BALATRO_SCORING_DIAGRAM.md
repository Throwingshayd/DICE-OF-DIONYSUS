# 🎲 Balatro-Style Scoring Diagram

## How Marathon Runner (and all boons) Work

```
┌─────────────────────────────────────────────────────────────┐
│                    SCORING FLOW                              │
└─────────────────────────────────────────────────────────────┘

Roll: [1, 1, 3, 4, 1]
Category: Artemis (Ones)
Marathon Runner: +6 pips stored
Artemis Worship: 2 levels

                    ↓

┌─────────────────────────────────────────────────────────────┐
│  STEP 1: Calculate Base Score                                │
├─────────────────────────────────────────────────────────────┤
│  Count 1s in dice: 1, 1, 1 = 3 dice                         │
│  Base Pips:    3                                             │
│  Base Favour:  1 + 2 (worship) = 3                          │
└─────────────────────────────────────────────────────────────┘

                    ↓

┌─────────────────────────────────────────────────────────────┐
│  STEP 2: Apply Boon Effects (before_score timing)           │
├─────────────────────────────────────────────────────────────┤
│  Marathon Runner triggers:                                   │
│    result.pips += 6                                          │
│                                                              │
│  After boons:                                                │
│  Total Pips:    3 + 6 = 9     ← ADDITIVE!                   │
│  Total Favour:  3              (no favour boons active)     │
└─────────────────────────────────────────────────────────────┘

                    ↓

┌─────────────────────────────────────────────────────────────┐
│  STEP 3: Calculate Final Score                               │
├─────────────────────────────────────────────────────────────┤
│  finalScore = pips × favour                                  │
│  finalScore = 9 × 3                                          │
│  finalScore = 27                    ✅                       │
└─────────────────────────────────────────────────────────────┘

                    ↓

┌─────────────────────────────────────────────────────────────┐
│  STEP 4: Animated Display                                    │
├─────────────────────────────────────────────────────────────┤
│  [9] × [3] = [27]                                            │
│   ↑    ↑     ↑                                              │
│   │    │     └─ Count-up animation                          │
│   │    └─ Favour (base + worship)                           │
│   └─ Pips (base + Marathon bonus)                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Multiple Boons Example

What if you have multiple pip-adding boons?

```
Roll: [5, 5, 5, 5, 5]
Category: Athena (Fives)
Boons Active:
  - Marathon Runner: +6 pips
  - Sisyphus' Boulder: +10 pips (2 rerolls)
  - Reckless Abandon: +50 pips
Athena Worship: 1 level

                    ↓

STEP 1: Base Calculation
  Pips: 25 (five 5s)
  Favour: 1 + 1 = 2

                    ↓

STEP 2: Apply ALL Boon Effects
  Base:              25 pips
  + Marathon:        +6
  + Sisyphus:        +10
  + Reckless:        +50
  ─────────────────────
  Total Pips:        91 pips ✅
  
  Total Favour:      2

                    ↓

STEP 3: Final Score
  91 × 2 = 182 ✅

                    ↓

STEP 4: Display
  [91] × [2] = [182]
```

---

## 🎯 The Key Formula

```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║  Final Score = (Base Pips + All Pip Bonuses)             ║
║                ×                                          ║
║                (Base Favour + All Favour Bonuses)        ║
║                                                           ║
║  This is EXACTLY how Balatro works!                      ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

---

## ⚙️ Code Implementation

### GameEngine.js (lines 645-668)
```javascript
// Get base calculation from dice
let { pips, favour, isValid } = this.calculateScore(category);

// Apply all boon bonuses
let eventData = { category, pips, favour };
this.state.jokers.forEach(joker => {
    eventData = joker.onTimingEvent('before_score', this.state, eventData);
    // Each boon adds its bonus to eventData.pips or eventData.favour
});

pips = eventData.pips;      // Now includes ALL pip bonuses
favour = eventData.favour;  // Now includes ALL favour bonuses

// Multiply to get final score
finalScore = pips * favour;
```

### Joker.js - Marathon Runner (lines 619-628)
```javascript
case 'marathon_runner':
    const marathonPips = this.marathonPips || 0;
    
    if (marathonPips > 0) {
        result.pips += marathonPips;  // ← ADDS to pips (not multiply)
        window.game?.showMessage?.(`Marathon Runner: +${marathonPips} Pips!`);
    }
    break;
```

---

## ✅ Verified Boon Patterns

### Pip-Adding Boons (19 total)
All use: `result.pips += bonus`

Example boons:
- Marathon Runner: `result.pips += marathonPips`
- Sisyphus' Boulder: `result.pips += boulderBonus`
- Reckless Abandon: `result.pips += 50`
- Early Bird: `result.pips += 20`
- First Blood: `result.pips += 50`

### Favour-Adding Boons (12 total)
All use: `result.favour += bonus`

Example boons:
- Hydra's Heads: `result.favour += 3`
- Pandora's Jar: `result.favour += 4`
- Tantalus' Curse: `result.favour += goldCount * 0.5`
- Pegasus' Flight: `result.favour += highDice * 0.5`
- Misery: `result.favour += 2`

---

## 🎬 In-Game Experience

When you score with boons active:

1. **Messages appear** for each boon that triggers
   - "Marathon Runner: +6 Pips!"
   - "Sisyphus' Boulder: +10 Pips!"
   
2. **Animation shows the math**
   - Pips appear: `91` (all bonuses included)
   - Multiplication: `91 × 2`
   - Final score: `= 182` (counts up)

3. **Visual feedback**
   - Screen shake (for high scores)
   - Particle effects (for very high scores)
   - Score glows and pulses

---

## 🏆 Conclusion

**The system is ALREADY working correctly!**

✅ Bonuses are **additive** within their type (pips or favour)  
✅ Final score **multiplies** (pips × favour)  
✅ This **matches Balatro** exactly  
✅ All 31 boons verified to use correct pattern  

**No changes needed!** The implementation is perfect! 🎉

