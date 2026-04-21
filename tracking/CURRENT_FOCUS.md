# Current focus — agent briefing

Updated as the team answers the onboarding questions. **Read with `SOUL.md`.**

---

## Step 1 — Priority (set)

| Priority | Choice |
|----------|--------|
| **Primary** | **Stability** — edge cases; **boon ↔ boon interactions** (ordering, stacking, conflicts). |
| **Secondary** | **Performance / feel** — smoother frame pacing; reduce “browser game” jank (perceived latency, layout thrash, heavy main-thread work). |

---

## Step 2 — Horizon (2–4 weeks) — *set*

### Outcomes (1–3)

1. **Boon matrix (by mechanic)** — Document all boons **sorted/grouped by mechanic**, each combo or scaling pattern **assessed as logical** (supported / edge case / needs cap or reorder). *Example audit target:* **Journey of Perseus** — currently **extreme scaling**; matrix should call this out explicitly.
2. **No known soft-locks** — Reproducible hangs, stuck states, or unfinishable runs eliminated or tracked with seeds until fixed.

### Non-goals (this window)

- No **new art** or **art pass**
- No **new boons** (content freeze)
- No **Electron packaging**

---

## Step 3 — Current pain — *draft* (edit anytime)

Synced with **deep scan (2026-04-10)** and `tracking/KNOWN_ISSUES.md`. Replace rows if priorities shift.

| # | What’s wrong | Where | Severity |
|---|----------------|-------|----------|
| 1 | **Boon ↔ boon behaviour** not systematically documented; ordering/stacking edge cases easy to miss | Scoring / timing pipeline (`Boon.js`, `boonTimingHandlers.js`, `ScoringEngine`, `GameEngine`) | **High** — blocks stability confidence |
| 2 | **Journey of Perseus** scales very hard with run **total score** (+10 pips per 100); feels **over-tuned** with other modifiers | `journey_of_perseus` (`Boon.js`, `gameData.js`) | **High** — example for matrix + balance note |
| 3 | **`GameEngine.js` monolith** (~3.3k lines) — any change can ripple across roll, score, shop, save, and UI wiring | `game/js/game/GameEngine.js` | **High** — structural risk (see `ARCHITECTURE.md` § GameEngine) |
| 4 | **Performance / feel** — score reveal, DOM updates, effects can feel like a **heavy browser page** | `GameEngine` animations, `UIManager`, `BalatroEffects`, main thread | **Medium** — secondary focus |
| 5 | **Test gap** — unit tests cover RNG + small invariants; **multi-boon combos** still manual / Playwright smoke | `tests/unit/`, `tests/e2e/` | **Medium** — improved baseline 2026-04-10 (`vitest run`, new unit files) |
| 6 | **Residual soft-lock classes** — timer chains, pack+expulsion (no new repros filed) | `ShopUI`, cashout → shop | **Medium** — monitor; log seeds in `KNOWN_ISSUES` if found |

---

## Step 4 — Success checks — *draft*

| Goal | Done when |
|------|-----------|
| Boon matrix | **`tracking/BOON_INTERACTION_MATRIX.md`** — 61 boons by mechanic bucket + hotspots; **Journey of Perseus** flagged **scale**. Add playtest verdicts as you run seeds. |
| Soft-locks | **`tracking/SOFT_LOCK_SWEEP.md`** + **`BUGS_FIXED_LOG.md`** (2026-04-10 expulsion fix; `isAwaitingApi` removed). New issues: repro + seed in **`KNOWN_ISSUES.md`**. Unit guard: `tests/unit/shop-expulsion-dom-guard.test.js`. |
| Perseus | Matrix documents current formula + **design verdict** (keep / cap / rework); optional follow-up task filed if change needed. |
| Performance (secondary) | Short **perf note**: e.g. profile **score tally + shop open** — list top 1–3 main-thread offenders and whether addressed or deferred (link **`.cursor/context/performance_notes.md`** if updated). |
| **Real boon testing** | Execute **`tracking/BOON_PLAYTEST_PROTOCOL.md`** — human seeded runs for matrix rows 1–8; log seeds + pass/fail; extend Playwright only after behaviour is agreed. |

---

## Step 5 — Constraints — *set*

- **Non-goals (this window):** no new art, art pass, boons, Electron packaging (see Step 2).
- **Engineering:** match **`SOUL.md`** — vanilla JS, **`GameEngine.state`** single source of truth, **seeded RNG** for gameplay, **preserve save compatibility**, no new dependencies unless you explicitly greenlight.
- **Content:** **no new boons**; tuning existing boons (e.g. Perseus cap) is allowed if it aligns with matrix assessment.

---

