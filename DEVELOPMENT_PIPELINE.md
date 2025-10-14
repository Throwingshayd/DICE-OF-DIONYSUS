# Dice of Dionysus - Development Pipeline & Bug Report
**Generated:** October 12, 2025  
**Post-Terminology Update Audit**

---

## 🚨 CRITICAL ISSUES (Fix Immediately)

### 1. **Parchment Enhancement Logic Bug**
**Location:** `js/game/GameEngine.js:828-836`  
**Severity:** CRITICAL  
**Issue:** Parchment enhancement has illogical probability checks:
```javascript
const parchmentRoll = Math.random();
if (parchmentRoll < 1/6) {  // 16.67% chance for +1 Favour
    favour += 1;
}
if (parchmentRoll < 1/15) {  // 6.67% chance for 15 gold
    this.state.gold += 15;
}
```
**Problem:** These are not mutually exclusive! If the roll is < 1/15 (6.67%), BOTH effects trigger. This means:
- 6.67% chance to get BOTH +1 favour AND +15 gold
- 10% chance to get ONLY +1 favour  
- 93.33% chance to get nothing

**Expected Behavior:** Should be:
- 6.67% for +1 Favour
- 6.67% for +15 Gold (different roll or mutually exclusive)

**Fix:**
```javascript
if (die.hasEnhancementForCurrentFace && die.hasEnhancementForCurrentFace('parchment')) {
    const parchmentRoll = Math.random();
    if (parchmentRoll < 1/6) {  // 16.67% for favour
        favour += 1;
        window.game?.showMessage?.("Parchment blessing: +1 Favour!");
    } else if (parchmentRoll < 1/6 + 1/15) {  // Additional 6.67% for gold
        this.state.gold += 15;
        window.game?.showMessage?.("Parchment fortune: +15 Gold!");
    }
}
```

---

## ⚠️ HIGH PRIORITY BUGS

### 2. **Number Parsing in calculateScore is Fragile**
**Location:** `js/game/GameEngine.js:675`  
**Severity:** HIGH  
**Issue:** Overly complex parsing logic:
```javascript
const num = parseInt(category.match(/\d/)?.[0] || category === "Ones" ? 1 : category === "Twos" ? 2 : ...
```
**Problem:** This is a maintenance nightmare and prone to errors.

**Fix:** Create a lookup map:
```javascript
const categoryToNumber = {
    'Ones': 1, 'Twos': 2, 'Threes': 3, 'Fours': 4, 
    'Fives': 5, 'Sixes': 6, 'Sevens': 7, 'Eights': 8, 'Nines': 9
};
const num = categoryToNumber[category];
```

---

### 3. **Duplicate Iron Enhancement Case**
**Location:** `js/classes/LibationCard.js:388-402`  
**Severity:** HIGH  
**Issue:** There are TWO `case 'iron':` blocks with different effects:
```javascript
case 'iron':  // Line 388
    message = `Die ${dieNumber} face ${targetFace} enhanced with Iron (+5 Pips when scored).`;
    break;
case 'iron':  // Line 396 - DUPLICATE!
    message = `Die ${dieNumber} face ${targetFace} enhanced with Iron (If not selected in scoring, add 1.5x favour).`;
    break;
```
**Problem:** The second case is unreachable dead code.

**Fix:** Remove the duplicate or rename to 'steel' if it's meant to be a different enhancement.

---

### 4. **Inconsistent Message String in UIManager**
**Location:** `js/ui/UIManager.js:1614`  
**Issue:** Message still says "House Rule" after renaming:
```javascript
message = success ? `House Rule activated: ${card.name}!` : "Failed to activate house rule.";
```
**Fix:**
```javascript
message = success ? `Libation activated: ${card.name}!` : "Failed to activate libation.";
```

---

## ⚠️ MEDIUM PRIORITY ISSUES

### 5. **Missing Validation for Die Face Selection**
**Location:** `js/classes/LibationCard.js:435-448`  
**Issue:** Direct manipulation of `die.faces[targetFace]` without checking if face exists first:
```javascript
if (die.faces[targetFace]) {
    const currentValue = die.faces[targetFace].modifiedValue || die.faces[targetFace].value;
    // ... modify value
}
```
**Problem:** Assumes `die.faces` uses 1-6 indexing but doesn't validate structure.

