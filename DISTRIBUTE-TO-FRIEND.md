# Share Dice of Dionysus with a Friend

## Quick steps

1. **Build** (if not already done):
   ```bash
   npm run build
   npm run dist
   ```

2. **Folder to send**: `dist/win-unpacked/`

3. **Zip it** for easy transfer (close the game first if it's running):
   - Right-click `win-unpacked` → Send to → Compressed (zipped) folder
   - Or: `Compress-Archive -Path "dist\win-unpacked" -DestinationPath "DiceOfDionysus-v1.4.zip"`

4. **Your friend**:
   - Unzip the folder
   - Double-click `Dice of Dionysus.exe`
   - No install needed — it runs portably

## Contents of win-unpacked

- `Dice of Dionysus.exe` — main launcher (run this)
- `resources/` — game assets (required)
- `*.dll` — required runtime libraries
- `locales/` — language packs (can be deleted to shrink if needed)

## Minimum requirements

- Windows 10/11 (64-bit)
- ~200 MB disk space
- No admin rights needed
