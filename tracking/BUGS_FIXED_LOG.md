# Bugs Fixed Log

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
