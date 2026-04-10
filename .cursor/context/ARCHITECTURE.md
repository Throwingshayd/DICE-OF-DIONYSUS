# 🏛️ Dice of Dionysus - Architecture Documentation

**Version:** 1.4  
**Last Updated:** April 10, 2026  
**Post-Phase 3 Architecture** (line counts and module boundaries refreshed)

*Agent orientation: `.cursor/skills/dice-ship/SKILL.md` + SOUL.md; this doc is structural detail.*

---

## 🎯 System Overview

Dice of Dionysus is a single-page application (SPA) built with vanilla JavaScript, inspired by Balatro's design philosophy. The game uses a class-based architecture with clear separation of concerns.

### Core Philosophy

- **Simplicity:** Vanilla JS, no framework overhead
- **Modularity:** Clear boundaries between systems
- **Maintainability:** Well-documented, consistent patterns
- **Performance:** 60fps target, minimal bundle size
- **Thematics:** Greek mythology themed gameplay

---

## 📁 File Structure

```
DICE-OF-DIONYSUS-WORKING/
├── game/                      # Game application (Vite root)
│   ├── index.html            # Main entry point
│   ├── dev/                   # Dev-only tools
│   │   └── boon-factory.html # Boon Card Factory (AI image gen, export)
│   ├── css/                  # Stylesheets
│   │   ├── styles.css        # Main game styles
│   │   ├── balatro-effects.css   # Visual effects
│   │   ├── juice-effects.css     # Juice/feedback
│   │   └── visual-tokens.css     # Design tokens (pixel-art, outlines)
│   │
│   ├── js/
│   │   ├── Main.js               # Application controller & entry point
│   │   │
│   │   ├── classes/              # Game entities
│   │   │   ├── Card.js           # Base card class
│   │   │   ├── Die.js            # Die with face-specific enhancements
│   │   │   ├── Boon.js           # Boon (equipped joker-style cards)
│   │   │   ├── boonTimingHandlers.js  # Large before_score switch (loaded before Boon.js)
│   │   │   ├── LibationCard.js   # Consumable libations
│   │   │   ├── WorshipCard.js    # Worship cards for favour
│   │   │   └── Artifact.js
│   │
│   │   ├── engine/               # Scoring logic (decoupled)
│   │   │   ├── HandEvaluator.js  # Category evaluation
│   │   │   ├── ScoringEngine.js  # Orchestrator
│   │   │   ├── SafeMath.js       # Overflow-safe arithmetic
│   │   │   └── GameStateManager.js  # State-driven UI (ROUND/SHOP/BLIND_SELECT)
│   │   │
│   │   ├── config/               # Configuration constants
│   │   │   ├── GameConstants.js  # Game balance (gold, rolls, slots)
│   │   │   ├── ScoringConstants.js # Scoring thresholds & bonuses
│   │   │   └── UIConstants.js    # Timing, animations, visual config
│   │   │
│   │   ├── data/                 # Game content & configuration
│   │   │   ├── gameData.js       # All cards, packs, artifacts
│   │   │   ├── AnteData_js.js    # Ante definitions & blinds
│   │   │   └── assetMapping.js   # Asset paths & mappings
│   │   │
│   │   ├── game/                 # Core game logic
│   │   │   └── GameEngine.js     # **MAIN ENGINE** (~3,285 lines — see § Monolithic GameEngine)
│   │   │
│   │   ├── ui/                   # UI rendering & interaction
│   │   │   ├── UIManager.js      # UI coordinator (~380 lines); renderers in ui/renderers/
│   │   │   ├── ShopUI.js         # Shop, packs, expulsion (~670 lines)
│   │   │   ├── BalatroEffects.js # Visual effects system (~690 lines)
│   │   │   └── SoundManager.js   # Audio playback
│   │   │
│   │   ├── utils/                # Utility functions
│   │   │   ├── seededRNG.js      # Deterministic random number generator
│   │   │   ├── dataManager.js    # Save/load system
│   │   │   ├── Logger.js         # Centralized logging
│   │   │   ├── JuiceManager.js   # Juice/feedback
│   │   │   └── ParticleSystem.js # Particle effects
│   │
│   └── public/                  # Static assets (served at /); ServiceWorker.js (registered from Main.js)
│       └── ART/                 # Images, music
│           ├── [68 .png files]
│           └── Music/
│               └── [5 .wav files]
│
├── tools/                      # Dev tooling
│   ├── extract-boons.cjs      # Extract jokers → boon-data.json
│   ├── image-gen-server.cjs  # DALL-E 3 image generation (npm run image-gen)
│   ├── import-boon-to-game.cjs # Import boon export into gameData
│   └── exports/              # Boon export files (default save location)
├── tests/                      # Unified test suite
│   ├── unit/                   # Vitest unit tests
│   └── e2e/                    # Playwright E2E
├── docs/                       # Documentation
│   ├── design/                 # Design docs
│   └── archive/                # Historical docs
├── tracking/                   # Bug logs, playtest reports
├── package.json
├── vite.config.js
└── SOUL.md
```

