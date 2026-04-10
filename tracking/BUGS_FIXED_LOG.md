# Bugs Fixed Log

## 2026-04-10

### Playwright boon E2E — skip first-run tutorial overlay

- **Issue:** `tests/e2e/boon-playtest.spec.js` timed out on **Cast the Bones** — first-run tutorial overlay blocked `#rollButton` when `localStorage` had no `diceOfDionysus_tutorialShown`.
- **Fix:** `page.addInitScript` sets `diceOfDionysus_tutorialShown` before `goto` in `startGame()` and the seven-sided test path.
- **Ref:** `tests/e2e/boon-playtest.spec.js`

### Playwright boon E2E — clear `diceOfDionysus_*` localStorage each test

- **Issue:** After ~30 passing tests, later specs failed in ~3s (boon slot not visible) — **auto-save** from earlier tests in the same browser context left a valid **Continue** save / loaded state so `?test=boon:…` injection did not match the visible run.
- **Fix:** `addInitScript` removes all `localStorage` keys with prefix `diceOfDionysus_`, then sets `tutorialShown` again.
- **Ref:** `tests/e2e/boon-playtest.spec.js`

### Dead `isAwaitingApi` flag removed

- **Issue:** `GameEngine.state.isAwaitingApi` was initialized `false` and **never** set `true`, yet it gated `rollDice`, hold toggles, `promptScore`, `canSave()`, and the info-bar roll button. That obscured real save/roll rules and suggested a non-existent async path.
- **Fix:** Removed the property and all checks. `InfoBarRenderer` roll disable now matches `rollsLeft`, `gameOver`, and `transitioningToShop` only. If async scoring is added later, use a documented phase flag or state machine.
- **Ref:** `tracking/KNOWN_ISSUES.md`, `tracking/SOFT_LOCK_SWEEP.md`

### Deep scan — tracking + tests

- **Doc sync:** `KNOWN_ISSUES.md` now lists **current** module line counts, test inventory, and a short GameEngine assessment pointer to `ARCHITECTURE.md`. Stale **~1,900 line UIManager** note removed (coordinator is ~380 lines; shop is `ShopUI.js`).
- **Tests:** Added Vitest specs for expulsion DOM preconditions, info-bar roll disable rules, and SeededRNG determinism; `package.json` **`test`** script uses **`vitest run`** so CI and agents exit cleanly.

### Shop expulsion soft-lock (missing DOM / cancel button)

- **Issue:** `ShopUI.enterExpulsionMode` set `expulsionPending` before verifying overlay/grid/title nodes. If DOM was incomplete, the flag stayed set and all later expulsion attempts no-op’d at the guard — player could not finish buys. Assigning `cancelBtn.onclick` when `expulsionCancelBtn` was missing could throw with the same stuck flag.
- **Fix:** Set `expulsionPending` only after `overlay`, `gridEl`, `titleEl`, and `subtitleEl` exist; guard cancel with `if (cancelBtn)`.
- **Ref:** `tracking/SOFT_LOCK_SWEEP.md`

## 2025-03-06

### Responsive layout - game scales to viewport

- **Issue:** Game was fixed 1920×1080; didn't work on different window sizes.
- **Fix:** Wrapped game in .game-viewport; uses CSS transform scale(min(100vw/1920, 100vh/1080)) to fit any window. Removed body min-width/min-height.

### Deferred items addressed

- **Settings:** docs/SETTINGS.md documents all options
- **PWA:** ServiceWorker registration in Main.js; manifest linked in index.html
- **Mobile:** Documented in README (desktop primary, PWA install available)
- **Tutorial:** First-run overlay when showTutorial enabled (Quick Start: roll, hold, score, formula)

### Golden Touch - verified + card tooltip

- **Verification:** Interest calculation correct (1 per 3g vs 1 per 5g base) in GameEngine.calculateInterestOnAmount.
- **Enhancement:** Added "1 per 3g" tooltip on card via getDynamicDisplayStats.

### The Heretic - ante_end reset + pip tooltip

- **Issue:** Ante-end reset was in GameEngine; no pip counter on card tooltip.
- **Fix:** Moved reset to Joker ante_end handler (with other ante_end jokers). Added live pip counter in getDynamicDisplayStats from gameState.hereticStacks.

### Parmenides Die - pantheon swap mechanic

- **Issue:** Parmenides had random face enhancement; user wanted pantheon swap instead.
- **Fix:** Scores now swap between upper and lower pantheon by position (Ones↔Three of a Kind, Twos↔Small Straight, Sixes↔Chance, Sevens↔Yahtzee, etc.). Implemented in GameEngine.confirmScore, animateScoreUpdate, animateSequentialScoring. Removed die-specific visuals.

### Mirror enhancement implemented (Balatro Red Seal)

- **Issue:** Mirror enhancement was defined but had no scoring logic.
- **Fix:** Mirror now scores twice: face value + iron + mother-of-pearl are added again for each die with mirror that contributes to the category. Implemented in `ScoringEngine.runPipeline()` and GameEngine fallback path. Updated descriptions in Die.js and LibationCard.js.

## 2025-03-04

### Pantheon scorecard no longer expands when 7/8/9 unlock

- **Issue:** Scorecard/pantheon asset height increased when Sevens, Eights, or Nines were unlocked (expanded-1/2/3 classes).
- **Fix:** Removed dynamic expansion logic in `UIManager.js` `updateScorecardUI()`. Pantheon stays fixed size regardless of 7/8/9 unlock state.