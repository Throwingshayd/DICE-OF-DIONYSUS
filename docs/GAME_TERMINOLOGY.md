# Game terminology (player-facing vs code)

Use this when editing UI copy, docs, or talking to agents about the project.

## Player-facing card types

| Name | What it is |
|------|------------|
| **Boon** | Persistent run modifier (right bar) |
| **Libation** | One-shot drink / item effects (left bar) |
| **Worship** | One-shot favour on a scoring god (left bar, same column as libations) |
| **Artifact** | Run-long passive (shop claim to gold) |

**Libation** and **Worship** are separate card types with their own art, tooltips, and drag targets.

## Left bar label: **Consumables**

The in-run left column title (marble stelae) reads **CONSUMABLES** because that bar holds both libations and worship. Individual cards still show their type on the face/tooltip.

## Code bucket: `consumables`

`gameState.consumables`, `consumableSlots`, `consumableSlotsMax`, and similar identifiers are the same group as the left bar.

- Use **consumables** in code/comments for the left-bar array/slots.
- Use **Libation** / **Worship** when referring to a specific card type (anthology tab “Libations”, pack names, effects).

Examples:

- OK: `updateConsumableUI()` — renders the left bar.
- OK: UI string: “Drag: worship ↑ · drink to chalice…”
- Avoid: Renaming `consumables` → `libations` in save data or state (would break saves and many call sites for worship).

## Legacy worship card IDs (saves)

Older saves may reference renamed worship IDs. Migrations map:

| Legacy ID | Current ID |
|-----------|------------|
| `worship_persephone` | `worship_aphrodite` |

Handled in `game/js/utils/dataManager.js` (collection) and `game/js/game/GameEngine.js` (run save load). Do not remove without a save-version bump.