---

## 🎮 Game Flow

### Application Lifecycle

```
1. index.html loads
2. All scripts load in dependency order
3. Main.js initializes App class
4. User sees Start Screen
   ↓
5. User clicks "Play" with optional seed
6. App.startGame() creates GameEngine instance
7. GameEngine.initializeGameState()
8. GameEngine.startGame() → first turn
   ↓
9. Game Loop:
   - Roll dice → Score category → End turn
   - Shop phase between turns
   - Ante progression every 13 turns
   - Repeat until win/loss
```

### Game Loop Detail

```
[Start Turn]
  ↓
[Reset dice, set rollsLeft = 3]
  ↓
[Player rolls dice] ← Can repeat up to 3 times
  ↓
[Player holds dice]
  ↓
[Player scores in category]
  ↓
[Apply Joker/Worship effects]
  ↓
[Check if turn complete]
  ↓
[If turn 13 of ante → Check win condition → Shop/Next Ante]
[Otherwise → Next turn]
```

---

## 🏗️ Core Systems

### 1. GameEngine (game/js/game/GameEngine.js)

**Scale (Apr 2026):** ~~3,285 lines, **~~90+ instance methods** — the primary **god object** for a run. Single source of truth: `**GameEngine.state`**.

**Responsibilities:**

- Game state initialization and mutation
- DOM binding (`bindDOMElements`, `setupDOMEventListeners`) and coordination with `window.uiManager` / `window.shopManager`
- Dice roll pipeline (`rollDice`, `executeRoll`, holds, triggers)
- Scoring (`calculateScore` delegates category math to `ScoringEngine` / `HandEvaluator`; `confirmScore`, animations, live preview)
- Turn / ante / blind progression (`nextTurn`, `endAnte`, win checks)
- Shop handoff (`openShop`, `closeShop`, `showInterestThenOpenShop` cashout UI)
- Boon timing orchestration (`onTimingEvent` on equipped boons; large `before_score` body lives in `boonTimingHandlers.js`)
- Artifacts, consumable targeting modes, save/load (`serializeStateForSave`, `canSave`)

#### Monolithic GameEngine — assessment


| Strength                                                            | Risk                                                           |
| ------------------------------------------------------------------- | -------------------------------------------------------------- |
| One place to read “what happens on a roll/score”                    | High **regression surface**; easy to break unrelated flows     |
| Already delegates pure scoring to `ScoringEngine` / `HandEvaluator` | DOM + animation + rules still interleaved in one class         |
| Shop **stock** is pure in `ShopStockGenerator`                      | Cashout timers, overlays, and shop open/close remain in-engine |


**Practical direction:** Prefer **new pure modules** (inputs/outputs clear, no `window`) for any large feature. **Vertical splits** of `GameEngine.js` (e.g. “animations only”) need careful design so `state` stays single-writer. See `tracking/KNOWN_ISSUES.md` for the live line-count table.

**Key Methods (non-exhaustive):**

- `rollDice()` / `executeRoll()` — roll pipeline
- `calculateScore(category)` / `confirmScore()` — scoring
- `startGame()` / `startAnte()` / `nextTurn()` / `endAnte()` — progression
- `showInterestThenOpenShop()` / `openShop()` / `closeShop()` — economy UI → shop
- `canSave()` / `saveGame()` / `loadGame()` — persistence
- `updateAllUI()` — refresh path into UI layer

**State object (shape, abbreviated):**

```javascript
{
    dice: [Die, Die, Die, Die, Die],
    held: [bool, bool, bool, bool, bool],
    rollsLeft: 3,
    scorecard: { "Ones": 5, "Twos": 10, ... },
    totalScore: 1234,
    gold: 15,
    ante: 1,
    turn: 1,
    boons: [Boon, ...],
    consumables: [WorshipCard, LibationCard, ...],
    artifacts: [Object, ...],
    worshipLevels: { "Zeus": 2, ... },
    // ... many more properties (effect buckets, flags, shop fields)
}
```

---

