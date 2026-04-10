# Dice of Dionysus — SOUL

**What this file is:** Laws + routing for agents and humans. **Gameplay code** lives under [`game/`](game/) (`game/js/`, `game/css/`). There is no canonical gameplay tree at repo-root `js/`.

---

## For Cursor (read this block first)

1. **Paths:** Implement under `game/js/` (see [`.cursor/PATHWAYS.md`](.cursor/PATHWAYS.md) for the map).
2. **Workflow:** Use the project skill [`.cursor/skills/dice-ship/SKILL.md`](.cursor/skills/dice-ship/SKILL.md) for ship/cleanup tasks (verify commands, guardrails).
3. **State:** `GameEngine.state` is the single game table; don’t duplicate run state in parallel globals.
4. **RNG:** Anything that affects **gameplay or seeded replay** uses the run’s **`prng`** (e.g. `this.prng` on `GameEngine`). **Cosmetic-only** jitter (SFX pitch, particle variance, one-off UI fluff) may use `Math.random()` unless you intentionally want replay-identical visuals.
5. **Rules:** Open the **smallest** `.cursor/rules/*.mdc` set for the task (narrowest number first; add **6** when shop/save/expulsion touches the change).
6. **Verify:** After edits: `npm run lint:fix`, `npm run test`, `npm run dev`; add `npm run playtest:boons` when boons/shop/flow change. Details in the skill and **3-automation.mdc**.

---

## Game snapshot

Vanilla JS, class-based roguelike dice + Greek myth. **5 dice**, **13 Yahtzee categories**, **Boons** (equipped), **Libations / Worship** (consumables). Score: **Pips × Favour**.

**Vocabulary:** Boons, Libations, Worship, Pips, Favour, Ante. Prefer these in UI copy; avoid casual “hands” / “discards”; align new player-facing terms with the design.

**Stance:** Ship stable behavior over clever rewrites. Prefer small diffs; use `Logger` instead of ad-hoc `console.log` in game code.

---

## Randomness (RNG)

| Kind | Use |
|------|-----|
| **Gameplay / outcome** (rolls, shop picks from pools, proc checks, anything stored in or derived from run state for logic) | `prng` from the game/run (`this.prng` on `GameEngine`, or passed-in `prng` where appropriate). Never `Math.random()` for these. |
| **Cosmetic** (audio pitch wobble, particle jitter, non-deterministic visuals that do not change scoring, inventory, or save payload) | `Math.random()` is acceptable; using `prng` is optional if you want stricter replay parity for VFX. |

Seeded RNG implementation: [`game/js/utils/seededRNG.js`](game/js/utils/seededRNG.js).

---

## Non‑negotiables

| Must | Must not |
|------|----------|
| Gameplay/outcome RNG via run `prng` | `Math.random()` for rolls, shop draws from pools, scoring procs, or other state-affecting picks |
| Mult order: additive (+) **then** multiplicative (×) | Reorder mult pipeline without explicit design sign-off |
| `turn_start` boon hooks from `nextTurn()` | `turn_start` from `executeRoll()` |
| One game table: `GameEngine.state` | Second parallel “real” state for the same run |
| Update [`.cursor/context/`](.cursor/context/) when adding cards, boons, economy, or UI patterns | Silent doc drift for new content |

---

## Hot files (where changes usually land)

| Area | Primary paths |
|------|----------------|
| Loop, state, shop flow | `game/js/game/GameEngine.js` |
| UI wiring | `game/js/ui/UIManager.js`, renderers under `game/js/ui/renderers/` |
| Card data | `game/js/data/gameData.js` |
| Boon / libation / worship logic | `game/js/classes/Boon.js`, `boonTimingHandlers.js` (`before_score`), `LibationCard.js`, `WorshipCard.js` |
| Tunables | `game/js/config/*.js` |
| Scoring | `game/js/engine/ScoringEngine.js`, `HandEvaluator.js`, `ScoringConstants.js` |
| Shop stock (pure logic) | `game/js/engine/ShopStockGenerator.js` |
| Save / collection | `game/js/utils/dataManager.js` |

**Refactors:** Prefer minimal, behavior-preserving edits. Splitting or extracting modules from large files is fine when it **reduces risk or complexity**—keep `GameEngine.state` authoritative and run verification after structural changes.

---

## Routing: intent → start here → rule

Rules live in `.cursor/rules/`. Use the **lowest** number that fits; stack **6** for shop/save/expulsion.

| Intent | Start here | Rule(s) |
|--------|------------|---------|
| Boon | `game/js/data/gameData.js` → `game/js/classes/Boon.js` | **1**; **6** if shop/save |
| Libation / Worship | `gameData.js` → `LibationCard.js` / `WorshipCard.js` | **1** |
| Scoring / categories | `ScoringEngine.js`, `HandEvaluator.js`, `ScoringConstants.js` | **1** |
| Economy / prices | `GameConstants.js`, `gameData.js` | **1**; **6** if shop stock |
| Shop / packs / expulsion | `GameEngine.js`, `ShopStockGenerator.js`, `game/js/ui/ShopUI.js` | **6** |
| Save / continue | `dataManager.js`, `GameEngine.js`; `.cursor/context/ARCHITECTURE.md` | **6** |
| Card DOM / inventory tags | `Card.js`, `UIManager.appendInventoryCard` | **7** |
| CSS / layout / juice | `game/css/`, `UIManager.js`, effects modules | **2** (+ **6** for CardArea / z-index) |
| New files / layout | `.cursor/context/ARCHITECTURE.md` | **5** |
| Polish / audit / bug sweep | whole codebase | **4** |
| Playtest → code | map metrics to `state` | **8** |
| Commands / CI / lint / tests | `package.json` | **3** |

**Rule index:** **0** global habits · **1** mechanics · **2** visuals · **3** automation · **4** polish phases · **5** architecture · **6** translator (shop/save) · **7** call-upon-able (tags) · **8** playtest → code.

---

## Definition of done (gameplay-facing)

1. Gameplay RNG and mult/timing contracts preserved—or explicitly agreed change.
2. Shop/save/expulsion still correct if those paths were touched (**6**).
3. Context/docs updated if you added patterns or content ([`.cursor/context/`](.cursor/context/)).
4. `npm run dev` loads; `npm run lint:fix`; `npm run test` where coverage exists; `playtest:boons` when boon/flow warrants.

**Anti-drift:** No shadow `v2` trees; no new frameworks unless the project adopts them deliberately; avoid new top-level folders without reason.

---

## Verification (copy-paste)

```text
npm run dev
npm run lint:fix
npm run test
npm run playtest:boons
```

More: [`.cursor/tester/TESTING.md`](.cursor/tester/TESTING.md), **3-automation.mdc**.

---

## Doc map

| Doc | Role |
|-----|------|
| **SOUL.md** (this file) | Laws, RNG, routing |
| [`.cursor/skills/dice-ship/SKILL.md`](.cursor/skills/dice-ship/SKILL.md) | Default agent workflow for changes |
| [`.cursor/PATHWAYS.md`](.cursor/PATHWAYS.md) | Repo zones + same routing table (compact) |
| `.cursor/rules/*.mdc` | Deep topic guidance |
| `.cursor/context/` | Architecture, module map, card references |

---

## Don’t

- Use `Math.random()` for gameplay/outcome (see RNG table).
- Break save compatibility without bumping `dataManager` version and a migration or clear reset path.
- Add card definitions outside `gameData.js` (then wire class behavior).
- Guess paths—search the repo or open PATHWAYS.
