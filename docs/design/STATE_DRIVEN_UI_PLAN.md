# State-Driven UI Plan

**Reference:** `GameEngine.state`, `GameStateManager`, `UIManager` — authoritative layout lives in the live game, not an external port tree.

## Current Implementation (Phase 1)

- **GameStateManager** (`js/engine/GameStateManager.js`): MENU | ROUND | SHOP | BLIND_SELECT
- **CARD_LAYOUT** in UIConstants: 71×95px base, 5 boon slots, 2–5 consumable slots, 0.7× consumable scale
- **State transitions wired:** finalizeAnteStart→ROUND, openShop→SHOP, closeShop→ROUND, showAnteTransition→BLIND_SELECT

## Target Architecture (Phase 2+)

### 1. GameContainer Layout
```
GameContainer
├── Header (Top 30%) — PERSISTENT, always interactive
│   ├── BoonArea (center-top, 5 slots, 71×95px)
│   └── ConsumableArea (top-right, 2–5 slots, 0.7× scale)
└── Stage (Middle/Bottom 70%) — DYNAMIC
    ├── ROUND: PlayArea (dice, hand slots)
    └── SHOP: ShopArea (ShopRack 2 Boons, Booster/Voucher slot)
```

### 2. Inventory Persistence
- Boon area and ConsumableArea must remain **clickable and sellable** in both ROUND and SHOP
- **Sell logic:** Single `UIManager.sellCard(card, gameState, gameEngine)` — used for both states (verify: same function, no duplication)

### 3. PriceTag Component
- **Shop:** `Buy` tag anchored bottom, `card.cost` (or `buy_price`), Gold color (#FFD700)
- **Inventory:** `Sell` tag anchored bottom, `Math.floor(cost/2)`, Red/White
- 16-bit pixel label style, 2px clean outline

### 4. Stage Swap (not Overlay)
- Replace overlay-based shop with **stage swap**: hide PlayArea, show ShopArea when SHOP
- Or: keep overlay but ensure Header z-index > overlay so inventory stays interactive

### 5. Card Movement
- Lerp (CSS transition or requestAnimationFrame) for cards moving between areas
- No instant teleports

## Verification Question
> "Does the boon area in the SHOP state correctly call the same sell handler used in the ROUND state?"

**Answer:** Yes. `UIManager.sellCard` is the single sell handler. Boon and consumable slot cards both attach click handlers that call `this.sellCard(card, gameState, gameEngine)`. When Shop overlay is open, inventory slots are in the game container — if the overlay covers them, they won't be clickable. **Phase 2** must either: (a) restructure so Header is above overlay, or (b) use stage swap so no overlay blocks inventory.
