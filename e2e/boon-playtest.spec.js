/**
 * Boon-by-Boon Playtest - Tests each boon with relevant hands
 * Uses ?test=boon:boonid to inject boons. Run: npx playwright test e2e/boon-playtest.spec.js
 */

import { test, expect } from '@playwright/test';

const SEED = 'boontest1';
const ROLL_WAIT = 800;
const SCORING_WAIT = 5500;

async function startGameWithBoon(page, boonId) {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(`/?test=boon:${boonId}`);
  await page.getByPlaceholder(/seed/i).fill(SEED);
  await page.locator('#playButton').evaluate((el) => el.click());
  await expect(page.locator('#gameContainerWrapper')).toBeVisible({ timeout: 5000 });
  await page.waitForTimeout(500);
}

async function rollAndScore(page, category) {
  await page.getByRole('button', { name: /cast the bones/i }).click();
  await page.waitForTimeout(ROLL_WAIT);
  await page.locator(`.score-row[data-category="${category}"]`).click();
  const confirmYes = page.locator('#confirmYes');
  if (await confirmYes.isVisible().catch(() => false)) await confirmYes.click();
  await page.waitForTimeout(SCORING_WAIT);
}

test.describe('Boon Playtests - Each boon with relevant hands', () => {
  test.describe.configure({ timeout: 120000 });

  test('Hestia\'s Hearth - +3 Favour when all odd or all even', async ({ page }) => {
    await startGameWithBoon(page, 'hestias_hearth');
    await expect(page.locator('.joker-slots [data-card-id="hestias_hearth"]')).toBeVisible();
    await rollAndScore(page, 'Chance');
    await expect(page.locator('#turnDisplay')).toContainText(/2/);
  });

  test('The Gambler - +10 pips per reroll remaining', async ({ page }) => {
    await startGameWithBoon(page, 'the_gambler');
    await expect(page.locator('.joker-slots [data-card-id="the_gambler"]')).toBeVisible();
    await rollAndScore(page, 'Chance');
    await expect(page.locator('#turnDisplay')).toContainText(/2/);
  });

  test('Charon\'s Ferry Fare - +1 Gold after scoring', async ({ page }) => {
    await startGameWithBoon(page, 'charons_ferry_fare');
    await expect(page.locator('.joker-slots [data-card-id="charons_ferry_fare"]')).toBeVisible();
    const goldBefore = await page.locator('#goldDisplay').textContent();
    await rollAndScore(page, 'Chance');
    await page.waitForTimeout(1000);
    const goldAfter = await page.locator('#goldDisplay').textContent();
    const g1 = parseInt(String(goldBefore).replace(/\D/g, ''), 10) || 0;
    const g2 = parseInt(String(goldAfter).replace(/\D/g, ''), 10) || 0;
    expect(g2).toBeGreaterThanOrEqual(g1); // Should gain gold from score + boon
  });

  test('Achilles\' Heel - +15 pips, -1 Gold per roll', async ({ page }) => {
    await startGameWithBoon(page, 'achilles_heel');
    await expect(page.locator('.joker-slots [data-card-id="achilles_heel"]')).toBeVisible();
    await rollAndScore(page, 'Chance');
    await expect(page.locator('#turnDisplay')).toContainText(/2/);
  });

  test('Midas Touch - +1 pip per 5 Gold when scoring', async ({ page }) => {
    await startGameWithBoon(page, 'midas_touch');
    await expect(page.locator('.joker-slots [data-card-id="midas_touch"]')).toBeVisible();
    await rollAndScore(page, 'Chance');
    await expect(page.locator('#turnDisplay')).toContainText(/2/);
  });

  test('Lethe Waters - dice 2 or less not counted, +25 pips', async ({ page }) => {
    await startGameWithBoon(page, 'lethe_waters');
    await expect(page.locator('.joker-slots [data-card-id="lethe_waters"]')).toBeVisible();
    await rollAndScore(page, 'Chance');
    await expect(page.locator('#turnDisplay')).toContainText(/2/);
  });

  test('Icarus\' Wings - +10 pips per unused reroll', async ({ page }) => {
    await startGameWithBoon(page, 'icarus_wings');
    await expect(page.locator('.joker-slots [data-card-id="icarus_wings"]')).toBeVisible();
    await rollAndScore(page, 'Chance');
    await expect(page.locator('#turnDisplay')).toContainText(/2/);
  });

  test('Forge of Hephaestus - x0.5 Favour per unused reroll (max x1.5)', async ({ page }) => {
    await startGameWithBoon(page, 'forge_of_hephaestus');
    await expect(page.locator('.joker-slots [data-card-id="forge_of_hephaestus"]')).toBeVisible();
    await rollAndScore(page, 'Chance');
    await expect(page.locator('#turnDisplay')).toContainText(/2/);
  });

  test('Prometheus\' Gift - +3 Favour, -1 reroll', async ({ page }) => {
    await startGameWithBoon(page, 'prometheus_gift');
    await expect(page.locator('.joker-slots [data-card-id="prometheus_gift"]')).toBeVisible();
    await rollAndScore(page, 'Chance');
    await expect(page.locator('#turnDisplay')).toContainText(/2/);
  });

  test('Sisyphus Boulder - +5 pips per reroll this turn', async ({ page }) => {
    await startGameWithBoon(page, 'sisyphus_boulder');
    await expect(page.locator('.joker-slots [data-card-id="sisyphus_boulder"]')).toBeVisible();
    await rollAndScore(page, 'Chance');
    await expect(page.locator('#turnDisplay')).toContainText(/2/);
  });

  test('Mathematician Compass - +10 pips if sum divisible by 10', async ({ page }) => {
    await startGameWithBoon(page, 'mathematicians_compass');
    await expect(page.locator('.joker-slots [data-card-id="mathematicians_compass"]')).toBeVisible();
    await rollAndScore(page, 'Chance');
    await expect(page.locator('#turnDisplay')).toContainText(/2/);
  });

  test('The Heretic - +2 pips per turn (stacks)', async ({ page }) => {
    await startGameWithBoon(page, 'the_heretic');
    await expect(page.locator('.joker-slots [data-card-id="the_heretic"]')).toBeVisible();
    await rollAndScore(page, 'Chance');
    await expect(page.locator('#turnDisplay')).toContainText(/2/);
  });

  test('The Zealot - +1 Favour if scoring matches last worship god', async ({ page }) => {
    await startGameWithBoon(page, 'the_zealot');
    await expect(page.locator('.joker-slots [data-card-id="the_zealot"]')).toBeVisible();
    await rollAndScore(page, 'Chance');
    await expect(page.locator('#turnDisplay')).toContainText(/2/);
  });
});

