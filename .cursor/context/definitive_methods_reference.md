# 🎯 Definitive Methods Reference

**Last Updated:** October 15, 2025  
**Purpose:** Single source of truth for which methods are used for each game mechanic

---

## ⚠️ Important: No Duplicate Methods

This file documents the **definitive, authoritative methods** used for each game mechanic. All duplicates have been removed.

**Cleanup Date:** October 15, 2025
- ✅ Removed duplicate `applyBeforeScoreEffect` (empty legacy version)
- ✅ Removed duplicate `applyBeforeRollEffect` (legacy version)
- ✅ Removed duplicate `applyTimingEffect` (if any existed)
- ✅ Verified no other duplicates exist

---

## 🎴 Card Rendering

### Definitive Method: `Card.render()`
**Location:** `js/classes/Card.js` (lines 52-195)
**Used By:** All card types (Joker, WorshipCard, LibationCard, Artifact)

**What It Does:**
- Renders card HTML with proper styling
- Adds Buy/Sell/Take labels automatically
- Handles asset mapping and fallbacks
- Shows uses counter for limited-use cards

**Pattern:**
```javascript
const cardElement = card.render(isShopItem, isDirectSale);
container.appendChild(cardElement);
```

**Do NOT Use:**
- ❌ Any custom render methods in UIManager
- ❌ Manual HTML generation for cards
- ❌ Duplicate rendering logic

---

## 💰 Shop Actions

### Buy Card - Definitive Method: `UIManager.buyCard()`
**Location:** `js/ui/UIManager.js` (line ~1596)

**Pattern:**
```javascript
this.buyCard(card, gameState, gameEngine, cardElement);
```

**Do NOT Use:**
- ❌ Direct manipulation of gameState.jokers/consumables
- ❌ Manual gold deduction
- ❌ Custom buy logic

### Sell Card - Definitive Method: `UIManager.sellCard()`  
**Location:** `js/ui/UIManager.js` (line 1745)

**Pattern:**
```javascript
this.sellCard(cardToSell, gameState, gameEngine);
```

**Includes:**
- ✅ Sell timing hook trigger
- ✅ Automatic gold credit
- ✅ UI update
- ✅ Boon effect triggers (The Merchant, Mortal Vineyard)

**Do NOT Use:**
- ❌ Hardcoded The Merchant checks (use timing system)
- ❌ Hardcoded Mortal Vineyard checks (use timing system)
- ❌ Manual array splicing without timing hooks

### Claim Card (Packs) - Definitive Method: `UIManager.claimCard()`
**Location:** `js/ui/UIManager.js` (line ~1616)

**Pattern:**
```javascript
this.claimCard(card, gameState, gameEngine, cardElement);
```

---

## 🎲 Boon Effect System

### Main Entry Point: `Joker.onTimingEvent()`
**Location:** `js/classes/Joker.js` (line 57)

**This is the ONLY method that should be called from GameEngine/UIManager**

**Pattern:**
```javascript
boon.onTimingEvent('before_score', gameState, eventData);
```

**Timing Events Supported:**
- `before_roll` - Before dice are rolled
- `after_roll` - After dice are rolled
- `before_score` - Before calculating score
- `after_score` - After scoring
- `turn_start` - At turn start
- `turn_end` - At turn end
- `shop_enter` - When entering shop
- `shop_exit` - When leaving shop
- `ante_end` - At ante completion ✅ NEW
- `sell` - When selling cards ✅ NEW

### Implementation Methods (Internal Only)

These are called BY `onTimingEvent`, never directly:

**Do NOT call these directly from game code:**
- ❌ `applyTimingEffect()` - Internal dispatcher
- ❌ `applyBeforeScoreEffect()` - Internal implementation
- ❌ `applyAfterScoreEffect()` - Internal implementation
- ❌ `applyBeforeRollEffect()` - Internal implementation
- ❌ `applyAfterRollEffect()` - Internal implementation
- ❌ `applyTurnStartEffect()` - Internal implementation
- ❌ `applyTurnEndEffect()` - Internal implementation
- ❌ `applyAnteEndEffect()` - Internal implementation ✅ NEW
- ❌ `applySellEffect()` - Internal implementation ✅ NEW

**Always Use:** `boon.onTimingEvent(eventName, gameState, eventData)`

---

## 🎯 Scoring System

### Definitive Method: `GameEngine.calculateScore()`
**Location:** `js/game/GameEngine.js` (line 1185)

**Returns:** `{ pips, favour, isValid }`

### Definitive Method: `GameEngine.confirmScore()`
**Location:** `js/game/GameEngine.js` (line 631)

**Process:**
1. Calls `calculateScore()` for base values
2. Applies boon effects via timing system
3. Calculates final: `(pips) × ((favour) × (favourMult))`
4. Animates score display
5. Updates scorecard

