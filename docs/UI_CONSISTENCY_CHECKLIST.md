# UI consistency checklist

**Branch:** `main` (UI card consistency merged)

**North star:** A card is one object on the table — same size, same face, same pick-up behaviour. Details live in tooltips when the face stays minimal.

Work **one step at a time**. Do not start the next step until the current step is checked off and you have play-tested.

---

## Done (recent)

- [x] **0a — Card footprint** — Single size `140×187` via `game/css/card-sizes.css` + `CARD_LAYOUT` in `UIConstants.js`
- [x] **0b — Drag size** — `CardDragSurface.pinToScreenRect()` uses screen `getBoundingClientRect()` (no grow on pick-up)
- [x] **0c — Drag text** — `card-drag-appearance` shows owned-style type indicator while dragging

---

## Step 1 — Card presentation contract (foundation)

**Goal:** One named rule for what appears *on the card face* in each context, wired in code (not only CSS hacks).

| Surface | Where | Face shows | Details |
|--------|--------|------------|---------|
| `rack` | Shop wares, pack reveal, Anthology | **Same as owned** + price chip in shop | Tooltip = full effect, cost, god |
| `owned` | Libations / Boons sidebars | **Name via type indicator only** (all types) | Tooltip = full effect |

**Tasks**

- [x] Write this checklist
- [x] Agree target face rules — **owned = option A** (all types: indicator only, details in tooltip)
- [x] Add `data-card-surface="rack|owned"` on every `Card.render()` (and document in `Card.js`)
- [x] Add `CARD_SURFACE` constants in `UIConstants.js`
- [x] Playtest: shop buy, pack claim, sidebar hover — no visual regressions *(you confirm in-game)*

**Decided (owned — option A)**

- **All types, `owned`:** Name on face via `.card-type-indicator` only; hide `.card-name` / `.card-effect` / `.card-god` in content; tooltip has effect. *(Step 2)*

**Rack (Step 3):** Same play face as owned — type indicator only; `card-shop-cost` on direct shop sales; tooltip for effect.

---

## Step 2 — Unify owned card faces (boon + worship + libation)

**Goal:** Sidebar cards use the same DOM + CSS rules for all three types.

- [x] Change `Card.js` — rack only gets full face text; owned = indicator + tooltip
- [x] Add `game/css/card-present.css` with `[data-card-surface="owned"]` + drag face rules
- [x] Remove duplicate boon-slot text rules from `styles.css`
- [x] Playtest: boon bar hover (tooltip has effect), reorder drag, sell drag

---

## Step 3 — Unify rack faces (shop + pack)

**Goal:** Shop and pack use the same face rules as owned (type indicator only) + price chip on shop wares.

- [x] Rack + owned shared rules in `card-present.css`; removed shop/pack face exceptions from `styles.css`
- [x] Playtest: shop wares (name on card, price chip, hover effect), all pack types, claim drag

---

## Step 3b — Card tooltip unity (shop + owned + pack)

**Goal:** Same dark card panel, same below placement for all `.card` hovers.

- [x] `BalatroEffects`: cards always `tooltip-card` (never `tooltip-shop`); `preferBelow` for all cards
- [x] Playtest: shop pack/boon drag ghosts (art-only packs, boon face paint, no white outer frame)
- [x] Playtest: hover libation in shop, in sidebar, in pack — same look and below placement *(confirm in Step 7)*
- [x] Shop shelf packs: art-only face (`data-pack-shelf`), price chip, dark `tooltip-card`, `CardDragSurface.freezePackArt` on drag ghost
- [x] Shop purchase drag uses `PointerDragGhost` (same smooth path as sell drag)

---

## Step 4 — Artifacts as a first-class “card kind”

**Goal:** Same footprint as other cards; one render path.

**Decided:** Artifacts use **`140×187`** (`--card-w/h`) — same table object as boons/libations (not 120×120 vouchers).