**Fix:** Add validation and error handling.

---

### 6. **Shop Overlay Recreation Logic**
**Location:** `js/Main.js:195-242`  
**Issue:** Hardcoded HTML for shop overlay in JavaScript.  
**Problem:** 
- Duplicates structure from `index.html`
- Maintenance nightmare if shop HTML changes
- Should use a template or data-driven approach

**Recommendation:** Use `<template>` tag in HTML and clone it.

---

### 7. **Auto-Save Doesn't Check for Valid Game State**
**Location:** `js/Main.js:270-274`  
**Issue:**
```javascript
this.autoSaveInterval = setInterval(() => {
    if (this.game && this.currentScreen === 'game') {
        this.game.saveGame();
    }
}, 30000);
```
**Problem:** Doesn't verify game is in a saveable state (not in middle of animation, dialog open, etc.)

**Fix:** Add state validation before saving.

---

### 8. **Scoring System Doesn't Account for Edge Cases**
**Location:** `js/game/GameEngine.js:646-866`  
**Issues:**
- No validation that dice array has exactly 5 dice
- Doesn't handle empty dice array gracefully
- Could crash if `this.state.dice` is undefined or corrupted

**Fix:** Add defensive programming checks.

---

## 📝 LOW PRIORITY / CODE QUALITY

### 9. **Inconsistent Error Handling**
- Some methods return false on error
- Some throw exceptions
- Some silently fail
- No consistent error logging strategy

**Recommendation:** Implement consistent error handling pattern across codebase.

---

### 10. **No Input Sanitization for Seed**
**Location:** `js/Main.js:132-139`  
**Issue:** User seed input isn't validated or sanitized.  
**Risk:** Low (just affects randomness) but could cause unexpected behavior.

**Fix:** Add validation for seed length/characters.

---

### 11. **Magic Numbers Throughout Codebase**
**Examples:**
- `30000` (auto-save interval)
- `50` (Yahtzee base score)
- `1/6`, `1/15` (parchment probabilities)
- Slot counts (5 boons, 2 libations)

**Recommendation:** Extract to configuration constants at top of files.

---

### 12. **No TypeScript/JSDoc Annotations**
**Issue:** No type safety or IDE autocomplete support.  
**Recommendation:** Add JSDoc comments for better DX.

---

## 🔄 DEVELOPMENT PIPELINE (Priority Order)

### Phase 1: Critical Bugs (DO NOW) ⏰
- [ ] **Fix Parchment Enhancement Logic** - 30 mins
- [ ] **Fix calculateScore Number Parsing** - 20 mins
- [ ] **Remove Duplicate Iron Case** - 10 mins
- [ ] **Update "House Rule" Message** - 5 mins
- [ ] **Test All Card Types** - 1 hour

**Estimated Time:** 2 hours 5 minutes  
**Deliverable:** Game without critical bugs

---

### Phase 2: High Priority Bugs (THIS WEEK) 📅
- [ ] **Add Die Face Validation** - 1 hour
- [ ] **Refactor Shop Overlay Creation** - 2 hours
- [ ] **Improve Auto-Save Logic** - 1 hour
- [ ] **Add Defensive Programming to Scoring** - 2 hours
- [ ] **Full Integration Testing** - 3 hours

**Estimated Time:** 9 hours  
**Deliverable:** Stable, production-ready game

---

### Phase 3: Code Quality (NEXT SPRINT) 🔧
- [ ] **Implement Consistent Error Handling** - 4 hours
- [ ] **Extract Magic Numbers to Constants** - 2 hours
- [ ] **Add JSDoc Annotations** - 6 hours
- [ ] **Add Input Validation** - 2 hours
- [ ] **Code Review & Refactoring** - 4 hours

**Estimated Time:** 18 hours  
**Deliverable:** Maintainable, well-documented codebase

---

