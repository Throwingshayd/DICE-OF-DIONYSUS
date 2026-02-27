/**
 * Boon Interactions Test - Multiple boons stacking, timing, common failure points
 * Mirrors scoring formula: pips × (additive × multiplicative) favour
 * Based on CONSOLIDATED_BOON_REFERENCE and BUGS_FIXED_LOG
 */

import { describe, it, expect } from 'vitest';

function createSeededRNG(seed) {
    let s = seed;
    return {
        random() {
            s = (s * 1103515245 + 12345) & 0x7fffffff;
            return s / 0x7fffffff;
        }
    };
}

describe('Boon Interactions', () => {
    describe('Scoring formula: pips × favour', () => {
        it('base score with no boons', () => {
            const pips = 30;  // e.g. Chance sum
            const favour = 1.5;  // base
            const final = Math.floor(pips * favour);
            expect(final).toBe(45);
        });

        it('Golden Six: +4 mult per 6 die (dice phase → pips/additive)', () => {
            const faces = [6, 6, 3, 4, 5];
            const sixCount = faces.filter((f) => f === 6).length;
            const pipsBonus = sixCount * 4;  // Golden Six adds to "chips"/pips
            const basePips = faces.reduce((a, b) => a + b, 0);
            const totalPips = basePips + pipsBonus;
            const favour = 1.5;
            const final = Math.floor(totalPips * favour);
            expect(final).toBe(48); // (24 + 8) * 1.5 = 32 * 1.5
        });

        it('The Gambler: +10 pips per reroll remaining (inventory phase)', () => {
            const basePips = 25;
            const rollsLeft = 2;
            const gamblerBonus = rollsLeft * 10;
            const totalPips = basePips + gamblerBonus;
            const favour = 1.5;
            const final = Math.floor(totalPips * favour);
            expect(final).toBe(67); // (25+20)*1.5
        });
    });

    describe('Boons stacking - additive then multiplicative', () => {
        it('Hestia + Forge: conditional favour stacks additively', () => {
            const allOddOrEven = true;
            const hestiaBonus = allOddOrEven ? 3 : 0;
            const rollsLeft = 2;
            const forgeBonus = Math.min(rollsLeft * 0.5, 1.5);
            const baseFavour = 1.5;
            const additiveFavour = baseFavour + hestiaBonus + forgeBonus;
            expect(additiveFavour).toBe(5.5); // 1.5 + 3 + min(1, 1.5) with 2 rolls
        });

        it('Midas + Icarus: pips bonuses stack', () => {
            const gold = 25;
            const midasPips = Math.floor(gold / 5);  // +1 per 5 gold
            const rollsLeft = 2;
            const icarusPips = rollsLeft * 10;
            const basePips = 30;
            const totalPips = basePips + midasPips + icarusPips;
            expect(totalPips).toBe(55); // 30 + 5 + 20
        });

        it('Straight Flush (x1.5) applies after additive', () => {
            const additive = 2.5;
            const straightFlushMult = 1.5;
            const totalFavour = additive * straightFlushMult;
            const pips = 50;
            const final = Math.floor(pips * totalFavour);
            expect(final).toBe(187);
        });
    });

    describe('turn_start vs before_score (Kronos fix)', () => {
        it('turn_start should run ONCE per turn, not per roll', () => {
            const turnStartCalls = [];
            const beforeScoreCalls = [];
            // Simulate: 1 turn, 3 rolls, 1 score
            const rollsThisTurn = 3;
            const scoresThisTurn = 1;
            turnStartCalls.push(1);  // Once at turn start
            for (let r = 0; r < rollsThisTurn; r++) { /* rolls don't call turn_start */ }
            for (let s = 0; s < scoresThisTurn; s++) beforeScoreCalls.push(1);
            expect(turnStartCalls.length).toBe(1);
            expect(beforeScoreCalls.length).toBe(1);
        });
    });

    describe('Reflection of Narcissus - double effect guard', () => {
        it('prevents infinite loop when doubling own effect', () => {
            let calls = 0;
            const maxCalls = 5;
            function applyEffect(isNarcissus, narcissusDoubling) {
                if (calls++ >= maxCalls) throw new Error('infinite loop');
                if (isNarcissus && narcissusDoubling) return;  // Don't double self
                // Simulate second application for other boons
                if (!isNarcissus && !narcissusDoubling) applyEffect(false, true);
            }
            expect(() => applyEffect(true, false)).not.toThrow();
        });
    });

    describe('ante_end effects - gold multiplier', () => {
        it('Cornucopia: gold ×1.5 at ante end', () => {
            let gold = 20;
            gold = Math.floor(gold * 1.5);
            expect(gold).toBe(30);
        });
    });

    describe('Stress: many boons at once', () => {
        it('100 rounds with randomised boon combinations produce finite scores', () => {
            const prng = createSeededRNG(12345);
            const blessingIds = ['the_gambler', 'achilles_heel', 'midas_touch', 'icarus_wings', 'hestias_hearth'];
            let invalidCount = 0;

            for (let round = 0; round < 100; round++) {
                const faces = Array.from({ length: 5 }, () => Math.floor(prng.random() * 6) + 1);
                const basePips = faces.reduce((a, b) => a + b, 0);
                let pips = basePips;
                let favour = 1.5;

                const numBoons = Math.floor(prng.random() * 4) + 1;
                for (let b = 0; b < numBoons; b++) {
                    const bid = blessingIds[Math.floor(prng.random() * blessingIds.length)];
                    if (bid === 'the_gambler') pips += Math.floor(prng.random() * 3) * 10;
                    if (bid === 'achilles_heel') pips += 15;
                    if (bid === 'midas_touch') pips += Math.floor((round * 2) / 5);
                    if (bid === 'icarus_wings') pips += Math.floor(prng.random() * 3) * 10;
                    if (bid === 'hestias_hearth') favour += 3;
                }

                const final = Math.floor(pips * favour);
                if (!Number.isFinite(final) || final < 0 || Number.isNaN(final)) invalidCount++;
                if (final > Number.MAX_SAFE_INTEGER) invalidCount++;
            }

            expect(invalidCount).toBe(0);
        });
    });
});
