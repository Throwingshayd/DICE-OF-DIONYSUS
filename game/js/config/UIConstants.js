/**
 * UI Configuration Constants
 * All timing, animation, and UI-related constants
 * @module UIConstants
 */

/**
 * Animation and timing constants
 * @const {Object}
 */
const TIMING = {
    // Animation durations (milliseconds)
    ANIMATION_DURATION: 300,
    DICE_ROLL_ANIMATION: 500,
    CARD_FLIP_ANIMATION: 400,
    FADE_IN_DURATION: 200,
    FADE_OUT_DURATION: 300,
    
    // Delays between actions
    DICE_ROLL_DELAY_PER_DIE: 100,  // Stagger dice animations
    MESSAGE_DISPLAY_TIME: 3000,
    LIVE_SCORE_DEBOUNCE_MS: 70,    // Debounce Gnosis preview on score row hover (smoothness)
    SAVE_INDICATOR_DURATION: 2000,
    /** Legacy default (prefer TOOLTIP_DELAY_CARD / TOOLTIP_DELAY_DIE in BalatroEffects) */
    TOOLTIP_DELAY: 500,
    /** All .card hovers — shop, pack, owned, anthology */
    TOOLTIP_DELAY_CARD: 100,
    /** Hover delay before die popover */
    TOOLTIP_DELAY_DIE: 200,
    /** Card tooltip width clamp (matches tooltips.css .tooltip-card) */
    TOOLTIP_CARD_MIN_W: 148,
    TOOLTIP_CARD_MAX_W: 220,
    /** @deprecated use TOOLTIP_CARD_MIN_W */
    TOOLTIP_SHOP_MIN_W: 148,
    /** Extra px added to die width for die tooltips */
    TOOLTIP_DIE_EXTRA_W: 14,
    
    // Auto-save
    AUTO_SAVE_INTERVAL: 30000,  // 30 seconds

    // Shop transitions
    SHOP_TRANSITION: 400,
    PACK_OPENING_DELAY: 500,
};

/**
 * Card layout — single 140×187px footprint (shop, pack, owned, drag)
 * @const {Object}
 */
/**
 * Player-facing: Boon | Libation | Worship | Artifact.
 * Code bucket `gameState.consumables` = libations + worship in the left bar only.
 * See docs/GAME_TERMINOLOGY.md.
 */
/** Where a card is shown — drives face layout (see docs/UI_CONSISTENCY_CHECKLIST.md) */
const CARD_SURFACE = {
    RACK: 'rack',   // shop, pack, anthology
    OWNED: 'owned', // libation / boon sidebars
};

const CARD_LAYOUT = {
    CARD_W: 140,
    CARD_H: 187,
    RACK_W: 140,
    RACK_H: 187,
    BOON_SLOTS: 5,
    BOON_AREA_W: 4.9 * 140,
    BOON_AREA_H: 0.95 * 187,
    CONSUMABLE_AREA_W: 2.3 * 140,
    CONSUMABLE_AREA_H: 0.95 * 187,
    CONSUMABLE_SLOTS_MIN: 2,
    CONSUMABLE_SLOTS_MAX: 5,
    CONSUMABLE_SCALE: 0.7,
    SHOP_RACK_BOONS: 2,
    SQUISH_OVERLAP: 0.1
};

/**
 * Visual configuration
 * @const {Object}
 */
const VISUAL = {
    // Text limits
    MAX_CARD_NAME_LENGTH: 30,
    MAX_MESSAGE_LENGTH: 100,
    
    // Card display
    CARDS_PER_ROW_SHOP: 3,
    CARDS_IN_PACK: 3,
    
    // Colors (for programmatic use)
    SUCCESS_COLOR: '#2ECC71',
    ERROR_COLOR: '#E74C3C',
    WARNING_COLOR: '#F39C12',
    INFO_COLOR: '#3498DB',
    BUY_TAG_COLOR: '#FFD700',
    SELL_TAG_COLOR: '#E74C3C',
};

/**
 * Z-index layers for proper stacking
 * @const {Object}
 */
const Z_INDEX = {
    BACKGROUND: 0,
    GAME_BOARD: 10,
    CARDS: 20,
    DICE: 30,
    UI_ELEMENTS: 40,
    TOOLTIPS: 50,
    MODALS: 100,
    OVERLAYS: 90,
    SAVE_INDICATOR: 9999,
};

/**
 * Responsive breakpoints
 * @const {Object}
 */
const BREAKPOINTS = {
    MOBILE_MAX: 768,
    TABLET_MAX: 1024,
    DESKTOP_MIN: 1025,
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        TIMING,
        VISUAL,
        Z_INDEX,
        BREAKPOINTS,
        CARD_SURFACE,
        CARD_LAYOUT
    };
}