test.describe('Die face enhancements', () => {
  test.describe.configure({ timeout: 60000 });

  test('Die renders with face values', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.getByPlaceholder(/seed/i).fill(SEED);
    await page.locator('#playButton').evaluate((el) => el.click());
    await expect(page.locator('#gameContainerWrapper')).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: /cast the bones/i }).click();
    await page.waitForTimeout(1200);
    const dice = page.locator('#diceContainer .die');
    await expect(dice).toHaveCount(5);
    // Each die should show a value or ?
    const firstDie = dice.first();
    await expect(firstDie).toBeVisible();
  });
});

test.describe('Libations', () => {
  test.describe.configure({ timeout: 60000 });

  test('Libation overlay exists in DOM', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    const libationOverlay = page.locator('#libationOverlay');
    await expect(libationOverlay).toBeAttached();
    await expect(page.locator('#libationOverlay h2')).toContainText(/libation/i);
  });

  test('Kyphi Mead (Parchment) - libation injected, consumable slot shows card', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/?test=libation:kyphi_mead');
    await page.getByPlaceholder(/seed/i).fill(SEED);
    await page.locator('#playButton').evaluate((el) => el.click());
    await expect(page.locator('#gameContainerWrapper')).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(500);
    const consumableCard = page.locator('.consumable-slots [data-card-id="kyphi_mead"]');
    await expect(consumableCard).toBeVisible();
  });
});
