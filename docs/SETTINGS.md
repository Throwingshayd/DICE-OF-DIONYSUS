# Settings Reference

Settings are available via the **Settings** button (start screen and in-game pause menu). All options persist to localStorage.

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| **Sound** | Checkbox | On | Master sound toggle (music + SFX) |
| **Music** | Slider (0–100%) | 60% | Music volume (when sound enabled) |
| **SFX** | Slider (0–100%) | 80% | Sound effects volume (when sound enabled) |
| **Animations** | Checkbox | On | Enable dice/UI animations |
| **Auto-save** | Checkbox | On | Auto-save game state every 30 seconds |
| **Show tutorial hints** | Checkbox | On | Show first-run and contextual hints |
| **Game Speed** | Select | 2× | 0.5×, 1×, 2×, or 4× animation speed |

### Keyboard shortcuts
- **R** — Roll dice  
- **1–5** — Toggle hold on die 1–5  
- **Esc** — Back / close overlay  

### Data storage
Settings and save data use `localStorage` with the prefix `diceOfDionysus_`. Clear browser data to reset.
