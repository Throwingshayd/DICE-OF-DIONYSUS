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
    test('pantheon symmetry and highfaces growth', async ({ page }) => {
        await startPlay(page, 'test=highfaces');

        await expect(page.locator('.pantheon-tier-upper .pantheon-chip:visible')).toHaveCount(8);
        await expect(page.locator('.pantheon-tier-lower .pantheon-chip:visible')).toHaveCount(9);

        const offsets = await page.evaluate(() => {
            const measure = (tierSel) => {
                const tier = document.querySelector(tierSel);
                if (!tier) return null;
                const tierRect = tier.getBoundingClientRect();
                const tierCenter = tierRect.left + tierRect.width / 2;
                const chips = [...tier.querySelectorAll('.pantheon-chip')].filter(
                    (c) => c.getClientRects().length > 0
                );
                const centers = chips.map((c) => {
                    const r = c.getBoundingClientRect();
                    return r.left + r.width / 2;
                });
                const avg = centers.reduce((a, b) => a + b, 0) / (centers.length || 1);
                return Math.abs(avg - tierCenter);
            };
            return {
                upper: measure('.pantheon-tier-upper'),
                lower: measure('.pantheon-tier-lower'),
            };
        });

        expect(offsets.upper).not.toBeNull();
        expect(offsets.lower).not.toBeNull();
        expect(offsets.upper).toBeLessThan(10);
        expect(offsets.lower).toBeLessThan(14);

        await page.screenshot({
            path: '/opt/cursor/artifacts/greek_layout_highfaces.png',
            fullPage: false,
        });
    });

    test('worship drag reveals zone with type class', async ({ page }) => {
        await startPlay(page, 'test=worship:worship_zeus');
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
        await expect(main).toHaveClass(/drag-type-worship/);
        await expect(page.locator('.consumable-zone-worship')).toHaveCSS('opacity', '1');

        await page.mouse.up();
        await page.screenshot({
            path: '/opt/cursor/artifacts/greek_worship_drag.png',
            fullPage: false,
        });
    });
});
