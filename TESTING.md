# Testing

How we verify Dice of Dionysus: **unit tests for pure logic**, **Playwright for full browser integration**, **PlaytestRecorder** for failure artifacts.

## Commands

| Command | What it runs | When to use |
|---------|----------------|-------------|
| `npm test` | Vitest unit tests | Every change (fast) |
| `npm run test:smoke` | Playwright smoke (`tests/e2e/smoke.spec.js`) | PR / after gameplay or UI touch |
| `npm run test:e2e` | All Playwright E2E specs | Before merge / nightly |
| `npm run playtest:boons` | Boon matrix E2E | Boon or scoring changes |

## Prerequisites

```bash
npm install
npx playwright install chromium
```

Playwright starts Vite on **port 3000** (see `playwright.config.js`).

## Integration harness

- **URL presets:** `?test=boon:id`, `?test=winning`, `?test=scenario:…` (see `GameEngine` / `TestDriver.js`)
- **Observability:** `?playtest=1` enables `PlaytestRecorder` (JSON export on failure in E2E)
- **Helpers:** `tests/e2e/helpers/` — shared waits, boot, attachments
- **Stable selectors:** `data-testid` on roll, score, confirm, shop continue

## Definition of done (gameplay)

1. `npm test` passes
2. `npm run test:smoke` passes
3. If shop/scoring/ante flow changed: `npm run test:e2e` (includes golden loop)
4. If boons changed: `npm run playtest:boons` (or targeted boon spec)

## Failure artifacts

On Playwright failure you should get: screenshot, trace (on retry), video (on failure), and **`playtest.json`** (event log + state snapshot) when `?playtest=1` is active.

## Boss blinds

Out of scope for current tests (`DEBUG_FLAGS.BOSS_BLINDS_DISABLED`).

## Manual playtest

```bash
npm run dev
# Optional: http://localhost:3000/?playtest=1
```

Use the in-game PLAYTEST dock (Copy JSON / Download) or Ctrl+Shift+E.
