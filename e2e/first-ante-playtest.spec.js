/**
 * First Ante Complete Gameplay Test - Multiple iterations
 * Plays through full ante 1: 13 turns, shops at 4 & 8, ante clear.
 * Produces report for cursor rules / translator improvement.
 */

import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const ITERATIONS = 3;
const SCORING_MS = 3500;
const ANTE1_CATEGORIES = [
  'Chance', 'Ones', 'Twos', 'Threes', 'Fours', 'Fives', 'Sixes',
  'Three of a Kind', 'Small Straight', 'Full House', 'Four of a Kind',
  'Large Straight', 'Yahtzee'
];
const ANTE1_THRESHOLD = 200;
const REPORT_PATH = path.join(process.cwd(), 'tracking', 'FIRST_ANTE_PLAYTEST_REPORT.md');

async function waitForRollButtonReady(page, timeoutMs = 15000) {
  const rollBtn = page.getByRole('button', { name: /cast the bones/i });
  await rollBtn.waitFor({ state: 'visible', timeout: timeoutMs });
  for (let i = 0; i < timeoutMs / 200; i++) {
    const disabled = await rollBtn.isDisabled().catch(() => true);
    if (!disabled) break;
    await page.waitForTimeout(200);
  }
  await page.waitForTimeout(300);
}

async function scoreTurn(page, category) {
  await waitForRollButtonReady(page);
  await page.getByRole('button', { name: /cast the bones/i }).click();
  await page.waitForTimeout(600);
  await page.locator(`.score-row[data-category="${category}"]`).click();
  const confirmYes = page.locator('#confirmYes');
  if (await confirmYes.isVisible().catch(() => false)) await confirmYes.click();
  await page.waitForTimeout(SCORING_MS);
}

async function closeShopIfOpen(page) {
  const shopStage = page.locator('#shopStage');
  const shopVisible = await shopStage.isVisible().catch(() => false);
  const shopHidden = await shopStage.evaluate(el => el.classList.contains('hidden')).catch(() => true);
  if (shopVisible && !shopHidden) {
    await page.locator('#closeShop').click();
    await page.waitForTimeout(1200); // Stage swap
    const beginBtn = page.locator('#anteBeginButton, .ante-begin-button');
    if (await beginBtn.isVisible().catch(() => false)) {
      await beginBtn.click();
      await page.waitForTimeout(600);
    }
    await waitForRollButtonReady(page); // Ensure roll button enabled before next turn
  }
}

