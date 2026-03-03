# tracking/ — Canonical Data

**Purpose:** Long-lived data the game and agents depend on.

---

## Canonical (Must Keep Updated)

| File | Purpose | Update when |
|------|---------|-------------|
| `card_database.csv` | All cards (boons, worship, libations, artifacts) | You add/change a card |
| `BOON_SPREADSHEET.csv` | Boon categorization | You add a boon category |

Referenced by: SOUL.md, 3-automation.mdc, CONSOLIDATED_BOON_REFERENCE, CARD_METADATA_REFERENCE.

---

## Tests & Reports

| Command | Purpose |
|---------|---------|
| `npm run playtest:boons` | E2E boon playtest — mechanic, visual, combo, enhanced dice |