**Formula:**
```javascript
// Get base
let { pips, favour, isValid } = this.calculateScore(category);

// Apply boons
let eventData = { category, pips, favour, favourMult: 1 };
this.state.jokers.forEach(joker => {
    eventData = joker.onTimingEvent('before_score', this.state, eventData);
});

// Calculate final
favour = eventData.favour * eventData.favourMult;
finalScore = pips * favour;
```

**Do NOT Use:**
- ❌ Manual pip/favour calculations
- ❌ Direct boon method calls
- ❌ Bypassing timing system

---

## 🏛️ Ante Completion

### Definitive Method: `GameEngine.finishAnteAndOpenShop()`
**Location:** `js/game/GameEngine.js` (line 1640)

**Triggers:**
1. Resets ante state
2. **Calls `ante_end` timing hook** ✅ (line 1654)
3. Updates score threshold
4. Opens shop

**Do NOT Use:**
- ❌ Hardcoded Cornucopia checks (use timing system)
- ❌ Hardcoded Odyssey checks (use timing system)
- ❌ Hardcoded Message in a Bottle checks (use timing system)
- ❌ Hardcoded Betrayal by Paris checks (use timing system)

**Always Use:** Timing system via `ante_end` event

---

## 💸 Economy System

### Interest Calculation: `GameEngine.calculateInterest()`
**Location:** `js/game/GameEngine.js` (line 1855)

**Includes:**
- ✅ Golden Touch boon support (1/3 rate vs 1/5)
- ✅ Configurable via GAME_BALANCE constants
- ✅ Max interest cap

**Do NOT:**
- ❌ Hardcode interest rates
- ❌ Bypass Golden Touch check
- ❌ Calculate interest manually

### Gold Updates: `GameEngine.updateGoldAnimated()`
**Location:** `js/game/GameEngine.js`

**Always use this for gold changes** - provides visual feedback

---

## 🎨 Card Animations & Interactions

### Buy/Sell/Take Labels
**Definitive Implementation:** `Card.render()` (lines 85-98)

**Automatically adds:**
- Green "Buy" button (shop purchases)
- Blue "Take" button (pack claims)  
- Red "Sell" button (inventory)

**Event Handling:** UIManager attaches click handlers after rendering

**Do NOT:**
- ❌ Create custom label HTML
- ❌ Duplicate label logic
- ❌ Override automatic label generation

### Card Hover Effects
**Definitive Implementation:** CSS in `css/balatro-effects.css`

**Classes Used:**
- `.card:hover` - Hover lift effect
- `.shop-item` - Shop-specific styles
- `.balatro-card` - Balatro-style card effects

**Do NOT:**
- ❌ Add duplicate hover listeners in JS
- ❌ Create custom CSS hover rules
- ❌ Override existing animations

### Card Flip/Rotate
**Definitive Implementation:** CSS animations

**Classes:**
- `.shop-item-flip-in` - Flip in animation (shop reroll)
- `.shop-item-flip-out` - Flip out animation (shop reroll)
- `.shop-item-slide-in` - Slide in animation (shop open)

**Do NOT:**
- ❌ Add JS-based flip animations
- ❌ Duplicate rotation logic
- ❌ Override CSS animations with JS

---

## 🎪 Worship Card System

### Apply Worship: `WorshipCard.applyWorship()`
**Location:** `js/classes/WorshipCard.js` (line 36)

**Includes:**
- ✅ The Heretic reset (line 53)
- ✅ Last worship god tracking (line 61)
- ✅ Cycle of Seasons spreading (line 63)

