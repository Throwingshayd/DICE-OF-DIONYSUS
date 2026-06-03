/**
 * Shared pointer hit-testing for inventory drag.
 * @module PointerGeometry
 */

const PointerGeometry = {
    DRAG_THRESHOLD_PX: 14,
    CONSUMABLE_DRAG_THRESHOLD_PX: 16,

    pointIn(px, py, el) {
        if (!el) return false;
        const r = el.getBoundingClientRect();
        return px >= r.left && px <= r.right && py >= r.top && py <= r.bottom;
    },

    pointInRect(px, py, r) {
        return !!(r && px >= r.left && px <= r.right && py >= r.top && py <= r.bottom);
    },

    pointInExpandedRect(px, py, el, pad = 16) {
        if (!el) return false;
        const r = el.getBoundingClientRect();
        return px >= r.left - pad && px <= r.right + pad && py >= r.top - pad && py <= r.bottom + pad;
    },

    distSqOverThreshold(dx, dy, threshold) {
        return (dx * dx + dy * dy) >= threshold * threshold;
    },
};

if (typeof window !== 'undefined') window.PointerGeometry = PointerGeometry;