### 2. UIManager (game/js/ui/UIManager.js)

**Scale (Apr 2026):** ~380 lines — **coordinator**, not the whole UI surface.

**Responsibilities:**

- Wires `GameEngine` to DOM, delegates heavy areas to dedicated modules
- Shop, packs, expulsion → `**ShopUI.js`** (`window.shopManager`)
- Dice / scorecard / info bar → `**game/js/ui/renderers/**` (e.g. `DiceRenderer`, `InfoBarRenderer`)
- Juices and tooltips → `BalatroEffects`, `SoundManager`

**Note:** Older docs that cite “UIManager 1,900+ lines” are obsolete; shop logic moved to `ShopUI.js`.

---

### 3. Card System

All cards inherit from `Card.js` base class.

#### Card (Base Class)

- Properties: id, name, rarity, cost, effect, god
- Methods: `render()`, `canUse()`, `use()`, `toJSON()`

#### Boon (equipped “jokers”)

- Extends `Card`; type `'boon'`
- Timing-based effects (`before_roll`, `before_score`, `after_score`, `turn_start`, `ante_end`, shop, etc.)
- `onTimingEvent(timing, gameState, result)` — `before_score` cases largely implemented in `boonTimingHandlers.js`

#### WorshipCard

- Extends Card
- Type: 'worship'
- Increases favour for specific scoring categories
- `applyWorship(gameState)` - Increase worship level

#### LibationCard

- Extends Card  
- Type: 'libation'
- Consumable effects (die face enhancements, gold doubling, etc.)
- `applyRule(gameState, gameEngine)` - Execute libation effect

---

### 4. Die System

**Die Class (game/js/classes/Die.js)**

- 6 independent faces with individual enhancements
- Face-specific enhancement system
- Permanent modifications (Elixir/Chalice effects)

**Key Features:**

- `faces[1-6]` - Each face has value, enhancements, modifiedValue
- `addFaceEnhancement(face, type)` - Add enhancement to specific face
- `modifyFaceValue(face, delta)` - Permanently change face value
- `hasEnhancementForCurrentFace(type)` - Check if rolled face has enhancement

**Enhancement Types:**

- Parchment: 6.67% for +15 gold OR 10% for +1 favour
- Iron: +5 pips when scored
- Gold: +1 gold when scored
- Mirror: Copies adjacent dice
- Wild: ±1 pips randomly
- Mother of Pearl: Adds adjacent pips

---

### 5. Data Management

**gameData.js** - All card definitions, rarities, packs
**AnteData_js.js** - Ante progression, score requirements, blinds
**assetMapping.js** - Maps card IDs to image assets
**dataManager.js** - Save/load to localStorage

**Data Flow:**

```
gameData.js defines cards
  ↓
GameEngine creates instances from data
  ↓
UIManager renders cards
  ↓
Player interacts
  ↓
GameEngine applies effects
  ↓
dataManager.js saves state
```

---

### 6. Configuration System (**NEW** - Phase 3)

All magic numbers extracted to constants:

**GameConstants.js:**

- Starting values (gold, rolls, dice)
- Progression (max turns, antes)
- Slots (boons, libations)
- Economy (shop reroll cost)

**ScoringConstants.js:**

- Base scores (straights, yahtzee)
- Bonuses (lower section)
- Thresholds (3-of-kind = 3, etc.)

**UIConstants.js:**

- Timing (animations, auto-save)
- Visual config
- Z-index layers

---

### 7. Logging System (**NEW** - Phase 3)

**Logger.js:**

- Log levels: DEBUG, INFO, WARN, ERROR, CRITICAL
- Auto-detects production mode
- Buffers last 100 messages
- Export/download logs for bug reports
- Production mode suppresses debug logs

**Usage:**

```javascript
Logger.debug('Dice rolled', { faces: [1,2,3,4,5] });
Logger.warn('Low gold', { gold: 2 });
Logger.error('Save failed', error);
```

---

## 🔄 Data Flow

### Dice Rolling Flow

```
User clicks "Roll"
  ↓
GameEngine.rollDice()
  ↓
Apply joker turn_start effects
  ↓
Decrement rollsLeft
  ↓
Roll each unheld die
  ↓
Apply joker roll effects
  ↓
Update UI
```

### Scoring Flow

