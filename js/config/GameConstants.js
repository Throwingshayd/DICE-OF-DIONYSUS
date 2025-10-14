/**
 * Game Balance Constants
 * All magic numbers for game balance in one place for easy tuning
 * @module GameConstants
 */

/**
 * Core game balance configuration
 * @const {Object}
 */
const GAME_BALANCE = {
    // Starting values - Balatro-inspired tightening
    STARTING_GOLD: 6,  // Reduced from 15 - creates gold tension!
    STARTING_ROLLS: 3,
    STARTING_DICE_COUNT: 5,
    
    // Progression
    MAX_TURNS_PER_ANTE: 13,
    STARTING_ANTE: 1,
    STARTING_SCORE_THRESHOLD: 300,
    THRESHOLD_INCREASE_PER_ANTE: 100,
    
    // Economy - Balatro-inspired
    SHOP_REROLL_COST: 4,  // Increased from 2 - rerolls are now expensive!
    FREE_REROLLS_PER_ANTE: 1,
    
    // Interest system (NEW - Balatro-inspired)
    INTEREST_RATE: 5,  // +1 gold per 5 saved
    MAX_INTEREST: 5,   // Cap at +5 gold per ante
    
    // Slots (Card capacity)
    STARTING_BOON_SLOTS: 5,
    STARTING_LIBATION_SLOTS: 2,
    STARTING_WORSHIP_SLOTS: 3,
    
    // Base multipliers
    BASE_FAVOUR: 1.5,
    
    // Dice face limits
    MIN_DIE_FACE: 1,
    MAX_DIE_FACE: 6,
    MAX_DIE_FACE_WITH_ENHANCEMENTS: 9,
};

/**
 * Card costs and prices
 * @const {Object}
 */
const CARD_ECONOMY = {
    // Boon prices by rarity - Balatro-style strict tiers
    RUSTIC_BOON_COST: 3,
    VIBRANT_BOON_COST: 5,  // Increased from 4
    EPIC_BOON_COST: 8,     // Increased from 6 - rare should be expensive!
    
    // Worship prices
    WORSHIP_CARD_COST: 3,
    
    // Libation prices
    LIBATION_BASE_COST: 2,
    LIBATION_PREMIUM_COST: 3,
    
    // Artifact prices - Balatro vouchers are expensive!
    ARTIFACT_BASE_COST: 12,  // Increased from 7
    ARTIFACT_UPGRADED_COST: 20,  // New tier!
    
    // Pack prices
    BOON_PACK_COST: 4,
    WORSHIP_PACK_COST: 4,
    LIBATION_PACK_COST: 4,
    CHAOS_PACK_COST: 6,
    
    // Sell values - Balatro-inspired (25% of cost, not 75%!)
    SELL_VALUE_PERCENTAGE: 0.25,  // Creates gold sink
    DEFAULT_SELL_VALUE: 1,
};

/**
 * Rarity distribution weights for shop generation
 * @const {Object}
 */
const RARITY_WEIGHTS = {
    RUSTIC: 45,      // Common - 45%
    VIBRANT: 35,     // Uncommon - 35%
    EPIC: 20,        // Rare - 20%
    WORSHIP: 100,    // All worship cards equal chance
    LIBATION: 100,   // All libations equal chance
    ARTIFACT: 100,   // All artifacts equal chance
};

/**
 * Enhancement probabilities
 * @const {Object}
 */
const ENHANCEMENT_CHANCES = {
    PARCHMENT_FAVOUR_CHANCE: 1/6,    // 16.67% for +1 favour
    PARCHMENT_GOLD_CHANCE: 1/15,     // 6.67% for +15 gold
    WILD_EFFECT_CHANCE: 0.5,         // 50% for positive/negative
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        GAME_BALANCE,
        CARD_ECONOMY,
        RARITY_WEIGHTS,
        ENHANCEMENT_CHANCES
    };
}