## Resume here (2026-04-21) — layout overhaul + live-score glitch pending

**Context:** big UI rework (Pantheon frieze on top, vertical Consumables/Boons
sidebars, felt layout with dice → live → Cast → stones cluster, dice-table
asset as felt art). Shop state unchanged mechanically; Cast doubles as Reroll.
Changes span `game/index.html`, `game/css/styles.css`, `UIManager`, `ShopUI`,
`GameEngine`, `InfoBarRenderer`, and new `game/js/utils/NumberFormat.js`.

**Open bug — live score preview shift (carry over to next session)**

- **Symptom:** during `animateSequentialScoring`, the `pips × favour = score`
  row still appears to drift rightward between the first dice tick and the
  final count-up, even with fixed-width cells and the Balatro-style tiered
  `NumberFormat` funnel.
- **What's already done** (see `CSS §6-7 (LAYOUT V4)` and `GameEngine.formatDisplay`):
    - `.center-game-area .live-score-display.felt-live` container locked at
      `width/min-width/max-width: 360px`.
    - `.gnosis-row` locked at 360px, `justify-content: center`.
    - Every cell (`pips-cell`, `favour-cell`, `pips-line`, `favour-line`,
      `multiply-symbol`, `equals-symbol`, `score-preview`) has
      `flex: 0 0 Npx` + matching width/min/max.
    - `[hidden]` on `.live-extra` / `.live-add` swapped to `visibility:hidden`
      (scoped to `.felt-live`) so they stay in layout.
    - Category name clamped with `nowrap + ellipsis`.
    - All pips/favour/score text writes go through `NumberFormat.display` /
      `.favour` / `.contrib` / `.favourContrib` so digit count is bounded.
- **Next step (pick up here):**
    1. Instrument the glitch — add a temporary `MutationObserver` on
       `#liveScoreDisplay` that logs child `offsetLeft` + `textContent` at
       each animation tick to confirm *which* cell is actually moving.
    2. Check for a competing CSS rule outside `LAYOUT V4` (grep
       `live-score-display` / `gnosis-row` for any width override beyond the
       felt section; base rule has `width:100%; max-width:280px` which should
       be beaten by our 360px override — verify specificity at runtime).
    3. If the row itself is stable but pips/favour visibly slide inside their
       cells, add the optional font-shrink hook noted at the end of the chat
       (clamp `.pips` / `.favour` `font-size` by `textContent.length`).
    4. Consider switching `.gnosis-row` to `display: grid` with
       `grid-template-columns: 96px 20px 96px 20px 84px` and
       `justify-items: center` — removes flex redistribution entirely.

**Read first on resume:** this block, `game/js/utils/NumberFormat.js`
(formatter contract), and the `LAYOUT V4 / ── 5/6/7` sections in
`game/css/styles.css` (the single source of truth for felt positions).

---

## Resume here (2026-04-10) — for the next session

**Read first:** `tracking/KNOWN_ISSUES.md` (snapshot + soft-lock triage), `tracking/BOON_PLAYTEST_PROTOCOL.md` §7 (playtest log).

**Already shipped in this arc**

- Deep scan + doc sync: `KNOWN_ISSUES`, `ARCHITECTURE.md`, `ai_context.yaml`, `system_map.md` (Boon terminology), `performance_notes.md` (deferred profile targets).
- Removed dead `isAwaitingApi`; `GameEngine.scaleDelay` delegated to `game/js/utils/GameTiming.js`.
- Unit tests: RNG determinism, expulsion DOM guard, info-bar roll rules, `GameTiming`, `ScoringEngine.buildContext` shape (`tests/unit/`).
- Matrix: **Journey of Perseus** spotlight + **design verdict: Keep** + tuning levers in `BOON_INTERACTION_MATRIX.md`.
- Playwright: tutorial skip + **clear `diceOfDionysus_*` localStorage per test** (auto-save leak fix); **68/68** boon specs; matrix **#1** smoke (Perseus + Trojan). Details in `BUGS_FIXED_LOG.md`.

**Do next when you return**

1. **Human layer B** — Complete matrix priority rows **3–8** in `BOON_PLAYTEST_PROTOCOL.md` §7 (seeds + pass/fail); optional deep pass on **#1** past turn 10.
2. **Balance** — Only if play feels wrong: Perseus / Trojan interaction (matrix documents optional caps).
3. **Perf** — Optional Chrome profile → fill `performance_notes.md` §2026-04-10 with real stacks.
4. **Engine** — On next `GameEngine` edit: extract another small pure helper (same pattern as `GameTiming`).

---

*Steps 3–5 drafted so work can start; ping to replace any row with your own list.*