```
User clicks category
  ↓
GameEngine.promptScore(category)
  ↓
GameEngine.calculateScore(category)
  ├─ Check category locked status
  ├─ Get effective die faces
  ├─ Calculate base pips
  ├─ Apply enhancement effects
  ├─ Calculate favour multiplier
  └─ Return {pips, favour, isValid}
  ↓
Show confirmation dialog
  ↓
User confirms
  ↓
GameEngine.confirmScore()
  ├─ Apply joker before_score effects
  ├─ Record score in scorecard
  ├─ Apply joker after_score effects
  ├─ Check win conditions
  ├─ Advance turn/ante
  └─ Update UI
```

### Shop Flow

```
Turn ends / Ante completes
  ↓
UIManager.openShop()
  ↓
UIManager.generateShopStock()
  ├─ Generate artifacts (rarity-weighted)
  ├─ Generate direct sale cards (random from each type)
  ├─ Generate packs
  └─ Render in shop
  ↓
Player buys/rerolls
  ↓
UIManager.handleCardPurchase()
  ├─ Validate gold
  ├─ Validate slots
  ├─ Add to inventory
  ├─ Apply artifact passive effects
  └─ Update UI
  ↓
Player clicks "Continue"
  ↓
UIManager.closeShop()
```

---

## 🎨 UI Architecture

### Screen Management

- **Start Screen:** Menu, seed input, collection
- **Game Screen:** Dice, scorecard, cards, shop
- **Collection Screen:** View all discovered cards

### Overlay System

- **Shop Overlay:** Modal for shopping
- **Confirm Overlay:** Scoring confirmation
- **Pack Opening:** Card selection from packs

### Visual Effects

- **BalatroEffects.js:** Hover effects, animations, particles
- **Card rendering:** Dynamic based on type/rarity
- **Dice animations:** Roll, hold, score effects

---

## 🔌 Extension Points

### Adding New Cards

**1. Boon (Joker):**

```javascript
// Add to gameData.js
{
    id: "new_boon",
    name: "New Boon",
    rarity: "vibrant",
    cost: 4,
    effect: "Description",
    timing: { before_score: true }
}

// Add effect to Joker.js applyTimingEffect()
case 'new_boon':
    // Implementation
    break;
```

**2. Worship Card:**

```javascript
// Add to gameData.js worship array
{ 
    id: "worship_new_god", 
    name: "Blessing of New God",
    god: "New God",
    rarity: "worship",
    cost: 3,
    effect: "+1 Favour when scoring Category"
}
```

**3. Libation:**

```javascript
// Add to gameData.js libations array
{
    id: "new_libation",
    name: "New Libation",
    rarity: "libation",
    cost: 2,
    effect: "Description",
    type: "instant"
}

// Add effect to LibationCard.js applyLibationEffect()
case 'new_libation':
    // Implementation
    break;
```

---

## 🗂️ Key Data Structures

### Game State

See GameEngine.initializeGameState() for full structure.

### Card Object

```javascript
{
    id: "card_id",
    name: "Card Name",
    rarity: "rustic|vibrant|epic|worship|libation|artifact",
    cost: 5,
    sellValue: 3,
    effect: "Effect description",
    type: "joker|worship|libation",
    god: "God Name" (optional),
    timing: { before_score: true, ... } (jokers only)
}
```

### Die Object

```javascript
{
    currentFace: 1-6 (or 0 = unrolled),
    isLocked: bool,
    dieId: number,
    faces: {
        1: { value: 1, enhancements: Set(['gold']), modifiedValue: 1 },
        2: { value: 2, enhancements: Set(), modifiedValue: 2 },
        // ... faces 3-6
    }
}
```

---

## 🎯 Design Patterns

### 1. Inheritance

```
Card (base)
  ├─ Joker (boons)
  ├─ WorshipCard  
  └─ LibationCard
```

### 2. Composition

```
GameEngine contains:
  ├─ state (game data)
  ├─ prng (random generator)
  ├─ dataManager (persistence)
  └─ dom (UI references)
```

### 3. Observer Pattern (implicit)

- UI updates when state changes
- Effects trigger on events (roll, score, turn end)

### 4. Strategy Pattern

- Different scoring strategies per category
- Different enhancement effects per type

---

## ⚙️ Configuration

All game balance is now in `game/js/config/` constants:

```javascript
// Easy to tweak game balance (see game/js/config/GameConstants.js for current values)
GAME_BALANCE.STARTING_GOLD = 6;   // Current
GAME_BALANCE.SHOP_REROLL_COST = 4; // Current
SCORING.YAHTZEE_BASE = 60;
```

Changes to constants automatically apply throughout codebase.

---

## 🔍 Debugging

### Logger Usage

