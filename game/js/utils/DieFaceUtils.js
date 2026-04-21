/* exported DieFaceUtils */
// Shared die-face fallback helpers for engine, scoring, and telemetry paths.

const DieFaceUtils = {
    resolveFace(die, fallback = 0) {
        if (!die) return fallback;
        if (typeof die.getEffectiveFace === 'function') {
            const value = die.getEffectiveFace();
            return typeof value === 'number' && !Number.isNaN(value) ? value : fallback;
        }
        const value = die.face ?? die.currentFace ?? fallback;
        return typeof value === 'number' && !Number.isNaN(value) ? value : fallback;
    },

    resolveFaces(dice = [], fallback = 0) {
        return dice.map((die) => this.resolveFace(die, fallback));
    }
};

if (typeof window !== 'undefined') window.DieFaceUtils = DieFaceUtils;
