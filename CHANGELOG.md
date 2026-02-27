# Dice of Dionysus - Changelog

## Tester Identity (Feb 2025)

- **Created** `.cursor/tester/SOUL.md` — Tester identity: folder map, commands, when to update tracking
- **Created** `tracking/README.md` — Canonical vs generated files
- **Added** test-results/, playwright-report/ to .gitignore
- **Wired** tester SOUL into SOUL.md and 3-automation.mdc

## Docs Consolidation (Feb 2025)

### docs/ → .cursor/context/ + archive/
- **Moved:** ARCHITECTURE.md, GOD_METADATA_REFERENCE.md, system_map.md → .cursor/context/
- **Archived:** GOLD_AND_INTEREST_SYSTEM_EXPLAINED, FAVOUR_SYSTEM_EXPLAINED, ENHANCEMENT_SYSTEM_CLARIFICATION, LIBATION_TO_ENHANCEMENT_MAPPING, JUICE_QUICK_START, PACK_OPENING_IMPLEMENTATION, TESTING_GUIDE_56_BOONS, PLAYTESTING_REPORT_BOONS, TEST_MODE_INSTRUCTIONS → archive/
- **Fixed:** Starting gold 15→6, reroll cost 2→4, test mode gold note (4→6)

## Agent Context Consolidation (Feb 2025)

### meta/ → .cursor/context/
- **Merged folders**: meta/ and .cursor/rules/ unified under .cursor/
- **meta/ removed**: All reference docs now in .cursor/context/
- **Unified vision**: .cursorrules slims to SOUL.md alignment; single project vision
- **Outdated fix**: MusicManager → SoundManager in ai_context.yaml
- **Paths**: All meta/ references updated to .cursor/context/

## Version 1.4.3 - Libation Adjustments

### Content Removal
- **Removed Libation**: "Distillate of Masks" has been removed from the game
- **Cleaned Up Code**: Removed implementation from LibationCard.js
- **Cleaned Up Assets**: Removed asset mapping reference
- **Libation Count**: Now 9 libations (was 10)

### Kylix of the Hermit - Buffed
- **Before**: "Destroy a boon, Double your money (max 20)"
- **After**: "Double your money (max 20)"
- **Change**: Removed the boon destruction penalty - now pure gold doubling!
- **Impact**: Much more useful libation, no downside

---

## Version 1.4.2 - Main Menu & Collection Improvements

### Balatro-Style Main Menu Layout
- **Bottom-Middle Positioning**: Buttons now positioned at bottom-center like Balatro
- **Horizontal Button Layout**: Play, Collection, and Seed Input in a row
- **Integrated Seed Input**: Seed input styled and placed inline with buttons
- **Better Visual Hierarchy**: More professional, familiar layout

### Scrollable Collection Screen
- **600px Max Height**: Collection grid now scrollable with fixed max height
- **Custom Scrollbar**: Themed scrollbar (terracotta/green) matching game aesthetic
- **Responsive Grid**: Auto-fill grid layout adapts to content
- **All Items Visible**: Can now scroll to see entire collection

### White Fallback for Locked Cards
- **Visible Locked Cards**: Locked cards now show white background instead of being invisible
- **Clear Mystery State**: All locked cards display "???" for name, effect, and rarity
- **Grayscale Filter**: Locked cards are grayed out to distinguish from unlocked
- **Consistent Across All Types**: Works for Boons, Worship, Libations, and Artifacts

#### Files Modified
- `index.html`: Updated start screen layout
- `css/styles.css`: Added Balatro-style menu positioning, collection scrolling, and locked card styles
- `js/Main.js`: Updated all collection populate methods to show white backgrounds for locked cards

---

## Version 1.4.1 - Balatro-Style Button Improvements

### Major UX Overhaul: Buy/Sell/Take Buttons
**Inspired by Balatro's design philosophy: obvious, easy, satisfying**

