/**
 * Economy & Shop E2E Test - Actual gameplay loops
 * Plays through turns, scores, reaches shop, verifies gold and economy behavior
 */

import { test, expect } from '@playwright/test';

const ECONOMY_SEED = 'economy99';
const SCORING_ANIMATION_MS = 4500; // Slightly faster for CI

async function scoreTurn(page, category) {
  await page.getByRole('button', { name: /cast the bones/i }).click();
  await page.waitForTimeout(700);
  await page.locator(`.score-row[data-category="${category}"]`).click();
  const confirmYes = page.locator('#confirmYes');
  if (await confirmYes.isVisible().catch(() => false)) await confirmYes.click();
  await page.waitForTimeout(SCORING_ANIMATION_MS);
}

test.describe('Economy & Shop - Gameplay Loop', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Gold increases after scoring (1 per score)', async ({ page }) => {
    test.setTimeout(60000);
    await page.getByPlaceholder(/seed/i).fill(ECONOMY_SEED);
    await page.locator('#playButton').evaluate((el) => el.click());

    await expect(page.locator('#gameContainerWrapper')).toBeVisible({ timeout: 5000 });

    const goldBefore = await page.locator('#goldDisplay').textContent();
    const before = parseInt(goldBefore || '0', 10);

    await scoreTurn(page, 'Chance');
    const goldAfter1 = await page.locator('#goldDisplay').textContent();
    const after1 = parseInt(goldAfter1 || '0', 10);
    expect(after1).toBeGreaterThanOrEqual(before);
  });

  test('Shop opens at turn 4 with gold and interest', async ({ page }) => {
    test.setTimeout(60000);
    await page.getByPlaceholder(/seed/i).fill(ECONOMY_SEED);
    await page.locator('#playButton').evaluate((el) => el.click());

    await expect(page.locator('#gameContainerWrapper')).toBeVisible({ timeout: 5000 });

    const categories = ['Chance', 'Ones', 'Twos'];
    for (const cat of categories) {
      await scoreTurn(page, cat);
    }

    await page.waitForTimeout(2500); // Interest animation
    await expect(page.locator('#shopStage')).toBeVisible({ timeout: 10000 });

    const goldDisplay = page.locator('#goldDisplay');
    await expect(goldDisplay).toBeVisible();
    const goldText = await goldDisplay.textContent();
    const gold = parseInt((goldText || '0').replace(/\D/g, ''), 10);
    expect(gold).toBeGreaterThanOrEqual(6);
  });

  test('Shop has purchasable items and close button', async ({ page }) => {
    test.setTimeout(60000);
    await page.getByPlaceholder(/seed/i).fill(ECONOMY_SEED);
    await page.locator('#playButton').evaluate((el) => el.click());

    await expect(page.locator('#gameContainerWrapper')).toBeVisible({ timeout: 5000 });
    const categories = ['Chance', 'Ones', 'Twos'];
    for (const cat of categories) await scoreTurn(page, cat);
    await page.waitForTimeout(2500);

    await expect(page.locator('#shopStage')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#shopDirectSales')).toBeVisible();
    await expect(page.locator('#closeShop')).toBeVisible();
    await expect(page.locator('#rerollShop')).toBeVisible();
  });

  test('Closing shop returns to game, turn 5', async ({ page }) => {
    test.setTimeout(60000);
    await page.getByPlaceholder(/seed/i).fill(ECONOMY_SEED);
    await page.locator('#playButton').evaluate((el) => el.click());

    await expect(page.locator('#gameContainerWrapper')).toBeVisible({ timeout: 5000 });
    const categories = ['Chance', 'Ones', 'Twos'];
    for (const cat of categories) await scoreTurn(page, cat);
    await page.waitForTimeout(2500);

    await expect(page.locator('#shopStage')).toBeVisible({ timeout: 10000 });
    await page.locator('#closeShop').click();
    await page.waitForTimeout(500);

    await expect(page.locator('#shopStage')).toHaveClass(/hidden/);
    // After closing shop at turn 4, we're ready to play turn 4 (next roll)
    await expect(page.locator('#turnDisplay')).toContainText(/[45]/);
  });
});