### Phase 4: Testing & QA (ONGOING) ✅
- [ ] Create unit tests for core game logic
- [ ] Create integration tests for game flow
- [ ] Test all card interactions
- [ ] Test all artifact effects
- [ ] Test save/load system
- [ ] Test blind effects
- [ ] Test ante progression
- [ ] Browser compatibility testing
- [ ] Performance profiling

**Estimated Time:** 20+ hours  
**Deliverable:** Comprehensive test coverage

---

### Phase 5: Enhancement & Features (BACKLOG) 🚀
- [ ] Add achievement system
- [ ] Add statistics tracking
- [ ] Add more boons/artifacts/worship cards
- [ ] Add animation polish
- [ ] Add sound effects (beyond music)
- [ ] Add tutorial/help system
- [ ] Mobile responsiveness improvements
- [ ] Accessibility improvements (screen readers, keyboard nav)

**Estimated Time:** TBD  
**Deliverable:** Feature-rich game experience

---

## 🧪 TESTING CHECKLIST

### Core Systems
- [ ] Game initializes without errors
- [ ] All screens (start, collection, game) render correctly
- [ ] Dice roll correctly with PRNG seed consistency
- [ ] All scoring categories calculate correctly
- [ ] Worship cards apply effects properly
- [ ] Libations apply effects properly
- [ ] Boons apply effects at correct timing
- [ ] Artifacts apply passive effects

### Edge Cases
- [ ] Game handles all dice being held
- [ ] Game handles no rolls left
- [ ] Game handles 0 gold
- [ ] Game handles full card slots
- [ ] Game handles scratching (scoring 0)
- [ ] Game handles bonus Yahtzees (7s/8s/9s unlocks)
- [ ] Game handles blind effects
- [ ] Game handles ante progression
- [ ] Game handles win/loss conditions

### Save/Load
- [ ] Game saves correctly
- [ ] Game loads correctly
- [ ] Auto-save works
- [ ] Save persists after page refresh
- [ ] Collection persists correctly

### UI/UX
- [ ] All buttons are clickable
- [ ] All tooltips display correctly
- [ ] Animations don't cause performance issues
- [ ] Music plays/stops correctly
- [ ] Messages display at appropriate times
- [ ] Shop interface works correctly
- [ ] Pack opening works correctly

---

## 📊 ESTIMATED TOTAL DEVELOPMENT TIME

| Phase | Time Estimate |
|-------|---------------|
| Phase 1: Critical Bugs | 2 hours |
| Phase 2: High Priority | 9 hours |
| Phase 3: Code Quality | 18 hours |
| Phase 4: Testing & QA | 20+ hours |
| Phase 5: Enhancements | TBD |
| **TOTAL (Phases 1-4)** | **49 hours** |

---

## 🎯 SUCCESS CRITERIA

### Phase 1 Complete:
✅ No critical bugs  
✅ All card types function correctly  
✅ Game playable from start to finish  

### Phase 2 Complete:
✅ No high-priority bugs  
✅ Stable save/load system  
✅ All systems tested  

### Phase 3 Complete:
✅ Clean, maintainable code  
✅ Documentation complete  
✅ Ready for open-source contribution  

### Phase 4 Complete:
✅ Comprehensive test coverage  
✅ All edge cases handled  
✅ Production-ready  

---

## 📝 NOTES

- All terminology has been updated from "HouseRuleCard" to "LibationCard" ✅
- All "offering" terminology has been updated to "libation" ✅
- All "planet" rarity has been updated to "worship" ✅
- File `js/classes/HouseRuleCard.js` has been renamed to `js/classes/LibationCard.js` ✅
- All references across 11 files have been updated ✅

---

## 🔍 ADDITIONAL INVESTIGATION NEEDED

1. **Artifact System**: Verify all artifact IDs are consistent after renaming
2. **Enhancement System**: Full audit of all enhancement types and interactions
3. **Blind Effects**: Test all blind combinations with scoring
4. **Worship Mechanics**: Verify worship levels apply correctly to all scoring categories
5. **PRNG**: Verify seeded RNG produces consistent results across sessions

---

*This document should be updated as issues are fixed and new issues are discovered.*

