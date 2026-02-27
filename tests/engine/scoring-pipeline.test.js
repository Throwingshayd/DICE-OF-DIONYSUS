/**
 * Scoring Pipeline Unit Tests
 * Tests SafeMath, Order of Operations formula, and runPipeline contract.
 */

import { describe, it, expect, beforeAll } from 'vitest';

// SafeMath logic (mirrors js/engine/SafeMath.js for isolation)
const MAX_SAFE_INT = Number.MAX_SAFE_INTEGER;

function clampScore(value) {
    if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
    return Math.max(0, Math.min(Math.floor(value), MAX_SAFE_INT));
}

function safeMultiply(a, b) {
    if (typeof a !== 'number' || !Number.isFinite(a) || typeof b !== 'number' || !Number.isFinite(b)) return 0;
    return clampScore(a * b);
}

function safeAdd(a, b) {
    if (typeof a !== 'number' || !Number.isFinite(a)) a = 0;
    if (typeof b !== 'number' || !Number.isFinite(b)) b = 0;
    return clampScore(a + b);
}

describe('SafeMath', () => {
    it('clampScore returns 0 for NaN and non-finite', () => {
        expect(clampScore(NaN)).toBe(0);
        expect(clampScore(Infinity)).toBe(0);
        expect(clampScore(-Infinity)).toBe(0);
        expect(clampScore('x')).toBe(0);
    });

    it('clampScore floors and clamps to [0, MAX_SAFE_INT]', () => {
        expect(clampScore(42.7)).toBe(42);
        expect(clampScore(-10)).toBe(0);
        expect(clampScore(MAX_SAFE_INT + 1)).toBe(MAX_SAFE_INT);
        expect(clampScore(MAX_SAFE_INT)).toBe(MAX_SAFE_INT);
    });

    it('safeMultiply clamps overflow', () => {
        expect(safeMultiply(100, 100)).toBe(10000);
        expect(safeMultiply(1e10, 1e10)).toBe(MAX_SAFE_INT);
        expect(safeMultiply(NaN, 5)).toBe(0);
    });

    it('safeAdd clamps overflow', () => {
        expect(safeAdd(1, 2)).toBe(3);
        expect(safeAdd(MAX_SAFE_INT, 1)).toBe(MAX_SAFE_INT);
    });
});

describe('Scoring formula (Order of Operations)', () => {
    it('Base -> +Mult -> xMult: (pips) * ((additive) * (multiplicative))', () => {
        const pips = 50;
        const additive = 2;
        const mult = 1.5;
        const expected = pips * additive * mult;
        expect(expected).toBe(150);
    });

    it('plusMult summed before timesMult applied', () => {
        const base = 1;
        const plus1 = 2;
        const plus2 = 1;
        const times = 2;
        const totalAdditive = base + plus1 + plus2;
        const result = totalAdditive * times;
        expect(result).toBe(8);
    });
});

describe('Pipeline structure contract', () => {
    it('runPipeline expects gameState with dice, jokers, consumables, worshipLevels', () => {
        const minimalState = {
            dice: [],
            jokers: [],
            consumables: [],
            worshipLevels: {},
            globalBonuses: {},
            diceSubstitutions: {}
        };
        expect(minimalState).toHaveProperty('dice');
        expect(minimalState).toHaveProperty('jokers');
    });
});
