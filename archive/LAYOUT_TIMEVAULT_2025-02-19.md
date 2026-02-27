# Game Layout Timevault — Feb 19, 2025

**Purpose:** Restore point for the in-game layout. Use this if layout changes break things.

---

## Key Layout Values (Restore These)

### Game board background (dice table)
- **Location:** Inside `.center-game-area`, first child (before `#playStage`)
- **CSS:**
```css
.game-board-bg {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    background-image: url('../ART/dice table.png');
    background-size: 93%;
    background-position: center;
    background-repeat: no-repeat;
}
```

### Dice container (vertical position)
- **CSS:** `margin-top: 61px` on `.dice-container` / `.diceContainer`

### Main structure

| Component | top | left | width | height |
|-----------|-----|------|-------|--------|
| `.main-game` | 0 | 0 | 1920px | 1080px |
| `.inventory-panel` | 55px | 490px | 963px | 240px |
| `.left-info-column` | 55px | 0 | 490px | 980px |
| `.right-scorecard` | 55px | 1453px | 490px | 980px |
| `.center-game-area` | 260px | 521px | 911px | 749px |

### Dice container full block
```css
.dice-container,
.diceContainer {
    flex-shrink: 0;
    width: 100%;
    max-width: min(100%, 720px);
    aspect-ratio: 1;
    align-self: center;
    margin-top: 61px;
    background: transparent;
    display: flex;
    gap: 10px;
    justify-content: center;
    align-items: center;
    padding: 11px;
    overflow: visible;
    box-sizing: border-box;
}
```

### HTML structure for center-game-area
```html
<div class="center-game-area">
    <div class="game-board-bg" aria-hidden="true"></div>
    <div id="playStage" class="game-stage">
        <div class="play-stage-spacer"></div>
        <div class="dice-container" id="diceContainer"></div>
        <div class="rolling-controls">
            <button id="rollButton" class="roll-button">Cast the Bones</button>
        </div>
        <div class="play-stage-spacer"></div>
    </div>
    <div id="shopStage" class="game-stage hidden">...</div>
</div>
```

---

## Files to Check/Restore
- `css/styles.css` — `.game-board-bg`, `.dice-container`, layout blocks
- `index.html` — `#gameUITemplate` (contains `.game-board-bg` inside `.center-game-area`)
