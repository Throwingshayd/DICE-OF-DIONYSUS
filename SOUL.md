# Dice of Dionysus — Agent Soul

**Read this first.** Canonical entry point. Everything branches from here.

---

## Identity

Balatro-style Yahtzee + Greek mythology. Vanilla JS, class-based. Single source of truth: `GameEngine.state`. 5 dice, 13 categories, boons (jokers) + libations. Pips × Favour = Score.

**Project stance:** Stability > novelty. Performance > elegance. Respect what works.

---

## Rule Identities (.cursor/rules/)

| Rule | Identity |
|------|----------|
| **0-global** | Gatekeeper. SOUL-first, search before edit, [PLAN] before build. |
| **1-mechanics** | The Judge. Hand validation, mult order (+ then ×), timing (`turn_start` in `nextTurn()`). |
| **2-visuals** | The Artist. 16-bit pixel art, card sizing (142×190 / 140×187), no blur, dithering. |
| **3-automation** | The Engineer. dev/build/lint/test/playtest commands. Verification protocol. |
| **4-master-architect** | The Architect. Invoked for polish, bug-hunting, Balatro alignment. |
| **5-architecture** | The Surveyor. File hierarchy, dependency order (data → logic → UI), pre-flight. |
| **6-translator** | The Translator. Lua→JS mapping, owned exclusion, expulsion, save-state. |
| **7-call-upon-able** | The Reuser. Card.render(), appendInventoryCard(). No duplicate card UI logic. |
| **8-translator-playtest** | The Playtester. Playtest→translator bridge. `npm run playtest:boons` → report. |

---

## Read Order

1. **SOUL.md** ← you are here
2. **0-global.mdc** — Primary reference
3. **ai_context.yaml** — Module map, hot paths
4. **Task-specific rule** — e.g. Balatro porting → 6-translator + `reference/balatro/`

---

## Critical Paths

| Concern | File(s) | Do Not |
|---------|---------|--------|
| Game state | `game/js/game/GameEngine.js` | Split it |
| UI | `game/js/ui/UIManager.js` | Split without request |
| Cards | `game/js/data/gameData.js` | Add elsewhere |
| Effects | `game/js/classes/Joker.js`, `LibationCard.js`, `WorshipCard.js` | Duplicate logic |
| Constants | `game/js/config/*.js` | Hardcode |
| Scoring | `game/js/engine/ScoringEngine.js`, `HandEvaluator.js` | Bypass |

---

## Strong Opinions

- **Seeded RNG only.** `this.prng.random()`. Never `Math.random()`.
- **Mult:** Additive (+) first, then multiplicative (×).
- **`turn_start`:** In `nextTurn()`, never `executeRoll()`.
- **Update .cursor/context/** when adding cards, boons, economy, UI patterns.
- **Terminology:** Jokers = Boons. Consumables = Libations/Worship. Pips = base. Favour = mult. Ante = difficulty.
- **Greek theming:** No "hands," "discards." Ask before new terms.

---

## Decision Tree

```
Adding boon/libation/worship?  → game/js/data/gameData.js + class (Joker/LibationCard/WorshipCard)
Changing economy?             → game/js/config/GameConstants.js
Changing scoring?             → game/js/engine/ScoringEngine.js, HandEvaluator.js, game/js/config/ScoringConstants.js
Fixing bug?                   → tracking/BUGS_FIXED_LOG.md, seed for repro
Porting Balatro?              → 6-translator.mdc, reference/balatro/
Card UI (sell/buy tags)?      → 7-call-upon-able.mdc
Optimizing?                   → Profile first. Preserve determinism.
```

---

## Verification

1. `npm run dev` — loads, no crash
2. `npm run lint:fix` — style passes
3. `npm run test` — if tests exist
4. Update .cursor/context/ when adding content

---

## Don't

- Restructure without being asked
- Add frameworks "because modern"
- Change working code "to be cleaner"
- Forget .cursor/context/ updates
- Break save compatibility
- Use Math.random()

---

*Search. Never guess paths.*
