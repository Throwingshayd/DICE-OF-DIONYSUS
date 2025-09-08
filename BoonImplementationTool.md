# 🎲 Boon Implementation Tool

## How to Use This Tool

1. **Describe your boon** in the format below
2. **I'll generate the code** for the joker effect
3. **Copy the code** into the appropriate section in `js/classes/Joker.js`

---

## 📝 Boon Description Format

Please provide your boon in this format:

```
**Boon Name:** [Name]
**Rarity:** [common/uncommon/rare/legendary]
**Cost:** [Gold cost]
**Effect Description:** [What the boon does]
**Trigger:** [When it activates - scoring/rolling/turn start/etc]
**Target:** [What it affects - specific categories/dice/gold/etc]
**Special Notes:** [Any additional details]
```

---

## 🔧 Implementation Sections

### 1. **Scoring Effects** (Most Common)
These affect the final score calculation:
- Modify `result.pips` (point value)
- Modify `result.favour` (multiplier)
- Add gold: `gameState.gold += X`
- Show messages: `window.game?.showMessage?.("Message")`

### 2. **Dice Rolling Effects**
These affect dice behavior:
- Modify dice faces
- Add reroll mechanics
- Change dice values

### 3. **Turn/Game State Effects**
These affect game mechanics:
- Modify rolls per turn
- Change base favour
- Add ongoing effects

### 4. **Conditional Effects**
These activate based on conditions:
- Dice face counts
- Category types
- Score thresholds
- Game state conditions

---

## 📋 Example Implementations

### Simple Scoring Bonus
```javascript
case 'example_boon':
    if (result.category === 'Ones') {
        result.pips += 10;
    }
    break;
```

### Conditional Gold Bonus
```javascript
case 'gold_boon':
    if (this.hasThreeOfSameFace(gameState.dice)) {
        gameState.gold += 5;
        window.game?.showMessage?.("Gold Boon: +5 Gold!");
    }
    break;
```

### Category-Specific Favour
```javascript
case 'favour_boon':
    if (result.category === 'Yahtzee') {
        result.favour += 2;
    }
    break;
```

### Dice Face Counting
```javascript
case 'face_counter':
    const sixes = gameState.dice.filter(d => d.face === 6).length;
    result.pips += sixes * 5;
    break;
```

---

## 🎯 Ready to Implement!

**Just describe your boon below and I'll generate the exact code you need!**

---

## 📚 Common Patterns

### **Category Checks**
```javascript
// Upper Sanctum categories
const upperSanctum = ['Ones', 'Twos', 'Threes', 'Fours', 'Fives', 'Sixes'];

// Lower Sanctum categories  
const lowerSanctum = ['Three of a Kind', 'Four of a Kind', 'Full House', 'Small Straight', 'Large Straight', 'Yahtzee', 'Chance'];
```

### **Dice Analysis**
```javascript
// Count specific faces
const sixes = gameState.dice.filter(d => d.face === 6).length;

// Check for patterns
const counts = {};
gameState.dice.forEach(d => counts[d.face] = (counts[d.face] || 0) + 1);

// Check all dice conditions
const allEven = gameState.dice.every(d => d.face % 2 === 0);
const allDiceThreeOrLess = gameState.dice.every(d => d.face <= 3);
```

### **Gold and Messages**
```javascript
// Add gold
gameState.gold += 5;

// Show message
window.game?.showMessage?.("Your Boon: +5 Gold!");
```

---

**Ready to create your boon? Just describe it below! 🎲** 