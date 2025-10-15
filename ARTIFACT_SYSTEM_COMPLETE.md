# 🏛️ Divine Artifacts System - Complete!

**Date:** October 15, 2025  
**Feature:** Artifact class like Balatro's Vouchers  
**Status:** ✅ COMPLETE

---

## 🎯 What Are Artifacts?

**Divine Artifacts** are permanent passive effects, like **Balatro's Vouchers**:
- 🏛️ **One-time purchases** (can't sell, permanent)
- 💰 **All cost 10 gold** (standardized pricing)
- ✨ **Powerful passive effects** (game-changers)
- 📜 **White card design** (text-focused, no images)
- 🎨 **Golden borders** (premium feel)

**Think of them as:**
- Balatro's Vouchers (permanent upgrades)
- Slay the Spire's Relics
- Long-term investments vs temporary boons

---

## 📋 All 5 Divine Artifacts

### 1. **Temple Market** (10g)
**Effect:** Shop inventory size increased by 1  
**Description:** Expands your shopping options each visit  
**Impact:** More choices each shop = better build diversity

### 2. **Merchants Arrival** (10g)
**Effect:** All shop prices reduced by 25%  
**Description:** Makes all future purchases cheaper  
**Impact:** 
- Rustic 3g → 2.25g (rounds to 2g)
- Vibrant 5g → 3.75g (rounds to 4g)
- Epic 8g → 6g

### 3. **Crystal Ball** (10g)
**Effect:** +1 Libation slot  
**Description:** Carry more libations for strategic plays  
**Impact:** 2 → 3 libation slots (more consumable options)

### 4. **Altar** (10g)
**Effect:** Double the Favour gained from Worship cards  
**Description:** Your devotion rewarded with greater divine favour  
**Impact:** Worship cards give 2× favour instead of 1× (e.g., Artemis 1 → 2 favour!)

### 5. **Antikythra** (10g)
**Effect:** +1 Boon slot  
**Description:** Collect more powerful boons for your build  
**Impact:** 5 → 6 boon slots (crucial for synergies!)

---

**Note:** The Trojan Horse has been reserved for a future ultra-rare boon tier (above Epic)!

---

## 🏗️ **Technical Implementation**

### New Artifact Class ✅
**File:** `js/classes/Artifact.js` (NEW!)

**Features:**
- Extends Card class (like Joker, WorshipCard, LibationCard)
- Forces cost to 10 gold
- Cannot be sold (sellValue = 0)
- Renders with white background
- Shows effect and description text

```javascript
class Artifact extends Card {
    constructor(data) {
        super(data);
        this.type = 'artifact';
        this.cost = 10; // All artifacts cost 10 gold
        this.sellValue = 0; // Cannot be sold
        this.rarity = 'artifact';
    }
}
```

### Updated gameData.js ✅
**All artifacts now:**
- ✅ Cost 10 gold (standardized)
- ✅ Have effect field (short description)
- ✅ Have description field (detailed explanation)
- ✅ Mention "Divine artifact - permanent passive effect"

### Updated UIManager.js ✅
**createCardElement() method now:**
- ✅ Detects artifact type
- ✅ Creates Artifact instance
- ✅ Calls Artifact.render() method
- ✅ Handles buy clicks properly

### Updated assetMapping.js ✅
**Added getArtifactAsset() method:**
- Returns null (artifacts use white fallback)
- Documented as intentional (like Balatro vouchers)

### Added CSS Styling ✅
**File:** `css/styles.css` (lines 2047-2113)

**Artifact-specific styles:**
- White background with golden border
- Text displayed (unlike regular cards in shop)
- Golden "Divine Artifact" badge
- Larger, readable text
- Golden buy button
- Premium hover effects

---

## 🎨 **Visual Design**

### Artifact Card Appearance

```
┌─────────────────────────────┐
│  [Divine Artifact]          │ ← Golden badge
│                             │
│    Temple Market            │ ← Large title
│                             │
│  Shop inventory size        │ ← Effect
│  increased by 1.            │
│                             │
│  Like Balatro's voucher     │ ← Description
│  system - permanent passive │   (italic, smaller)
│  effect.                    │
│                             │
│         [10g] ←Buy button   │ ← Golden button
└─────────────────────────────┘
```

**Colors:**
- Background: White (#FFFFFF)
- Border: Goldenrod (#DAA520)
- Badge: Golden gradient
- Title: Dark brown (#2F1C10)
- Effect: Dark gray (#444)
- Description: Gray (#666, italic)
- Buy button: Golden gradient

---

## 🔧 **How They Work In-Game**

### Shop Display
1. Artifacts appear in "Divine Artifacts" section
2. White cards with golden borders (stand out!)
3. Text clearly visible (effect + description)
4. Golden "10g" buy button
5. Only ONE artifact shows per shop

### Purchasing
```javascript
1. Click golden "10g" button
2. Deduct 10 gold
3. Artifact added to gameState.artifacts array
4. Passive effect applied immediately
5. Won't appear in future shops (one-time purchase)
```

### Passive Effects
Artifacts apply effects via `Joker.applyEffect()`:
- Temple Market → increases shop inventory
- Merchants Arrival → reduces all prices 25%
- Crystal Ball → adds libation slot
- Altar → doubles favour from worship cards (2× multiplier)
- Antikythra → adds boon slot

---

## 📊 **Artifact Comparison to Boons**

| Aspect | Boons | Artifacts |
|--------|-------|-----------|
| **Purpose** | Active effects | Passive upgrades |
| **Cost** | 3-11g | Always 10g |
| **Slot** | Uses boon slots (limited) | Separate (unlimited) |
| **Sell** | Can sell for 1-3g | Cannot sell |
| **Effect** | Per-turn bonuses | Permanent upgrades |
| **Display** | Image-based cards | Text-based vouchers |
| **Rarity** | Rustic/Vibrant/Epic | All "artifact" rarity |
| **Like** | Balatro's jokers | Balatro's vouchers |

---

## ✅ **Fixed Issues**

### Issue #1: No Description Showing
**Before:** Artifacts only showed effect field  
**After:** ✅ Shows both effect AND description

### Issue #2: No White Fallback
**Before:** Artifacts tried to load images (failed)  
**After:** ✅ Intentionally use white background (like Balatro)

### Issue #3: Inconsistent Costs
**Before:** 10g for Trojan Horse, 12g for others  
**After:** ✅ All cost 10g (standardized)

### Issue #4: No Artifact Class
**Before:** Artifacts were just data objects  
**After:** ✅ Proper Artifact class extending Card

---

## 🎮 **Player Experience**

### When You See an Artifact in Shop

**Visual:**
- Bright white card with golden border
- Stands out from colorful boon/worship cards
- Text is large and readable
- "Divine Artifact" badge at top
- Description explains what it does

**Decision:**
- 10 gold investment
- Permanent upgrade
- Can only buy once
- Worth it for long-term power

**After Purchase:**
- Effect applies immediately
- Listed in artifacts array
- Can't be sold or removed
- Passive benefit forever

---

## 📁 **Files Modified/Created**

### Created
1. **js/classes/Artifact.js** (NEW!) - Artifact class

### Modified
2. **js/data/gameData.js** - Standardized all to 10g, added descriptions
3. **js/ui/UIManager.js** - Updated createCardElement to use Artifact class
4. **js/data/assetMapping.js** - Added getArtifactAsset() method
5. **css/styles.css** - Added artifact-specific styling
6. **index.html** - Added Artifact.js script

---

## 🧪 **Testing**

### Console Test
```javascript
// Test 1: Verify Artifact class exists
console.log(typeof Artifact); // Should be 'function'

// Test 2: Create an artifact
const tmData = window.CardData.artifacts.temple_market.base;
const artifact = new Artifact(tmData);
console.log(artifact.cost); // Should be 10
console.log(artifact.type); // Should be 'artifact'
console.log(artifact.description); // Should exist

// Test 3: Verify all artifacts cost 10g
Object.values(window.CardData.artifacts).forEach(pair => {
    console.log(pair.base.name, ':', pair.base.cost, 'gold');
    // All should show 10 gold
});

// Test 4: In-game shop
// Open shop (turn 4 or 8)
// Look for artifact in "Divine Artifacts" section
// Should see white card with gold border
// Should see full description text
```

---

## 🎯 **Strategic Value**

### Most Valuable Artifacts (Ranked)

1. **Antikythra (+1 Boon slot)** - More boons = more power
2. **Altar (×2 Worship favour)** - HUGE for worship-heavy builds!
3. **Merchants Arrival (-25% prices)** - Saves gold long-term
4. **Temple Market (+1 shop slot)** - More options
5. **Crystal Ball (+1 Libation)** - Useful but situational

### When to Buy
- **Early (Antes 1-2):** Merchants Arrival (saves gold later)
- **Mid (Antes 3-4):** Altar (if worship build) or Antikythra (more boon slots)
- **Late (Antes 5+):** Any remaining based on build strategy

---

## ✅ **Quality Assurance**

- ✅ **Artifact class created** - Extends Card properly
- ✅ **All cost 10 gold** - Standardized pricing
- ✅ **Descriptions added** - Clear explanations
- ✅ **White background** - Like Balatro vouchers
- ✅ **Text visible** - CSS exception for artifacts
- ✅ **Golden styling** - Premium feel
- ✅ **No linter errors** - Code validates perfectly
- ✅ **Proper rendering** - Uses Artifact.render() method

---

## 🎊 **Result**

**Artifacts now work exactly like Balatro's Vouchers:**

✅ **Own class** - Artifact extends Card  
✅ **10g each** - Consistent pricing  
✅ **White cards** - Text-focused design  
✅ **Full descriptions** - Shows effect + detailed description  
✅ **Golden styling** - Premium, special feel  
✅ **Permanent effects** - One-time purchases  

**Divine Artifacts are now a polished, distinct card type!** 🏛️✨

---

## 📚 **Integration with Existing Systems**

### Shop Generation
- `generateArtifactStock()` picks one random artifact
- Uses new Artifact class
- Displays in "Divine Artifacts" section
- Only shows unpurchased artifacts

### Purchasing
- Uses `buyArtifact()` method
- Deducts 10 gold
- Adds to `gameState.artifacts` array
- Applies passive effect immediately

### Effects
- Applied via `Joker.applyEffect()` (artifacts section)
- Permanent, passive (no timing events)
- Modify game state on purchase
- Never expire or get removed

**The artifact system is production-ready!** ✅

