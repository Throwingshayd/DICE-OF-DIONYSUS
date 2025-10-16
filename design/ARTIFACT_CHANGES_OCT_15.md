# 🏛️ Artifact Changes - October 15, 2025

**Changes Made:** Removed Trojan Horse, Updated Altar
**Reason:** Reserve Trojan Horse for ultra-rare boon tier, make Altar more impactful

---

## 🔄 **Changes Made**

### Change #1: The Trojan Horse Removed ✅
**Before:** 6th artifact (10g)
- Effect: After Turn 10 each Ante, all Boons give ×2 effect
- Too powerful for artifacts
- Better suited as ultra-rare boon

**After:** Reserved for future implementation
- Will become an ultra-rare boon (rarity above Epic)
- Potentially called "Legendary" or "Divine" tier
- Remains as aspirational high-power boon for late game

**Reasoning:**
- Doubling all boon effects is TOO powerful for a 10g purchase
- Better as a rare, exciting boon drop
- Creates anticipation for ultra-rare tier
- Balatro has "Legendary" jokers - we should too!

---

### Change #2: Altar Effect Changed ✅

**Before:**
- Effect: +1 Worship card slot
- Impact: 3 → 4 worship slots
- Problem: Arbitrary slot increase, worship slots already generous

**After:**
- Effect: Double the Favour gained from Worship cards
- Impact: All worship cards give 2× their normal favour
- Description: "Your devotion to the gods is rewarded with greater divine favour!"

**Examples:**
```
Without Altar:
- Artemis 1's worship card: +1 favour → Artemis 1's = 2 favour
- Use 3 times: 2, 3, 4 favour

With Altar (10g investment):
- Artemis 1's worship card: +2 favour → Artemis 1's = 3 favour
- Use 3 times: 3, 5, 7 favour
- MASSIVE difference for worship builds!
```

**Reasoning:**
- More impactful effect (multiplier > slot)
- Encourages worship-heavy builds
- Creates meaningful strategic choice
- Better synergy with existing mechanics
- Makes Altar a top-tier artifact for worship decks

---

## 📊 **New Artifact Rankings**

### Before (With Trojan Horse)
1. Antikythra (+1 Boon slot)
2. The Trojan Horse (×2 boons) ← Removed
3. Merchants Arrival (-25% prices)
4. Temple Market (+1 shop)
5. Crystal Ball (+1 Libation)
6. Altar (+1 Worship slot) ← Changed

### After (Updated)
1. **Antikythra** (+1 Boon slot) - Still #1, more boons = more power
2. **Altar** (×2 Worship favour) - NOW #2! Huge for worship builds!
3. **Merchants Arrival** (-25% prices) - Long-term gold savings
4. **Temple Market** (+1 shop slot) - More build options
5. **Crystal Ball** (+1 Libation) - Situational utility

**Key Change:** Altar moved from #6 to #2 due to massive worship synergy!

---

## 🎮 **Strategic Impact**

### Altar's New Power

**Build Archetypes:**
- **Worship-Heavy Build:** Altar is MANDATORY (buy first!)
- **Balanced Build:** Altar still great if using 2+ gods
- **Boon-Only Build:** Skip Altar, buy Antikythra instead

**Favour Math:**
```
Scenario: Level up Artemis 1's to max (level 10)

Without Altar:
- 10 uses of worship card
- Favour: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
- Final: 10 favour for Artemis 1's

With Altar (10g):
- 10 uses of worship card (doubled)
- Favour: 2, 4, 6, 8, 10, 12, 14, 16, 18, 20
- Final: 20 favour for Artemis 1's
- DOUBLE THE FAVOUR!
```

**This is INSANE for worship strategies!**

---

## 🏛️ **Current 5 Divine Artifacts**

All cost **10 gold** each:

1. **Temple Market**
   - Effect: +1 shop inventory size
   - Best For: Any build (always useful)

2. **Merchants Arrival**
   - Effect: All shop prices -25%
   - Best For: Early purchase (long-term savings)

3. **Crystal Ball**
   - Effect: +1 Libation slot
   - Best For: Consumable-heavy strategies

4. **Altar** ⭐ (UPDATED!)
   - Effect: Double favour from worship cards
   - Best For: Worship-heavy builds (game-changer!)

5. **Antikythra**
   - Effect: +1 Boon slot
   - Best For: Boon synergy builds (always strong)

---

## 📁 **Files Modified**

### Code Changes
1. **js/data/gameData.js**
   - Removed `'trojan_horse'` artifact entry
   - Updated `'telescope'` (Altar) effect and description

### Documentation Updates
2. **ARTIFACT_SYSTEM_COMPLETE.md** - Updated all references
3. **SHOP_UI_ARTIFACTS_FIXED.md** - Updated artifact list
4. **meta/definitive_methods_reference.md** - Updated artifact section

---

## 🔮 **Future: The Trojan Horse**

**Reserved For:** Ultra-Rare Boon Tier (above Epic)

**Potential Implementation:**
```javascript
{
    id: "trojan_horse",
    name: "The Trojan Horse",
    rarity: "legendary", // New tier!
    cost: 15, // Higher than Epic (8g)
    sellValue: 5,
    effect: "After Turn 10 each Ante, all Boons give ×2 effect.",
    description: "Hidden power that doubles all boon effects late game!",
    timing: { turn_start: true }
}
```

**Rarity Tiers:**
- Rustic (3g, common)
- Vibrant (5g, uncommon)
- Epic (8g, rare)
- **Legendary (15g, ultra-rare)** ← New tier for Trojan Horse!

**Legendary Boon Ideas:**
- The Trojan Horse (×2 all boons after turn 10)
- Crown of Laurels (permanent +10 favour)
- Ichor of the Gods (all dice roll maximum)
- Kronos' Hourglass (replay any turn)

---

## ✅ **Testing Notes**

### Test Altar's New Effect

**In-Game Test:**
```
1. Start new game
2. Get to shop (turn 4 or 8)
3. Buy Altar artifact (10g)
4. Use any worship card
5. Check that favour is doubled:
   - Artemis 1's: Should give +2 favour (not +1)
   - Hera 2's: Should give +2 favour (not +1)
   - Etc.
```

**Console Test:**
```javascript
// Check Altar definition
const altar = CardData.artifacts.telescope.base;
console.log(altar.name); // "Altar"
console.log(altar.effect); // "Double the Favour gained from Worship cards."

// Verify Trojan Horse removed
console.log(CardData.artifacts.trojan_horse); // undefined
```

---

## 🎊 **Result**

**Artifacts Now:**
- ✅ 5 balanced artifacts (Trojan Horse removed)
- ✅ Altar now doubles worship favour (much more impactful!)
- ✅ Better strategic diversity (worship builds viable!)
- ✅ Trojan Horse reserved for legendary boon tier
- ✅ All 10g, consistent pricing maintained

**Altar is now a TOP-TIER artifact for worship builds!** 🏛️✨

**Ready for implementation of Legendary boon tier in the future!** 🔮

