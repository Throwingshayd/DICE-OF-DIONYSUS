# tracking/ — Canonical Data

**Purpose:** Long-lived data the game and agents depend on.

---

## Canonical (Must Keep Updated)

| File | Purpose | Update when |
|------|---------|-------------|
| `card_database.csv` | All cards (boons, worship, libations, artifacts) | You add/change a card |
| `BOON_SPREADSHEET.csv` | Boon categorization | You add a boon category |
| `KNOWN_ISSUES.md` | Current bugs, incomplete features, tech debt | You fix or discover an issue |
| `CURRENT_FOCUS.md` | Active priorities (stability, matrix, perf) | You change milestone focus |
| `SOFT_LOCK_SWEEP.md` | Static review: stuck states, shop/expulsion | After major flow changes |
| `BOON_INTERACTION_MATRIX.md` | All boons by mechanic + interaction hotspots | Add/retune boons; playtest planning |
| `BOON_PLAYTEST_PROTOCOL.md` | **Real** boon testing — seeded browser runs + matrix checklist + Playwright role | Before shipping boon changes; priority combo passes |

Referenced by: SOUL.md, 3-automation.mdc, `.cursor/tester/TESTING.md`, CONSOLIDATED_BOON_REFERENCE, CARD_METADATA_REFERENCE.

---

## Tests & Reports

| Command | Purpose |
|---------|---------|
| `npm run test` | Vitest **run** (non-watch) — unit tests under `tests/unit/` |
| `npm run playtest:boons` | E2E boon playtest — mechanic, visual, combo, enhanced dice |
