# 🛠️ Development Workflow for Dice of Dionysus

## AI-Assisted Development Guide

This document outlines how to work effectively with Cursor AI on this project.

---

## 🎯 Quick Start Commands

### Starting Development
```bash
npm run dev          # Start Vite dev server (hot reload)
```

### Building for Production
```bash
npm run build        # Build optimized bundle
npm run preview      # Preview production build
```

### Code Quality
```bash
npm run lint         # Check code style
npm run lint:fix     # Auto-fix linting issues
```

---

## 🧠 Working with Cursor AI

### Setting Expectations

Cursor AI has been configured (via `.cursorrules` and `.cursor/context/ai_context.yaml`) to understand:

1. **Your architecture** (vanilla JS, class-based, GameEngine as single source of truth)
2. **Your terminology** (libations not "houseRules", Greek mythology theming)
3. **Your constraints** (no frameworks, maintain determinism, simple debugging)
4. **Your performance targets** (60fps, ~120KB bundle)

### Effective Prompts

#### ✅ Good Prompts (Specific and Contextual)

```
"Add a new boon called 'Blessing of Athena' that gives +2 pips 
when scoring straights. Follow the existing joker pattern in 
gameData.js and Joker.js."
```

```
"Optimize the calculateScore() method for performance. Profile 
first, then suggest improvements that preserve determinism."
```

```
"Fix the bug where Mirror enhancement doesn't work on the last 
die. Check BUGS_FIXED_LOG.md for similar issues first."
```

#### ❌ Bad Prompts (Vague or Conflicting)

```
"Make the game better"  // Too vague
```

```
"Rewrite everything in TypeScript"  // Violates constraints
```

```
"Add a combo system"  // Needs thematic translation first
```

### AI Command Templates

Save these as snippets for common tasks:

#### Add New Boon
```
Create a new boon with these specs:
- Name: [Greek mythology themed name]
- Rarity: [rustic/vibrant/epic]
- Cost: [number]
- Effect: [description]
- Timing: [before_roll/before_score/after_score/turn_start/turn_end]

Follow the pattern:
1. Add to gameData.js jokers array
2. Implement in Joker.js applyTimingEffect()
3. Add to assetMapping.js if needs custom image
4. Test with seed: [provide seed]
```

#### Optimize Function
```
Optimize [function name] in [file]:
1. Profile current performance with Chrome DevTools
2. Identify bottlenecks
3. Suggest improvements that:
   - Preserve deterministic behavior
   - Don't break existing architecture
   - Improve performance by [X]%
4. Benchmark before/after
5. Document tradeoffs
```

#### Fix Bug
```
Fix bug: [description]

Steps:
1. Check BUGS_FIXED_LOG.md for similar issues
2. Reproduce with seed: [seed if applicable]
3. Use Logger to trace issue
4. Fix root cause (not symptom)
5. Verify with multiple seeds
6. Update CHANGELOG.md
```

---

## 📁 File Organization for AI

### Where to Put Things

| Type | Location | AI Guidance |
|------|----------|-------------|
| **Game logic** | `js/game/GameEngine.js` | Single source of truth, don't split |
| **UI rendering** | `js/ui/UIManager.js` | Monolithic by design, optimize in place |
| **Card definitions** | `js/data/gameData.js` | All cards start here |
| **Card behavior** | `js/classes/Joker.js`, `LibationCard.js`, etc. | Implement effects here |
| **Constants** | `js/config/*.js` | All magic numbers go here |
| **Utilities** | `js/utils/*.js` | Helpers, no game logic |
| **AI notes** | `.cursor/context/*.md`, `ai_context.yaml` | Teach AI about your project |

### File Size Guidelines

- **Under 500 lines**: ✅ Good, easy to navigate
- **500-1000 lines**: ⚠️ Consider logical grouping
- **1000-2000 lines**: 🟡 OK if monolithic by design (GameEngine, UIManager)
- **Over 2000 lines**: 🔴 Consider splitting (with user approval)

---

## 🔄 Development Cycle

### 1. Planning Phase
```
1. Define feature/fix clearly
2. Check if it needs thematic translation
3. Identify affected files
4. Consider performance impact
5. Ask AI for implementation plan
```

### 2. Implementation Phase
```
1. AI generates code following patterns
2. Review for architecture violations
3. Test in browser console
4. Use deterministic seeds for testing
5. Verify performance (if hot path)
```

### 3. Testing Phase
```
1. Manual testing in browser
2. Test with multiple seeds
3. Check console for errors/warnings
4. Verify save/load works
5. Test edge cases
```

### 4. Documentation Phase
```
1. Update CHANGELOG.md
2. Update card_database.csv (if card changes)
3. Add to BUGS_FIXED_LOG.md (if bug fix)
4. Update AI context if patterns changed
```

---

## 🧪 Testing Strategies

### Browser Console Testing

```javascript
// Access game instance
window.game

// Test specific seed
window.app.startGame('TEST123')

// Inspect state
console.log(game.state)

// Force specific scenario
game.state.gold = 100
game.state.jokers.push(new Joker(gameData.jokers[0]))

// Test scoring
game.calculateScore('Yahtzee')

// Export logs
Logger.downloadLogs()
```