#### Always Visible Actions
- **Before**: Buttons hidden with `opacity: 0`, only visible on hover
- **After**: Buttons always visible (`opacity: 1`) - no more "hover to discover" pattern
- **Impact**: Players immediately see available actions, works on mobile (no hover required)

#### Consistent Positioning
- **Before**: Buttons moved between contexts (center-top in shop, top-right in inventory)
- **After**: All buttons consistently positioned at top-right corner
- **Impact**: Muscle memory - players always know where to click

#### Improved Clickability
- **Before**: Buttons shrunk to 35px in inventory (hard to click)
- **After**: Consistent 50px minimum width across all contexts
- **Impact**: Better hit targets, especially on smaller screens and mobile

#### Enhanced Visual Feedback
- **Hover**: Subtle lift animation (scale 1.08 + translateY)
- **Press**: Satisfying click (scale 0.95)
- **Ripple**: Material Design-style ripple effect on click
- **Success**: Scale + brightness pulse on purchase

#### Technical Improvements
- Consolidated 3 conflicting CSS blocks into single master definition
- Removed 15+ `!important` overrides (cleaner cascade)
- Separated positioning (top/right) from animation (transform)
- GPU-accelerated animations for smooth 60fps
- Added `createRippleEffect()` and `playPurchaseAnimation()` utility methods
- Replaced `console.log` with `Logger.debug` for better debugging

#### Files Modified
- `css/styles.css`: Consolidated button CSS, added animations
- `js/ui/UIManager.js`: Added ripple effect method, updated all button click handlers
- `meta/BALATRO_BUTTON_ANALYSIS.md`: Comprehensive analysis document
- `BALATRO_BUTTON_IMPROVEMENTS_COMPLETE.md`: Implementation summary

#### Testing Completed
- ✅ Shop buy buttons (visible, positioned, animated)
- ✅ Inventory sell buttons (jokers + consumables)
- ✅ Pack opening take buttons (all pack types)
- ✅ Mobile compatibility (no hover dependencies)
- ✅ Performance (smooth animations, no glitches)

**The buttons are no longer janky!** 🎉

---

## Version 1.2.4 - Double-Click Confirmation & Shop Timing

### Pack Selection Improvements
- **Double-Click Confirmation**: Replaced confirm button with double-click system for claiming cards from packs
- **Simplified Interaction**: Single-click to select a card (visual feedback), double-click to claim it
- **Updated Instructions**: Pack opening view now shows "Click to Select, Double-Click to Claim"
- **Streamlined UX**: More intuitive and faster card claiming process
- **Maintained Safeguards**: All multiple-claim prevention systems remain in place

### Shop Timing Adjustment
- **Corrected Shop Access**: Shop now opens after turn 3 (when turn becomes 4), after turn 7 (when turn becomes 8), and after the end of ante
- **Better Progression**: Players can access shop items at strategic points throughout the game
- **Maintained Balance**: Shop opens at turns 4, 8, and after each ante completion

### Technical Changes
- Removed confirm button logic and `updatePackConfirmButton()` method
- Updated pack generation functions to use double-click event listeners
- Modified shop opening condition in `nextTurn()` method
- Enhanced visual feedback for card selection states

## Version 1.2.3 - Pack Selection System

### New Feature: Single Card Selection from Packs
- **Pack Mechanics**: All packs now reveal 3 cards but players can only choose one to claim
- **Boon Packs**: Reveal 3 boons - choose one to add to your collection
- **Worship Packs**: Reveal 3 worship cards - choose one to apply immediately
- **Libation Packs**: Reveal 3 libations - choose one to add to your consumables
- **Chaos Packs**: Reveal 3 random cards from any type - choose one to claim
- **UI Improvements**: 
  - Pack opening view now shows "Choose One Card" header
  - All revealed cards are clickable for selection
  - Pack automatically closes after claiming a card
  - Updated pack descriptions to clarify single-card selection
- **User Experience**: More strategic decision-making as players must choose between multiple options
- **Integration**: Works seamlessly with category filtering system

