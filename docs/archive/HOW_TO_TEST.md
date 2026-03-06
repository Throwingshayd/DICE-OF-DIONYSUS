# 🎮 How to Play & Test Dice of Dionysus

## Quick Start (30 seconds)

### Method 1: Double-Click (Easiest)
1. Open File Explorer
2. Navigate to: `C:\Users\Lorcan\Desktop\DICE-OF-DIONYSUS-WORKING\`
3. **Double-click `index.html`**
4. Game opens in your default browser!

### Method 2: VS Code Live Server (Recommended for Development)
1. In VS Code, right-click `index.html`
2. Select "Open with Live Server"
3. Game opens at `http://localhost:5500`
4. Auto-reloads when you make changes!

### Method 3: Any Web Browser
1. Open Chrome/Firefox/Edge
2. Press `Ctrl+O` (Open File)
3. Navigate to `index.html`
4. Click Open

---

## 🎯 Testing Checklist

### Basic Functionality Test (~5 minutes)

**1. Game Launches**
- [ ] Start screen appears
- [ ] "Play" and "Collection" buttons visible
- [ ] No console errors (Press F12 to check)

**2. Start a Game**
- [ ] Enter seed: `TEST1234` (for reproducible testing)
- [ ] Click "Play"
- [ ] Game screen loads
- [ ] Dice show as "?"
- [ ] Scorecard visible
- [ ] Gold shows 15

**3. Roll Dice**
- [ ] Click "Roll" button (or press R)
- [ ] All 5 dice roll
- [ ] Rolls Left decrements (3 → 2)
- [ ] Dice show numbers 1-6

**4. Hold Dice**
- [ ] Click a die (or press 1-5)
- [ ] "HOLD" text appears on die
- [ ] Roll again
- [ ] Held dice don't change

**5. Score**
- [ ] Click a scoring category (e.g., "Chance")
- [ ] Confirmation dialog appears
- [ ] Shows pips and favour calculation
- [ ] Click "Confirm"
- [ ] Score recorded in scorecard
- [ ] Turn advances (Turn 1 → Turn 2)

**6. Shop**
- [ ] Complete turn 13
- [ ] Shop automatically opens
- [ ] Cards visible in shop
- [ ] Can buy cards (if you have gold)
- [ ] Click "Continue" to close shop

**7. Save/Load**
- [ ] Play a few turns
- [ ] Press Ctrl+S to save manually
- [ ] See green "✓ Saved" indicator (top-right)
- [ ] Refresh page (F5)
- [ ] Click "Play" without entering seed
- [ ] Game should resume from save

---

## 🔍 Phase 3 Features to Test

### New Constants System
**Test:** Check that game balance works
- Starting gold should be 15
- Starting rolls should be 3
- Reroll shop should cost 2 gold
- All scoring thresholds should work

**How to verify:**
```javascript
// Open console (F12)
GAME_BALANCE.STARTING_GOLD  // Should show 15
GAME_BALANCE.SHOP_REROLL_COST  // Should show 2
```

### New Logger System
**Test:** Check that logging works

```javascript
// In console (F12)
Logger.debug('Test message', {test: 'data'});
Logger.getRecentLogs(10);  // See last 10 logs
Logger.downloadLogs();  // Download full log file
```

**Expected:**
- In localhost: DEBUG messages appear
- Logger auto-detects development mode
- Can export logs

### Die Face Validation
**Test:** Try to use a libation that modifies die faces

**Steps:**
1. Buy "Elixir of Lethe" or "Chalice of Helios" from shop
2. Use it from your libations
3. Select a die face
4. Should work without errors
5. Check console - should see validation logs

### JSDoc Autocomplete
**Test:** Open a JS file in VS Code

```javascript
// Type this and watch autocomplete:
const die = new Die(1);
die.  // Should show all methods with descriptions!
```

---

## 🐛 What to Look For (Bug Testing)

### During Gameplay
- ❌ Any console errors (red text in F12 console)
- ❌ Dice not rolling
- ❌ Scores calculating incorrectly
- ❌ Cards not working
- ❌ Shop not opening
- ❌ Save/load failing

