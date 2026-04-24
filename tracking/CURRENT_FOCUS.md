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

**Live score preview shift — fix applied (2026-04-21)**

- **Symptom:** during `animateSequentialScoring`, the `pips × favour = score`
  row appeared to drift rightward as successive boons landed, even with
  fixed-width cells and the Balatro-style tiered `NumberFormat` funnel.
- **Root cause (confirmed by code read):** inside the `pips-line` /
  `favour-line` flex rows, the sibling `.live-add` ("+N" chip) remained in
  layout when hidden (`visibility: hidden` in felt-live so the row stays
  stable). Its rendered width was a function of the last
  `pips-contrib` / `favour-contrib` textContent, which mutated per boon. Flex
  `justify-content: center` recentered on every mutation → the main number
  walked sideways while the true-fixed `=` / score-preview cells stayed
  put, reading as overall row drift.
- **Fix shipped:**
    - CSS (`LAYOUT V4 §5`): `.center-game-area .live-score-display.felt-live
      .live-add` → `position: absolute`, popped as a small floating chip above
      the main number. Cells/lines get `overflow: visible; contain: none` so
      the chip isn't clipped. `.live-add` no longer contributes flow width,
      so pips/favour numbers are anchored purely by their own text.
    - `GameEngine.updateLiveScoreValues`: on hide, explicitly clear
      `pips-contrib` / `favour-contrib` textContent so the hidden chip has
      zero ghost-width even if another CSS rule ever puts it back in flow.
- **Watch list on next smoke run:**
    - Confirm the `+N` chip is visually legible on the dark felt
      (currently dark pill with cream text — tweak `background` /
      `padding` in the new felt-live `.live-add` block if it reads weird).
    - If any residual drift remains, fall back to step 4 of the earlier
      plan (switch `.gnosis-row` to `display: grid` with fixed template
      columns 96px 20px 96px 20px 84px).

**Read first on resume:** this block, `game/js/utils/NumberFormat.js`
(formatter contract), and the `LAYOUT V4 / ── 5/6/7` sections in
`game/css/styles.css` (the single source of truth for felt positions).

### Version marker

- **Current build target:** `v1.5.0` — **Layout Overhaul**

### Next declutter TODOs

1. Continue removing dead selectors and obsolete UI hooks as features stabilize.
2. Keep `GameEngine` responsibilities lean by extracting pure helpers when touching scoring/shop flow.
3. Add a short smoke checklist for layout-sensitive flows (hover preview, scoring sequence, pre-shop ticker, shop open).

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