### Deterministic Testing

```javascript
// Same seed should produce same results
const seed1 = 'REPRODUCIBLE'
app.startGame(seed1)
// Play through scenario, note results

// Reset and replay
app.startGame(seed1)
// Should get identical results
```

### Performance Testing

```javascript
// Benchmark hot functions
function benchmark(fn, iterations = 1000) {
    const start = performance.now()
    for (let i = 0; i < iterations; i++) fn()
    const end = performance.now()
    console.log(`Avg: ${((end - start) / iterations).toFixed(3)}ms`)
}

benchmark(() => game.rollDice())
benchmark(() => game.calculateScore('Yahtzee'))
```

---

## 🔍 Debugging Workflow

### 1. Reproduce the Issue
```
- Note exact steps to reproduce
- Identify seed if relevant
- Check if it's deterministic
- Screenshot/record if visual
```

### 2. Gather Context
```
- Check BUGS_FIXED_LOG.md for similar issues
- Check console for errors
- Export logs with Logger.downloadLogs()
- Inspect game.state
```

### 3. Locate the Bug
```
- Use Logger.debug() to trace execution
- Add breakpoints in Chrome DevTools
- Inspect call stack
- Check for null/undefined values
```

### 4. Fix and Verify
```
- Fix root cause, not symptom
- Test with original reproduction steps
- Test with multiple seeds
- Verify no new issues introduced
```

---

## 📊 Code Quality Standards

### AI Checklist for Code Review

When AI generates code, verify:

- [ ] Uses Logger, not console.log
- [ ] Uses constants from config/, not hardcoded values
- [ ] Uses this.prng, not Math.random()
- [ ] Follows existing naming conventions
- [ ] Has inline comments explaining non-obvious logic
- [ ] Preserves deterministic behavior
- [ ] Doesn't break existing functionality
- [ ] Maintains Greek mythology theming
- [ ] No new frameworks or dependencies
- [ ] Performance is acceptable (profile if hot path)

---

## 🚀 Performance Workflow

### Before Optimizing
```
1. Profile with Chrome DevTools Performance tab
2. Identify actual bottlenecks (don't guess)
3. Measure current performance
4. Set target improvement (e.g., 20% faster)
```

### During Optimization
```
1. Make one change at a time
2. Benchmark after each change
3. Document reasoning and tradeoffs
4. Preserve deterministic behavior
```

### After Optimization
```
1. Verify performance improvement
2. Test with multiple seeds
3. Check memory usage
4. Update .cursor/context/performance_notes.md
5. Document in commit message
```

---

## 🎨 Adding New Features

### Full Workflow Example: Adding a New Boon

#### Step 1: Define the Boon
```javascript
// Ask AI: "I want to add a boon that [description]. 
// What Greek mythology themed name would fit?"

// Then ask AI to add to gameData.js:
{
    id: "suggested_id",
    name: "Suggested Name",
    rarity: "vibrant",
    cost: 4,
    effect: "Description of effect",
    god: "Appropriate God",
    timing: { before_score: true }
}
```

#### Step 2: Implement Logic
```javascript
// Ask AI: "Implement the logic for [boon name] in Joker.js"
// AI will add to applyTimingEffect() switch statement

case 'suggested_id':
    // Implementation following existing patterns
    break;
```

#### Step 3: Add Asset (if needed)
```javascript
// Ask AI: "Add asset mapping for [boon name]"
// AI adds to assetMapping.js
```

#### Step 4: Test
```javascript
// In browser console:
window.app.startGame('TESTBOON')
// Navigate to shop, buy the boon, test its effect
```

#### Step 5: Document
```
- Update card_database.csv
- Update CHANGELOG.md
- Commit with message: "feat: add [Boon Name] boon"
```

---

## 🤝 Working with GitHub

### Commit Message Format

```
feat: add new feature
fix: fix bug description
perf: improve performance of X
docs: update documentation
style: formatting changes
refactor: code restructuring
test: add tests
```

### Before Committing

- [ ] Test manually in browser
- [ ] Check console for errors
- [ ] Verify determinism with seeds
- [ ] Run `npm run lint:fix`
- [ ] Update relevant documentation
- [ ] Review changes in diff

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Performance improvement
- [ ] Documentation update

## Testing
- Tested with seed: [seed]
- Verified: [what was verified]
- Performance: [before/after if applicable]

