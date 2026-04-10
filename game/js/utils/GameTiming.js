/* exported GameTiming */
/**
 * Pure animation delay scaling (Balatro-style game speed).
 * Used by GameEngine.scaleDelay — keep in sync with tests/unit/game-timing.test.js
 */
const GameTiming = {
    /**
     * @param {number} ms - Base delay in ms
     * @param {number} [gameSpeed=2] - G.SETTINGS.GAMESPEED style (2 = normal, higher = faster)
     * @returns {number} Scaled delay, minimum 1
     */
    scaleDelay(ms, gameSpeed) {
        const speed = gameSpeed ?? 2;
        return Math.max(1, Math.round(ms / speed));
    }
};

if (typeof window !== 'undefined') {
    window.GameTiming = GameTiming;
}
