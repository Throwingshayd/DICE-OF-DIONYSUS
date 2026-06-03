import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('ScoringEngine.validateRun wiring', () => {
    it('ScoringEngine exposes validateRun before runPipeline', () => {
        const js = readFileSync('game/js/engine/ScoringEngine.js', 'utf8');
        expect(js).toContain('validateRun(state, category)');
        expect(js.indexOf('validateRun')).toBeLessThan(js.indexOf('runPipeline(category'));
    });

    it('calculateScore delegates validation to ScoringEngine.validateRun', () => {
        const js = readFileSync('game/js/game/GameEngine.js', 'utf8');
        expect(js).toContain('ScoringEngine.validateRun(this.state, category)');
        expect(js).not.toMatch(/if\s*\(\s*!fromPipeline\s*\)/);
    });

    it('LiveScoreController owns preview and cashout DOM updates', () => {
        const ctrl = readFileSync('game/js/ui/LiveScoreController.js', 'utf8');
        const engine = readFileSync('game/js/game/GameEngine.js', 'utf8');
        expect(ctrl).toContain('buildPreviewSplit');
        expect(ctrl).not.toContain('onTimingEvent');
        expect(engine).toContain('new LiveScoreController(this)');
        expect(engine).toContain('ensureLiveScore()?.schedulePreview');
    });
});