## Checklist
- [ ] Code follows project style
- [ ] Tested in browser
- [ ] Documentation updated
- [ ] No console errors
- [ ] Determinism preserved
```

---

## 🎯 AI Context Maintenance

### When to Update AI Context

Update `.cursor/context/ai_context.yaml` when:
- New architectural patterns are established
- New coding conventions are adopted
- Performance targets change
- New critical paths are identified
- Technical debt is paid down

Update `.cursorrules` when:
- Core philosophy changes
- New absolute rules are established
- Project structure changes significantly

### Keep Context Fresh

```
# Monthly review
1. Check if AI suggestions align with project goals
2. Update performance targets if achieved
3. Document new patterns in ai_context.yaml
4. Remove outdated guidance
5. Add learnings from bug fixes
```

---

## 📚 Resources

- **ARCHITECTURE.md** (same folder) - Deep dive into system design
- **BUGS_FIXED_LOG.md** - Historical bug fixes and solutions
- **CHANGELOG.md** - Version history and changes
- **.cursor/context/performance_notes.md** - Performance optimization guide
- **.cursor/context/ai_context.yaml** - AI configuration and guidance

---

## 🎮 **GAME MECHANICS REFERENCE**

### **Timing System (Balatro-Inspired)**
Boons trigger at specific phases:
1. **turn_start** - Called ONCE in nextTurn() AFTER setting default rolls (so boons can modify)
2. **before_roll** - Before dice roll animation
3. **after_roll** - After dice are rolled
4. **before_score** - Before calculating final score (main phase for bonuses)
5. **after_score** - After score is added
6. **turn_end** - End of turn
7. **ante_end** - End of ante (before shop)
8. **sell** - When selling cards

**CRITICAL:** turn_start must ONLY be in nextTurn(), never in executeRoll() or rollDice() (causes infinite triggers)

### **Scoring Formula (Balatro-Style)**
```javascript
// Sequential calculation:
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

### **Edge Case Protections (ALWAYS REQUIRED)**
```javascript
// Prevent negative pips
pips = Math.max(0, pips);

// Prevent zero favour (division by zero)
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

### **Enhancement System**
Each die has 6 faces, each face can have multiple enhancements:
- **Parchment:** 15% chance +5 gold OR 25% chance +1 favour (mutually exclusive)
- **Iron:** +5 pips when scored
- **Gold:** +1 gold when scored
- **Mother of Pearl:** Randomly selects adjacent die, adds its value
- **Wild:** Player chooses +1 or -1 from rolled value

Enhancements are face-specific and persist across turns.

### **Legendary Boons (Shop Excluded)**
Mark with `shopExclude: true` and `rarity: "legendary"`:
- Trojan Horse (×2 all boons after turn 10)
- Chaos Primordial (double favour, -1 roll)

Shop filters these out in `selectCardByRarity()`.

### **Boon Mechanic Categories**
33 types: Conditional Favour, Gold Generation, Pips Bonus, Gold-Scaling, Unused Roll Bonus, Favour Multiplier, Multiplicative Favour, Roll Penalty, Roll Randomizer, Roll Counter, Permanent Modification, Auto-Hold, Auto-Reroll, Dice Transformation, Dice Counter, Hold Tracker, Turn Accumulator, Turn-Based Effects, Matching Counter, Slot Checker, Destruction, Pattern Detector, Dual-Value Modifier, Global Multiplier, Boon Mimic, Trigger Counter, Effect Doubler, Enhancement Counter, Threshold Reduction, Worship Spreader, Shop Block, Completion Bonus, Solo Tracker.

See BOON_SPREADSHEET.csv and BOON_MECHANICS_GUIDE.md for details.

### **Sequential Scoring Animation (Balatro-Style)**
```
1. Dice add pips one by one (150ms each, purple)
2. Category bonus appears (Full House +25, etc.)
3. Enhancement bonuses (iron, pearl, etc.)
4. Boon bonuses (200ms each, purple/red)
5. Final multiplication display
6. Count-up to final score (1s)
7. Screen shake + particles (if high)
8. Place in scorecard with flash
```

Display shows math: "9 + 10 = 19" (purple for pips, red for favour)

### **Critical Bug Fixes (Oct 16, 2025)**
1. **Trojan Horse** - Fixed ID check (artifact vs boon)
2. **Kronos' Hourglass** - Fixed infinite rolls (turn_start moved to nextTurn)
3. **Tantalus' Curse** - Added gold blocking in all shop purchase methods
4. **Parmenides Die** - Renamed variable to avoid redeclaration
5. **Shop Cards** - Fixed instantiation (track cardType explicitly)
6. **Hover Disruption** - Added isScoring flag to block hover during animations

### **Balance Changes (Oct 16, 2025)**
- Midas Touch: 5 pips/10g → 1 pip/5g (60% nerf)
- Icarus' Wings: 15 pips/roll → 10 pips/roll (33% nerf)
- Tantalus' Curse: 0.5 favour/gold → 0.1 favour/gold (80% nerf)
- Mathematician's Compass: sum%2==0 → sum%10==0 (harder to trigger)
- The Symposium: +1 favour → +0.05 stacking favour
- Pandora's Jar: ×2 multiplicative → +2 additive stacking
- Dionysus' Revelry: NEW - 2 pairs count as Full House
- Apollo's Oracle: NEW - +1 roll/turn, -20% score
- Parmenides Die: NEW - Random face enhancement each turn

---

**Remember**: AI is your pair programmer, not your replacement. Review everything, understand the changes, and maintain ownership of your codebase.

