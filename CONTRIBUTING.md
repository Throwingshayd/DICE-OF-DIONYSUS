# 🎲 Contributing to Dice of Dionysus

Welcome! This guide will help you contribute to the project effectively.

---

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Edge)
- Text editor (VS Code recommended)
- Basic JavaScript knowledge
- Familiarity with dice games (Yahtzee-like)

### Setup (30 seconds)
```bash
# Clone the repository
git clone [repository-url]
cd DICE-OF-DIONYSUS-WORKING

# Open index.html in browser
# That's it! No build step required.
```

### Running the Game
1. Open `index.html` in your browser
2. Click "Play"
3. Enter a seed (optional) for reproducible games
4. Start playing!

### Development Mode
- Game auto-detects localhost
- Full debug logging enabled
- Console access to game objects:
  ```javascript
  window.game        // GameEngine instance
  window.app         // App instance
  Logger.exportLogs() // Download debug logs
  ```

---

## 📋 Code Style Guide

### General Principles
- **Simplicity over cleverness**
- **Readable over compact**
- **Document non-obvious logic**
- **Test your changes**

### JavaScript Style

**Classes:**
```javascript
/**
 * Class description
 * @class
 */
class MyClass {
    /**
     * Method description
     * @param {type} param - Description
     * @returns {type} Description
     */
    myMethod(param) {
        // Implementation
    }
}
```

**Constants:**
- Use `UPPER_SNAKE_CASE` for constants
- Group related constants in objects
- Add JSDoc comments

**Functions:**
- Use descriptive names (`calculateScore` not `calcS`)
- Keep functions focused (single responsibility)
- Document with JSDoc

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Classes | PascalCase | `GameEngine`, `Die` |
| Methods | camelCase | `rollDice()`, `calculateScore()` |
| Constants | UPPER_SNAKE_CASE | `STARTING_GOLD` |
| Variables | camelCase | `diceValue`, `totalScore` |
| Private methods | _camelCase | `_internalMethod()` |
| DOM elements | camelCase | `confirmOverlay` |

### File Organization
- **One class per file** (except small utilities)
- **File name matches class name:** `GameEngine.js` contains `GameEngine` class
- **Group by function:** `/classes`, `/ui`, `/data`

---

## 🎮 Adding New Features

### Adding a New Boon (Joker)

**Step 1: Add to gameData.js**
```javascript
{
    id: "my_new_boon",  // Unique ID
    name: "My New Boon",
    rarity: "vibrant",  // rustic/vibrant/epic
    cost: 4,  // Shop cost
    sellValue: 2,  // Sell value (optional, defaults to 75% of cost)
    effect: "Effect description shown on card",
    timing: { 
        before_score: true  // When this boon triggers
        // Options: before_roll, after_roll, before_score, after_score, turn_start, turn_end
    }
}
```

**Step 2: Implement effect in Joker.js**

Find `applyTimingEffect()` method:
```javascript
case 'my_new_boon':
    // Your implementation
    if (timing === 'before_score') {
        result.pips += 10;  // Example: add 10 pips
        window.game?.showMessage?.("My New Boon: +10 Pips!");
    }
    break;
```

**Step 3: Add asset (optional)**

Add to `ART/` folder and map in `assetMapping.js`:
```javascript
'my_new_boon': 'my_boon_image.png'
```

**Step 4: Test**
- Start game
- Use seed for consistency
- Buy your boon in shop
- Verify effect triggers correctly
- Check console for errors

---

### Adding a New Libation

**Step 1: Add to gameData.js**
```javascript
{
    id: "my_libation",
    name: "My Libation",
    rarity: "libation",
    cost: 2,
    sellValue: 0,  // Libations typically don't sell
    effect: "Effect description",
    type: "instant"
}
```

**Step 2: Implement in LibationCard.js**

Find `applyLibationEffect()` method:
```javascript
case 'my_libation':
    // Implementation
    gameState.gold += 5;  // Example
    const engine = gameEngine || window.game;
    engine?.showMessage?.("My Libation: +5 Gold!");
    break;
```

---

### Adding a New Worship Card

Simpler - just add to `gameData.js`:
```javascript
{
    id: "worship_new_god",
    name: "Blessing of New God",
    god: "New God",
    rarity: "worship",
    cost: 3,
    effect: "+1 Favour when scoring [Category]"
}
```

Worship cards work automatically through the worship system!

---

## 🐛 Debugging Tips

### Common Issues

**1. Effect not triggering:**
- Check timing configuration
- Check if joker is in gameState.jokers
- Check console for errors
- Use `Logger.debug()` to trace execution

**2. Undefined errors:**
- Check JSDoc for parameter types
- Validate inputs (use Phase 2 patterns)
- Check if DOM elements exist

**3. Scoring incorrect:**
- Check `calculateScore()` logic
- Verify category name matches exactly
- Check if enhancement effects apply

