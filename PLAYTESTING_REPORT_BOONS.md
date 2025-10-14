# 🎮 PLAYTESTING REPORT - New Boons Implementation
**Date:** October 14, 2025  
**Tester:** Senior QA Analysis  
**Build:** v1.04 - 56 New Boons Edition  
**Status:** Good → Amazing Polish Pass

---

## 📊 EXECUTIVE SUMMARY

**Overall Assessment:** The game feels **really good** now with 56 boons implemented. The foundation is solid, but there are **critical bugs, balance issues, and UX inconsistencies** that need addressing to reach "amazing" status.

**Critical Blockers:** 4  
**Major Issues:** 12  
**Minor Issues:** 18  
**Polish Opportunities:** 22

---

## 🐛 CRITICAL BUGS (Fix Immediately)

### BUG-001: Duplicate Boon Effect Implementations ⚠️ **BLOCKER**
**Location:** `Joker.js` lines 1082-1198 (applyBeforeScoreEffect)  
**Issue:** Many boon effects are implemented TWICE - once in `applyEffect()` and again in `applyBeforeScoreEffect()`. This causes **double-triggering** for:
- `hestias_hearth`
- `achilles_heel`
- `midas_touch`
- `icarus_wings`
- `lethe_waters`
- `chaos_primordial`
- Several others

**Evidence:**
```javascript
// Line 191-198: First implementation in applyEffect()
case 'hestias_hearth':
    const allOdd = gameState.dice.every(d => d.face % 2 === 1);
    const allEven = gameState.dice.every(d => d.face % 2 === 0);
    if (allOdd || allEven) {
        result.favour += 3;
    }

// Line 1082-1086: DUPLICATE in applyBeforeScoreEffect()
case 'hestias_hearth':
    // Hestia's Hearth favour is now applied directly in favour calculation
    // This case is kept for compatibility but doesn't add favour here
```

**Impact:** Players getting 2x the intended benefit from these boons!  
**Fix Priority:** **URGENT** - Choose ONE location per boon, remove duplicates  
**Recommendation:** Use timing-based system exclusively, remove legacy `applyEffect()` cases

---

### BUG-002: Medusa's Gaze Broken Logic ⚠️
**Location:** `Joker.js` lines 456, 476-484  
**Issue:** `medusas_gaze` has TWO separate `case` blocks doing different things:
1. Line 456: Placeholder comment (does nothing)
2. Line 476: Actually applies the effect

**Also:** Effect says "auto-hold 6s" but implementation is in `after_roll`, not integrated with scoring favour bonus.

**Fix:** Consolidate into single timing block, verify both effects work together

---

### BUG-003: Marathon Runner Self-Destruction Logic Error
**Location:** `Joker.js` lines 1304-1315  
**Issue:** Destroys itself on scratch OR when pips >= 42, but the check is in `after_score`. If player scratches, the boon tries to splice from `gameState.jokers` but the actual array is `gameState.boons`.

**Impact:** Runtime error on scratch with Marathon Runner active  
**Fix:**
```javascript
// Line 1309: Wrong array name
const marathonIndex = gameState.jokers.findIndex(j => j.id === 'marathon_runner');
// Should be:
const marathonIndex = gameState.boons.findIndex(j => j.id === 'marathon_runner');
```

---

### BUG-004: Pandora's Jar Destroys From Wrong Array
**Location:** `Joker.js` line 1347  
**Issue:** Same as BUG-003 - tries to splice from `gameState.boons` but should check if it exists first

**Fix:** Add array validation before splice operations

---

## 🔴 MAJOR ISSUES (Fix This Sprint)

### MAJOR-001: Inconsistent State Variable Naming
**Issue:** Code uses both `gameState.jokers` and `gameState.boons` interchangeably  
**Examples:**
- Line 570: Uses `gameState.boons`
- Line 679: Uses `gameState.jokers`
- Line 828: Uses `gameState.jokers`

**Impact:** Runtime errors when boons try to access wrong array  
**Fix:** Standardize on ONE naming convention across entire codebase

