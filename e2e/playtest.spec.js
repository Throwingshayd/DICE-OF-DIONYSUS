/**
 * Dice of Dionysus - Full Playtest
 * Verifies scoring, shop, packs, and visual display work correctly.
 * Uses deterministic seed for reproducibility.
 */

import { test, expect } from '@playwright/test';

// Fixed seed for reproducible playtest
const PLAYTEST_SEED = 'playtest42';

// Wait for scoring animation (pips × favour step-through) - reduced for CI speed
const SCORING_ANIMATION_MS = 5500;

test.describe('Dice of Dionysus Playtest', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Start screen displays correctly', async ({ page }) => {
    await expect(page.getByRole('button', { name: /play/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /anthology/i })).toBeVisible();
    await expect(page.getByPlaceholder(/seed/i)).toBeVisible();
  });

  test('Game start - play button launches game with seed', async ({ page }) => {
    await page.getByPlaceholder(/seed/i).fill(PLAYTEST_SEED);
    await page.locator('#playButton').evaluate((el) => el.click());

    // Game container should be visible (template loads)
    const gameWrapper = page.locator('#gameContainerWrapper');
    await expect(gameWrapper).toBeVisible({ timeout: 5000 });
    await expect(gameWrapper).not.toHaveClass(/hidden/);

    // Dice area and roll button
    await expect(page.locator('#diceContainer')).toBeVisible({ timeout: 3000 });
    await expect(page.getByRole('button', { name: /cast the bones/i })).toBeVisible();

    // Scorecard visible
    await expect(page.locator('#scorecard')).toBeVisible();
    await expect(page.locator('.score-row[data-category="Chance"]')).toBeVisible();

    // Game info displays
    await expect(page.locator('#anteDisplay')).toContainText(/\d+/);
    await expect(page.locator('#turnDisplay')).toContainText(/\d+/);
    await expect(page.locator('#goldDisplay')).toBeVisible();
  });

  test('Roll and score - Chance category (always valid)', async ({ page }) => {
    await page.getByPlaceholder(/seed/i).fill(PLAYTEST_SEED);
    await page.locator('#playButton').evaluate((el) => el.click());

    await expect(page.locator('#gameContainerWrapper')).toBeVisible({ timeout: 5000 });

    // Roll dice
    await page.getByRole('button', { name: /cast the bones/i }).click();
    await page.waitForTimeout(800); // Dice roll animation

    // Click Chance to score (always valid)
    const chanceRow = page.locator('.score-row[data-category="Chance"]');
    await chanceRow.click();

    // Confirm if dialog appears; else game may score directly (fallback when overlay not bound)
    const confirmYes = page.locator('#confirmYes');
    const overlayVisible = await confirmYes.isVisible().catch(() => false);
    if (overlayVisible) await confirmYes.click();

    // Wait for scoring animation and turn advance
    await page.waitForTimeout(SCORING_ANIMATION_MS);

    // Turn should advance (turn 2)
    await expect(page.locator('#turnDisplay')).toContainText(/2/);
  });

  test('Shop opens after 3 scored turns (turn 4)', async ({ page }) => {
    test.setTimeout(60000);
    await page.getByPlaceholder(/seed/i).fill(PLAYTEST_SEED);
    await page.locator('#playButton').evaluate((el) => el.click());

    await expect(page.locator('#gameContainerWrapper')).toBeVisible({ timeout: 5000 });

    // Score 3 turns (each: roll -> click category -> confirm if dialog shows)
    const categories = ['Chance', 'Ones', 'Twos'];
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: /cast the bones/i }).click();
      await page.waitForTimeout(800);

      await page.locator(`.score-row[data-category="${categories[i]}"]`).click();
      const confirmYes = page.locator('#confirmYes');
      if (await confirmYes.isVisible().catch(() => false)) await confirmYes.click();
      await page.waitForTimeout(SCORING_ANIMATION_MS);
    }

    // Shop opens at turn 4 (interest animation then shop)
    await page.waitForTimeout(3000); // Interest animation frames

    const shopStage = page.locator('#shopStage');
    await expect(shopStage).toBeVisible({ timeout: 10000 });
    await expect(shopStage).not.toHaveClass(/hidden/);

    // Shop content (scope to shop stage - .shop-title exists elsewhere)
    await expect(page.locator('#shopStage .shop-title')).toContainText(/temple market/i);
    await expect(page.locator('#goldDisplay')).toBeVisible();
    await expect(page.locator('#rerollShop')).toBeVisible();
    await expect(page.locator('#closeShop')).toBeVisible();

    // Shop sections (Packs, Wares, Artifacts)
    await expect(page.locator('#shopPacksArea')).toBeVisible();
    await expect(page.locator('#shopDirectSales')).toBeVisible();
    await expect(page.locator('#shopArtifactsArea')).toBeVisible();
  });

  test('Shop - close and return to game', async ({ page }) => {
    test.setTimeout(60000);
    await page.getByPlaceholder(/seed/i).fill(PLAYTEST_SEED);
    await page.locator('#playButton').evaluate((el) => el.click());

    await expect(page.locator('#gameContainerWrapper')).toBeVisible({ timeout: 5000 });

    // Score 3 turns to reach shop (different category each turn)
    const categories = ['Chance', 'Ones', 'Twos'];
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: /cast the bones/i }).click();
      await page.waitForTimeout(800);
      await page.locator(`.score-row[data-category="${categories[i]}"]`).click();
      const confirmYes = page.locator('#confirmYes');
      if (await confirmYes.isVisible().catch(() => false)) await confirmYes.click();
      await page.waitForTimeout(SCORING_ANIMATION_MS);
    }

    await page.waitForTimeout(3000);
    await expect(page.locator('#shopStage')).toBeVisible({ timeout: 10000 });

    // Close shop
    await page.locator('#closeShop').click();
    await page.waitForTimeout(500);

    // Shop should close (stage swap: shopStage hidden)
    await expect(page.locator('#shopStage')).toHaveClass(/hidden/);

    // Game continues - turn 5, roll button available
    await expect(page.locator('#gameContainerWrapper')).toBeVisible();
    await expect(page.getByRole('button', { name: /cast the bones/i })).toBeVisible();
  });

  test('Visual display - dice, scorecard, live score (Gnosis)', async ({ page }) => {
    await page.getByPlaceholder(/seed/i).fill(PLAYTEST_SEED);
    await page.locator('#playButton').evaluate((el) => el.click());

    await expect(page.locator('#gameContainerWrapper')).toBeVisible({ timeout: 5000 });

    // Dice container and 5 dice rendered (dice created by UIManager after game start)
    const diceContainer = page.locator('#diceContainer');
    await expect(diceContainer).toBeVisible();
    await page.waitForTimeout(500); // Allow render cycle
    const diceCount = await page.locator('#diceContainer .die').count();
    expect(diceCount).toBeGreaterThanOrEqual(5); // At least 5 dice

    // Scorecard categories
    const categories = ['Ones', 'Twos', 'Threes', 'Fours', 'Fives', 'Sixes',
      'Three of a Kind', 'Small Straight', 'Full House', 'Four of a Kind',
      'Large Straight', 'Yahtzee', 'Chance'];
    for (const cat of categories) {
      await expect(page.locator(`.score-row[data-category="${cat}"]`)).toBeVisible();
    }

    // Live score display (Gnosis) exists
    await expect(page.locator('#liveScoreDisplay')).toBeVisible();
  });

  test('Packs visible in shop when affordable', async ({ page }) => {
    test.setTimeout(60000);
    await page.getByPlaceholder(/seed/i).fill(PLAYTEST_SEED);
    await page.locator('#playButton').evaluate((el) => el.click());

    await expect(page.locator('#gameContainerWrapper')).toBeVisible({ timeout: 5000 });

    // Score 3 turns (earn some gold) - different category each turn
    const categories = ['Chance', 'Ones', 'Twos'];
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: /cast the bones/i }).click();
      await page.waitForTimeout(800);
      await page.locator(`.score-row[data-category="${categories[i]}"]`).click();
      const confirmYes = page.locator('#confirmYes');
      if (await confirmYes.isVisible().catch(() => false)) await confirmYes.click();
      await page.waitForTimeout(SCORING_ANIMATION_MS);
    }

    await page.waitForTimeout(3000);
    await expect(page.locator('#shopStage')).toBeVisible({ timeout: 10000 });

    // Packs section should have content (at least heading)
    const packsArea = page.locator('#shopPacksArea');
    await expect(packsArea).toBeVisible();
    await expect(packsArea).toContainText(/pack/i);
  });
});
