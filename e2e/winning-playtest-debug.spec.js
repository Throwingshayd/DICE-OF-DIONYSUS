/**
 * Short winning playtest for debugging - 2 iterations to reproduce roll button disabled
 */
import { test, expect } from '@playwright/test';

const ITERATIONS = 2;
const SCORING_MS = 1200;
const CATEGORIES = [
  'Chance', 'Ones', 'Twos', 'Threes', 'Fours', 'Fives', 'Sixes',
  'Three of a Kind', 'Small Straight', 'Full House', 'Four of a Kind',
  'Large Straight', 'Yahtzee'
];

async function waitForRollButtonReady(page, timeoutMs = 15000) {
  const rollBtn = page.getByRole('button', { name: /cast the bones/i });
  await rollBtn.waitFor({ state: 'visible', timeout: timeoutMs });
  await rollBtn.waitFor({ state: 'attached', timeout: timeoutMs });
  for (let i = 0; i < timeoutMs / 200; i++) {
    const disabled = await rollBtn.isDisabled().catch(() => true);
    if (!disabled) break;
    await page.waitForTimeout(200);
  }
  await page.waitForTimeout(300);
}

async function scoreTurn(page, category) {
  await waitForRollButtonReady(page);
  const rollBtn = page.getByRole('button', { name: /cast the bones/i });
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
    await page.waitForTimeout(2000); // Stage swap + ante transition overlay
    const beginBtn2 = page.locator('#anteBeginButton, .ante-begin-button');
    await beginBtn2.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    if (await beginBtn2.isVisible().catch(() => false)) {
      await beginBtn2.click();
      await page.waitForTimeout(800);
    }
    await waitForRollButtonReady(page); // Human-like: wait for roll button enabled
  }
}

test('Winning playtest debug - 2 iterations', async ({ page }) => {
  test.setTimeout(300000); // 5 min - 2 iterations × ~2 min each
  const results = [];

  for (let iter = 0; iter < ITERATIONS; iter++) {
    const seed = `winning${iter}`;
    const run = { seed, maxAnte: 1, errors: [] };

    await page.goto('/?test=winning');
    await page.getByPlaceholder(/seed/i).fill(seed);
    await page.locator('#playButton').evaluate((el) => el.click());

    await expect(page.locator('#gameContainerWrapper')).toBeVisible({ timeout: 5000 });

    let done = false;
    let anteCount = 0;

    while (!done && anteCount < 3) {
      for (let t = 0; t < CATEGORIES.length; t++) {
        try {
          const gameOver = await page.evaluate(() => window.game?.state?.gameOver).catch(() => false);
          if (gameOver) {
            done = true;
            break;
          }
          if (t === 3 || t === 7) await closeShopAndTransitions(page);
          await scoreTurn(page, CATEGORIES[t]);
          if (t === 2 || t === 6) await closeShopAndTransitions(page);
        } catch (e) {
          run.errors.push(`Ante ${anteCount + 1} turn ${t + 1} (${CATEGORIES[t]}): ${e.message}`);
          done = true;
          break;
        }
      }
      if (done) break;

      anteCount++;
      run.maxAnte = anteCount + 1;
      await page.waitForTimeout(2500);
      await closeShopAndTransitions(page);
    }

    results.push(run);
  }

  const withErrors = results.filter(r => r.errors.length > 0).length;
  expect(withErrors).toBe(0);
});
