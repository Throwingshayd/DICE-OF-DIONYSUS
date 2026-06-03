import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('Greek theme wiring', () => {
    it('index.html loads card-sizes and card-present after tooltips', () => {
        const html = readFileSync('game/index.html', 'utf8');
        const stylesIdx = html.indexOf('href="css/styles.css"');
        const greekIdx = html.indexOf('href="css/greek-theme.css"');
        const tooltipsIdx = html.indexOf('href="css/tooltips.css"');
        const cardSizesIdx = html.indexOf('href="css/card-sizes.css"');
        const cardPresentIdx = html.indexOf('href="css/card-present.css"');
        const visualIdx = html.indexOf('href="css/visual-tokens.css"');
        expect(stylesIdx).toBeGreaterThan(-1);
        expect(greekIdx).toBeGreaterThan(stylesIdx);
        expect(greekIdx).toBeGreaterThan(visualIdx);
        expect(tooltipsIdx).toBeGreaterThan(greekIdx);
        expect(cardSizesIdx).toBeGreaterThan(tooltipsIdx);
        expect(cardPresentIdx).toBeGreaterThan(cardSizesIdx);
    });

    it('greek-theme.css defines marble pantheon frieze and side stelae', () => {
        const css = readFileSync('game/css/greek-theme.css', 'utf8');
        expect(css).toContain('.main-game .pantheon-frieze');
        expect(css).toContain('var(--gk-marble-1)');
        expect(css).toContain('LIBATIONS');
        expect(css).toContain('BOONS');
        expect(css).toContain('Greater Pantheon');
    });
});
