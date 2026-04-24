# Card Metadata Reference
**Comprehensive documentation of all card types, their properties, and metadata**

## Overview
Dice of Dionysus has 4 main card categories, all inheriting from the base `Card` class:
1. **Boons** (Jokers) - Passive effects with timing system
2. **Worship Cards** - Increase favour for specific categories
3. **Libations** - Consumable cards with instant effects
4. **Artifacts** - Permanent passive bonuses (like Balatro vouchers)

---

## 1. Boons (Jokers)

### Class: `Joker` (extends `Card`)
**File:** `js/classes/Joker.js`

### Core Properties
```javascript
{
    id: string,              // Unique identifier (e.g., "hestias_hearth")
    name: string,            // Display name (e.g., "Hestia's Hearth")
    rarity: string,          // "rustic" | "vibrant" | "epic"
    cost: number,            // Purchase cost (3/5/8 for rustic/vibrant/epic)
    sellValue: number,       // 25% of cost (Balatro-inspired)
    effect: string,          // Effect description shown on card
    description: string,     // Detailed flavor text
    type: "joker",           // Always "joker" for boons
    
    // Boon-specific
    timing: {                // Balatro-inspired timing system
        before_roll: boolean,
        after_roll: boolean,
        before_score: boolean,  // Most common - modifies pips/favour
        after_score: boolean,   // Post-scoring effects (gold, etc.)
        turn_start: boolean,
        turn_end: boolean,
        ante_end: boolean,
        shop_enter: boolean,
        shop_exit: boolean,
        sell: boolean          // Triggers when ANY card is sold
    },
    
    triggers: Array,         // Legacy - mostly replaced by timing
    stackable: boolean,      // Can have multiple copies (default: false)
    conditions: Object,      // Activation conditions
    
    // Runtime stats (tracked during play)
    timesTriggered: number,  // How many times effect activated
    totalValue: number,      // Total value generated
    isActive: boolean        // Whether currently enabled
}
```

### Rarity Tiers
- **Rustic** (Common) - Cost: 3g, Weight: 45%
- **Vibrant** (Uncommon) - Cost: 5g, Weight: 35%
- **Epic** (Rare) - Cost: 8g, Weight: 20%

### Timing System
Boons trigger at specific game moments via `onTimingEvent(timing, gameState, eventData)`:
- **turn_start** - At start of turn (AFTER default rolls set)
- **before_roll** - Before dice are rolled
- **after_roll** - After dice rolled (rarely used)
- **before_score** - Before scoring calculation (PRIMARY - pips/favour bonuses)
- **after_score** - After score confirmed (gold, card draws, etc.)
- **turn_end** - End of turn
- **ante_end** - End of ante
- **sell** - When ANY card is sold

### Implementation Pattern
1. Define in `js/data/gameData.js` with timing flags
2. Implement effect in `js/classes/Joker.js` → `applyTimingEffect()` switch statement
3. Return modified `eventData` object

### Example Boon Definition
```javascript
{
    id: "hestias_hearth",
    name: "Hestia's Hearth",
    rarity: "vibrant",
    cost: 5,
    sellValue: 1,
    effect: "If all 5 dice are odd or all 5 are even, +3 Favour.",
    timing: { before_score: true }
}
```

---

## 2. Worship Cards

### Class: `WorshipCard` (extends `Card`)
**File:** `js/classes/WorshipCard.js`

### Core Properties
```javascript
{
    id: string,              // "worship_artemis", "worship_zeus", etc.
    name: string,            // "Blessing of Artemis"
    god: string,             // God name (e.g., "Artemis", "Zeus")
    rarity: "worship",       // Always "worship" (static category)
    cost: number,            // Always 3g
    sellValue: number,       // Default 0; right-click to reveal sell tag in inventory (see 7-call-upon-able)
    effect: string,          // "+1 Favour when scoring [Category]"
    type: "worship",         // Always "worship"
    
    // Worship-specific
    worshipType: string,     // "level" | "bonus" | "special"
    worshipValue: number,    // Amount of worship (usually 1)
    category: string         // Derived from god (e.g., "Ones", "Full House")
}
```

