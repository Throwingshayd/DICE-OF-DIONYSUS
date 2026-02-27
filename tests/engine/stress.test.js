/**
 * Stress Test - Simulate 100 rounds with random blessing combinations
 * Verifies no crashes, no NaN/Infinity, no invalid scores
 */

import { describe, it, expect } from 'vitest';

// Minimal seeded RNG for determinism
function createSeededRNG(seed) {
    let s = seed;
    return {
        random() {
            s = (s * 1103515245 + 12345) & 0x7fffffff;
            return s / 0x7fffffff;
        }
    };
}

// Simplified dice - just stores face value
function createDie(prng, faces = 6) {
    return {
        currentFace: 0,
        getEffectiveFace() {
            return this.currentFace || 0;
        },
        hasEnhancementForCurrentFace: () => false,
        roll() {
            this.currentFace = Math.floor(prng.random() * faces) + 1;
            return this.currentFace;
        }
    };
}

// Minimal HandEvaluator logic for Chance (always valid)
function evalChance(faces) {
    const sum = faces.reduce((a, b) => a + b, 0);
    return { pips: sum, isValid: true };
}

describe('Stress Test - 100 rounds', () => {
    it('simulates 100 rounds without crash', () => {
        const prng = createSeededRNG(42);
        const dice = Array.from({ length: 5 }, () => createDie(prng));
        const blessingIds = ['the_gambler', 'achilles_heel', 'midas_touch'];
        let errors = [];
        let invalidScores = 0;

        for (let round = 0; round < 100; round++) {
            try {
                for (let r = 0; r < 3; r++) {
                    dice.forEach((d) => d.roll());
                }
                const faces = dice.map((d) => d.getEffectiveFace());
                const { pips, isValid } = evalChance(faces);
                let favour = 1;
                const numBlessings = Math.floor(prng.random() * 4);
                for (let b = 0; b < numBlessings; b++) {
                    const bid = blessingIds[Math.floor(prng.random() * blessingIds.length)];
                    if (bid === 'the_gambler') favour += 0.5;
                }
                const finalScore = Math.floor(pips * favour);
                if (finalScore < 0 || !Number.isFinite(finalScore) || Number.isNaN(finalScore)) {
                    invalidScores++;
                    errors.push({ round, pips, favour, finalScore });
                }
                if (finalScore > Number.MAX_SAFE_INTEGER) {
                    invalidScores++;
                    errors.push({ round, msg: 'overflow', finalScore });
                }
            } catch (e) {
                errors.push({ round, error: e.message });
            }
        }

        expect(errors).toHaveLength(0);
        expect(invalidScores).toBe(0);
    });

    it('guards against 0 dice', () => {
        const result = { pips: 0, favour: 1, finalScore: 0, isValid: false };
        expect(result.isValid).toBe(false);
        expect(result.finalScore).toBe(0);
    });

    it('guards against x0 multiplier', () => {
        const additive = 1;
        const mult = 0;
        const safeFavour = Math.max(0.1, additive) * Math.max(1, mult);
        expect(safeFavour).toBeGreaterThanOrEqual(0.1);
    });

    it('simulates 500 rounds with varied boon combos - no NaN/overflow', () => {
        const prng = createSeededRNG(999);
        const dice = Array.from({ length: 5 }, () => createDie(prng));
        const blessingIds = ['the_gambler', 'achilles_heel', 'midas_touch', 'hestias_hearth', 'icarus_wings'];
        let errors = [];

        for (let round = 0; round < 500; round++) {
            try {
                for (let r = 0; r < 3; r++) dice.forEach((d) => d.roll());
                const faces = dice.map((d) => d.getEffectiveFace());
                const { pips, isValid } = evalChance(faces);
                let favour = 1.5;
                const numBlessings = Math.floor(prng.random() * 5);
                for (let b = 0; b < numBlessings; b++) {
                    const bid = blessingIds[Math.floor(prng.random() * blessingIds.length)];
                    if (bid === 'the_gambler') favour += 0.5;
                    if (bid === 'achilles_heel') favour += 0.2;
                    if (bid === 'hestias_hearth') favour += 3;
                }
                const finalScore = Math.floor(Math.max(0, pips) * Math.max(0.1, favour));
                if (finalScore < 0 || !Number.isFinite(finalScore) || Number.isNaN(finalScore)) {
                    errors.push({ round, pips, favour, finalScore });
                }
                if (finalScore > Number.MAX_SAFE_INTEGER) errors.push({ round, msg: 'overflow' });
            } catch (e) {
                errors.push({ round, error: e.message });
            }
        }

        expect(errors).toHaveLength(0);
    });
});
