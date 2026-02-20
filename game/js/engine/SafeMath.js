/**
 * SafeMath - Overflow protection for score calculations
 * Clamps values to [0, Number.MAX_SAFE_INTEGER] to prevent NaN, Infinity, and integer overflow.
 * @module SafeMath
 */

const MAX_SAFE_INT = Number.MAX_SAFE_INTEGER;

/**
 * Clamp a value to safe integer range [0, MAX_SAFE_INT]
 * @param {number} value
 * @returns {number}
 */
function clampScore(value) {
    if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
    return Math.max(0, Math.min(Math.floor(value), MAX_SAFE_INT));
}

/**
 * Safe multiply with overflow clamp
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
function safeMultiply(a, b) {
    if (typeof a !== 'number' || !Number.isFinite(a) || typeof b !== 'number' || !Number.isFinite(b)) return 0;
    return clampScore(a * b);
}

/**
 * Safe add with overflow clamp
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
function safeAdd(a, b) {
    if (typeof a !== 'number' || !Number.isFinite(a)) a = 0;
    if (typeof b !== 'number' || !Number.isFinite(b)) b = 0;
    return clampScore(a + b);
}

const SafeMath = { clampScore, safeMultiply, safeAdd, MAX_SAFE_INT };

if (typeof window !== 'undefined') window.SafeMath = SafeMath;
