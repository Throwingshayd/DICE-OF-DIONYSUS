/**
 * HandEvaluator - Extensible Yahtzee category evaluation
 * Pure logic: faces + counts + context -> { pips, isValid }
 * No UI, no side effects. Add new categories by extending CATEGORY_HANDLERS.
 * @module HandEvaluator
 */

const HandEvaluator = {
    /**
     * Evaluate a category against dice faces and counts
     * @param {string} category
     * @param {number[]} faces
     * @param {Object} counts
     * @param {Object} context - { pipsBonuses, jokers, activeBlind, unlockedCategories }
     * @returns {{ pips: number, isValid: boolean }}
     */
    evaluate(category, faces, counts, context = {}) {
        const { pipsBonuses = {}, jokers = [], activeBlind = null, unlockedCategories = {} } = context;

        if (['Sevens', 'Eights', 'Nines'].includes(category) && !unlockedCategories[category]) {
            return { pips: 0, isValid: false };
        }

        const handler = this.CATEGORY_HANDLERS[category];
        if (!handler) {
            if (typeof Logger !== 'undefined') Logger.warn('HandEvaluator: Unknown category', category);
            return { pips: 0, isValid: false };
        }

        let result = handler(faces, counts, { pipsBonuses, jokers, activeBlind });

        if (activeBlind === 'half_upper_pips' && ['Ones', 'Twos', 'Threes', 'Fours', 'Fives', 'Sixes'].includes(category)) {
            result = { ...result, pips: Math.floor(result.pips / 2) };
        }

        return result;
    },

    _maxConsecutiveRun(sortedUnique) {
        if (!sortedUnique.length) return 0;
        let run = 1, maxRun = 1;
        for (let i = 1; i < sortedUnique.length; i++) {
            if (sortedUnique[i] === sortedUnique[i - 1] + 1) {
                run++;
                maxRun = Math.max(maxRun, run);
            } else if (sortedUnique[i] !== sortedUnique[i - 1]) run = 1;
        }
        return maxRun;
    },

    CATEGORY_HANDLERS: {}
};

// Upper section
['Ones', 'Twos', 'Threes', 'Fours', 'Fives', 'Sixes', 'Sevens', 'Eights', 'Nines'].forEach(cat => {
    const num = CATEGORY_TO_NUMBER[cat];
    HandEvaluator.CATEGORY_HANDLERS[cat] = (faces, counts, { pipsBonuses }) => {
        let pips = (counts[num] || 0) * num;
        if (cat === 'Twos' && pipsBonuses.twosBonus) pips += (counts[2] || 0) * pipsBonuses.twosBonus;
        if (cat === 'Sixes' && pipsBonuses.sixesBonus) pips += (counts[6] || 0) * pipsBonuses.sixesBonus;
        return { pips, isValid: true };
    };
});

HandEvaluator.CATEGORY_HANDLERS['Three of a Kind'] = (faces, counts, { jokers, pipsBonuses }) => {
    let threshold = SCORING_THRESHOLDS.THREE_OF_KIND_REQUIRED;
    if (jokers.some(j => j.id === 'bellows_of_war')) threshold -= 1;
    if (!Object.values(counts).some(c => c >= threshold)) return { pips: 0, isValid: false };
    let pips = faces.reduce((a, b) => a + b, 0) + LOWER_SECTION_BONUSES['Three of a Kind'];
    if (jokers.some(j => j.id === 'bellows_of_war')) {
        const matchVal = parseInt(Object.keys(counts).find(k => counts[k] >= threshold), 10);
        pips += matchVal;
    }
    if (pipsBonuses.threeOfKindBonus) pips += pipsBonuses.threeOfKindBonus;
    return { pips, isValid: true };
};

HandEvaluator.CATEGORY_HANDLERS['Four of a Kind'] = (faces, counts, { jokers, pipsBonuses }) => {
    let threshold = SCORING_THRESHOLDS.FOUR_OF_KIND_REQUIRED;
    if (jokers.some(j => j.id === 'bellows_of_war')) threshold -= 1;
    if (!Object.values(counts).some(c => c >= threshold)) return { pips: 0, isValid: false };
    let pips = faces.reduce((a, b) => a + b, 0) + LOWER_SECTION_BONUSES['Four of a Kind'];
    if (jokers.some(j => j.id === 'bellows_of_war')) {
        const matchVal = parseInt(Object.keys(counts).find(k => counts[k] >= threshold), 10);
        pips += matchVal;
    }
    if (pipsBonuses.fourOfKindBonus) pips += pipsBonuses.fourOfKindBonus;
    return { pips, isValid: true };
};

HandEvaluator.CATEGORY_HANDLERS['Full House'] = (faces, counts, { jokers }) => {
    const has3 = Object.values(counts).includes(SCORING_THRESHOLDS.FULL_HOUSE_THREE);
    const has2 = Object.values(counts).includes(SCORING_THRESHOLDS.FULL_HOUSE_TWO);
    const hasDionysus = jokers.some(j => j.id === 'dionysus_revelry');
    const pairCount = Object.values(counts).filter(c => c === 2).length;
    if (!((has3 && has2) || (hasDionysus && pairCount >= 2))) return { pips: 0, isValid: false };
    return { pips: faces.reduce((a, b) => a + b, 0) + LOWER_SECTION_BONUSES['Full House'], isValid: true };
};

HandEvaluator.CATEGORY_HANDLERS['Small Straight'] = (faces) => {
    const unique = [...new Set(faces)].sort((a, b) => a - b);
    if (HandEvaluator._maxConsecutiveRun(unique) < SCORING_THRESHOLDS.SMALL_STRAIGHT_LENGTH) return { pips: 0, isValid: false };
    return { pips: faces.reduce((a, b) => a + b, 0) + LOWER_SECTION_BONUSES['Small Straight'], isValid: true };
};

HandEvaluator.CATEGORY_HANDLERS['Large Straight'] = (faces) => {
    const unique = [...new Set(faces)].sort((a, b) => a - b);
    if (HandEvaluator._maxConsecutiveRun(unique) < SCORING_THRESHOLDS.LARGE_STRAIGHT_LENGTH) return { pips: 0, isValid: false };
    return { pips: faces.reduce((a, b) => a + b, 0) + LOWER_SECTION_BONUSES['Large Straight'], isValid: true };
};

HandEvaluator.CATEGORY_HANDLERS['Yahtzee'] = (faces, counts) => {
    if (!Object.values(counts).some(c => c >= SCORING_THRESHOLDS.YAHTZEE_REQUIRED)) return { pips: 0, isValid: false };
    return { pips: faces.reduce((a, b) => a + b, 0) + LOWER_SECTION_BONUSES['Yahtzee'], isValid: true };
};

HandEvaluator.CATEGORY_HANDLERS['Chance'] = (faces, counts, { activeBlind }) => {
    if (activeBlind === 'no_chance') return { pips: 0, isValid: false };
    return { pips: faces.reduce((a, b) => a + b, 0), isValid: true };
};

if (typeof window !== 'undefined') window.HandEvaluator = HandEvaluator;