### Phase 3 Specific
- ✅ Constants being used (no hardcoded numbers in errors)
- ✅ Logger messages formatted correctly
- ✅ Auto-save indicator appears every 30 seconds
- ✅ No references to "HouseRuleCard" (should be LibationCard)
- ✅ No references to "offering" (should be libation)

---

## 🧪 Advanced Testing

### Test with Specific Seed
```
Seed: TEST1234
```
This gives reproducible:
- Same dice rolls
- Same shop inventory
- Consistent testing

### Console Debug Commands
```javascript
// Access game instance
game.state  // View full game state

// Manipulate for testing
game.state.gold = 100  // Give yourself gold
game.state.rollsLeft = 99  // Unlimited rolls
game.updateAllUI()  // Refresh display

// Test specific features
Logger.debug('Testing', {data: 'test'})
Logger.getRecentLogs(20)

// Check constants
console.log(GAME_BALANCE)
console.log(SCORING_CONSTANTS)
```

### Test Scoring Categories
Score at least one of each:
- [ ] Upper Sanctum (Ones through Sixes)
- [ ] Lower Sanctum (Three of Kind, Four of Kind, etc.)
- [ ] Special (Sevens, Eights, Nines - unlock via bonus Yahtzees)
- [ ] Yahtzee (shows as "Heureka")
- [ ] Chance

### Test Card Types
Buy and test:
- [ ] At least 1 Boon (joker)
- [ ] At least 1 Worship card
- [ ] At least 1 Libation
- [ ] At least 1 Artifact (if available)

---

## ⚡ Quick Smoke Test (2 minutes)

1. **Open** `index.html`
2. **Enter seed:** `TEST1234`
3. **Click** "Play"
4. **Roll** 3 times
5. **Score** in "Chance"
6. **Verify** turn advances
7. **Check console** - No errors
8. **Done!** ✅

If this works, Phase 3 changes are good!

---

## 🎯 Recommended Test Flow

### Full Test (~15 minutes)

**Ante 1:**
1. Play normally through 13 turns
2. Try to buy cards in shop
3. Test worship cards
4. Test libations
5. Complete ante 1

**Ante 2:**
6. Verify save worked (should have your cards)
7. Try different scoring strategies
8. Test more shop purchases
9. Complete ante 2

**Final Checks:**
10. Refresh page (F5)
11. Click Play (no seed)
12. Game should resume
13. Check all your cards are there

---

## 🆘 If Something Breaks

### Check Console
Press **F12** → **Console** tab

Look for:
- Red errors
- Yellow warnings
- What line the error is on

### Common Issues & Fixes

**"X is not defined"**
- Probably a constant file not loaded
- Check index.html - constants should load before GameEngine

**"Cannot read property of undefined"**
- Validation issue
- Check which file/line
- Report with seed & steps to reproduce

**Shop doesn't open**
- Check console for errors
- Verify shopOverlay exists in DOM

**Dice don't roll**
- Check if rollsLeft > 0
- Check console for errors

---

## 📊 Performance Testing

### Check Frame Rate
```javascript
// In console
window.performance.now()  // Note the time
// Play for 30 seconds
window.performance.now()  // Should be ~30,000ms later
```

Should maintain 60fps (smooth animations).

### Check Memory
1. Open DevTools (F12)
2. Performance tab
3. Click record
4. Play for 5 minutes
5. Stop recording
6. Check memory usage - should be stable (no leaks)

---

## ✅ Success Criteria

Your Phase 3 changes are successful if:
- ✅ Game launches without errors
- ✅ Can play through at least 1 full ante
- ✅ All card types work
- ✅ Save/load works
- ✅ Shop works
- ✅ No console errors
- ✅ Constants are being used (check in console)
- ✅ Logger is working (Logger.getRecentLogs())

---

## 🎮 Enjoy Testing!

The game should feel exactly the same to play - all improvements are under the hood. But the codebase is now professional-grade and ready for Phase 4!

**Pro Tip:** Keep the console open (F12) while testing to see Logger messages and catch any issues.

---

*Happy testing! May Dionysus favor your rolls!* 🎲✨

