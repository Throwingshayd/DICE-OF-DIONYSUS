# 💰 Gold & Interest System - Complete Guide

**Updated:** October 15, 2025  
**Version:** 1.5 - With Gnosis Interest Display

---

## 💵 **How Gold Works**

### Starting Gold
You begin each run with **6 gold**

---

## 📈 **Gold Income (How You Earn)**

### 1. Scoring → +1 Gold per Score
**When:** Every time you score a category  
**Amount:** +1 gold  
**Important:** ❌ **NO gold on scratches** (0 score)  

```
Example:
- Score Ones with 12 points → +1 gold ✅
- Score Twos with 0 points (scratch) → +0 gold ❌
```

**Why this matters:**
- Encourages strategic play (don't scratch if you can help it!)
- Makes gold more valuable
- Rewards good rolls

---

### 2. Interest → Passive Income (At Shop)
**When:** Before shop opens (turns 4 and 8)  
**How:** Based on saved gold  
**Display:** Animated in Gnosis display!

#### **Standard Interest (No Golden Touch)**

**Formula:** `Interest = floor(Gold ÷ 5)` capped at max 5

**Table:**
```
Saved Gold    Interest Earned
─────────────────────────────
0 - 4 gold  →  +0 gold
5 - 9 gold  →  +1 gold
10 - 14 gold  →  +2 gold
15 - 19 gold  →  +3 gold
20 - 24 gold  →  +4 gold
25+ gold  →  +5 gold (MAXIMUM!)
```

**Key Points:**
- Every **5 gold** gives you **+1 interest**
- Maximum interest is **+5 gold** per shop
- 2 shops per ante (turns 4 and 8) = up to **+10 gold per ante** from interest!

#### **With Golden Touch Boon (Better Rate!)**

**Formula:** `Interest = floor(Gold ÷ 3)` capped at max 5

**Table:**
```
Saved Gold    Interest Earned
─────────────────────────────
0 - 2 gold  →  +0 gold
3 - 5 gold  →  +1 gold
6 - 8 gold  →  +2 gold
9 - 11 gold  →  +3 gold
12 - 14 gold  →  +4 gold
15+ gold  →  +5 gold (MAXIMUM!)
```

**Advantage:**
- Reach max interest with **15 gold** (vs 25 without boon)
- Save **10 gold** that can be spent elsewhere!
- Much easier to maintain high interest

---

### 3. Boon Effects (Conditional Gold)

| Boon | Amount | Trigger | Scratches? |
|------|--------|---------|------------|
| **Charon's Ferry Fare** | +1g | After scoring | ❌ No gold on scratches |
| **Gambler's Charm** | +2g or -1g | After scoring | ✅ Always triggers (50/50) |
| **Early Bird** | +2g | Turns 4-5 only | ✅ Always triggers |
| **The Merchant** | +1g | Selling worship/libation | N/A |
| **Betrayal by Paris** | +10g | Ante end | N/A |
| **Artemis' Blessing** | +1g | Scoring Ones | ❌ No gold on scratches |
| **Spring's Return** | +1g per 2 | Scoring Twos | ❌ No gold on scratches |

---

### 4. Enhancement Effects

| Enhancement | Amount | Trigger | Chance |
|-------------|--------|---------|--------|
| **Gold Enhancement** | +1g | When die scored | 100% |
| **Parchment Enhancement** | +15g | When die scored | 6.67% |

---

## 💸 **Gold Expenses (What Costs Gold)**

### Shop Purchases
- **Rustic Boons:** 3 gold
- **Vibrant Boons:** 5 gold
- **Epic Boons:** 8-11 gold
- **Worship Cards:** 3 gold
- **Libations:** 2-3 gold
- **Packs:** 4-6 gold
- **Artifacts:** 10-12 gold

### Shop Actions
- **Shop Reroll:** 4 gold (first reroll each ante is FREE!)

### Boon Costs
- **Achilles' Heel:** -1 gold per turn (every turn!)

---

## ✨ **The Gnosis Interest Display (NEW!)**

### What Happens at Turns 4 and 8

**Before (Old Way):**
- Shop just opens
- You see "+X gold" message
- Interest already added

**Now (NEW Way):**
```
Turn ends → Gnosis Display Animates:

Frame 1 (600ms): "Saved Gold : 17g"
Frame 2 (600ms): "Interest (1 per 5g)"
Frame 3 (600ms): "Interest + 3g"
Frame 4 (600ms): "= 20g"

Then: Interest awarded (+3g)
Then: Shop opens!
```

**Total animation:** 2.4 seconds  
**Purpose:** Shows you HOW interest is calculated!

### Visual Breakdown

**Example with 17 gold saved:**
```
╔══════════════════════════════════════╗
║         GNOSIS DISPLAY               ║
╠══════════════════════════════════════╣
║                                      ║
║  Frame 1: Saved Gold : 17g          ║
║  Frame 2: Interest (1 per 5g)       ║
║  Frame 3: Interest + 3g             ║
║  Frame 4: = 20g                     ║
║                                      ║
║  (You receive +3g interest!)        ║
║                                      ║
╚══════════════════════════════════════╝
```

**With Golden Touch:**
```
╔══════════════════════════════════════╗
║  Frame 1: Saved Gold : 12g          ║
║  Frame 2: Interest (1 per 3g)       ║  ← Shows better rate!
║  Frame 3: Interest + 4g             ║
║  Frame 4: = 16g                     ║
╚══════════════════════════════════════╝
```

---

## 🎮 **Complete Turn Flow**

### Regular Turn (1, 2, 3, 5, 6, 7, 9, 10, 11, 12, 13)
```
1. Roll dice
2. Select category
3. Gnosis shows: {pips} × {favour} (preview)
4. Confirm score
5. Gnosis animates: {pips} × {favour} = [count to score]
6. Score placed in Pantheon scorecard
7. Gold awarded: +1g (if not a scratch)
8. Next turn
```

### Shop Turn (4 or 8)
```
1. Roll dice
2. Select category
3. Gnosis shows: {pips} × {favour} (preview)
4. Confirm score
5. Gnosis animates: {pips} × {favour} = [count to score]
6. Score placed in Pantheon scorecard
7. Gold awarded: +1g (if not a scratch)
8. Next turn starts...

9. Gnosis animates interest calculation:
   - "Saved Gold : 17g"
   - "Interest (1 per 5g)"
   - "Interest + 3g"
   - "= 20g"
   
10. Interest awarded: +3g
11. Shop opens!
```

---

## 📊 **Example Ante Walkthrough**

```
Starting Gold: 6g

Turn 1: Score 15 → +1g = 7g
Turn 2: Score 18 → +1g = 8g
Turn 3: Score 21 → +1g = 9g

Turn 4: Score 24 → +1g = 10g
  Then: Interest calculation in Gnosis
        "Saved: 10g" → "Interest (1/5g)" → "+ 2g" → "= 12g"
        Interest awarded: +2g
        Total: 12g
  Shop: Buy Rustic boon (3g) = 9g left

Turn 5: Score 30 → +1g = 10g
Turn 6: Score 20 → +1g = 11g
Turn 7: Scratch (0) → +0g = 11g (no gold!)

Turn 8: Score 25 → +1g = 12g
  Then: Interest calculation in Gnosis
        "Saved: 12g" → "Interest (1/5g)" → "+ 2g" → "= 14g"
        Interest awarded: +2g
        Total: 14g
  Shop: Buy Vibrant boon (5g), Reroll (4g) = 5g left

Turns 9-13: Score 5 times → +5g = 10g

Ante End: 10g carried forward
```

**Total earned:** 11g (scoring) + 4g (interest) = 15g  
**Total spent:** 12g (cards + reroll)  
**Net: +3g for the ante**

---

## 🎯 **Strategic Tips**

### Maximize Interest
1. **Save before turn 4** - Try to have 10g+ for interest
2. **Save before turn 8** - Your last chance for interest
3. **Target 25g** - Maximum interest (5g × 2 shops = 10g bonus)
4. **Get Golden Touch** - Easier to max (only need 15g)

### Avoid Scratches
- Scratches = 0 score = **NO GOLD** ❌
- Better to score something small than scratch!
- Example: 3 points in Ones + 1g > 0 points + 0g

### Timing Spending
- **Before Turn 4:** Save for first interest
- **After Turn 4:** Spend some, but save for turn 8
- **After Turn 8:** Spend freely (no more interest)
- **Consider Cornucopia:** ×1.5 gold at ante end!

---

## 🧮 **Interest Calculation Examples**

### Example 1: Low Gold
```
Turn 4 arrives, you have 7 gold:
  - Gnosis shows: "7g → (1/5g) → +1g → = 8g"
  - Interest awarded: +1g
  - You now have: 8g
```

### Example 2: Optimal Gold
```
Turn 4 arrives, you have 25 gold:
  - Gnosis shows: "25g → (1/5g) → +5g → = 30g"
  - Interest awarded: +5g (maximum!)
  - You now have: 30g
```

### Example 3: With Golden Touch
```
Turn 4 arrives, you have 15 gold (Golden Touch active):
  - Gnosis shows: "15g → (1/3g) → +5g → = 20g"
  - Interest awarded: +5g (maximum!)
  - You now have: 20g
  
  (Without Golden Touch, 15g would only give +3g interest)
```

### Example 4: Over the Cap
```
Turn 4 arrives, you have 40 gold:
  - Calculation: 40/5 = 8 → capped at 5
  - Gnosis shows: "40g → (1/5g) → +5g → = 45g"
  - Interest awarded: +5g (capped)
  - You now have: 45g
  
  (Even with tons of gold, max interest is 5g)
```

---

## 🎨 **Visual Experience**

### Scoring Animation
```
1. Hover category: Gnosis shows "30 × 3"
2. Confirm: Gnosis animates "30 × 3 = [0→90 count-up]"
3. Score placed in Pantheon: [90] flashes in
4. If score > 0: "+1 Gold!" message appears
```

### Interest Animation (Turns 4 & 8)
```
1. Score finishes, gold awarded
2. Turn increments
3. Gnosis takes over screen with:
   "Saved Gold : 17g"
   "Interest (1 per 5g)"
   "Interest + 3g"
   "= 20g"
4. "+3 Gold!" message appears
5. Shop opens!
```

---

## ✅ **Changes Made**

### 1. Gold Per Score: 2 → 1
**Old:** +2 gold every score  
**New:** +1 gold every score (if not scratch)  
**Impact:** Tighter economy, more strategic

### 2. No Gold on Scratches
**Old:** +2 gold even on 0 score  
**New:** +0 gold on scratches  
**Impact:** Scratches now hurt more (no consolation gold)

### 3. Gnosis Interest Display
**Old:** Shop opens, interest message appears  
**New:** Gnosis animates interest calculation BEFORE shop  
**Impact:** Educational + suspenseful + clear

### 4. Timing Verified
**Gold when scored:** ✅ Happens in finalizeScoring (immediate)  
**Interest before shop:** ✅ Happens in showInterestThenOpenShop (before shop opens)

---

## 🎯 **Economy Balance**

### Income Per Ante (No Boons)

**Assuming 11 successful scores, 2 scratches:**

| Source | Amount | Total |
|--------|--------|-------|
| Scoring (11 non-scratches) | +1g each | +11g |
| Scratches (2) | 0g each | +0g |
| Interest (turn 4, ~10g saved) | +2g | +2g |
| Interest (turn 8, ~12g saved) | +2g | +2g |
| **Total** | | **~15g** |

### Income With Good Boons

**With Charon's Ferry Fare + Golden Touch:**

| Source | Amount | Total |
|--------|--------|-------|
| Scoring (11 non-scratches) | +1g each | +11g |
| Charon's Ferry Fare | +1g × 11 | +11g |
| Interest (turn 4, ~15g saved) | +5g (max) | +5g |
| Interest (turn 8, ~20g saved) | +5g (max) | +5g |
| **Total** | | **~32g** |

**Golden Touch Impact:**
- Easier to max interest (need 15g vs 25g)
- Can earn max interest both shops more consistently

---

## 💡 **Pro Strategies**

### Strategy 1: Interest Maximizer
```
Goal: Get max interest (+10g per ante)

Turns 1-3: SAVE EVERYTHING
- Score, but don't buy anything
- Target: 25g before turn 4 (15g with Golden Touch)

Turn 4: Earn +5g interest
- Now have ~30g to spend

Turns 5-7: SAVE AGAIN
- Rebuild to 25g+ before turn 8

Turn 8: Earn +5g interest again
- Now flush with gold!

Result: +10g from interest, plus ~32g+ total income
```

### Strategy 2: Early Power
```
Goal: Get powerful boons early

Turns 1-3: Score for gold
- ~9g before turn 4

Turn 4: Earn +1g interest (only 9g saved)
- Buy cheap Rustic boons (3g each)

Turns 5-7: Build with boons
- Stronger scoring = more consistent income

Turn 8: Moderate interest (~+3g)
- Buy what you need

Result: Stronger run, less interest optimization
```

### Strategy 3: Scratch Recovery
```
When you must scratch:
- You get 0 points
- You get 0 gold ❌
- BUT you save a category for later
- Consider: Is saving this slot worth losing 1g?
```

---

## 🎬 **Gnosis Interest Animation Sequence**

### Frame-by-Frame Breakdown

**Scenario: Turn 4, you have 17 gold**

```
Frame 1 (0.6s):
╔══════════════════════════════════════╗
║     Saved Gold : 17g                 ║
╚══════════════════════════════════════╝

Frame 2 (0.6s):
╔══════════════════════════════════════╗
║     Interest (1 per 5g)              ║
╚══════════════════════════════════════╝

Frame 3 (0.6s):
╔══════════════════════════════════════╗
║     Interest + 3g                    ║
╚══════════════════════════════════════╝

Frame 4 (0.6s):
╔══════════════════════════════════════╗
║     = 20g                            ║
╚══════════════════════════════════════╝

Pause (0.5s):
  Message: "💰 Interest earned: +3 Gold!"
  Gold counter: 17 → 20 (animated)

Shop Opens!
```

**Total time:** 2.9 seconds (informative and satisfying!)

---

## 📋 **Quick Reference**

### Gold Income Sources
✅ **+1g per score** (no scratches)  
✅ **+0-5g interest** (turn 4 shop)  
✅ **+0-5g interest** (turn 8 shop)  
✅ **Boons** (Charon +1g, Gambler ±2/1g, Early Bird +2g, etc.)  
✅ **Enhancements** (Gold +1g, Parchment +15g rare)

### Interest Quick Calc
- **Every 5 saved = +1 interest** (standard)
- **Every 3 saved = +1 interest** (Golden Touch)
- **Max interest = +5 per shop**
- **Max per ante = +10 total** (if you max both shops)

### Key Rules
- ❌ **Scratches give NO gold**
- ✅ **Interest shows in Gnosis before shop**
- ✅ **Gold awarded immediately when scoring**
- ✅ **First reroll each ante is FREE**

---

## 🎊 **Summary**

**The gold system now:**
1. ✅ Gives **1 gold per score** (down from 2)
2. ✅ Gives **0 gold on scratches** (strategic penalty)
3. ✅ Shows **interest calculation in Gnosis** before shop
4. ✅ Awards **gold when scored** (immediate feedback)
5. ✅ Awards **interest before shop opens** (with animation)

**Result:** More strategic economy, better visual feedback, clearer understanding of interest! 💰✨

---

## 🧪 **Testing the New System**

```javascript
// Test 1: Score with points → should get +1g
window.game.state.dice.forEach(d => d.face = 6);
window.game.state.hasRolled = true;
// Score Sixes (30 points) → expect +1 gold ✅

// Test 2: Scratch → should get +0g
const goldBefore = window.game.state.gold;
window.game.state.dice.forEach(d => d.face = 1);
// Score Sixes (0 points, scratch) → expect +0 gold ✅

// Test 3: Interest at turn 4
window.game.state.turn = 3;
window.game.state.gold = 17;
window.game.nextTurn(); // Will trigger turn 4
// Should see Gnosis animation, then +3g interest, then shop opens ✅

// Test 4: Golden Touch interest
const gt = new Joker(window.CardData.jokers.find(j => j.id === 'golden_touch'));
window.game.state.jokers.push(gt);
window.game.state.gold = 15;
window.game.state.turn = 3;
window.game.nextTurn();
// Should see "1 per 3g" in animation, +5g interest ✅
```

---

## 💎 **Why This System Is Better**

**Before:**
- Too much gold (2 per score)
- Scratches still gave gold (no penalty)
- Interest just "happened" (unclear)

**Now:**
- Balanced economy (1 per score)
- Scratches hurt (no gold!)
- Interest is educational (see the math!)
- More strategic decisions
- Clearer feedback

**The gold system is now more engaging and balanced!** 💰🎯