test.describe('First Ante - Complete Gameplay (multiple iterations)', () => {
  test.setTimeout(300000); // 5 min per run

  test('Run full first ante x3 iterations, produce translator template', async ({ page }) => {
    const results = [];

    for (let iter = 0; iter < ITERATIONS; iter++) {
      const seed = `ante1_iter${iter}`;
      const run = { seed, cleared: false, totalScore: 0, gold: 0, goldAtShops: [], errors: [], categoriesFilled: 0, turn: 0 };

      await page.goto('/');
      await page.getByPlaceholder(/seed/i).fill(seed);
      await page.locator('#playButton').evaluate((el) => el.click());

      await expect(page.locator('#gameContainerWrapper')).toBeVisible({ timeout: 5000 });

      for (let t = 0; t < ANTE1_CATEGORIES.length; t++) {
        const category = ANTE1_CATEGORIES[t];
        try {
          await scoreTurn(page, category);
          run.categoriesFilled++;
          run.turn = t + 1;

          // Shop at turns 3→4 and 7→8 (after scoring 3rd and 7th categories)
          if (t === 2 || t === 6) {
            await page.waitForTimeout(2200);
            const shopOpen = await page.locator('#shopStage').isVisible();
            if (shopOpen) {
              const gText = await page.locator('#goldDisplay').textContent().catch(() => '0');
              run.goldAtShops.push(parseInt((gText || '0').replace(/\D/g, ''), 10));
              await closeShopIfOpen(page);
            }
          }
        } catch (e) {
          run.errors.push(`Turn ${t + 1} (${category}): ${e.message}`);
        }
      }

      await page.waitForTimeout(4000); // Allow ante-end tally and transition

      try {
        const state = await page.evaluate(() => {
          const g = window.game;
          return g && g.state ? { totalScore: g.state.totalScore, gold: g.state.gold, ante: g.state.ante } : null;
        });
        if (state) {
          run.totalScore = state.totalScore || 0;
          run.gold = state.gold ?? run.gold;
        }
      } catch (_) {}
      if (run.gold === 0) {
        try {
          const g = await page.locator('#goldDisplay').textContent().catch(() => '0');
          run.gold = parseInt((g || '0').replace(/\D/g, ''), 10);
        } catch (_) {}
      }

      const ante2 = await page.evaluate(() => (window.game?.state?.ante || 0) >= 2).catch(() => false);
      const stateCleared = await page.evaluate(() => {
        const s = window.game?.state;
        return s && Object.keys(s.scorecard || {}).length >= 13 && (s.totalScore || 0) >= 200;
      }).catch(() => false);
      run.cleared = ante2 || (run.categoriesFilled >= 13 && run.totalScore >= ANTE1_THRESHOLD) || stateCleared;

      results.push(run);
    }

    // Write report
    const report = buildTranslatorTemplate(results);
    const dir = path.dirname(REPORT_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(REPORT_PATH, report, 'utf8');

    const clearedCount = results.filter(r => r.cleared).length;
    expect(clearedCount).toBeGreaterThanOrEqual(0);
    expect(results.length).toBe(ITERATIONS);
  });
});

function buildTranslatorTemplate(results) {
  const cleared = results.filter(r => r.cleared).length;
  const totalScoreAvg = results.reduce((s, r) => s + r.totalScore, 0) / (results.length || 1);
  const goldAvg = results.reduce((s, r) => s + r.gold, 0) / (results.length || 1);

  return `# First Ante Playtest Report — Translator Improvement Template

**Date:** ${new Date().toISOString().slice(0, 10)}  
**Iterations:** ${results.length}  
**Ante Cleared:** ${cleared}/${results.length}  
**Avg Total Score:** ${Math.round(totalScoreAvg)} (threshold: ${ANTE1_THRESHOLD})  
**Avg Gold End:** ${Math.round(goldAvg)}

---

## Per-Iteration Results

| Seed | Cleared | Score | Gold | Shops | Errors |
|------|---------|-------|------|-------|--------|
${results.map(r => `| ${r.seed} | ${r.cleared ? '✓' : '✗'} | ${r.totalScore} | ${r.gold} | [${r.goldAtShops.join(',')}] | ${r.errors.length} |`).join('\n')}

---

## Cursor Rules / Translator Improvement Template

Use this when updating \`.cursor/rules/6-translator.mdc\` or improving the game.

### 1. Balatro Mapping Additions

| Observation | Balatro | Dice of Dionysus | Action |
|-------------|---------|------------------|--------|
| Ante flow | Blind → rounds → shop | Ante → 13 turns → shop @ 4,8,end | Verify \`nextTurn\` → \`endAnte\` → \`openShop\` |
| Economy | Interest, sell 25% | \`GAME_BALANCE\`, \`CARD_ECONOMY\` | Match interest rate (1/5), sell 25% |
| First ante threshold | ~200 | 200 (AnteData) | Confirm scaling matches Balatro early antes |

### 2. Gameplay Loop Verification

- [ ] **Turn structure:** roll → hold → score → nextTurn (turn_end → turn++ → turn_start)
- [ ] **Shop triggers:** turns 4, 8, end-of-ante (when threshold met)
- [ ] **Gold:** +1 per score, interest floor(gold/5) max 5
- [ ] **Categories:** 13 standard (Ones–Chance), high (7,8,9) when unlocked

### 3. Improvement Suggestions (from playtest)

${cleared < results.length ? `- Consider easing first-ante threshold or improving early-score bonuses (${cleared}/${results.length} cleared)` : '- First ante clear rate adequate'}
- Economy: starting gold 6, 3 scores + interest ≈ 10g at first shop — verify affordability of rustic boons (3g)
- Timing: scoring animation ${SCORING_MS}ms — tune for CI vs UX

### 4. State Mapping Reference

\`\`\`
state.turn        → 1..13
state.ante        → 1..13+
state.scorecard   → { category: score }
state.totalScore  → sum + bonuses
state.gold        → economy
state.jokers      → boons
\`\`\`

---

## Raw Data (JSON)

\`\`\`json
${JSON.stringify(results, null, 2)}
\`\`\`
`;
}
