import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('Greek theme wiring', () => {
    it('index.html loads greek-theme.css after styles.css', () => {
        const html = readFileSync('game/index.html', 'utf8');
        const stylesIdx = html.indexOf('href="css/styles.css"');
        const greekIdx = html.indexOf('href="css/greek-theme.css"');
        expect(stylesIdx).toBeGreaterThan(-1);
        expect(greekIdx).toBeGreaterThan(stylesIdx);
    });

    it('greek-theme.css defines marble pantheon frieze', () => {
        const css = readFileSync('game/css/greek-theme.css', 'utf8');
        expect(css).toContain('.main-game .pantheon-frieze');
        expect(css).toContain('var(--gk-marble-1)');
        expect(css).toContain('LIBATIONS');
        expect(css).toContain('Greater Pantheon');
    });
});
