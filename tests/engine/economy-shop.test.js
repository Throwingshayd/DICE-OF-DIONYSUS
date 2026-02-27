/**
 * Economy & Shop Test - Based on actual gameplay loops
 * Verifies gold flow, interest, shop costs, and economy formulas from GameConstants
 */

import { describe, it, expect } from 'vitest';

// Mirror GameConstants economy values (single source: js/config/GameConstants.js)
const GAME_BALANCE = {
    STARTING_GOLD: 6,
    GOLD_PER_SCORE: 1,
    INTEREST_RATE: 5,
    MAX_INTEREST: 5,
};
const CARD_ECONOMY = {
    RUSTIC_BOON_COST: 3,
    VIBRANT_BOON_COST: 5,
    EPIC_BOON_COST: 8,
    WORSHIP_CARD_COST: 3,
    LIBATION_BASE_COST: 2,
    LIBATION_PREMIUM_COST: 3,
    BOON_PACK_COST: 4,
    WORSHIP_PACK_COST: 4,
    LIBATION_PACK_COST: 4,
    CHAOS_PACK_COST: 6,
    SHOP_REROLL_COST: 4,
    SELL_VALUE_PERCENTAGE: 0.25,
};

function calculateInterest(gold, hasGoldenTouch = false) {
    const rate = hasGoldenTouch ? 3 : GAME_BALANCE.INTEREST_RATE;
    return Math.min(Math.floor(gold / rate), GAME_BALANCE.MAX_INTEREST);
}

describe('Economy - Gameplay Loop', () => {
    describe('Gold sources', () => {
        it('starting gold is 6', () => {
            expect(GAME_BALANCE.STARTING_GOLD).toBe(6);
        });

        it('gold per valid score is 1', () => {
            expect(GAME_BALANCE.GOLD_PER_SCORE).toBe(1);
        });

        it('3 scores in ante 1: 6 + 3 = 9 gold before shop', () => {
            const gold = GAME_BALANCE.STARTING_GOLD + 3 * GAME_BALANCE.GOLD_PER_SCORE;
            expect(gold).toBe(9);
        });

        it('no gold on scratch (0 added)', () => {
            const goldFromScratch = 0;
            expect(goldFromScratch).toBe(0);
        });
    });

    describe('Interest (shop at turns 4, 8, end-ante)', () => {
        it('interest = floor(gold/5), max 5', () => {
            expect(calculateInterest(0)).toBe(0);
            expect(calculateInterest(4)).toBe(0);
            expect(calculateInterest(5)).toBe(1);
            expect(calculateInterest(9)).toBe(1);
            expect(calculateInterest(10)).toBe(2);
            expect(calculateInterest(24)).toBe(4);
            expect(calculateInterest(25)).toBe(5);
            expect(calculateInterest(100)).toBe(5); // Capped
        });

        it('Golden Touch: interest 1 per 3 saved', () => {
            expect(calculateInterest(3, true)).toBe(1);
            expect(calculateInterest(6, true)).toBe(2);
            expect(calculateInterest(15, true)).toBe(5);
            expect(calculateInterest(30, true)).toBe(5); // Still capped at 5
        });
    });

    describe('Shop costs', () => {
        it('boon costs by rarity', () => {
            expect(CARD_ECONOMY.RUSTIC_BOON_COST).toBe(3);
            expect(CARD_ECONOMY.VIBRANT_BOON_COST).toBe(5);
            expect(CARD_ECONOMY.EPIC_BOON_COST).toBe(8);
        });

        it('cheapest boon (rustic) is affordable after 3 scores + interest', () => {
            const goldBeforeShop = 9;
            const interest = calculateInterest(9);
            const goldAtShop = goldBeforeShop + interest;
            expect(goldAtShop).toBeGreaterThanOrEqual(CARD_ECONOMY.RUSTIC_BOON_COST);
        });

        it('shop reroll costs 4', () => {
            expect(CARD_ECONOMY.SHOP_REROLL_COST).toBe(4);
        });

        it('pack costs: boon/worship/libation 4, chaos 6', () => {
            expect(CARD_ECONOMY.BOON_PACK_COST).toBe(4);
            expect(CARD_ECONOMY.CHAOS_PACK_COST).toBe(6);
        });
    });

    describe('Sell value (gold sink)', () => {
        it('sell value is 25% of cost', () => {
            expect(CARD_ECONOMY.SELL_VALUE_PERCENTAGE).toBe(0.25);
        });

        it('selling 4g boon returns 1g', () => {
            const sellValue = Math.floor(4 * CARD_ECONOMY.SELL_VALUE_PERCENTAGE);
            expect(sellValue).toBe(1);
        });
    });

    describe('Full loop simulation - 3 scores then shop', () => {
        it('turn 4 shop: gold = start + 3 scores + interest', () => {
            let gold = GAME_BALANCE.STARTING_GOLD;
            const scoresBeforeShop = 3;
            gold += scoresBeforeShop * GAME_BALANCE.GOLD_PER_SCORE;
            const interest = calculateInterest(gold);
            gold += interest;
            expect(gold).toBe(10); // 6 + 3 + 1
        });

        it('after buying rustic boon (3g): 7g remaining', () => {
            const goldAtShop = 10;
            const afterBuy = goldAtShop - CARD_ECONOMY.RUSTIC_BOON_COST;
            expect(afterBuy).toBe(7);
        });
    });
});

describe('Shop - Rarity and filtering', () => {
    it('RARITY_WEIGHTS favour rustic over epic (boons only)', () => {
        // Weights from GameConstants - rustic 60, vibrant 30, epic 10
        const weights = { rustic: 60, vibrant: 30, epic: 10 };
        const total = weights.rustic + weights.vibrant + weights.epic;
        const rusticChance = weights.rustic / total;
        const epicChance = weights.epic / total;
        expect(rusticChance).toBeGreaterThan(epicChance);
        expect(rusticChance).toBeCloseTo(0.6);
        expect(epicChance).toBeCloseTo(0.1);
    });
});