- [x] Product decision: rectangular `--card-w/h` (removed shop 120×120 override)
- [x] `Artifact.render()` — rack indicator (name), gold frame via CSS, tooltip for effect
- [x] Anthology `CollectionManager.populateArtifacts` uses `Artifact.render()` (shop already did)
- [x] Playtest shop artifact drag-to-gold + anthology artifacts tab (`tests/e2e/ui-checklist-playtest.spec.js`)

---

## Step 5 — Anthology (collection screen)

**Goal:** Same surfaces as in-run (`rack` + locked state).

- [x] `CollectionManager._renderRackCard()` → `render(true, false)` for boons, worship, libations, artifacts
- [x] Locked cards: `_applyLockedCollectionCard()` + `.collection-unlock-meta` CSS (no inline styles)
- [x] Anthology catalog mode: `unlockAllInAnthology` (all entries + `data-tooltip`); tooltips init in `showCollection()`
- [x] Playtest all four tabs + paging (hover + click-pin tooltips) (`tests/e2e/ui-checklist-playtest.spec.js`)

---

## Step 6 — Motion policy (“table feel”)

**Goal:** Cards stay fixed size on hover/drag (physical object). Drop zones keep gamey juice.

- [x] `card-present.css` motion policy: no scale/lift on `.card:hover`; shadow-only hover; drag frozen
- [x] Drop zones unchanged (`shop-drop-target-hot`, gold stone glow, etc.)
- [x] Playtest shop + sidebars + anthology + pack claim (no card grow; zones still pop)
- [x] Fix consumable drag lag (zone visibility + RAF drop hints); boon ghost art; worship/libation zone labels

---

## Step 7 — Tooltip policy

**Goal:** One hierarchy — short face, full tooltip.

- [x] Cards: unified `TIMING.TOOLTIP_DELAY_CARD` (100ms), `TOOLTIP_CARD_MIN_W` / `MAX_W` (148–220px) in `BalatroEffects`
- [x] All `.card` tooltips: dark `tooltip-card`, prefer below (shop / pack / owned / anthology)
- [x] Enhancement picker: slate shell + title/effect colours match `tooltip-card` (`tooltips.css`); stays full-screen modal for multi-die pick (documented below)
- [x] Playtest: card hover (shop, sidebar, pack, anthology); die hover; enhancement picker after Kyphi/etc.

**Enhancement picker vs tooltip:** Hover tooltips are read-only. Face-enhancer libations open a **modal** so you pick which die/face — same fonts/colours as card tooltips, not the same control.

---

## Step 8 — CSS consolidation

**Goal:** Fewer context-specific selector lists.

- [x] `card-present.css` documented as canonical (faces, drag, motion, anthology)
- [x] Removed duplicate hover/shimmer, shop hover, anthology sizes, consumable face-hide from `styles.css`
- [x] Removed dead `.consumable-horizon`, `.consumable-shell`, `.consumable-zone-sell-wide`, legacy zone layout
- [x] Removed duplicate shop-drag-hide / drag-ghost width rules (live in `card-present.css`)
- [x] `card-sizes.css` uses `.left-consumable-bar` / `.inventory-panel-consumables` (not horizon)
- [x] Playtest: quick pass shop, sidebars, drag, anthology, consumable zones (no visual regressions)

---

## Step 9 — Interaction & naming cleanup

**Goal:** One interaction vocabulary; less legacy naming in UI.

- [x] Removed dead buy/sell/use label CSS (shop + inventory drag-only)
- [x] `docs/GAME_TERMINOLOGY.md` — Libation & Worship are player types; `consumables` = code bucket for left bar
- [x] Legacy worship ID map documented (`worship_persephone` → `worship_aphrodite`)

---

## How we work each step

1. Read the step tasks above.
2. Implement only that step (small PR-sized diff).
3. You playtest the listed flows.
4. Check boxes in this file; note any “TBD” decisions in *Proposed defaults*.
5. Ask to continue to the next step.

**Status:** **Complete on `main`** — Steps 4–5 verified via `tests/unit/ui-checklist-steps-4-5.test.js` and `tests/e2e/ui-checklist-playtest.spec.js`. Feature branch `feat/ui-card-consistency` already removed (local + remote).
