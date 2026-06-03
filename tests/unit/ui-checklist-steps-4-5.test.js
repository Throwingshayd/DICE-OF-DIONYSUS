import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('UI checklist steps 4–5 wiring', () => {
    it('artifacts use rack surface, shop drag-to-gold, and anthology render path', () => {
        const artifact = readFileSync('game/js/classes/Artifact.js', 'utf8');
        const shop = readFileSync('game/js/ui/ShopUI.js', 'utf8');
        const main = readFileSync('game/js/Main.js', 'utf8');

        expect(artifact).toContain('CARD_SURFACE.RACK');
        expect(artifact).toContain('dataset.cardSurface = surface');
        expect(artifact).toContain('card-type-indicator');
        expect(artifact).toContain('card-shop-cost');

        expect(shop).toContain("mode: 'artifact'");
        expect(shop).toContain('shop-draggable-artifact');
        expect(shop).toContain("ctx.mode === 'artifact'");
        expect(shop).toContain('buyArtifact(ctx.artifactData');

        expect(main).toContain('populateArtifacts(collection)');
        expect(main).toContain('_renderRackCard(new Artifact(artifactData))');
        expect(main).toContain('ensureAnthologyTooltipsReady');
    });

    it('anthology exposes four tabs, paging, and click-to-pin tooltips on cards', () => {
        const html = readFileSync('game/index.html', 'utf8');
        const main = readFileSync('game/js/Main.js', 'utf8');
        const effects = readFileSync('game/js/ui/BalatroEffects.js', 'utf8');

        expect(html).toContain('data-tab="boons"');
        expect(html).toContain('data-tab="artifacts"');
        expect(html).toContain('data-tab="worship"');
        expect(html).toContain('data-tab="libations"');
        expect(html).toContain('collectionPrevPageBtn');
        expect(html).toContain('collectionNextPageBtn');

        expect(main).toContain('pageByTab = { boons: 0, artifacts: 0, worship: 0, libations: 0 }');
        expect(main).toContain('pageSize = 9');
        expect(main).toContain('turnPage(delta)');
        expect(main).toContain('unlockAllInAnthology = true');

        expect(effects).toContain('Click-to-pin on cards only');
        expect(effects).toContain('pinnedTooltips');
        expect(effects).toContain('tooltip-card');
    });
});
