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
    SAVE_INDICATOR_DURATION: 2000,
    TOOLTIP_DELAY: 500,
    
    // Auto-save
    AUTO_SAVE_INTERVAL: 30000,  // 30 seconds
    
    // Shop transitions
    SHOP_TRANSITION: 400,
    PACK_OPENING_DELAY: 500,
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
        BREAKPOINTS
    };
}

