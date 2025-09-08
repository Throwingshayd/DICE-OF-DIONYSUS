## Dice of Dionysus

An elegant dice strategy game of pips, favour, and devotion. Cast the bones, court the gods, pour libations, and climb through antes as you build your pantheon of power.

### What this is
- Theme: Mythic Greco ambience with a clean, readable UI. Worship cards raise your favour with specific gods; libations grant run-shaping effects.
- Core loop: Roll dice up to three times, optionally hold dice between rolls, then score one category per turn. Progress through antes by meeting score thresholds.

### How to play
1) Start a run
   - Open `index.html` in a modern desktop browser.
   - Click Play (optionally enter a seed to make the run reproducible).

2) Rolling and holding
   - Press “Cast the Bones” or hit R to roll. You have 3 rolls per turn.
   - Click dice to hold/release them between rolls.
   - The live score always shows “pips x favour”. When resting (no hover/before first roll) it shows `0 x 0`.

3) Scoring
   - Hover a score category to preview its current “pips x favour”.
   - Click a category to score it (or scratch it if invalid).
   - Upper section (Ones–Sixes): sum of matching faces (plus any pips bonuses you’ve earned).
   - Lower section pip bonuses are automatically added when valid:
     - Three of a Kind: +15 pips
     - Four of a Kind: +20 pips
     - Full House: +25 pips
     - Small Straight: +30 pips
     - Large Straight: +40 pips
     - Heureka (Yahtzee): +50 pips

4) Favour (multiplier)
   - Base favour is always 1x.
   - Each worship level for the category’s god adds +1 to favour (first worship makes it 2x, then 3x, etc.).
   - Some artifacts and effects can modify favour or pips before the multiply step.

5) Worship, Libations, Artifacts
   - Worship cards: Static, per-use boosts to favour aligned to specific gods/categories.
   - Libations: Powerful one-use “house rules” that alter your run in thematic ways.
   - Artifacts: Persistent economy/slot/bonus items you buy in the shop.

6) Shop, Packs, and Layout
   - The shop appears at fixed moments during the run. Layout:
     - Top row: Individual items (Divine Artifacts and Wares).
     - Middle row: Packs (Boon/Worship/Libation).
     - Bottom row: category buttons and actions (Sell Mode, Reroll, Continue).
   - Items are represented by assets only; hover to see a white tooltip below (name, description, cost).
   - Pack contents open in a horizontal layout; items again reveal their tooltip on hover.

7) Antes and thresholds
   - Ante 1 threshold: 300.
   - Each subsequent ante increases the threshold by +250 (e.g., 300 → 550 → 800 → …).

8) Bonus categories
   - Additional categories (Sevens/Eights/Nines) can unlock via Heureka bonuses in-run.

### Controls
- R: Roll
- 1–5: Toggle hold on the corresponding die
- Esc: Back (from game or collection)

### Running locally
- Just open `index.html` in a modern desktop browser on a desktop machine (fixed 1920×1080 layout).
- No build step required; assets and scripts are included.

### Debugging
- The in-game console is the primary debugging surface.
- Development helpers can be enabled in `js/Main.js` (debug mode).

### Art and UI notes
- Worship and Libation cards globally use `ART/worship frame.png` and `ART/libation frame.png` frames (sized with background-size: contain to avoid cropping).
- Shop and pack items hide on-asset text by default; hover reveals a white tooltip under the item.

### License (Australia-focused)
Copyright © 2025 Dice of Dionysus team. All rights reserved.

This work is protected under the Copyright Act 1968 (Cth) and applicable laws of Australia. No part of this game (including, without limitation, source code, gameplay logic, audiovisual elements, visual identities, names, characters, likenesses, and unique mechanics) may be reproduced, adapted, distributed, publicly performed, communicated, or made into derivative works without the express written permission of the rights holder(s).

Limited personal-use permission: You may download and run the game locally for personal entertainment and evaluation. Any commercial use, redistribution, re-hosting, decompilation, or re-publication is prohibited without prior written approval.

No warranties: This software and content are provided “as is” without warranty of any kind. To the extent permitted by law, the authors disclaim all warranties and liability for any damages or losses arising from use of this work.

Third-party names and marks: Any references to third-party works, studios, or names are for descriptive purposes only. They are the property of their respective owners and used without intent to infringe.

If you wish to license, adapt, or distribute this work, please contact the authors to obtain written permission.

### Thank you
- loclathunk - for Balatro - 
- B. Muraresku - for The immortality key - 
- Supergiant - for Bastion & Hades - 
- Parmenides - A god amongst men - 
- “Honey” - the honey to the bee - 

### Credits & Attribution
- Visual/UI concepts align with a clean, legible, tactile aesthetic inspired by tabletop dice, ancient scrolls, and mythic motifs.
- Fonts and image assets are included in the `ART/` folder and used in good faith for this project.

### Contact
For licensing, collaboration, or questions, please reach out via DiceofDionysus@gmail.com 

Cheers SKIIBO. 


