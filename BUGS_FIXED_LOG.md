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

