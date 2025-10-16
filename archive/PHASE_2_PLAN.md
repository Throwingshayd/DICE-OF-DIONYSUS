# Phase 2: High Priority Bugs - Detailed Action Plan
**Status:** IN PROGRESS  
**Started:** October 12, 2025  
**Estimated Time:** 9 hours  

---

## Overview
Phase 2 focuses on fixing high-priority bugs that affect game stability and maintainability. These issues won't cause crashes but can lead to undefined behavior or make the codebase harder to maintain.

---

## Task 2.1: Add Die Face Validation ⏱️ 1 hour

### Problem
`js/classes/LibationCard.js` directly manipulates `die.faces[targetFace]` without proper validation.

### Current Code Issues:
- Assumes `die.faces` structure exists
- No validation that `targetFace` is valid (1-6)
- No error handling if face doesn't exist
- Could cause silent failures

### Action Items:
- [ ] Add validation method to Die class
- [ ] Validate targetFace range (1-6) before use
- [ ] Add error handling for invalid faces
- [ ] Add console warnings for debugging
- [ ] Test with edge cases (invalid faces, undefined dice)

### Files to Modify:
- `js/classes/Die.js` - Add validation methods
- `js/classes/LibationCard.js` - Add validation checks before face manipulation

### Success Criteria:
✅ No crashes when invalid face is targeted  
✅ Clear error messages for debugging  
✅ All libation effects handle edge cases gracefully  

---

## Task 2.2: Refactor Shop Overlay Creation ⏱️ 2 hours

### Problem
`js/Main.js:195-242` has hardcoded HTML for shop overlay, duplicating structure from `index.html`.

### Current Issues:
- HTML structure duplicated in JS
- Maintenance nightmare (must update in 2 places)
- No single source of truth
- Prone to sync errors

### Action Items:
- [ ] Check if shop overlay template already exists in HTML
- [ ] If not, create `<template id="shopOverlayTemplate">` in index.html
- [ ] Refactor `restoreShopOverlay()` to clone template
- [ ] Remove hardcoded HTML from JS
- [ ] Add fallback if template not found
- [ ] Test shop opening/closing still works

### Files to Modify:
- `index.html` - Add/verify shop overlay template
- `js/Main.js` - Refactor `restoreShopOverlay()` method

### Success Criteria:
✅ Shop overlay uses template cloning  
✅ Single source of truth for shop structure  
✅ Easier to maintain and update  
✅ Shop functionality unchanged  

---

## Task 2.3: Improve Auto-Save Logic ⏱️ 1 hour

### Problem
Auto-save doesn't validate game state before saving.

### Current Issues:
- Saves during dialogs/animations
- No check if save operation is safe
- Could save corrupted state
- No feedback to user on save

### Action Items:
- [ ] Add `canSave()` method to GameEngine
- [ ] Check for: no active dialogs, no animations, valid state
- [ ] Add save status indicator to UI
- [ ] Add manual save confirmation message
- [ ] Add save failure handling
- [ ] Test save during various game states

### Files to Modify:
- `js/game/GameEngine.js` - Add `canSave()` method
- `js/Main.js` - Update auto-save logic with validation
- `js/utils/dataManager.js` - Add save error handling

### Success Criteria:
✅ Only saves when game is in stable state  
✅ User feedback on save success/failure  
✅ No corrupted saves  
✅ Manual save still works reliably  

---

## Task 2.4: Add Defensive Programming to Scoring ⏱️ 2 hours

### Problem
`calculateScore()` assumes dice array is valid and has 5 dice.

### Current Issues:
- No validation that `this.state.dice` exists
- Assumes exactly 5 dice
- No handling for undefined/null dice
- Could crash on corrupted state

### Action Items:
- [ ] Add dice array validation at start of `calculateScore()`
- [ ] Validate dice count (should be 5)
- [ ] Add null/undefined checks
- [ ] Return safe default values on error
- [ ] Add error logging for debugging
- [ ] Test with various invalid states

### Files to Modify:
- `js/game/GameEngine.js` - Update `calculateScore()` and related methods

### Success Criteria:
✅ No crashes on invalid dice state  
✅ Graceful degradation with error messages  
✅ Proper error logging for debugging  
✅ All edge cases handled  

---

## Task 2.5: Create Integration Test Suite ⏱️ 3 hours

### Problem
No automated testing - all testing is manual.

### Action Items:
- [ ] Create test runner (simple HTML page)
- [ ] Write tests for core game flow
- [ ] Write tests for scoring all categories
- [ ] Write tests for card effects
- [ ] Write tests for artifact effects
- [ ] Write tests for save/load
- [ ] Document how to run tests

### Files to Create:
- `tests/index.html` - Test runner
- `tests/test-framework.js` - Simple test framework
- `tests/game-logic-tests.js` - Core game tests
- `tests/card-tests.js` - Card system tests
- `tests/scoring-tests.js` - Scoring tests
- `tests/save-load-tests.js` - Persistence tests

### Test Categories:
1. **Game Initialization**
   - Game starts with correct state
   - PRNG produces consistent results with same seed
   - All UI elements bind correctly

2. **Dice Rolling**
   - Dice roll correctly
   - Hold mechanics work
   - Rolls decrement properly

3. **Scoring System**
   - All categories calculate correctly
   - Worship bonuses apply
   - Edge cases (all held, 0 rolls, etc.)

4. **Card System**
   - Boons apply at correct timing
   - Worship cards increase favour
   - Libations activate properly

5. **Save/Load**
   - Save persists correctly
   - Load restores state
   - Collection saves properly

### Success Criteria:
✅ 30+ automated tests covering critical paths  
✅ Tests pass consistently  
✅ Easy to run tests (single HTML page)  
✅ Tests document expected behavior  

---

## Task 2.6: Documentation ⏱️ 30 mins

### Action Items:
- [ ] Update DEVELOPMENT_PIPELINE.md with Phase 2 completion
- [ ] Create PHASE_2_CHANGES.md documenting all changes
- [ ] Update README.md if needed
- [ ] Add inline comments for complex logic
- [ ] Update any affected documentation

### Success Criteria:
✅ All changes documented  
✅ Future developers can understand changes  
✅ Documentation is accurate  

---

## Phase 2 Timeline

| Task | Duration | Status |
|------|----------|--------|
| 2.1 Die Face Validation | 1 hour | 🔄 In Progress |
| 2.2 Shop Overlay Refactor | 2 hours | ⏳ Pending |
| 2.3 Auto-Save Improvements | 1 hour | ⏳ Pending |
| 2.4 Defensive Programming | 2 hours | ⏳ Pending |
| 2.5 Integration Tests | 3 hours | ⏳ Pending |
| 2.6 Documentation | 0.5 hours | ⏳ Pending |
| **TOTAL** | **9.5 hours** | **0% Complete** |

---

## Success Criteria for Phase 2 Complete

✅ All high-priority bugs fixed  
✅ Game handles edge cases gracefully  
✅ No crashes or undefined behavior  
✅ Basic test coverage in place  
✅ Code is more maintainable  
✅ Documentation updated  

---

## After Phase 2

Once Phase 2 is complete, we move to:
- **Phase 3:** Code Quality (error handling, constants, JSDoc)
- **Phase 4:** Comprehensive Testing & QA
- **Phase 5:** New Features & Enhancements

---

*Let's build this right! 🎲*

