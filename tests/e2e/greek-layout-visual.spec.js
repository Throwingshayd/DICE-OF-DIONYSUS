// @ts-check
import { test, expect } from '@playwright/test';

const VIEWPORT = { width: 1920, height: 1080 };

async function startPlay(page, query) {
    await page.addInitScript(() => {
        try {
            Object.keys(localStorage).forEach((k) => {
                if (k.startsWith('diceOfDionysus_')) localStorage.removeItem(k);
            });
            localStorage.setItem('diceOfDionysus_tutorialShown', '1');
        } catch (_) { /* ignore */ }
    });
    await page.setViewportSize(VIEWPORT);
    await page.goto(`/${query.startsWith('?') ? query : `?${query}`}`);
    await page.locator('#playButton').click();
    await expect(page.locator('#gameContainerWrapper')).toBeVisible({ timeout: 12000 });
    await page.waitForSelector('.main-game', { timeout: 12000 });
}

test.describe('Greek layout visual checks', () => {
    test('pantheon orthogonal rows and highfaces growth', async ({ page }) => {
        await startPlay(page, 'test=highfaces');

        await expect(page.locator('.pantheon-tier-upper .pantheon-chip:visible')).toHaveCount(8);
        await expect(page.locator('.pantheon-tier-lower .pantheon-chip:visible')).toHaveCount(9);

        const rowFlatness = await page.evaluate(() => {
            const rowSpread = (selector) => {
                const tops = [...document.querySelectorAll(selector)].map(
                    (el) => el.getBoundingClientRect().top
                );
                if (tops.length < 2) return 0;
                return Math.max(...tops) - Math.min(...tops);
            };
            return {
                upper: rowSpread('.pantheon-tier-upper .pantheon-chip'),
                lower: rowSpread('.pantheon-tier-lower .pantheon-chip'),
            };
        });
        expect(rowFlatness.upper).toBeLessThan(14);
        expect(rowFlatness.lower).toBeLessThan(14);

        await expect(page.locator('.consumable-drag-hint')).toHaveCount(0);

        await page.screenshot({
            path: '/opt/cursor/artifacts/greek_layout_highfaces.png',
            fullPage: false,
        });
    });

    test('libation drag reveals zone with type class', async ({ page }) => {
        await startPlay(page, 'test=libation:ambrosial_krasi');
        await expect(page.locator('#consumableSlots .card')).toHaveCount(1, { timeout: 12000 });

        const card = page.locator('#consumableSlots .card').first();
        const box = await card.boundingBox();
        expect(box).toBeTruthy();
        const cx = box.x + box.width / 2;
        const cy = box.y + box.height / 2;
        await page.mouse.move(cx, cy);
        await page.mouse.down();
        await page.mouse.move(cx, cy - 48, { steps: 10 });
        await page.waitForTimeout(200);

        const main = page.locator('.main-game');
        await expect(main).toHaveClass(/consumable-drag-active/);
        await expect(main).toHaveClass(/drag-type-libation/);
        await expect(page.locator('.consumable-zone-libation')).toHaveCSS('opacity', '1');

        await page.mouse.up();
        await page.screenshot({
            path: '/opt/cursor/artifacts/greek_libation_drag.png',
            fullPage: false,
        });
    });
});