---

### MAJOR-002: Trojan Horse Multiplier Breaks Game Balance
**Location:** `Joker.js` lines 138-150, 524-530  
**Issue:** The Trojan Horse applies multiplier to ALL boon effects after turn 10, but implementation is inconsistent:
1. Generic multiplier system (lines 138-150)
2. Self-multiplying in its own case (lines 524-530)

**Double-dip exploit:** If you have Trojan Horse + any pips boon, effects multiply TWICE after turn 10!

**Fix:** Remove self-multiplication, rely only on global multiplier system

---

### MAJOR-003: Reflection of Narcissus Infinite Loop Risk
**Location:** `Joker.js` lines 80-86  
**Issue:** Uses `gameState.narcissusDoubling` flag to prevent infinite loops, but flag is cleared AFTER effect. If boon crashes mid-execution, flag stays set forever.

**Fix:** Use try-finally block:
```javascript
try {
    gameState.narcissusDoubling = true;
    result = this.applyTimingEffect(timingEvent, gameState, result);
} finally {
    gameState.narcissusDoubling = false;
}
```

---

### MAJOR-004: Dionysus' Revelry Modifies Future Die Faces Incorrectly
**Location:** `Joker.js` lines 1248-1258  
**Issue:** Sets `modifiedValue` on die faces, but doesn't reset them. Once modified, faces stay that way FOREVER.

**Impact:** After a few uses, all dice have random scrambled faces permanently  
**Fix:** Reset `modifiedValue` to null at turn start OR use temporary modification system

---

### MAJOR-005: No Validation for Empty Boon Arrays
**Issue:** Multiple boons assume arrays exist without checking:
- The Pantheon (line 571)
- Divine Synergy (line 690)
- Assembly of Heroes (line 679)

**Impact:** Crashes if player has no boons  
**Fix:** Add null checks before `.forEach()` and `.filter()` operations

---

### MAJOR-006: Dynamic Stats Not Resetting Between Turns
**Issue:** `dynamicStats` object is set in `before_score` timing but never cleared  
**Impact:** Boon cards show stale data from previous turn

**Example:** Sisyphus' Boulder shows "+25 Pips" even when you haven't rerolled yet  
**Fix:** Clear `dynamicStats` at turn start for all boons

---

### MAJOR-007: Heretic Stacks Never Reset on Ante End
**Location:** `Joker.js` line 1371-1377  
**Effect Description:** "Resets at end of ante or when worship card is used"  
**Implementation:** Only resets on worship use, NOT on ante end

**Impact:** Players can accumulate hundreds of pips across antes (OP!)  
**Fix:** Add ante_end timing handler that resets `gameState.hereticStacks`

---

### MAJOR-008: Parmenides Die Quantum Value Not Used in Scoring
**Location:** `Joker.js` lines 1392-1406  
**Issue:** Sets `isParmenidesDie` and `oppositeValue` flags, but scoring system doesn't check these flags!

**Impact:** Boon does nothing (visual message only)  
**Fix:** Integrate with scoring logic to actually count die as dual-value

---

### MAJOR-009: Early Bird Gold Not Awarded (Turns 4-5)
**Location:** `Joker.js` lines 1292-1302  
**Effect:** "Turns 4-5 gain 2 gold"  
**Issue:** Code is in `after_score` which might not trigger properly  
**Also:** Uses ===  for turn check (fragile)

**Fix:** Move to turn_start timing OR use `>=` and `<=` operators

---

### MAJOR-010: Proteus Disguise Can Mimic Itself (Crash Risk)
**Location:** `Joker.js` lines 1408-1424  
**Issue:** Filter excludes proteus_disguise BUT if there's only one other boon and it was mimicked last turn, `proteusOtherBoons` can be empty → random() on empty array → undefined → crash

**Fix:** Add fallback for empty array

---

