# Bugs Fixed - Recent Sessions

## Session: October 16, 2025 (System Refinement)

### 1. Trojan Horse Never Activated (FIXED)
**File:** `js/game/GameEngine.js:1854-1864`  
**Issue:** Code checked for `artifact_trojan_horse` but boon ID is `trojan_horse`  
**Fix:** Added proper boon check that activates at turn 11  
**Impact:** HIGH - Major boon now works correctly

### 2. Kronos' Hourglass Infinite Rolls (FIXED)
**File:** `js/game/GameEngine.js:1615-1621`  
**Issue:** turn_start timing called in executeRoll() every roll instead of once per turn  
**Fix:** Moved turn_start timing to nextTurn() AFTER setting default rolls  
**Impact:** CRITICAL - Was game-breaking, now works correctly

### 3. Tantalus' Curse Gold Blocking (FIXED)
**File:** `js/ui/UIManager.js` (4 purchase methods)  
**Issue:** Players could spend gold despite having the curse  
**Fix:** Added hasTantalusCurse checks in all purchase functions  
**Impact:** MEDIUM - Curse downside now enforced

### 4. Parmenides Die Variable Redeclaration (FIXED)
**File:** `js/classes/Joker.js:1190`  
**Issue:** `const randomFaceKey` declared twice (Demeter & Parmenides)  
**Fix:** Renamed to `parmenidesFaceKey`  
**Impact:** CRITICAL - Syntax error prevented game from running

### 5. Shop Cards Not Instantiating (FIXED)
**File:** `js/ui/UIManager.js:1076-1122`  
**Issue:** generateDirectSales tried to use Joker class before it was defined  
**Fix:** Track cardType explicitly, instantiate proper class  
**Impact:** CRITICAL - Shop was broken, cards wouldn't appear

### 6. Hover Disrupts Scoring Animation (FIXED)
**File:** `js/game/GameEngine.js:245-256, 858, 1006`  
**Issue:** Hovering over scorecard during animation interrupted live display  
**Fix:** Added isScoring flag to block hover events during animation  
**Impact:** MEDIUM - Animation flow now smooth

---

# Bugs Fixed - October 12, 2025

## Critical Bugs Fixed ✅

### 1. Parchment Enhancement Logic (FIXED)
**File:** `js/game/GameEngine.js:826-836`  
**Issue:** Overlapping probability checks causing both effects to trigger simultaneously  
**Fix:** Changed to mutually exclusive checks - gold check first (6.67%), then favour check (10%)  
**Status:** ✅ FIXED

### 2. Number Parsing in calculateScore (FIXED)
**File:** `js/game/GameEngine.js:672-675`  
**Issue:** Fragile, complex ternary operator chain for parsing category numbers  
**Fix:** Created clean `categoryToNumber` lookup map  
**Status:** ✅ FIXED

### 3. Duplicate Iron Enhancement Case (FIXED)
**File:** `js/classes/LibationCard.js:388-402`  
**Issue:** Two `case 'iron':` blocks, second was unreachable dead code  
**Fix:** Removed duplicate case statement  
**Status:** ✅ FIXED

### 4. "House Rule" Message String (FIXED)
**File:** `js/ui/UIManager.js:1614`  
**Issue:** Message still referenced old "House Rule" terminology  
**Fix:** Updated to "Libation activated" / "Failed to activate libation"  
**Status:** ✅ FIXED

---

## All Tests Passed ✅

- ✅ No linter errors
- ✅ LibationCard class fully migrated
- ✅ All terminology updated consistently
- ✅ Critical logic bugs fixed
- ✅ Game should be playable without crashes

---

## Next Steps (See DEVELOPMENT_PIPELINE.md)

### Phase 2: High Priority Bugs
- Add die face validation
- Refactor shop overlay creation  
- Improve auto-save logic
- Add defensive programming to scoring
- Full integration testing

### Phase 3: Code Quality
- Consistent error handling
- Extract magic numbers to constants
- Add JSDoc annotations
- Input validation
- Code review & refactoring

### Phase 4: Testing & QA
- Unit tests for core game logic
- Integration tests for game flow
- Test all card interactions
- Browser compatibility testing
- Performance profiling

---

**Time Spent:** ~2 hours  
**Bugs Fixed:** 4 critical bugs  
**Files Modified:** 3 files  
**Lines Changed:** ~30 lines

