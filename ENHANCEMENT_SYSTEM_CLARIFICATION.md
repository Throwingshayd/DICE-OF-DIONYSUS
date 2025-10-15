# 🎲 Dice Enhancement System - Complete Clarification

## 📋 **Current Enhancement Types & Mechanics**

### **1. Parchment Enhancement** 📜
**Current Implementation:**
- **Chance for +1 Favour:** 16.67% (1/6 chance)
- **Chance for +15 Gold:** 6.67% (1/15 chance) 
- **Trigger:** Only when the enhanced face is rolled and scored
- **Issue:** Very low gold chance, favour chance is decent but gold is rare

**Suggested Fix:** Make parchment more reliable
- **+1 Favour:** 25% chance (1/4)
- **+5 Gold:** 15% chance (3/20)

### **2. Iron Enhancement** ⚔️
**Current Implementation:**
- **+5 Pips:** Always when the enhanced face is scored
- **Trigger:** Only when the enhanced face is rolled and scored
- **Status:** ✅ Working correctly

### **3. Gold Enhancement** 💰
**Current Implementation:**
- **+1 Gold:** Always when the enhanced face is scored
- **Trigger:** Only when the enhanced face is rolled and scored
- **Status:** ✅ Working correctly

### **4. Mother of Pearl Enhancement** 🦪
**Current Implementation:**
- **Effect:** Adds pips from adjacent dice when scored
- **Trigger:** Only when the enhanced face is rolled and scored
- **Status:** ✅ Working correctly

### **5. Wild Enhancement** 🎲
**Current Implementation:**
- **Effect:** 50% chance for +1 pips OR -1 pips
- **Trigger:** Only when the enhanced face is rolled and scored
- **Issue:** Can reduce score, which feels bad

**Suggested Fix:** Make wild always positive
- **Effect:** Always +1 pips (100% chance)

### **6. Mirror Enhancement** 🪞
**Current Implementation:**
- **Status:** ❌ NOT IMPLEMENTED in scoring logic
- **Issue:** Missing from GameEngine.js scoring

## 🔧 **Implementation Issues Found**

### **Issue 1: Mirror Enhancement Missing**
Mirror enhancement is referenced in Die.js but not implemented in GameEngine.js scoring logic.

### **Issue 2: Parchment Probabilities Too Low**
Current parchment gold chance (6.67%) is too low to be meaningful, especially with 15 gold reward.

### **Issue 3: Wild Can Reduce Score**
Wild enhancement can give -1 pips, which feels bad for players.

### **Issue 4: Enhancement Descriptions Inconsistent**
Different files have different descriptions for the same enhancements.

## 🎯 **Proposed Enhancement Rebalance**

| Enhancement | Current Effect | Proposed Effect | Reason |
|-------------|----------------|-----------------|---------|
| **Parchment** | 1/6 +1 Favour, 1/15 +15 Gold | 1/4 +1 Favour, 3/20 +5 Gold | More reliable, less gold inflation |
| **Iron** | +5 Pips (always) | +5 Pips (always) | ✅ Keep as is |
| **Gold** | +1 Gold (always) | +1 Gold (always) | ✅ Keep as is |
| **Mother of Pearl** | Adjacent dice pips | Adjacent dice pips | ✅ Keep as is |
| **Wild** | 50% +1/-1 pips | +1 Pips (always) | Remove negative outcome |
| **Mirror** | ❌ Not implemented | +2 Pips (always) | Implement missing enhancement |

## 🔍 **Testing Requirements**

1. **Test each enhancement individually** - Apply to a die face and score
2. **Verify parchment probabilities** - Test multiple times to confirm rates
3. **Test mirror enhancement** - Ensure it works when implemented
4. **Verify face-specific triggering** - Enhancements only work on the rolled face
5. **Test multiple enhancements** - Same face with multiple enhancement types

## 📝 **Code Changes Needed**

1. **GameEngine.js:** Add mirror enhancement logic
2. **ScoringConstants.js:** Update enhancement bonuses and chances
3. **Die.js:** Ensure enhancement descriptions are consistent
4. **UIManager.js:** Verify enhancement overlays work correctly

## 🎮 **Player Experience Goals**

- **Reliable Effects:** Enhancements should feel impactful when triggered
- **Balanced Rewards:** Not too powerful, not too weak
- **Clear Feedback:** Players should understand what each enhancement does
- **Positive Outcomes:** Avoid negative effects that feel bad
