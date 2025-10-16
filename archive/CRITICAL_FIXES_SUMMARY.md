# 🔧 CRITICAL FIXES - Implementation Plan

## Overview
Based on comprehensive code analysis, here are the **must-fix-now** critical bugs preventing the game from reaching "amazing" status.

---

## 🚨 CRITICAL BUG FIXES (Implement Immediately)

### 1. **BUG-001: Duplicate Boon Implementations** ⚠️ **HIGHEST PRIORITY**

**Problem:** The `Joker.js` file has TWO implementation systems running simultaneously:
1. Legacy `applyEffect()` method (lines 186-933)
2. New timing-based `applyTimingEffect()` methods (lines 1080+)

Many boons are implemented in BOTH, causing **double-triggering**.

**Files Affected:** `js/classes/Joker.js`

**Solution:** Remove ALL legacy implementations from `applyEffect()`, keep ONLY timing-based implementations.

**Boons to Remove from applyEffect():**
- hestias_hearth
- achilles_heel  
- midas_touch
- icarus_wings
- lethe_waters
- forge_of_hephaestus
- prometheus_gift
- chaos_primordial
- persephone_common
- morpheus_common
- heracles_rare
- athena_common
- poseidon_eights_rare
- scaled_of_justice
- parmenides

**Implementation:**
```javascript
// Replace entire applyEffect() method with:
applyEffect(event, gameState, eventData) {
    // Legacy method - now deprecated
    // All effects should use timing-based system
    Logger.warn(`Legacy applyEffect() called for ${this.id} - should use timing system`);
    return eventData;
}
```

---

###

 2. **BUG-002 & BUG-003 & BUG-004: Wrong Array Names**

**Problem:** Code uses `gameState.jokers` but actual array is `gameState.boons`

**Locations:**
- Line 679: `gameState.jokers?.length` (Assembly of Heroes)
- Line 690: `gameState.jokers.forEach` (Divine Synergy)
- Line 829: `gameState.jokers?.length` (Ascetic's Vow)
- Line 1309: `gameState.jokers.findIndex` (Marathon Runner destruction)
- Line 1347: `gameState.boons.splice` (Pandora's Jar)

**Solution:** Standardize on `gameState.jokers` (since that's what GameEngine uses)

**Find & Replace:**
- Search: `gameState.boons` (in Joker.js only)
- Replace: `gameState.jokers`

---

### 3. **MAJOR-003: Narcissus Infinite Loop Protection**

**Problem:** Flag cleanup isn't guaranteed if boon crashes

**Fix:**
```javascript
// Line 80-86, replace with:
const hasNarcissus = gameState.jokers?.some(j => j.id === 'reflection_of_narcissus');
if (hasNarcissus && this.id !== 'reflection_of_narcissus' && !gameState.narcissusDoubling) {
    try {
        gameState.narcissusDoubling = true;
        result = this.applyTimingEffect(timingEvent, gameState, result);
    } finally {
        gameState.narcissusDoubling = false;
    }
}
```

---

### 4. **MAJOR-004: Dionysus' Revelry Face Corruption**

**Problem:** Sets `modifiedValue` permanently, never resets

**Fix:** Add to `applyTurnStartEffect()`:
```javascript
case 'dionysus_revelry':
    // Reset any previously modified faces
    gameState.dice.forEach(die => {
        Object.keys(die.faces).forEach(faceKey => {
            if (die.faces[faceKey].modifiedValue !== undefined) {
                delete die.faces[faceKey].modifiedValue;
            }
        });
    });
    break;
```

---

### 5. **MAJOR-006: Dynamic Stats Not Resetting**

**Problem:** Boon cards show stale stats from previous turn

**Fix:** Add to top of `applyTurnStartEffect()`:
```javascript
applyTurnStartEffect(gameState, result) {
    // Reset dynamic stats at turn start
    this.dynamicStats = {
        pips: 0,
        favour: 0,
        gold: 0,
        other: null
    };
    
    switch (this.id) {
        // ... rest of cases
    }
}
```

---

### 6. **MAJOR-007: Heretic Stacks Never Reset**

**Problem:** Description says "resets at end of ante" but only resets on worship use

**Fix:** Add ante-end handler in GameEngine.js:
```javascript
// When ante ends, reset heretic stacks
endAnte() {
    this.state.hereticStacks = 0;
    // ... rest of ante-end logic
}
```

---

### 7. **MAJOR-008: Parmenides Die Not Integrated**

**Problem:** Sets flags but scoring doesn't use them

**This is complex - requires changes to scoring logic in GameEngine.js**
**Recommendation:** Disable this boon for now, fix in next sprint

---

## 🎯 QUICK WIN BALANCE FIXES

### Fix 1: Reckless Abandon
**Change:** Increase from +50 to +120 pips
```javascript
case 'reckless_abandon':
    result.pips += 120; // Was 50
    window.game?.showMessage?.("Reckless Abandon: +120 Pips!");
    break;
```

### Fix 2: Tantalus' Curse Softlock
**Change:** Make it a toggle
```javascript
// Add to card data:
effect: "+0.5 Favour per gold. Right-click to toggle spending lock.",
```

### Fix 3: Marathon Runner
**Change:** Remove scratch destruction, increase cap
```javascript
// Line 1306, change condition:
if (this.marathonPips >= 100) { // Was 42
    // Destroy - no scratch check
}
```

### Fix 4: Typhon Trigger Rate
**Change:** All 1s OR all 6s
```javascript
// Line 1019:
const allOnes = gameState.dice.every(die => die.face === 1);
const allSixes = gameState.dice.every(die => die.face === 6);

if (isFirstRoll && (allOnes || allSixes)) {
    // Award bonus
}
```

### Fix 5: Message in a Bottle
**Change:** Exclude itself from count
```javascript
// Line 588:
if (currentBoons === 1) { // Only this boon
    result.pips += Math.floor(gameState.scoreThreshold * 0.5);
}
```

---

## 📝 IMPLEMENTATION ORDER

1. **Session 1 (30 minutes):** Fix duplicate implementations (BUG-001)
2. **Session 2 (15 minutes):** Fix array naming (BUG-002/003/004)
3. **Session 3 (15 minutes):** Add safety measures (Narcissus, dynamic stats reset)
4. **Session 4 (30 minutes):** Balance quick wins (5 boons)
5. **Session 5 (1 hour):** Playtest all fixes

**Total Time:** ~2.5 hours to fix critical blockers

---

## ✅ SUCCESS CRITERIA

After these fixes:
- [ ] No boons trigger twice
- [ ] No runtime errors from wrong array names
- [ ] No infinite loops possible
- [ ] Dynamic stats update correctly
- [ ] At least 5 previously useless boons are now viable
- [ ] Full playthrough with no crashes

---

## 🚀 READY TO IMPLEMENT?

Would you like me to:
1. **Start with BUG-001** (duplicate implementations) - **Recommended**
2. **Fix all array naming issues first** (quickest wins)
3. **Balance pass only** (skip bug fixes for now)
4. **Comprehensive fix** (all of the above in sequence)

Let me know and I'll begin immediately!