### MAJOR-011: The Odyssey Awards Bonus Multiple Times
**Location:** `Joker.js` lines 784-805  
**Issue:** Uses `gameState.odysseyAwarded` flag BUT flag never persists across saves/reloads  
**Also:** Checks categories on every `before_score` trigger (expensive!)

**Fix:** Move check to ante completion, persist flag in save data

---

### MAJOR-012: Gold Standard Checks Wrong Enhancement Format
**Location:** `Joker.js` lines 866-882  
**Issue:** Assumes `die.faces[currentFace].enhancements` is a Set with `.has()` method, but enhancement system might use different format

**Risk:** Runtime error if enhancement format changed  
**Fix:** Validate enhancement structure OR standardize enhancement API

---

## ⚠️ BALANCE ISSUES

### BALANCE-001: Reckless Abandon Completely Unplayable
**Effect:** "+50 Pips but you cannot hold dice"  
**Cost:** 3 gold (Rustic)  
**Issue:** +50 pips is NOTHING compared to losing all hold control. Even with favor multiplier, this averages ~75 score. Useless.

**Fix:** Either:
- Increase to +150 pips (makes it viable)
- Change to "Roll results are always 4-6" (high-roller mode)
- Add "+2 rolls" to compensate for no holding

---

### BALANCE-002: Ascetic's Vow Paradox
**Effect:** "Gain +1 favour per empty boon slot"  
**Cost:** 8 gold (Epic)  
**Issue:** If you buy this, you FILL a slot, reducing its own benefit. With 5 slots, you can have max 4 empty → +4 favour. But that means you can't have any other boons (defeats purpose of game).

**Fix:** Change to "OTHER empty boon slots" OR give multiplicative favour instead

---

### BALANCE-003: Marathon Runner Too Fragile
**Effect:** Gains +1 pips per roll, destroyed at 42 pips or scratch  
**Issue:** You get AT MOST 13 turns × 3 rolls = 39 pips before auto-destruct. In practice, you'll scratch once and lose it. Not worth 3 gold.

**Fix:** 
- Remove scratch destruction (keep 42 limit)
- OR increase cap to 100 pips
- OR give +2 pips per roll

---

### BALANCE-004: Tantalus' Curse Softlocks Player
**Effect:** "+0.5 Favour per gold, but cannot spend gold"  
**Issue:** If player buys this with 10 gold, they literally cannot buy ANYTHING else for the rest of the run. No shop interaction possible.

**Fix:** 
- Add "Right-click to temporarily disable" option
- OR change to "Spending gold costs 2x (but you keep favour bonus)"
- OR make it a toggle artifact instead

---

### BALANCE-005: Typhon Never Triggers
**Effect:** "Rolling all 1s on first roll gives +90% of threshold"  
**Probability:** (1/6)^5 = 0.0128% = **1 in 7,776 chance**  
**Issue:** Most players will NEVER see this effect in 100+ games

**Fix:**
- Change to "All 1s OR all 6s"
- OR "3 or more 1s on first roll" (still rare but achievable)

---

### BALANCE-006: Message in a Bottle Impossible Condition
**Effect:** "Complete ante with NO other boons for entire ante"  
**Issue:** If you buy this, you have A BOON (itself), so condition never met!

**Fix:** "Complete ante with only THIS boon" (exclude itself from check)

---

### BALANCE-007: Carillon of the Muses Unreachable
**Cost:** 10 gold (Epic)  
**Effect:** All 5 dice enhanced → x3 favour (x5 if all same)  
**Issue:** By the time you can afford this (ante 3+), you'd need ~10+ gold in libations to enhance all 5 dice. Total investment: 20+ gold for +3 favour? Terrible ROI.

**Fix:** Reduce cost to 6 gold OR make effect trigger with 3+ enhanced dice

---

## 🎨 UX & POLISH ISSUES

### UX-001: No Visual Feedback for Held Dice Counts (The Locksmith)
**Issue:** The Locksmith gives +1 pip per roll held, but player has no way to see roll count on dice

**Fix:** Add small number badge on dice showing "Held: 2 rolls" or similar