### God to Category Mapping
**Source:** `js/config/GameConstants.js` → `GOD_TO_CATEGORY` (category→god), `GOD_METADATA` (god→category)

```javascript
// Category → God (GOD_TO_CATEGORY)
'Ones' → 'Artemis', 'Twos' → 'Aphrodite', 'Threes' → 'Morpheus',
'Fours' → 'Hera', 'Fives' → 'Athena', 'Sixes' → 'Heracles',
'Three of a Kind' → 'Hephaestus', 'Four of a Kind' → 'Ares', 'Full House' → 'Dionysus',
'Small Straight' → 'Hermes', 'Large Straight' → 'Apollo', 'Yahtzee' → 'Zeus', 'Chance' → 'Nyx',
'Sevens' → 'The Pleiades', 'Eights' → 'Poseidon', 'Nines' → 'The Nine Muses'
```

### God Gender Metadata
**See:** `js/config/GameConstants.js` → `GOD_METADATA`

**Female Gods (8):** Artemis, Aphrodite, Athena, Hera, Nyx, The Pleiades, The Nine Muses

**Male Gods (9):** Apollo, Ares, Dionysus, Hephaestus, Heracles, Hermes, Morpheus, Poseidon, Zeus

### Usage Pattern
- Worship cards are consumables (stored in `gameState.consumables`)
- Using a worship card increases `gameState.worshipLevels[god]` by 1
- Worship level adds +1 favour when scoring that god's category
- Worship cards are single-use and removed after application

### Example Worship Definition
```javascript
{
    id: "worship_athena",
    name: "Blessing of Athena",
    god: "Athena",
    rarity: "worship",
    cost: 3,
    effect: "+1 Favour when scoring Fives."
}
```

---

## 3. Libations

### Class: `LibationCard` (extends `Card`)
**File:** `js/classes/LibationCard.js`

### Core Properties
```javascript
{
    id: string,              // "kyphi_mead", "the_eucharist", etc.
    name: string,            // "Kyphi Mead", "The Eucharist"
    rarity: "libation",      // Always "libation" (static category)
    cost: number,            // 2-3g typically
    sellValue: number,       // Default 0; right-click to reveal sell tag in inventory (see 7-call-upon-able)
    effect: string,          // Effect description
    type: "instant",         // Effect type (always instant currently)
    
    // Libation-specific
    ruleType: string,        // "libation" (most use this)
    effectType: string,      // "instant" | "hand" | "next_hand" | "ante"
    maxUses: number,         // Always 1 (single-use)
    usesLeft: number,        // Always 1 initially
    timing: string           // "anytime" (can be used anytime)
}
```

### Libation Types
All current libations are **instant** consumables that:
1. Enhance die faces (Parchment, Iron, Gold, Mother of Pearl, Wild)
2. Modify die values permanently (±1)
3. Grant gold (Kylix of the Hermit - double money)
4. Grant worship levels (The Eucharist, Divine Guidance)

### Enhancement Mapping
- **Kyphi Mead** → Parchment (25% +1 favour OR 15% +5 gold when scored)
- **Tisane of Hephaestus** → Iron (+5 pips when scored)
- **Ambrosial Krasi** → Gold (+1 gold when scored)
- **Retsina of Echoes** → Mother of Pearl (adds adjacent die value)
- **Soma of the Wild** → Wild (randomly ±1 or same when rolled)
- **Elixir of Lethe** → Reduce die face by 1 permanently
- **Chalice of Helios** → Increase die face by 1 permanently

### Usage Pattern
- Libations are stored in `gameState.consumables`
- Clicking a libation opens UI for selection (die face, god, etc.)
- Applied via `LibationCard.applyLibationEffect(gameState, gameEngine)`
- Removed from consumables after use

### Example Libation Definition
```javascript
{
    id: "kyphi_mead",
    name: "Kyphi Mead",
    rarity: "libation",
    cost: 2,
    sellValue: 0,
    effect: "Enhance a die face to Parchment.",
    type: "instant"
}
```