```javascript
Logger.debug('Dice rolled', { faces: [1,2,3,4,5] });  // Dev only
Logger.info('Ante started', { ante: 2 });
Logger.warn('Low gold', { gold: 1 });
Logger.error('Save failed', error);
Logger.critical('Fatal error', error);  // Game-breaking
```

### Export Logs

```javascript
Logger.downloadLogs();  // Downloads log file
Logger.getRecentLogs(50);  // Get last 50 entries
```

### Console Access

```javascript
window.game  // Current GameEngine instance
window.app   // App instance
window.dataManager  // DataManager instance
window.uiManager  // UIManager instance
```

---

## 🚀 Performance

### Optimizations

- **Seeded RNG:** Deterministic, no Math.random()
- **Event delegation:** Minimal event listeners
- **CSS animations:** GPU-accelerated
- **Lazy rendering:** Only render visible cards

### Bundle Size

- **Total:** ~120KB (after Phase 3 cleanup)
- **Scripts:** ~80KB
- **CSS:** ~20KB
- **Assets:** Loaded on demand

---

## 🔐 Save System

### Storage Strategy

- **localStorage:** Auto-save every 30 seconds
- **Checkpoints:** After each roll, after scoring, at shop open
- **Slot:** 'auto' (single save per player)
- **Format:** JSON

### Save Data

```javascript
{
    gameState: { ... },   // serializeStateForSave() ensures plain objects
    prngState: { a, b, c, d }, // SeededRNG state for determinism
    resumePhase: "play" | "shop",
    timestamp: 1234567890,
    version: "1.0"
}
```

### Explicitly Serialized (guaranteed to persist)

- **dice** — Die.toJSON() per die
- **jokers** (boons) — Card.toJSON() per joker
- **artifacts** — Card.toJSON() per artifact
- **consumables** — Card.toJSON() per libation/worship
- **worshipLevels** — plain object (god → level)
- **scorecard**, **enhancementMap**, **unlockedCategories**

### Resume Behaviour

- **play:** Restore play stage (dice, rolls left, held state)
- **shop:** Restore shop stage with same stock (PRNG restored = identical offerings)

### Collection Data (Separate)

```javascript
{
    boons: ["id1", "id2", ...],  // Discovered boons
    artifacts: ["id1", ...],
    worship: ["id1", ...],
    libations: ["id1", ...]
}
```

---

## 🛡️ Error Handling

### Strategy (Phase 3)

1. **Validate inputs** at function boundaries
2. **Return safe defaults** on error (don't throw)
3. **Log errors** with context
4. **Show user-friendly messages** via showMessage()

### Example

```javascript
calculateScore(category) {
    // Validate
    if (!category) {
        Logger.error('Invalid category', { category });
        return { pips: 0, favour: 0, isValid: false };
    }
    
    // Process safely
    try {
        // ... calculation
    } catch (error) {
        Logger.error('Score calculation failed', error);
        return { pips: 0, favour: 0, isValid: false };
    }
}
```

---

## 📊 Terminology


| Code Term   | UI Term           | Description                              |
| ----------- | ----------------- | ---------------------------------------- |
| jokers      | Boons             | Permanent passive effects                |
| consumables | Libations/Worship | One-time use cards                       |
| scorecard   | Scorecard         | Player's scores                          |
| ante        | Ante              | Difficulty level (like Balatro's blinds) |
| pips        | Pips              | Base score value                         |
| favour      | Favour            | Score multiplier                         |
| Yahtzee     | Heureka           | 5-of-a-kind (thematic rename)            |


---

## 🔮 Future Architecture Considerations

### Potential Improvements

1. **Thin GameEngine** — Extract cohesive units (e.g. cashout/shop transition object, animation scheduler) behind stable interfaces; keep `state` mutation in one layer.
2. **Event System** - True pub/sub for loose coupling
3. **TypeScript Migration** - Type safety & better IDE support
4. **State Machine** - Formal state transitions (especially shop / expulsion / targeting modes)
5. **Plugin System** - Modding support

### Technical Debt (Post-Phase 3)

- **GameEngine.js** remains the largest maintenance hotspot (~3.3k lines)
- Routine logging → **Logger**; avoid new `console.`* in `game/js` outside `Logger.js`
- **Tests:** `vitest run` + unit invariants + one Playwright boon spec; combo coverage still manual (see `tracking/KNOWN_ISSUES.md`)

---

## 📚 Additional Resources

- **system_map.md** (same folder) - Data flow, God Objects, technical debt
- **tracking/BUGS_FIXED_LOG.md** - Historical bug fixes

---

*Architecture evolves with each phase - this document will be updated as systems improve.*