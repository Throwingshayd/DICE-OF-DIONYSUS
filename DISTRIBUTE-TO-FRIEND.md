# Share Dice of Dionysus with a Friend

## Quick steps (Web build)

1. **Build** (if not already done):
   ```bash
   npm run build
   ```

2. **Folder to send**: `dist/`

3. **Zip it** for easy transfer:
   - Right-click `dist` → Send to → Compressed (zipped) folder
   - Or: `Compress-Archive -Path "dist" -DestinationPath "DiceOfDionysus-v1.4.zip"`

4. **Your friend**:
   - Unzip the folder
   - Open `index.html` in a browser (Chrome, Firefox, Edge)
   - Or host the folder on any static web server (e.g. `npx serve dist`)

## Contents of dist/

- `index.html` — main entry point
- `assets/` — JS, CSS, fonts
- `ART/` — images, sounds

## Minimum requirements

- Modern browser (Chrome, Firefox, Edge, Safari)
- JavaScript enabled
- No install needed — runs in browser