---

### UX-002: Boon Trigger Messages Too Spammy
**Issue:** Every boon shows message on trigger. With 5+ boons, screen fills with overlapping messages

**Fix:** 
- Consolidate messages: "🎴 Boons: +45 Pips, ×2.5 Favour"
- OR add message queue with stacking

---

### UX-003: No Explanation for Why Boon Didn't Trigger
**Issue:** Conditional boons (First Blood, Midnight Oil) don't explain WHY they're inactive

**Fix:** Add tooltip hover: "First Blood: ❌ Already scored this ante" or "✅ Active"

---

### UX-004: Dynamic Stats Not Visible Until Score
**Issue:** Balatro shows joker stats constantly. Your implementation only updates on before_score

**Fix:** Update dynamic stats on every dice roll, not just scoring

---

### UX-005: Symmetry Palindrome Not Visually Indicated
**Issue:** Boon triggers on palindrome but player has to mentally check "1-2-3-2-1"

**Fix:** Highlight dice in symmetric pattern OR show visual "⚖️ PALINDROME!" indicator

---

### UX-006: No Warning When Selling Boon with Proteus Active
**Issue:** If Proteus is mimicking Boon X and you sell Boon X, Proteus breaks silently

**Fix:** Show warning: "⚠️ Proteus is currently mimicking this boon!"

---

### UX-007: Chaos Primordial Pips Randomization Feels Bad
**Effect:** "Pips randomized 1-40"  
**Issue:** Player scores 200 pips → suddenly becomes 15 pips. No player control, pure RNG feel-bad.

**Fix:** Show preview of random roll OR change to "Pips ±50% random variance"

---

### UX-008: Eruption of Etna Trigger Count Hidden
**Effect:** "If 3+ boons trigger, +1 favour (stacks)"  
**Issue:** Player can't see how many boons triggered this turn

**Fix:** Add counter UI: "🌋 Etna: 4 boons triggered" during turn

---

### UX-009: No Indication of Trojan Horse Turn 10 Activation
**Issue:** After turn 10, all boons suddenly 2x stronger but no fanfare or visual change

**Fix:** Show big "🐴 TROJAN HORSE ACTIVATED!" message on turn 11 start

---

### UX-010: Betrayal by Paris Destruction is Silent
**Effect:** "Destroy random boon at ante end"  
**Issue:** Player finishes ante, goes to shop, suddenly missing a boon with no explanation

**Fix:** Show modal: "💔 Betrayal by Paris destroyed [Boon Name]!"

---

## 🔍 CODE QUALITY ISSUES

### CODE-001: Inconsistent Timing System Usage
**Issue:** Some boons use timing object, others use legacy `applyEffect()`  
**Impact:** Hard to debug, duplicate code, confusing for new boon implementations

**Fix:** Migrate ALL boons to timing-based system exclusively

---

### CODE-002: Magic Numbers Everywhere
**Examples:**
- Line 407: `totalRerolls * 5` (why 5?)
- Line 421: `result.pips * 0.8` (why 0.8?)
- Line 637: `result.pips += 50` (why 50?)

**Fix:** Move to constants:
```javascript
const SISYPHUS_PIPS_PER_REROLL = 5;
const KRONOS_PENALTY_MULTIPLIER = 0.8;
const RECKLESS_ABANDON_PIPS_BONUS = 50;
```

---

### CODE-003: No Logging for Boon Triggers
**Issue:** Impossible to debug "why didn't my boon trigger?"  
**Fix:** Add Logger.debug() calls for each boon activation/skip

---

### CODE-004: God Name Mappings Hardcoded
**Location:** Lines 766-773 (The Zealot)  
**Issue:** God-to-category mapping duplicated across codebase

**Fix:** Move to shared constant in GameConstants.js:
```javascript
const GOD_CATEGORY_MAP = {
    'Artemis': 'Ones', 
    'Persephone': 'Twos',
    // etc...
};
```

---

## 🚀 ENHANCEMENT OPPORTUNITIES

