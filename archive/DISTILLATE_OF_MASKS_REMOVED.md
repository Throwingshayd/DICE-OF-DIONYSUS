# 🗑️ Distillate of Masks - Removed

## ✅ Complete Removal

**Date**: October 14, 2025  
**Status**: ✅ REMOVED

---

## What Was Removed

**Distillate of Masks** - A libation (consumable card) that had this effect:
- **Cost**: 2 gold
- **Effect**: "Apply a random enhancement to a random Boon"
- **Type**: Instant use

---

## Files Modified

### 1. `js/data/gameData.js`
- Removed from `libations` array (line 822)
- **Before**: 10 libations
- **After**: 9 libations

### 2. `js/classes/LibationCard.js`
- Removed case handler for `distillate_masks` (lines 200-212)
- Removed implementation that:
  - Selected random boon from player's collection
  - Applied random enhancement (parchment, iron, gold, mirror, wild, mother of pearl)
  - Showed success/failure messages

### 3. `js/data/assetMapping.js`
- Removed asset mapping: `'distillate_masks': 'distilatte of masks.png'`

---

## Remaining Libations (9 Total)

1. **Kyphi Mead** - Enhance die face to Parchment
2. **Tisane of Hephaestus** - Enhance die face to Steel
3. **Ambrosial Krasi** - Enhance die face to Gold
4. **Retsina of Echoes** - Enhance die face to Mirror
5. **Soma of the Wild** - Enhance die face to Wild
6. **Kylix of the Hermit** - Destroy a boon, double your money (max 20)
7. **Elixir of Lethe** - Reduce a die face by 1
8. **Chalice of Helios** - Increase a die face by 1
9. **The Eucharist** - Gain +1 worship level in god of choice
10. ~~Divine Guidance~~ - Gain 2 random levels in any 2 scores

**Note**: Divine Guidance is still in the game (it's #10 in the list above, not removed)

---

## Impact

### Positive
- ✅ Cleaner libation pool
- ✅ Removed random/unpredictable card effect
- ✅ Fewer edge cases to test
- ✅ Simplified codebase

### Gameplay
- Players can no longer randomly enhance boons via libation
- Die face enhancements remain available (5 libations for that)
- No balance issues expected

---

## Testing

After removal, verify:
- [ ] Libation packs show only 9 libations
- [ ] Shop libation selection works correctly
- [ ] No references to `distillate_masks` in console errors
- [ ] Collection screen shows 9 libations (not 10)
- [ ] Game loads without errors

---

## Code Removed

### gameData.js
```javascript
// REMOVED:
{ id: "distillate_masks", name: "Distillate of Masks", rarity: "libation", cost: 2, sellValue: 0, effect: "Apply a random enhancement to a random Boon.", type: "instant" },
```

### LibationCard.js
```javascript
// REMOVED:
case 'distillate_masks':
    // Apply a random enhancement to a random Boon
    if (gameState.jokers && gameState.jokers.length > 0) {
        const randomBoon = gameState.jokers[Math.floor(Math.random() * gameState.jokers.length)];
        const enhancements = ['parchment', 'iron', 'gold', 'mother_of_pearl', 'mirror', 'wild'];
        const randomEnhancement = enhancements[Math.floor(Math.random() * enhancements.length)];
        const engine = gameEngine || window.game;
        engine?.showMessage?.(`Distillate of Masks: Applied ${randomEnhancement} enhancement to ${randomBoon.name}!`);
    } else {
        const engine = gameEngine || window.game;
        engine?.showMessage?.("Distillate of Masks: No boons available to enhance!");
    }
    break;
```

### assetMapping.js
```javascript
// REMOVED:
'distillate_masks': 'distilatte of masks.png',
```

---

## ✅ Removal Complete!

The game now has 9 libations instead of 10. All references to "Distillate of Masks" have been removed from the codebase.

**No further action needed** - the changes will take effect on next page reload!