---

## 4. Artifacts

### Class: `Artifact` (extends `Card`)
**File:** `js/classes/Artifact.js`

### Core Properties
```javascript
{
    id: string,              // "artifact_temple_market", "sundial_plus", etc.
    name: string,            // "Temple Market", "Chronos' Hourglass"
    rarity: "artifact",      // Always "artifact"
    cost: number,            // 12g base, 20g upgraded
    sellValue: number,       // Always 0 (cannot sell artifacts)
    effect: string,          // Effect description
    description: string,     // Detailed description
    type: "artifact",        // Always "artifact"
    
    // Artifact-specific
    isUpgraded: boolean,     // Whether this is the upgraded version
    baseArtifactId: string,  // ID of base version (for upgrades)
    passive: boolean         // Always true (artifacts are passive)
}
```

### Artifact System (Balatro-Inspired)
- Artifacts have **base** and **upgraded** versions (like Balatro vouchers)
- Purchasing base version unlocks upgraded version in shop
- Cannot sell artifacts (permanent investment)
- All artifacts cost 10g base, 20g upgraded

### Artifact Pairs
Each artifact has a base → upgraded path:
- **Temple Market** → **Merchant's Arrival** (shop size +1 → prices -25%)
- **Crystal Ball** → **Sibyl's Vision** (libation slot +1 → ?)
- **Telescope** → **Observatory** (worship slot +1 → ?)
- **Sundial** → **Chronos' Hourglass** (? → free reroll)
- **Shrine** → **Grand Temple** (boon slot +1 → ?)

### Usage Pattern
- Artifacts stored in `gameState.artifacts`
- Effects applied passively in `GameEngine.applyArtifactEffects()`
- Cannot be sold or removed once purchased

### Example Artifact Definition
```javascript
artifacts: {
    temple_market: {
        base: {
            id: "artifact_temple_market",
            name: "Temple Market",
            effect: "Shop inventory size increased by 1.",
            cost: 12
        },
        upgraded: {
            id: "artifact_merchant_arrival",
            name: "Merchant's Arrival",
            effect: "All shop prices reduced by 25%.",
            cost: 20,
            baseArtifactId: "artifact_temple_market"
        }
    }
}
```

---

## Base Card Properties (All Cards)

### Inherited from `Card` class
```javascript
{
    // Identity
    id: string,              // Unique identifier
    name: string,            // Display name
    type: string,            // "joker" | "worship" | "libation" | "artifact"
    
    // Economy
    cost: number,            // Purchase cost in gold
    sellValue: number,       // Sell value (0 for worship/libations/artifacts)
    
    // Categorization
    rarity: string,          // Rarity tier or card category
    
    // Theming
    god: string,             // Associated god (if any)
    effect: string,          // Short effect description
    description: string,     // Detailed flavor text
    
    // Usage tracking
    isActive: boolean,       // Whether currently enabled
    usesLeft: number,        // Remaining uses (-1 = unlimited)
    maxUses: number,         // Maximum uses (-1 = unlimited)
    timesTriggered: number,  // Times effect activated
    totalValue: number,      // Total value generated
    acquired: timestamp      // When acquired
}
```

---

## Rarity System

### Boon Rarities (Dynamic)
```javascript
"rustic"   // Common   - 45% chance, 3g cost
"vibrant"  // Uncommon - 35% chance, 5g cost
"epic"     // Rare     - 20% chance, 8g cost
```

### Static Categories (Not Rarities)
```javascript
"worship"   // All worship cards (equal chance)
"libation"  // All libations (equal chance)
"artifact"  // All artifacts (equal chance)
```

### Rarity Colors
```javascript
'rustic': '#8B4513'    // Saddle Brown
'vibrant': '#4682B4'   // Steel Blue
'epic': '#9932CC'      // Dark Orchid
'worship': '#FFD700'   // Gold
'libation': '#8B008B'  // Dark Magenta
'artifact': '#FFFFFF'  // White
```

---

## Card Storage in Game State

