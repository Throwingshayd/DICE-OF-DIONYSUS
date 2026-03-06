# Unfinished & Improvements Audit

**Date:** March 2026  
**Purpose:** Tie-off checklist for game development — what's incomplete, confusing to AI, and what players need.

---

## 1. Broken or Missing References (Fix First)

### 1.1 `npm run playtest:ante1` Does Not Exist — FIXED
- Updated SOUL.md, 6-translator.mdc, 8-translator-playtest.mdc to use `playtest:boons`

### 1.2 `npm run dist` Does Not Exist — FIXED
- Rewrote DISTRIBUTE-TO-FRIEND.md for web-only: `npm run build` → zip `dist/` → open in browser or static host

### 1.3 README Project Structure Outdated — FIXED
- Updated README to: tools/, tests/unit/, tests/e2e/, reference/balatro/

---

## 2. Boons/Mechanics Not Fully Implemented

From `docs/archive/TESTING_GUIDE_56_BOONS.md` and codebase search:

| Boon | Status | Notes |
|------|--------|-------|
| **Parmenides Die** | Implemented | Pantheon swap: scores go to corresponding upper↔lower slot |
| **The Heretic** | Implemented | ante_end reset in Joker; pip tooltip via getDynamicDisplayStats |
| **Tantalus' Curse** | Implemented | Shop blocking works (message shown); gold-spend blocked in multiple handlers |
| **Golden Touch** | Verified | Interest 1 per 3g in calculateInterestOnAmount; card tooltip added |
| **Message in a Bottle** | Implemented | Solo/company logic in Joker.js ante_end |
| **Apollo's Oracle** | Implemented | -20% score, +1 reroll in Joker.js |

### 2.1 Mirror Enhancement — IMPLEMENTED
- **Status:** Mirror now scores twice (Balatro Red Seal), including iron and mother-of-pearl bonuses.
- **Implementation:** ScoringEngine.runPipeline() and GameEngine fallback path.

---

## 3. Technical Debt (Documented, Deferred)

| Item | Location | Priority |
|------|-----------|----------|
| UIManager.js too large (~1900 lines) | ARCHITECTURE.md | Deferred |
| console.log → Logger | FIXED — Main, GameEngine, Die, LibationCard migrated | — |
| Limited automated tests | ai_context.yaml | Medium |
| ESLint config | FIXED — .eslintrc.cjs added, lint:fix passes (0 errors) | — |
| Split hand validation from GameEngine | system_map.md | Deferred |
| PWA ServiceWorker | FIXED — registration in Main.js, manifest in game/ | — |
| Settings documentation | FIXED — docs/SETTINGS.md | — |
| Tutorial | FIXED — first-run overlay when showTutorial enabled | — |

---

## 4. Confusing or Inconsistent (For AI)

### 4.1 Terminology Overlap
- **Jokers** = Boons (internal vs UI term)
- **Consumables** = Libations + Worship
- Rules and docs mix these; SOUL.md is canonical

### 4.2 Scattered Documentation
- `.cursor/context/` — primary AI learning
- `docs/archive/` — historical, some still accurate (e.g. TESTING_GUIDE known issues)
- `docs/design/` — design plans
- **Gap:** Addressed — tracking/KNOWN_ISSUES.md created as single source of truth

### 4.3 Playtest vs E2E
- `playtest:boons` runs Playwright
- `playtest:ante1` referenced but doesn't exist
- No `playtest:ante1` report template or script

### 4.4 PWA / Service Worker
- FIXED: ServiceWorker registration in Main.js; manifest linked in index.html; works on HTTPS/localhost

---

## 5. What Players Need

### 5.1 Onboarding
- **FIXED:** First-run tutorial overlay when "Show tutorial hints" enabled in Settings
- README has "How to play"; in-game overlay covers roll, hold, score, formula

### 5.2 Accessibility
- Keyboard: R (roll), 1–5 (hold), Esc (back) — documented in README
- Screen reader / ARIA: Partial (some aria-hidden, aria labels)
- Mobile: Fixed 1920×1080 layout per README — may not scale well

### 5.3 Distribution
- **Web:** `npm run build` → serve `dist/`
- **Electron/EXE:** Removed (electron-main.js deleted)
- **DISTRIBUTE-TO-FRIEND.md:** Outdated; describes non-existent Electron build

### 5.4 Save / Continue
- Auto-save to localStorage
- "Continue" button on start screen — should work if save exists
- No explicit "how to backup/restore" for players

### 5.5 Settings
- FIXED: docs/SETTINGS.md documents all options (sound, music, SFX, animations, auto-save, tutorial, game speed)

---

## 6. Quick Wins (Tie-Off)

1. **Update README** — tests/unit, tests/e2e, tools/, reference/balatro/
2. **Fix playtest references** — Replace `playtest:ante1` with `playtest:boons` in SOUL, rules
3. **Fix or remove DISTRIBUTE-TO-FRIEND.md** — Web-only or document current build
4. **Add ESLint config** — `npm init @eslint/config` or add `.eslintrc` so `npm run lint:fix` works
5. **Create tracking/KNOWN_ISSUES.md** — Single source for: Mirror not implemented, boons to verify, etc.

---

## 7. Medium-Term Improvements

1. **Verify all 56 boons** — Run through TESTING_GUIDE checklist, update status
2. **Tutorial / first-run hints** — Optional overlay or tooltips
3. **Mobile/responsive** — Or document "desktop only"

---

## 8. Summary

| Category | Count |
|----------|-------|
| Broken references | 3 |
| Boons/mechanics incomplete | 0 |
| Technical debt items | 5 |
| AI confusion points | 4 |
| Player needs | 5 areas |

**Recommended order:** Verify remaining boons per TESTING_GUIDE; tutorial/mobile deferred.
