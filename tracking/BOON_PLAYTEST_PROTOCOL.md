# Boon playtest protocol — real runs, not “code vs code”

**Goal:** Prove boons **in the running game** — what the player sees (pips, favour, gold, messages, category behaviour, shop flow). Unit tests and Playwright are **supplements** for regression; they rarely catch **feel**, **misleading tooltips**, or **wrong category text**.

**Companion docs:** `BOON_INTERACTION_MATRIX.md` (what to combine), `SOFT_LOCK_SWEEP.md` (shop/expulsion), `.cursor/tester/TESTING.md` (commands).

---

## 1. Three layers (use all three, different jobs)

| Layer | What it is | Best for |
|-------|------------|----------|
| **A — Human playtest** | You (or a tester) play **seeded** runs in Chrome/Edge, watch UI + console. | **Truth**: timing, clarity, balance gut-check, soft-locks, “is this fun?” |
| **B — Human + checklist** | Same as A, but you follow **matrix priority rows** and write one line per combo. | **Coverage** without writing code first. |
| **C — Playwright (`npm run playtest:boons`)** | Headless/browser automation clicks roll/score and asserts DOM. | **Regression**: “did we break the happy path?” — not a substitute for A. |

**Rule of thumb:** Changing **Boon.js** / scoring → run **A** on at least one **matrix** combo; add **C** only when the flow is stable and worth locking in.

### PlaytestRecorder (structured log → AI)

**In-game panel:** With `?playtest=1` (or `localStorage` `playtest`), a **PLAYTEST** dock appears (bottom-right). Use **Copy JSON**, **Download**, optional notes, and **Auto-download JSON when run ends** (`localStorage` `playtest_auto_end`) — no devtools required. Shortcut: **Ctrl+Shift+E** copies the export.

The log uses a **fixed ring buffer** (~8000 events); each push is **O(1)** with slimmed payloads.

**Enable**

- URL: `?playtest=1` or `?playtest=verbose` (reserved for future extra hooks).
- Or: `localStorage.setItem('playtest','1')` then reload.

Combine with matrix URLs, e.g. `http://localhost:3000/?playtest=1&test=boon:journey_of_perseus&seed=boontest1` (adjust host/port).

**API (optional):** `PlaytestRecorder.note('…')`, `getPayload()`, `clear()` from console if you want.

**Payload:** `meta` (`schemaVersion`, `latestState` including scorecard snapshot, artifact ids, targeting flags, notes) + `events` `{ n, t, wall, type, data }`.

**Event types (non-exhaustive):** `session_start`, `roll`, `hold_toggle`, `hold_clear_all`, `dice_shuffle`, `score_begin`, `before_score_chain` (includes per-boon **`steps`**), `score_scratch`, `score_finalized`, `turn_tick`, `ante_check`, `ante_cleared`, `game_over` (with `reason`), `shop_open` / `shop_close`, `shop_pack_purchase`, `pack_open`, `shop_buy_card`, `shop_buy_artifact`, `shop_reroll`, `shop_stock_after_reroll`, `inventory_gain`, `inventory_sell`, `expulsion_*`, `consumable_used`, `libation_die_applied`, `eucharist_used`, `targeting_cancelled`, `window_error`, `unhandled_rejection`, `user_note`.

Implementation: `game/js/utils/PlaytestRecorder.js`, wired from `GameEngine`, `ShopUI`, `UIManager`, `DiceRenderer`, `Main.js`.

---

## 2. Start a real boon test (local)

1. `npm run dev` → open **http://localhost:3000/** (or your Vite port).
2. **Inject boon(s)** via query string (parsed in `GameEngine`):

   `http://localhost:3000/?test=boon:journey_of_perseus,trojan_horse`

   - Multiple ids: comma-separated, no spaces (or trim-safe — use ids from `gameData.js`).
   - Optional dice setup: `&enhance=iron` (or `parchment`, `gold`) for enhancement-related boons.

3. Enter a **fixed seed** in the start screen (e.g. `boontest1` or a numeric seed you log). Same seed → same RNG → **reproducible** bugs.
4. Click **Play**. Boon(s) are **pre-equipped**; gold is bumped so roll-cost boons aren’t falsely blocked.

**Other test hooks (see `GameEngine` constructor):**

- `?test=winning` — skips mid-ante shop noise (`winningTestMode`) when you only care about scoring loops.
- `?test=seven_sided` / `?test=highfaces` — special dice setups when relevant.

---

## 3. What to watch (observable “pass”)

| Signal | Where |
|--------|--------|
| **Pips / Favour** | Live line, score breakdown, post-score message |
| **Gold** | Header; after Charon, Gambler’s Charm, shop |
| **Rolls left** | Kronos, Chaos, Prometheus, Narcissus, Midnight Oil |
| **Category behaviour** | Correct hand type (especially **⚠ rules** pairs: Dionysus/Hydra, Bellows/Parmenides) |
| **Shop / expulsion** | Buy → full slots → overlay → **Cancel** refunds and closes (see soft-lock fix) |
| **Soft-lock** | Can you always roll, score, or leave shop? |

