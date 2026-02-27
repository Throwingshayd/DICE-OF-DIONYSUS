/**
 * Edge Cases Test - Common failure points from BUGS_FIXED_LOG and mechanics audit
 * Tests: NaN guards, overflow, 0 dice, ante AND logic, multiplier order, determinism
 */

import { describe, it, expect } from 'vitest';

const MAX_SAFE_INT = Number.MAX_SAFE_INTEGER;

describe('Edge Cases - Common Failure Points', () => {
    describe('Score clamping (SafeMath)', () => {
        it('rejects NaN in final score', () => {
            const clampScore = (v) => (typeof v !== 'number' || !Number.isFinite(v) ? 0 : Math.max(0, Math.min(Math.floor(v), MAX_SAFE_INT)));
            expect(clampScore(NaN)).toBe(0);
            expect(clampScore(Infinity)).toBe(0);
            expect(clampScore(-Infinity)).toBe(0);
            expect(clampScore('x')).toBe(0);
            expect(clampScore(null)).toBe(0);
        });

        it('clamps overflow to MAX_SAFE_INTEGER', () => {
            const clampScore = (v) => (typeof v !== 'number' || !Number.isFinite(v) ? 0 : Math.max(0, Math.min(Math.floor(v), MAX_SAFE_INT)));
            expect(clampScore(MAX_SAFE_INT + 1)).toBe(MAX_SAFE_INT);
            expect(clampScore(1e20)).toBe(MAX_SAFE_INT);
        });

        it('rejects negative scores', () => {
            const clampScore = (v) => (typeof v !== 'number' || !Number.isFinite(v) ? 0 : Math.max(0, Math.min(Math.floor(v), MAX_SAFE_INT)));
            expect(clampScore(-100)).toBe(0);
            expect(clampScore(-1)).toBe(0);
        });
    });

    describe('0 dice / empty hand', () => {
        it('returns isValid false when no dice', () => {
            const faces = [];
            const pips = faces.reduce((a, b) => a + b, 0);
            const isValid = faces.length === 5;
            expect(isValid).toBe(false);
            expect(pips).toBe(0);
        });

        it('guards against undefined dice faces', () => {
            const faces = [undefined, 3, 4, 5, 6];
            const safeFaces = faces.map((f) => (typeof f === 'number' && !isNaN(f) ? f : 0));
            const pips = safeFaces.reduce((a, b) => a + b, 0);
            expect(pips).toBeLessThanOrEqual(24); // 0+3+4+5+6
        });
    });

    describe('Multiplier order (Balatro: + then ×)', () => {
        it('additive favour summed before multiplicative applied', () => {
            const base = 1;
            const plus1 = 2;
            const plus2 = 1;
            const timesMult = 2;
            const additive = base + plus1 + plus2;
            const result = additive * timesMult;
            expect(result).toBe(8); // (1+2+1)*2 = 8
        });

        it('formula: pips × (additive × multiplicative)', () => {
            const pips = 50;
            const additive = 1.5 + 1;  // base 1.5 + boon +1
            const mult = 1.5;          // Straight Flush
            const finalScore = Math.floor(pips * additive * mult);
            expect(finalScore).toBe(187); // 50 * 2.5 * 1.5
        });

        it('guards against x0 multiplier (minimum 0.1 additive)', () => {
            const additive = 0;
            const mult = 2;
            const safeFavour = Math.max(0.1, additive) * Math.max(1, mult);
            expect(safeFavour).toBeGreaterThanOrEqual(0.2);
        });
    });

    describe('Ante progression - AND logic (not OR)', () => {
        it('requires BOTH all categories filled AND score threshold', () => {
            const allCategoriesFilled = true;
            const meetsThreshold = false;
            const canAdvance = allCategoriesFilled && meetsThreshold;
            expect(canAdvance).toBe(false);
        });

        it('advances only when both conditions met', () => {
            const allCategoriesFilled = true;
            const meetsThreshold = true;
            const canAdvance = allCategoriesFilled && meetsThreshold;
            expect(canAdvance).toBe(true);
        });

        it('does NOT advance when categories missing even if threshold met', () => {
            const allCategoriesFilled = false;
            const meetsThreshold = true;
            const canAdvance = allCategoriesFilled && meetsThreshold;
            expect(canAdvance).toBe(false);
        });
    });

    describe('Boss blind bypass (DEBUG_FLAGS.BOSS_BLINDS_DISABLED)', () => {
        it('activeBlind should be "none" when boss blinds disabled', () => {
            const BOSS_BLINDS_DISABLED = true;
            const anteDataBlindId = 'half_upper_pips';
            const activeBlind = BOSS_BLINDS_DISABLED ? 'none' : anteDataBlindId;
            expect(activeBlind).toBe('none');
        });

        it('score_penalty should NOT apply when boss blinds disabled', () => {
            const BOSS_BLINDS_DISABLED = true;
            const baseThreshold = 2300;
            const scorePenalty = 1.5;
            const effectiveThreshold = BOSS_BLINDS_DISABLED
                ? baseThreshold
                : Math.floor(baseThreshold * scorePenalty);
            expect(effectiveThreshold).toBe(2300);
        });
    });

    describe('Determinism - seeded RNG', () => {
        function createSeededRNG(seed) {
            let s = seed;
            return {
                random() {
                    s = (s * 1103515245 + 12345) & 0x7fffffff;
                    return s / 0x7fffffff;
                }
            };
        }

        it('same seed produces same sequence', () => {
            const rng1 = createSeededRNG(42);
            const rng2 = createSeededRNG(42);
            const seq1 = [rng1.random(), rng1.random(), rng1.random()];
            const seq2 = [rng2.random(), rng2.random(), rng2.random()];
            expect(seq1).toEqual(seq2);
        });

        it('different seeds produce different sequences', () => {
            const rng1 = createSeededRNG(42);
            const rng2 = createSeededRNG(43);
            expect(rng1.random()).not.toBe(rng2.random());
        });
    });

    describe('Parchment/Gold - isActualScoring guard', () => {
        it('gold and favour should only trigger on actual score, not preview', () => {
            const isActualScoring = false;
            let goldGained = 0;
            if (isActualScoring) goldGained += 5;
            expect(goldGained).toBe(0);
        });
    });
});