```javascript
gameState = {
    // Boons (active effects)
    jokers: Array<Joker>,              // Max: boonSlots (default 5)
    
    // Consumables (worship + libations)
    consumables: Array<WorshipCard | LibationCard>,  // Max: consumableSlots (default 2)
    
    // Artifacts (permanent bonuses)
    artifacts: Array<Artifact>,        // No limit
    
    // Capacity
    boonSlots: number,                 // Default 5, increased by artifacts
    consumableSlots: number,           // Default 2, increased by artifacts
    
    // Worship system
    worshipLevels: {                   // God name → level
        'Athena': number,
        'Zeus': number,
        // ... all 15 gods
    }
}
```

---

## Shop Distribution

### Direct Sales (2-3 items per shop)
- 40% chance: Boon (rarity-weighted)
- 30% chance: Worship card (all equal chance)
- 30% chance: Libation (all equal chance)

### Packs (1-2 packs per shop)
- **Boon Pack** (4g) - 3 boons, take 1
- **Worship Pack** (3g) - 3 worship cards, take 1
- **Libation Pack** (5g) - 3 libations, take 1

### Artifacts (1 per shop)
- Base artifact (if not owned)
- Upgraded artifact (if base owned)

---

## Card Metadata Usage Examples

### Query by Type
```javascript
// Get all boons
CardData.jokers  // Array of 60+ boons

// Get all worship cards
CardData.worship  // Array of 15 worship cards (one per god)

// Get all libations
CardData.libations  // Array of 10 libations

// Get all artifacts
CardData.artifacts  // Object with artifact pairs
```

### Query by Rarity
```javascript
// Get all epic boons
CardData.jokers.filter(b => b.rarity === 'epic')

// Get all rustic boons
CardData.jokers.filter(b => b.rarity === 'rustic')
```

### Query by God
```javascript
// Get worship card for Athena
CardData.worship.find(w => w.god === 'Athena')

// Get all boons associated with Zeus
CardData.jokers.filter(b => b.god === 'Zeus')
```

### Query by Timing
```javascript
// Get all before_score boons (most common)
CardData.jokers.filter(b => b.timing?.before_score)

// Get all turn_start boons
CardData.jokers.filter(b => b.timing?.turn_start)
```

### Query by Gender (NEW)
```javascript
// Get all boons associated with female gods
const femaleGods = GodUtils.getFemaleGods();
CardData.jokers.filter(b => b.god && femaleGods.includes(b.god))

// Get all worship cards for male gods
const maleGods = GodUtils.getMaleGods();
CardData.worship.filter(w => GodUtils.isMale(w.god))
```

---

## Adding New Cards

### New Boon Checklist
1. ✅ Add to `js/data/gameData.js` → `CardData.jokers[]`
2. ✅ Set timing flags (usually `before_score: true`)
3. ✅ Implement in `js/classes/Joker.js` → `applyTimingEffect()` switch
4. ✅ Add to `tracking/card_database.csv`
5. ✅ Update `.cursor/context/CONSOLIDATED_BOON_REFERENCE.md`
6. ✅ Test with seed for determinism
7. ✅ Add asset to `ART/` and `js/data/assetMapping.js` (optional)

### New Worship Card Checklist
1. ✅ Add to `js/data/gameData.js` → `CardData.worship[]`
2. ✅ Ensure god is in `GOD_METADATA`
3. ✅ Add to `tracking/card_database.csv`
4. ✅ Add asset to `ART/` and `js/data/assetMapping.js` (optional)

### New Libation Checklist
1. ✅ Add to `js/data/gameData.js` → `CardData.libations[]`
2. ✅ Implement effect in `js/classes/LibationCard.js` → `applyLibationEffect()` switch
3. ✅ Add to `tracking/card_database.csv`
4. ✅ Add asset to `ART/` and `js/data/assetMapping.js` (optional)

### New Artifact Checklist
1. ✅ Add base + upgraded to `js/data/gameData.js` → `CardData.artifacts{}`
2. ✅ Implement in `js/game/GameEngine.js` → `applyArtifactEffects()`
3. ✅ Test shop unlock progression
4. ✅ Update `.cursor/context/BALATRO_DESIGN_PRINCIPLES.md` if UI/economy changes