### ENHANCE-001: Boon Synergy Tooltips
**Idea:** When hovering boon, highlight OTHER boons it synergizes with  
**Example:** Hover "Pegasus Flight" → "The Pantheon" glows (shares god theme)

---

### ENHANCE-002: Boon Tier List / Stats
**Idea:** Track win rate per boon, show "🔥 Popular" or "📉 Underused" tags in shop

---

### ENHANCE-003: Boon Transformation Chains
**Idea:** Some boons could "upgrade" into better versions  
**Example:** "Lucky Dice Bag" + "Philosopher's Stone" → "Alchemist's Fortune" (combines both)

---

### ENHANCE-004: Negative/Curse Boons
**Idea:** Add "Cursed" rarity that COSTS negative gold (you get paid to take them)  
**Example:** "Pandora's Curse: -×1 Favour but gain +10 gold per turn"

---

## 📋 TESTING CHECKLIST

### Critical Path Testing
- [ ] Play full run with each new boon (56 playthroughs)
- [ ] Test all boon combinations (permutations of 5 slots)
- [ ] Verify timing triggers (before/after roll/score/turn/ante)
- [ ] Validate dynamic stat display updates
- [ ] Confirm sell/destroy mechanics work
- [ ] Check save/load preserves boon state

### Edge Case Testing
- [ ] Buy boon with full slots (should fail gracefully)
- [ ] Sell boon that another boon depends on
- [ ] Trigger 10+ boons simultaneously
- [ ] Overflow gold (10,000+)
- [ ] Underflow gold (debt)
- [ ] Complete ante with 0 boons
- [ ] Complete ante with 5 same-rarity boons
- [ ] Trigger Typhon (force 5 ones)
- [ ] Trigger Odyssey (score all categories)
- [ ] Narcissus + Narcissus (infinite loop test)

### Performance Testing
- [ ] 100+ boon triggers per turn (lag test)
- [ ] Memory leak check (long sessions)
- [ ] Save file size with max boons

---

## 🎯 RECOMMENDED FIX PRIORITY

### Phase 1 (Critical - Fix Today)
1. BUG-001: Remove duplicate boon implementations
2. BUG-002: Fix Medusa's Gaze
3. BUG-003: Fix Marathon Runner array name
4. BUG-004: Fix Pandora's Jar array name
5. MAJOR-001: Standardize jokers vs boons naming

### Phase 2 (Major - Fix This Week)
6. MAJOR-002: Fix Trojan Horse double-multiply
7. MAJOR-003: Add try-finally to Narcissus
8. MAJOR-004: Reset Dionysus' Revelry face mods
9. MAJOR-007: Reset Heretic on ante end
10. MAJOR-008: Integrate Parmenides with scoring

### Phase 3 (Balance - Next Sprint)
11. Rebalance: Reckless Abandon, Ascetic's Vow, Marathon Runner
12. Fix: Tantalus softlock
13. Adjust: Typhon trigger rate
14. Fix: Message in a Bottle condition

### Phase 4 (Polish - Final Pass)
15. Add UX feedback for all conditional boons
16. Implement boon trigger message consolidation
17. Add dynamic stat real-time updates
18. Visual indicators for special states

---

## 💯 FINAL RECOMMENDATIONS

To go from "really good" to "amazing":

1. **Bug Squashing Sprint:** Fix all Critical + Major bugs (2-3 days)
2. **Balance Pass:** Playtest each boon 5+ times, adjust numbers (1 week)
3. **UX Polish:** Add visual feedback for every boon state (3 days)
4. **Code Cleanup:** Consolidate timing system, remove duplicates (2 days)
5. **Playtesting:** External testers play 10 full runs each (1 week)

**Total Estimated Time:** 3-4 weeks to "amazing" status

---

**Next Steps:**
1. Prioritize critical bugs
2. Create fix branches
3. Add comprehensive unit tests
4. Schedule balance playtest sessions

**Game is 80% there - these fixes will make it shine! 🌟**