### Debug Console Commands
```javascript
// Inspect current state
game.state

// Manually trigger effects
game.state.jokers.forEach(j => console.log(j.id, j.timing))

// Force gold
game.state.gold = 100

// Unlock all categories
Object.keys(game.state.unlockedCategories).forEach(k => 
    game.state.unlockedCategories[k] = true
)

// Save state
game.saveGame()

// Export logs
Logger.downloadLogs()
```

---

## ✅ Testing Your Changes

### Manual Testing Checklist
- [ ] Game loads without errors
- [ ] Can roll dice
- [ ] Can score in all categories  
- [ ] Can buy cards from shop
- [ ] New feature works as expected
- [ ] No console errors
- [ ] Save/load still works
- [ ] Game completes without crashes

### Test with Seeds
Use same seed for reproducible testing:
```
Seed: TEST1234
```

This ensures:
- Same dice rolls
- Same shop inventory
- Consistent behavior

---

## 📝 Pull Request Guidelines

### Before Submitting
1. **Test thoroughly** - Play through at least one full ante
2. **Check console** - No errors or warnings
3. **Run linter** - No linting errors
4. **Add JSDoc** - Document new functions
5. **Update constants** - No magic numbers
6. **Use Logger** - Replace console.log with Logger.debug

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature (boon/libation/worship)
- [ ] Code quality improvement
- [ ] Documentation update

## Testing
- Tested with seed: [SEED]
- Played through [N] antes
- Verified: [specific functionality]

## Checklist
- [ ] No console errors
- [ ] JSDoc added
- [ ] Constants used (no magic numbers)
- [ ] Logger used (not console.log)
- [ ] Tested thoroughly
```

---

## 🎨 Adding New Mechanics

### Example: New Enhancement Type

**1. Add to constants:**
```javascript
// js/config/GameConstants.js
ENHANCEMENT_BONUSES: {
    // ... existing
    MY_ENHANCEMENT_BONUS: 5
}
```

**2. Add to Die class:**
```javascript
// js/classes/Die.js getEnhancementDescription()
'my_enhancement': '+5 Pips when scored with specific condition'
```

**3. Implement in scoring:**
```javascript
// js/game/GameEngine.js calculateScore()
if (die.hasEnhancementForCurrentFace('my_enhancement')) {
    if (/* condition */) {
        pips += ENHANCEMENT_BONUSES.MY_ENHANCEMENT_BONUS;
        window.game?.showMessage?.("My Enhancement: +5 Pips!");
    }
}
```

---

## 📊 Game Balance Guidelines

### Boon Design
- **Rustic (Common):** Simple, consistent effects (+pips, +gold)
- **Vibrant (Uncommon):** Conditional, interesting mechanics
- **Epic (Rare):** Powerful, game-changing effects

### Cost Guidelines
- Rustic: 3-4 gold
- Vibrant: 4-6 gold  
- Epic: 6-8 gold

### Effect Power Level
- +10-15 pips = Common
- +20-30 pips or +0.5 favour = Uncommon
- +40+ pips or +1 favour = Rare

---

## 🔍 Code Review Process

All code changes should:
1. **Follow existing patterns** - Match surrounding code style
2. **Include JSDoc** - Document public methods
3. **Use constants** - No magic numbers
4. **Handle errors** - Use Logger, return safe defaults
5. **Be testable** - Avoid tight coupling

### Red Flags
- ❌ Magic numbers (use constants)
- ❌ console.log (use Logger.debug)
- ❌ Undocumented public methods
- ❌ No error handling
- ❌ Modifying multiple systems at once

---

## 🎯 Areas Needing Help

### High Priority
- [ ] Split UIManager.js into modules (Task 3.4 deferred)
- [ ] Add integration tests (Phase 4)
- [ ] Browser compatibility testing
- [ ] Mobile responsiveness

### Medium Priority
- [ ] More boons (currently 15)
- [ ] More libations (currently 11)
- [ ] More artifacts (currently 5 base + upgrades)
- [ ] Tutorial system
- [ ] Achievement system

### Low Priority
- [ ] Sound effects (beyond music)
- [ ] Advanced animations
- [ ] Particle effects
- [ ] Accessibility improvements

---

## 💬 Communication

### Asking Questions
- Check ARCHITECTURE.md first
- Search existing issues
- Include seed + steps to reproduce
- Include console logs (Logger.exportLogs())

### Reporting Bugs
```markdown
**Seed:** ABC12345
**Steps:**
1. Roll dice
2. Score in "Ones"
3. Game crashes

**Expected:** Score should be recorded
**Actual:** Error in console

**Console Log:**
[Paste error]
```

---

## 🏆 Recognition

Contributors will be added to:
- README.md credits section
- In-game credits (future)
- Release notes

---

## 📜 License

[To be determined]

---

## 🙏 Thank You!

Every contribution helps make Dice of Dionysus better. Whether it's:
- Fixing a typo
- Adding a new boon
- Improving documentation
- Reporting a bug

**Your contribution matters!** 🎲✨

---

*Happy coding! May the gods favor your pulls.*