---

## Card Rendering

### Render Modes
```javascript
card.render(isShopItem, isDirectSale)
```

| Mode | isShopItem | isDirectSale | Button | Location |
|------|------------|--------------|--------|----------|
| Shop Direct Sale | true | true | Buy (green) | Shop direct sales |
| Pack Card | true | false | Take (blue) | Pack opening view |
| Inventory | false | false | Sell (red) | Player inventory |

### Visual Components
- **Background Image** - From `AssetMapping` (if asset exists)
- **Frame** - Card type frame overlay
- **Buy/Sell/Take Label** - Action button with price
- **Type Indicator** - "Boon" / "Worship" / "Libation" badge
- **Uses Counter** - For limited-use cards
- **Dynamic Stats** - Live pips/favour display (boons only)
- **Rarity Border** - Color-coded by rarity

---

## Metadata Access Patterns

### From Game Code
```javascript
// In Joker.applyTimingEffect()
const god = this.god;  // Access god property
if (GodUtils.isFemale(god)) {
    // Gender-specific effect
}

// In GameEngine
const category = 'Fives';
const god = this.getGodForCategory(category);  // Returns 'Athena'
const gender = GodUtils.getGender(god);  // Returns 'female'
```

### From Console (Debugging)
```javascript
// Get all female god worship cards
CardData.worship.filter(w => GodUtils.isFemale(w.god))

// Get all epic boons with before_score timing
CardData.jokers.filter(b => 
    b.rarity === 'epic' && b.timing?.before_score
)

// Find boons by name
CardData.jokers.find(b => b.name.includes('Athena'))

// Count cards by type
console.log({
    boons: CardData.jokers.length,
    worship: CardData.worship.length,
    libations: CardData.libations.length,
    artifacts: Object.keys(CardData.artifacts).length
})
```

---

## Future Metadata Ideas

### Potential Additions
- **Element** - Fire, Water, Earth, Air (for themed synergies)
- **Era** - Primordial, Titan, Olympian (for timeline-based effects)
- **Alignment** - Chaos, Order, Neutral (for philosophical boons)
- **Constellation** - For celestial-themed boons
- **Season** - Spring, Summer, Fall, Winter (for Demeter synergies)

### Synergy Metadata
Cards already check for god synergies:
```javascript
card.synergizesWith(otherCard)  // Returns true if same god
```

Could expand to:
- Gender-based synergies (goddesses empower each other)
- Domain-based synergies (war + wisdom combo)
- Rarity-based synergies (epic cards boost other epics)

---

## References

### Code Files
- `js/classes/Card.js` - Base card class
- `js/classes/Joker.js` - Boon implementation
- `js/classes/WorshipCard.js` - Worship implementation
- `js/classes/LibationCard.js` - Libation implementation
- `js/classes/Artifact.js` - Artifact implementation
- `js/data/gameData.js` - All card definitions
- `js/config/GameConstants.js` - God metadata, rarities, costs

### Documentation
- `.cursor/context/CONSOLIDATED_BOON_REFERENCE.md` - Boon patterns and mechanics
- `.cursor/context/development_workflow.md` - Game mechanics and formulas
- `.cursor/context/GOD_METADATA_REFERENCE.md` - God gender and domain info
- `tracking/card_database.csv` - Complete card database

---

## Summary Table

| Card Type | Class | Count | Rarity | Cost | Uses | Storage | Effect Type |
|-----------|-------|-------|--------|------|------|---------|-------------|
| Boon | Joker | 60+ | rustic/vibrant/epic | 3/5/8g | Unlimited | jokers[] | Timing-based passive |
| Worship | WorshipCard | 15 | worship | 3g | Single-use | consumables[] | +1 favour per god |
| Libation | LibationCard | 10 | libation | 2-3g | Single-use | consumables[] | Instant effect |
| Artifact | Artifact | 5 pairs | artifact | 12/20g | Permanent | artifacts[] | Passive bonus |

**Total Cards:** ~100 unique cards across all types