**Do NOT:**
- ❌ Manually increment worship levels
- ❌ Hardcode Cycle of Seasons (it's in the method)
- ❌ Bypass applyWorship() method

---

## 🔄 Timing System Flow

### Definitive Call Pattern

```javascript
// ✅ CORRECT: Use onTimingEvent
gameState.jokers.forEach(joker => {
    if (joker.timing && joker.timing.before_score) {
        eventData = joker.onTimingEvent('before_score', gameState, eventData);
    }
});

// ❌ WRONG: Direct method calls
gameState.jokers.forEach(joker => {
    eventData = joker.applyBeforeScoreEffect(gameState, eventData); // DON'T DO THIS
});
```

### Where Timing Hooks Are Called

| Event | Location | Line |
|-------|----------|------|
| `before_roll` | GameEngine.rollDice() | TBD |
| `after_roll` | GameEngine.rollDice() | TBD |
| `before_score` | GameEngine.confirmScore() | 662 |
| `after_score` | GameEngine.finalizeScoring() | 706 |
| `turn_start` | GameEngine.nextTurn() | TBD |
| `turn_end` | GameEngine.nextTurn() | TBD |
| `ante_end` | GameEngine.finishAnteAndOpenShop() | 1654 ✅ |
| `sell` | UIManager.sellCard() | 1753 ✅ |

---

## 🎯 Best Practices

### Always Use These Methods

1. **Card Rendering:** `card.render()`
2. **Boon Effects:** `boon.onTimingEvent()`
3. **Shop Actions:** `UIManager.buyCard()`, `sellCard()`, `claimCard()`
4. **Scoring:** `GameEngine.calculateScore()`, `confirmScore()`
5. **Gold Updates:** `GameEngine.updateGoldAnimated()`
6. **Interest:** `GameEngine.calculateInterest()`

### Never Do These

1. ❌ Call internal `apply*Effect()` methods directly
2. ❌ Create duplicate methods for existing functionality
3. ❌ Hardcode boon checks (use timing system)
4. ❌ Manual array manipulation for cards (use proper methods)
5. ❌ Bypass animation/feedback systems
6. ❌ Override CSS animations with JS
7. ❌ Create custom rendering logic

---

## 🔍 How to Verify Methods

### Check for Duplicates

```bash
# Search for duplicate method definitions
grep -n "^    methodName" js/classes/ClassName.js

# Should return only ONE result per method
```

### Check Method Usage

```bash
# Find all calls to a method
grep -r "methodName(" js/

# Verify all calls go through the correct entry point
```

---

## 📝 Quick Reference

### Card Actions
| Action | Method | Location |
|--------|--------|----------|
| Render | `card.render()` | Card.js:52 |
| Buy | `UIManager.buyCard()` | UIManager.js:1596 |
| Sell | `UIManager.sellCard()` | UIManager.js:1745 |
| Claim | `UIManager.claimCard()` | UIManager.js:1616 |

### Boon System
| Function | Method | Location |
|----------|--------|----------|
| Trigger Effect | `boon.onTimingEvent()` | Joker.js:57 |
| Check Conditions | `boon.checkConditions()` | Joker.js:172 |

### Timing Implementations (Internal Only)
| Event | Method | Location |
|-------|--------|----------|
| before_roll | `applyBeforeRollEffect()` | Joker.js:204 |
| after_roll | `applyAfterRollEffect()` | Joker.js:234 |
| before_score | `applyBeforeScoreEffect()` | Joker.js:365 |
| after_score | `applyAfterScoreEffect()` | Joker.js:920 |
| turn_start | `applyTurnStartEffect()` | Joker.js:1061 |
| turn_end | `applyTurnEndEffect()` | Joker.js:1217 |
| ante_end | `applyAnteEndEffect()` | Joker.js:1280 ✅ |
| sell | `applySellEffect()` | Joker.js:1249 ✅ |

### Economy
| Function | Method | Location |
|----------|--------|----------|
| Calculate Interest | `GameEngine.calculateInterest()` | GameEngine.js:1869 |
| Update Gold | `GameEngine.updateGoldAnimated()` | GameEngine.js:916 |
| Show Interest Animation | `GameEngine.showInterestThenOpenShop()` | GameEngine.js:1888 |
| Open Shop | `GameEngine.openShop()` | GameEngine.js:1946 |

### Scoring
| Function | Method | Location |
|----------|--------|----------|
| Calculate Score | `GameEngine.calculateScore()` | GameEngine.js:1185 |
| Confirm Score | `GameEngine.confirmScore()` | GameEngine.js:631 |
| Animate Score | `GameEngine.animateScoreUpdate()` | GameEngine.js:746 |
| Live Score Preview | `GameEngine.updateLiveScoreDisplay()` | GameEngine.js:1793 ✅ UPDATED |

---

## 💰 Economy System (Production-Ready)

### Gold Income Rules
**Base Income:**
- **+1 gold per successful score** (finalScore > 0)
- **+0 gold on scratches** (finalScore = 0)
- Constant: `GAME_BALANCE.GOLD_PER_SCORE = 1`

**Interest System:**
- Awarded at **turns 4 and 8** (before shop opens)
- **Standard Rate:** +1 gold per 5 saved (max +5)
- **Golden Touch Boon:** +1 gold per 3 saved (max +5)
- Constants: `INTEREST_RATE = 5`, `MAX_INTEREST = 5`

**Boon Bonuses:**
- Charon's Ferry Fare: +1g per score (no scratches)
- Gambler's Charm: 50% +2g / 50% -1g
- Early Bird: +2g on turns 4-5
- The Merchant: +1g selling worship/libation
- Betrayal by Paris: +10g at ante end

### Gold Award Timing
**Immediate (when scoring):**
- Base gold (+1g if not scratch)
- Boon bonuses (Charon, Gambler, etc.)
- Enhancement bonuses (gold/parchment)

**Before Shop Opens (turns 4 & 8):**
- Interest calculation shown in Gnosis display
- Animated breakdown (4 frames, 600ms each)
- Interest awarded after animation
- Shop opens

### Interest Display Flow (Gnosis)
```javascript
// At turns 4 and 8:
showInterestThenOpenShop() {
    // 1. Calculate interest
    // 2. Animate in Gnosis:
    //    "Saved: Xg" → "Interest (1/5g)" → "+ Yg" → "= Zg"
    // 3. Award interest
    // 4. Open shop
}
```

### Economy Balance
**Income per ante (average):**
- Scoring: ~11-12g (assuming 1-2 scratches)
- Interest: ~4-10g (depends on savings)
- Boons: Variable (+0-15g)
- **Total: ~15-30g per ante**

**Expenses per ante (average):**
- Cards: ~10-20g
- Rerolls: ~4-8g (first free!)
- **Total: ~14-28g per ante**

**Result:** Balanced, strategic economy ✅

### Golden Touch Impact
**Without:** Need 25g to max interest (+5g)
**With:** Need 15g to max interest (+5g)
**Savings:** 10g can be spent elsewhere!

---

## 🚫 Deprecated/Removed Methods

### DO NOT USE These

| Method | Status | Replacement |
|--------|--------|-------------|
| `Joker.applyEffect()` | ⚠️ Legacy - Artifacts only | Use `onTimingEvent()` |
| `UIManager.renderCard()` | ❌ If exists, don't use | Use `card.render()` |
| Hardcoded boon checks | ❌ Removed | Use timing hooks |
| Duplicate applyBeforeScoreEffect | ❌ Deleted Oct 15 | Use line 365 version |
| Duplicate applyBeforeRollEffect | ❌ Deleted Oct 15 | Use line 204 version |

---

## ✅ Verification Checklist

When adding new features:

- [ ] Check this file first for definitive method
- [ ] Verify no duplicates exist with `grep -n "methodName"`
- [ ] Use timing system for boon effects (not hardcoding)
- [ ] Use `card.render()` for all card rendering
- [ ] Use proper shop methods (buy/sell/claim)
- [ ] Update this file if adding new definitive methods

---

## 📚 Related Documentation

- **BOON_IMPLEMENTATION_PATTERNS.md** - How to implement boons
- **ALL_BOONS_IMPLEMENTED.md** - Complete boon implementation list
- **FAVOUR_SYSTEM_EXPLAINED.md** (archive/) - Scoring formula details
- **ARCHITECTURE.md** (.cursor/context/) - Overall system architecture

---

## 🎯 Golden Rules

1. **One Method Per Function** - No duplicates
2. **Use Timing System** - Never hardcode boon checks
3. **Entry Points Only** - Never call internal methods
4. **Verify First** - Check this file before implementing
5. **Update This File** - When adding new systems

**Remember:** If you find a duplicate, remove it immediately and update this file! 🎯

---

## 🏛️ Artifact System (Like Balatro Vouchers)

### Artifact Class
**Location:** `js/classes/Artifact.js`
**Extends:** Card class

**Properties:**
- All cost **10 gold** (standardized)
- Cannot be sold (sellValue = 0)
- Rarity: 'artifact'
- Type: 'artifact'
- Permanent passive effects

### Rendering
**Method:** `Artifact.render(isShopItem, isDirectSale)`

**Appearance:**
- White background (no images)
- Golden border (#DAA520)
- Text-focused design
- Shows effect + description
- "Divine Artifact" badge

**Like:** Balatro's voucher cards (text-based, premium feel)

### All 5 Artifacts (10g each)
1. **Temple Market** - +1 shop inventory size
2. **Merchants Arrival** - All shop prices -25%
3. **Crystal Ball** - +1 libation slot
4. **Altar** - Double favour from worship cards
5. **Antikythra** - +1 boon slot

**Note:** The Trojan Horse reserved for future ultra-rare boon tier (above Epic)

### Shop Display
**Section:** "Divine Artifacts" (left side)
**Appearance:** White cards with golden styling
**Text:** Always visible (exception to normal shop cards)
**Purchase:** Click golden "10g" button

### CSS Styling
**Classes:**
- `.artifact-card` - White background, golden border
- `.artifact-name` - Large, bold title
- `.artifact-effect` - Effect description
- `.artifact-description` - Detailed explanation (italic)
- `.artifact-buy` - Golden buy button

**Location:** `css/styles.css` (lines 2047-2113)

### Asset Mapping
**Method:** `AssetMapping.getArtifactAsset(id)`
**Returns:** null (intentional - artifacts use white fallback)
**Reason:** Text-based design like Balatro vouchers

