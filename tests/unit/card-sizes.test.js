import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('card size system', () => {
    it('card-sizes.css uses one footprint for in-game cards only', () => {
        const css = readFileSync('game/css/card-sizes.css', 'utf8');
        expect(css).toContain('--card-w: 140px');
        expect(css).toContain('--card-h: 187px');
        expect(css).toContain('.consumable-slots.card-area-squish .card');
        expect(css).not.toContain('.drag-ghost.card');
        expect(css).not.toContain('.shop-drag-lift.card');
    });

    it('UIConstants CARD_LAYOUT is 140×187', () => {
        const js = readFileSync('game/js/config/UIConstants.js', 'utf8');
        expect(js).toContain('CARD_W: 140');
        expect(js).toContain('CARD_H: 187');
    });

    it('CardDragSurface pins drag to screen rect without forcing layout size', () => {
        const js = readFileSync('game/js/utils/CardDragSurface.js', 'utf8');
        expect(js).toContain('pinToScreenRect');
        expect(js).toContain('getBoundingClientRect');
        expect(js).not.toContain('applyFixedRect');
        expect(js).not.toContain('getTargetSize');
    });
});
