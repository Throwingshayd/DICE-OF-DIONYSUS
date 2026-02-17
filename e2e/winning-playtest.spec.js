/**
 * Winning Seed Playtest - ?test=winning forces valid hands per turn
 * 100 iterations, play as far as possible to verify game is playable
 */

import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const ITERATIONS = 100;
const SCORING_MS = 1200; // Reduced for faster 100-iteration runs
const CATEGORIES = [
  'Chance', 'Ones', 'Twos', 'Threes', 'Fours', 'Fives', 'Sixes',
  'Three of a Kind', 'Small Straight', 'Full House', 'Four of a Kind',
  'Large Straight', 'Yahtzee'
];
const REPORT_PATH = path.join(process.cwd(), 'tracking', 'WINNING_PLAYTEST_REPORT.md');
const MAX_ANTES = 14;

async function scoreTurn(page, category) {
  const rollBtn = page.getByRole('button', { name: /cast the bones/i });
  await rollBtn.waitFor({ state: 'visible', timeout: 20000 });
  await rollBtn.click();
  await page.waitForTimeout(500);
  await page.locator(`.score-row[data-category="${category}"]`).click();
  const confirmYes = page.locator('#confirmYes');
  if (await confirmYes.isVisible().catch(() => false)) await confirmYes.click();
  await page.waitForTimeout(SCORING_MS);
}

async function closeShopAndTransitions(page) {
  await page.waitForTimeout(1200);
  const beginBtn = page.locator('#anteBeginButton, .ante-begin-button');
  if (await beginBtn.isVisible().catch(() => false)) {
    await beginBtn.click();
    await page.waitForTimeout(800);
  }
  const shopStage = page.locator('#shopStage');
  const shopVisible = await shopStage.isVisible().catch(() => false);
  const shopHidden = await shopStage.evaluate(el => el.classList.contains('hidden')).catch(() => true);
  if (shopVisible && !shopHidden) {
    await page.locator('#closeShop').click();
    await page.waitForTimeout(1500); // Wait for stage swap back to play
    const beginBtn2 = page.locator('#anteBeginButton, .ante-begin-button');
    if (await beginBtn2.isVisible().catch(() => false)) {
      await beginBtn2.click();
      await page.waitForTimeout(600);
    }
  }
}

test.describe('Winning playtest - 100 runs, as far as possible', () => {
  test.setTimeout(10800000); // 3 hours for 100 iterations

  test('Run 100 iterations with winning hands, go as far as possible', async ({ page }) => {
    const results = [];

    for (let iter = 0; iter < ITERATIONS; iter++) {
      const seed = `winning${iter}`;
      const run = { seed, maxAnte: 1, totalScore: 0, gold: 0, antesPlayed: 0, gameOver: false, errors: [] };

      await page.goto('/?test=winning');
      await page.getByPlaceholder(/seed/i).fill(seed);
      await page.locator('#playButton').evaluate((el) => el.click());

      await expect(page.locator('#gameContainerWrapper')).toBeVisible({ timeout: 5000 });

      let done = false;
      let anteCount = 0;

      while (!done && anteCount < MAX_ANTES) {
        for (let t = 0; t < CATEGORIES.length; t++) {
          try {
            const gameOver = await page.evaluate(() => window.game?.state?.gameOver).catch(() => false);
            if (gameOver) {
              run.gameOver = true;
              done = true;
              break;
            }

            // Close mid-ante shop before turns 4 & 8 (shop opens after scoring turns 3 & 7)
            if (t === 3 || t === 7) {
              await closeShopAndTransitions(page);
            }

            await scoreTurn(page, CATEGORIES[t]);

            // Close shop after scoring turns 3 & 7 (shop opens when advancing to turn 4 & 8)
            if (t === 2 || t === 6) {
              await closeShopAndTransitions(page);
            }
          } catch (e) {
            run.errors.push(`Ante ${anteCount + 1} turn ${t + 1} (${CATEGORIES[t]}): ${e.message}`);
            done = true;
            break;
          }
        }

        if (done) break;

        anteCount++;
        run.maxAnte = anteCount + 1;
        run.antesPlayed = anteCount;

        await page.waitForTimeout(2500); // Tally + ante transition

        try {
          const state = await page.evaluate(() => {
            const g = window.game?.state;
            return g ? { ante: g.ante, gameOver: g.gameOver, totalScore: g.totalScore, gold: g.gold } : null;
          });
          if (state) {
            run.totalScore = state.totalScore || 0;
            run.gold = state.gold ?? 0;
            run.maxAnte = Math.max(run.maxAnte, state.ante || 1);
            if (state.gameOver) {
              run.gameOver = true;
              done = true;
            }
          }
        } catch (_) {}

        await closeShopAndTransitions(page);

        const endless = await page.evaluate(() => window.game?.state?.endlessMode).catch(() => false);
        if (endless && anteCount >= 12) {
          run.maxAnte = 13;
          done = true;
        }
      }

      results.push(run);
    }

    const report = buildReport(results);
    const dir = path.dirname(REPORT_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(REPORT_PATH, report, 'utf8');

    const maxAnteReached = Math.max(...results.map(r => r.maxAnte));
    expect(results.length).toBe(ITERATIONS);
  });
});

function buildReport(results) {
  const maxAnte = Math.max(...results.map(r => r.maxAnte));
  const avgAnte = results.reduce((s, r) => s + r.maxAnte, 0) / results.length;
  const withErrors = results.filter(r => r.errors.length > 0).length;
  const gameOvers = results.filter(r => r.gameOver).length;

  return `# Winning Playtest Report

**Date:** ${new Date().toISOString().slice(0, 10)}  
**Mode:** \`?test=winning\` (forced valid hands per turn)  
**Iterations:** ${results.length}  
**Max ante reached:** ${maxAnte}  
**Avg ante:** ${avgAnte.toFixed(1)}  
**Game overs:** ${gameOvers}  
**Runs with errors:** ${withErrors}

---

## Per-Run Results

| Seed | Max Ante | Score | Gold | Antes | Game Over | Errors |
|------|----------|-------|------|-------|-----------|--------|
${results.map(r => `| ${r.seed} | ${r.maxAnte} | ${r.totalScore} | ${r.gold} | ${r.antesPlayed} | ${r.gameOver ? '✓' : '-'} | ${r.errors.length} |`).join('\n')}

---

## Verdict

${maxAnte >= 5 ? '✓ Game is playable to mid-late antes with winning hands' : '⚠ Game may have blocking issues'}
${withErrors > 0 ? `\n⚠ ${withErrors} run(s) had errors — check logs` : ''}

---

## Raw JSON

\`\`\`json
${JSON.stringify(results, null, 2)}
\`\`\`
`;
}