### Technical Implementation
- Modified `claimCard()` function to detect pack opening context and close view
- Added `closePackOpeningView()` method for clean pack closure
- Updated pack generation functions to make all cards clickable
- Enhanced tooltip system for better card information display
- Updated pack descriptions in `CardData` to reflect new mechanics

## Version 1.2.2 - Category-Based Card Filtering

### New Feature: Progressive Card Unlocking
- **Worship Cards**: Cards associated with 7's, 8's, and 9's are now filtered from shops and packs until their respective scoring categories are unlocked:
  - "Blessing of the Pleiades" (Sevens) - only appears after scoring bonus Yahtzee to unlock Sevens
  - "Blessing of Poseidon (Eights)" (Eights) - only appears after scoring bonus Yahtzee to unlock Eights  
  - "Blessing of the Nine Muses" (Nines) - only appears after scoring bonus Yahtzee to unlock Nines
- **Boon Cards**: "Ocean's Depth" (Eights) is now filtered from shops and packs until the Eights category is unlocked
- **Shop Integration**: Direct sales, all pack types (Boon, Worship, Libation, Chaos), and pack contents now respect category filtering
- **Error Handling**: Graceful handling when filtered pools are empty, showing appropriate messages to players
- **Progressive Discovery**: Players must unlock bonus scoring categories through bonus Yahtzees before accessing their associated cards

### Technical Implementation
- Added `filterCardsByUnlockedCategories()` helper function in UIManager
- Updated shop generation functions to apply filtering logic
- Enhanced pack generation to exclude unavailable card types
- Added comprehensive error handling for empty filtered pools

## Version 1.2.1 - Working live score and scorecard (bonus scores)

- Live score: colored pips/favour, consistent N/A, shows 0 x 0 at rest.
- Bonus categories (7/8/9):
  - Displayed in Upper Sanctum after Sixes.
  - Preview unlocks on extra Heureka rolls within the ante (Sevens → Eights → Nines).
  - Persisted unlocks on scoring bonus Heureka.
- Scorecard asset: dynamically expands height/bottom padding as bonus rows unlock to contain text cleanly.
- No mechanics changed; visuals and UI only.

## Version 1.2.0 - Worship, Scoring, Shop UI, and Asset Pass

### Scoring and Worship Updates
- Base favour multiplier set to 1x for all categories; worship adds +1 per level (first worship → 2x).
- Added flat pip bonuses to lower section when valid:
  - Three of a Kind: +15 pips
  - Four of a Kind: +20 pips
  - Full House: +25 pips
  - Small Straight: +30 pips
  - Large Straight: +40 pips
  - Heureka (Yahtzee): +50 pips
- Live score display shows colored pips (purple) and favour (wine red) and remains visible at rest as `0 x 0`.
- Invalid hand indicator standardized to “N/A” with styled letters.

### Ante Progression
- First ante score requirement set to 300.
- Threshold scales linearly by +250 per ante (easy to adjust in `GameEngine.endAnte`).

### Shop UX and Layout
- Shop overlay increased by 10% (1320x880).
- New layout: Individual items row (Artifacts, Wares) above Packs row; categories row at bottom.
- Sections constrained to 2/3 width of shop and centered; items flow horizontally.
- All shop items and pack contents hide on-asset text; white tooltip box appears under assets on hover with name/desc/cost.
- Category buttons scroll/focus sections.

### Asset Integration and Visual Style
- Pack art: Boon (`ART/boon pack.png`), Worship (`ART/worship pack.png`), Libation (`ART/Libation pack.png`).
- Global frames: Worship cards use `ART/worship frame.png`; Libation (house_rule) use `ART/libation frame.png` everywhere (shop, packs, collection, game).
- Removed pink boxes globally; temporary placeholders are white-outline boxes until art is provided.
- Worship/Libation frames sized with `background-size: contain` to prevent cropping.