**Console:** `window.game` (engine), `window.uiManager` — useful for state inspection without guessing.

---

## 4. Session script from the matrix (layer B)

Use **`BOON_INTERACTION_MATRIX.md` → Priority combinations — assessed** as your run list.

For **each row (1–8)**:

1. Build URL with the listed boon ids (and `&enhance=...` if noted in matrix).
2. Pick seed `S = __________`.
3. Play until the **Verify** column is satisfied (e.g. reach turn 11 for Perseus+Trojan).
4. Record one line:

   `| # | seed | URL params | pass/fail | notes (1 sentence) |`

Append to a scratch file or the bottom of this doc (gitignored personal notes OK) — or a new dated section in `KNOWN_ISSUES.md` if something fails.

**Spotlight:** Proteus + Narcissus — run **twice** with **different slot orders** (if the UI lets you reorder or you reinject in different order via save/edit — otherwise document “order at first equip”).

---

## 5. When to add or extend Playwright (layer C)

Add a spec in `tests/e2e/boon-playtest.spec.js` when:

- The behaviour is **stable** and **DOM-assertable** (e.g. “Journey of Perseus shows +N pips after score”).
- You’ve already **seen it pass** in layer A and want **CI regression**.

Avoid automating first for:

- **⚠ order** / **⚠ rules** combos until human agrees expected outcome.
- Anything needing **visual judgment** (juice, readability).

Run: `npm run playtest:boons`

---

## 6. After a session (close the loop)

| If… | Then… |
|-----|--------|
| Bug found | `KNOWN_ISSUES.md` + **seed** + URL params; fix → `BUGS_FIXED_LOG.md` |
| Balance only | Note in `BOON_INTERACTION_MATRIX.md` row or a short “Verdict” line (keep / cap / rework) |
| CSV / card DB | Update `tracking/card_database.csv` if definition changed |

---

## 7. Playtest log — matrix priority rows (1–8)

**Purpose:** Close the loop from [`BOON_INTERACTION_MATRIX.md`](BOON_INTERACTION_MATRIX.md) § *Priority combinations — assessed*.  
**Layers:** **A/B** = human seeded browser; **C** = `npm run playtest:boons` (regression smoke — not a substitute for A/B).

| # | Combo (matrix) | Seed | URL / params | Layer | Result | Notes |
|---|----------------|------|--------------|-------|--------|-------|
| 1 | journey_of_perseus + trojan_horse | `boontest1` | `?test=boon:journey_of_perseus,trojan_horse` | **C** | **Pass** | E2E smoke: both equipped, roll+score, turn advances (2026-04-10). Human: verify turn ≥ 10 doubling + pip growth. |
| 2 | reflection_of_narcissus + eruption_of_etna | `boontest1` | `?test=boon:reflection_of_narcissus,icarus_wings,eruption_of_etna` | **C** | **Pass** | Existing E2E “Eruption + 3 boons” smoke (2026-04-10). Human: trigger count vs tooltip. |
| 3 | proteus + chaos / kronos / heretic | — | (build per matrix) | **B** | Pending | Slot-order matrix — run with `?playtest=1` + Copy JSON if filing issues. |
| 4 | parmenides_die + bellows_of_war | — | `?test=boon:parmenides_die,bellows_of_war` | **B** | Pending | Human: 3K/4K + swap + virtual die (⚠ rules). |
| 5 | dionysus_revelry + hydras_heads | — | `?test=boon:dionysus_revelry,hydras_heads` | **B** | Pending | Human: FH-from-2-pair vs Hydra “exactly 2 pairs”. |
| 6 | tantalus_curse (shop / cancel) | — | `?test=boon:tantalus_curse` | **B** | Pending | Soft-lock: buy cancel, expulsion cancel — see `SOFT_LOCK_SWEEP.md`. |
| 7 | reckless_abandon + cerberus_watch + the_locksmith | — | `?test=boon:reckless_abandon,cerberus_watch,the_locksmith` | **B** | Pending | Human: no throws, 0-hold bonuses OK. |
| 8 | proteus_disguise + reflection_of_narcissus | — | `?test=boon:proteus_disguise,reflection_of_narcissus` (+ left neighbor) | **B** | Pending | Two slot orders; compare totals. |

**Last automation run:** `npm run playtest:boons` — **2026-04-10**: **68/68 passed** (Chromium). Each test clears `localStorage` keys prefixed `diceOfDionysus_` then sets `tutorialShown` so auto-save cannot leak between specs.

---

## 8. How an AI assistant can help **without** replacing real play

- Generate **URLs + seed list** from the matrix.
- Turn your **notes** into `KNOWN_ISSUES` rows or E2E tests **after** you confirm behaviour.
- **Not** sufficient: “only run unit tests and say ship” for new boon interactions.

---

*Real testing = seeded browser + eyes on the board. Everything else is backup.*
