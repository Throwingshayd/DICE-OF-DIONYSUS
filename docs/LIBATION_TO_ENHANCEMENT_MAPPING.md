# 🍷 Libation to Enhancement Mapping

## ✅ **Complete Libation → Enhancement Coverage**

| Libation Card | Enhancement Applied | Cost | Status |
|---------------|-------------------|------|--------|
| **Kyphi Mead** | Parchment | 2g | ✅ Implemented |
| **Tisane of Hephaestus** | Iron (Steel) | 2g | ✅ Implemented |
| **Ambrosial Krasi** | Gold | 2g | ✅ Implemented |
| **Retsina of Echoes** | Mirror | 2g | ✅ Implemented |
| **Soma of the Wild** | Wild | 2g | ✅ Implemented |

## ❌ **Missing Enhancement Coverage**

| Enhancement | Libation Card | Status |
|-------------|---------------|--------|
| **Mother of Pearl** | ❌ No libation | Missing |

## 📋 **Other Libations (Non-Enhancement)**

| Libation Card | Effect | Cost | Type |
|---------------|--------|------|------|
| **Kylix of the Hermit** | Double your money (max 20) | 3g | Economic |
| **Elixir of Lethe** | Reduce a die face by 1 | 2g | Face Modifier |
| **Chalice of Helios** | Increase a die face by 1 | 2g | Face Modifier |
| **The Eucharist** | Gain +1 worship level | 2g | Worship |
| **Divine Guidance** | Gain 2 random worship levels | 2g | Worship |

## 🎯 **Summary**

**Enhancement Libations:** 5/6 implemented (missing Mother of Pearl)
**Total Libations:** 10 libations total
**Enhancement Coverage:** 83% (5 out of 6 enhancements have libations)

## 🔧 **Recommendations**

1. **Add Mother of Pearl libation** - Create a new libation card for this enhancement
2. **All other enhancements are covered** - Wild and Mirror both have corresponding libations
3. **System is well-balanced** - Each enhancement costs 2g and provides strategic value

## 📝 **Libation Implementation Details**

All enhancement libations use the `promptForDieFaceSelection()` method to:
1. Show available dice
2. Let player select which die
3. Let player select which face (1-6)
4. Apply the enhancement to that specific face
5. Provide feedback to the player

This creates a strategic choice for players on which die and which face to enhance.