### Error Handling and Misc
- Suppress wallet/MetaMask missing errors from showing user-facing popups in development; still logged in console.
- Added favicon reference to avoid 404.

### Files Touched (high-level)
- `js/game/GameEngine.js`: scoring flow, live score display, thresholds.
- `js/classes/WorshipCard.js`: level-up worship flow (no mechanics change; messaging/clarity only).
- `js/ui/UIManager.js`: shop layout, stock generation, tooltip injection, pack contents behavior.
- `index.html`: shop DOM structure rework, favicon.
- `css/styles.css`: shop and pack layouts, tooltips, card/pack visuals, frames, white-outline placeholders.

---

## Version 1.1.0 - Asset Positioning & UI Improvements

### 🎨 **Major Asset Positioning Overhaul**
- **Complete CSS Rewrite**: Simplified and cleaned up the entire positioning system
- **Fixed Asset Clipping**: Resolved issues with assets being cut off by containers
- **Rigid Layout System**: Implemented fixed 1920x1080 layout with precise positioning

### 🎯 **Asset Positioning Improvements**
- **Dice Container**: Positioned at `top: 260px, left: 495px` with `902x749px` dimensions
- **Rolling Controls**: Centered and sized at `top: 500px` with `437x262px` button
- **Boon Slots**: Positioned at `top: -25px` with `1100x412px` dimensions
- **Game Info**: Positioned at `top: 55px` with proper text alignment
- **Scorecard**: Positioned at `top: 55px, left: 1453px` with `490x904px` dimensions
- **Artifacts**: Positioned at `top: 836px, left: 1645px` with `240x220px` dimensions
- **Libations**: Positioned at `top: 836px, left: 950px` with `270x270px` dimensions

### 🎨 **Visual Improvements**
- **Universal Font**: Implemented DisneyHeroic font throughout entire interface
- **Color Consistency**: Standardized dark brown (`#2F1C10`) for all text elements
- **Font Sizing**: Optimized font sizes for better readability (16px-26px range)
- **Text Spacing**: Tightened gaps between text elements for compact layout

### 📝 **Text Content Updates**
- **KNOWLEDGE Header**: Added centered "KNOWLEDGE" heading above ante line
- **Blind Information**: Added styling for blind status display
- **Start Screen**: Removed duplicate "Dice of Dionysus" text (now in asset)
- **Button Styling**: Updated Play/Collection buttons to use DisneyHeroic font

### 🎲 **Game Element Improvements**
- **Dice Size**: Increased to 95px with better visibility
- **Roll Button**: Enlarged to 437x262px for better interaction
- **Score Categories**: Improved spacing and readability
- **Asset Boundaries**: Optimized all asset containers for proper fit

### 🔧 **Technical Improvements**
- **CSS Cleanup**: Removed conflicting layout systems
- **Z-Index Management**: Proper layering for all UI elements
- **Responsive Disabled**: Fixed 1920x1080 layout for consistent display
- **Overflow Handling**: Fixed clipping issues with proper overflow settings

### 📊 **Layout Specifications**
- **Game Container**: 1920x1080 fixed dimensions
- **Content Area**: 1728x864px with proper margins
- **Asset Positioning**: All elements use absolute positioning with precise coordinates
- **Font Hierarchy**: Consistent DisneyHeroic font with appropriate sizing

### 🎯 **Key Features**
- **Precise Positioning**: All assets positioned with exact pixel coordinates
- **Consistent Typography**: DisneyHeroic font throughout interface
- **Optimized Spacing**: Tight, readable text layouts
- **Professional Appearance**: Clean, organized interface design

### 🔄 **Backup Information**
- **Date**: Current session
- **Files Modified**: `css/styles.css`, `index.html`
- **Key Changes**: Asset positioning, font implementation, layout optimization
- **Status**: All changes tested and functional

---

## Version 1.0.0 - Initial Release
- Base game functionality
- Original layout system
- Basic asset integration 