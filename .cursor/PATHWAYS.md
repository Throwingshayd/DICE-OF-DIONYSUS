# Pathways — fast navigation

**Laws:** [`SOUL.md`](../SOUL.md). **Agent workflow:** [`.cursor/skills/dice-ship/SKILL.md`](skills/dice-ship/SKILL.md). This file is **where** code lives and **which** `.cursor/rules` topic to open—compact map only.

---

## Repo map

| Zone | Path |
|------|------|
| Vite app | `game/` (`index.html`, `js/`, `css/`, `public/`) |
| All gameplay code | `game/js/` (not repo-root `js/`) |
| Card data | `game/js/data/gameData.js` |
| Constants | `game/js/config/*.js` |
| Scoring | `game/js/engine/` |
| Loop + state | `game/js/game/GameEngine.js` |
| UI | `game/js/ui/` |
| Styles | `game/css/` |
| Agent reference | `.cursor/context/` (`ARCHITECTURE.md`, `ai_context.yaml`, …) |
| Topic rules | `.cursor/rules/` (`0-global` … `8-translator-playtest`) |
| Tests | `tests/` |
| Tracking | `tracking/` (`CURRENT_FOCUS.md`, **`GAME_DESIGN_BACKLOG.md`**, issues / playtest protocols) |

---

## Task → files → rule

Same table as **SOUL.md § Task → primary files → rule**—open `SOUL.md` if you want it inline with Definition of done and non‑negotiables.

| Intent | Start here | Rules |
|--------|------------|--------|
| Boon | `gameData.js`, `Boon.js` | 1; **6** if shop/save |
| Libation / Worship | `gameData.js`, libation/worship classes | 1 |
| Scoring | `ScoringEngine.js`, `HandEvaluator.js`, `ScoringConstants.js` | 1 |
| Economy | `GameConstants.js`, `gameData.js` | 1; **6** if shop |
| Shop / exclusion / expulsion / save | `GameEngine.js`, `ShopStockGenerator`, shop UI, `dataManager` | 6 |
| Card DOM / tags | `Card.js`, `UIManager.appendInventoryCard` | 7 |
| Look / juice | `game/css/`, `UIManager.js`, effects | 2 (+ **6** for CardArea) |
| Structure / new files | `ARCHITECTURE.md` | 5 |
| Commands / tests | `package.json` | 3 |
| Polish / audit / bug sweep | codebase | 4 |
| Playtest → code | state mapping, **8** | 8 |

Rule files: `.cursor/rules/1-mechanics.mdc` … `8-translator-playtest.mdc`.

---

## Verification snippet

```text
npm run dev
npm run lint:fix
npm run test
npm run playtest:boons   # when relevant
```

Details: **3-automation.mdc**, **`.cursor/tester/TESTING.md`**.
