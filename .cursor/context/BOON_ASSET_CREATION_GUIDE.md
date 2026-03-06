# Boon Asset Creation Guide

**Purpose:** Structured workflow for creating consistent boon (joker) card art for Dice of Dionysus.

---

## 1. Technical Specs

| Property | Value |
|----------|-------|
| **Format** | PNG (with transparency if needed) |
| **Dimensions** | **284×380px** (2× display size for crispness) or **142×190px** minimum |
| **Aspect ratio** | ~3:4 (0.75) — matches 71×95 base, 142×190 inventory |
| **Display sizes** | Boon slots: 142×190px; Shop: 140×187px |
| **Style** | 16-bit pixel art, crisp, no blur |
| **Shading** | Dithering for gradients; hard edges; 2px outlines |
| **Location** | `game/public/ART/` |

---

## 2. Naming Convention

- **Filename:** `boon name lowercase.png` (e.g. `hestias hearth.png`, `mt olympus.png`)
- **assetMapping key:** `boon_id` from gameData (e.g. `hestias_hearth`, `mt_olympus`)

---

## 3. Structured Workflow

### Option A: AI Image Generation (Stable Diffusion, DALL·E, etc.)

Use a **consistent prompt template** for each boon:

```
[STYLE] 16-bit pixel art, Greek mythology card, Balatro-style joker card, 
crisp edges, no blur, dithering for shading, 2px outline, 
vibrant retro palette, centered composition.

[SUBJECT] [Boon name] — [one-line visual concept]

[FRAME] Card-shaped, portrait orientation, 3:4 aspect ratio.
```

**Example prompts per boon:**

| Boon | Visual concept |
|------|----------------|
| Hestia's Hearth | Warm hearth flame, home, hospitality |
| Charon's Ferry Fare | Obol coin, river Styx, boat |
| Achilles' Heel | Shield with single vulnerable spot |
| Midas Touch | Golden hand, coins |
| Icarus Wings | Wax wings, sun, flight |
| Mt Olympus | Mountain peak, clouds, divine summit |
| Forge of Hephaestus | Anvil, hammer, fire |
| Prometheus' Gift | Flame, torch, chains |
| Chaos Primordial | Void, swirling darkness, primordial |

### Option B: Pixel Art (Aseprite, Piskel, etc.)

1. **Canvas:** 142×190 or 284×380
2. **Palette:** Limit to 16–32 colors for 16-bit feel
3. **Layers:** Background → symbol/icon → border/outline
4. **Export:** PNG, no scaling (1:1 pixel)

### Option C: Vector → Raster (Illustrator, Inkscape)

1. Design at 284×380 artboard
2. Use pixel-perfect snap (1px grid)
3. Export as PNG at 2× (568×760) then downscale to 284×380 for crisp pixels

---

## 4. Checklist for Each New Boon Asset

- [ ] Create image at 284×380px (or 142×190 minimum)
- [ ] Save as PNG in `game/public/ART/`
- [ ] Filename: lowercase, spaces OK (e.g. `mt olympus.png`)
- [ ] Add to `game/js/data/assetMapping.js`:
  ```js
  'boon_id': 'filename.png',
  ```
- [ ] Verify in game: `?test=boon:boon_id`

---

## 5. Prompt Library (Copy-Paste)

Use these as starting points; adjust `[Boon name]` and `[concept]`:

```
16-bit pixel art, Greek mythology, Balatro joker card, centered icon/symbol, 
crisp pixel edges, dithering, no blur, 2px black outline, 
warm amber and olive palette, portrait 3:4 ratio.
No text, no writing — symbol only. PORTRAIT orientation — image must be TALLER than wide (3:4 ratio, vertical playing card). No landscape or widescreen. — [Boon name]: [concept]
```

**Rarity-based color hints:**
- Rustic: earth tones, brown, green
- Vibrant: gold, purple, blue
- Epic: deep purple, gold, celestial
- Worship: god-specific (Artemis = bow/green, Zeus = lightning/gold)

---

## 6. Integration

After adding the PNG to `ART/` and `assetMapping.js`, boons with a mapping will display the image. Boons without a mapping use the white fallback design.

**Reference:** `game/js/data/assetMapping.js` → `jokers` object

---

## 7. Boon Card Factory Tool

A web-based tool (similar to Balatro Jimbo Card Factory) helps create boon images and text:

- **URL:** Run `npm run dev` and open `http://localhost:3000/dev/boon-factory.html`
- **Features:** Select boon, edit name/effect/description, upload image, live keyword formatting, AI prompt copy, save/load .jimbo, export PNG, copy assetMapping/gameData entries
- **Import workflow:** Export from factory, save to `tools/exports/` (or project root). Run `npm run import-boon` or `npm run import-boon tools/exports/<id>-export.json`
- **Update boon list:** After changing `gameData.js` jokers, run `npm run extract-boons` to refresh `game/public/boon-data.json`
- **Auto-generate images:** Run `npm run image-gen` (requires `OPENAI_API_KEY`). Then click "Generate Image" in the factory to create images via DALL-E 3.
