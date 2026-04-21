/* exported NumberFormat */
// Balatro-style tiered number formatter.
//
// The live score row uses fixed-width cells. The formatter's job is to keep
// the rendered string bounded to ~7 visible chars so numbers from 0 to
// astronomical fit the same slot without reflow.
//
// Tiers (absolute value):
//   < 1e4    → integer            "1234"
//   < 1e6    → thousands w/ comma "12,345"
//   < 1e9    → millions           "1.23M"
//   < 1e12   → billions           "1.23B"
//   < 1e15   → trillions          "1.23T"
//   ≥ 1e15   → scientific         "1.23e15"
//   non-finite → "—"

const NumberFormat = {
    _tier(v) {
        const abs = Math.abs(v);
        if (abs < 1e4)  return 'int';
        if (abs < 1e6)  return 'comma';
        if (abs < 1e9)  return 'M';
        if (abs < 1e12) return 'B';
        if (abs < 1e15) return 'T';
        return 'sci';
    },

    _trim(str) {
        return str.replace(/\.?0+$/, '');
    },

    /**
     * Main display formatter for pips / favour total / score preview.
     * Always integer-truncated below 1e4 so count-up animation reads cleanly.
     * @param {number} n
     * @returns {string}
     */
    display(n) {
        const v = Number(n);
        if (!Number.isFinite(v)) return '—';
        switch (this._tier(v)) {
            case 'int':   return String(Math.trunc(v));
            case 'comma': return Math.trunc(v).toLocaleString('en-US');
            case 'M':     return this._trim((v / 1e6).toFixed(2)) + 'M';
            case 'B':     return this._trim((v / 1e9).toFixed(2)) + 'B';
            case 'T':     return this._trim((v / 1e12).toFixed(2)) + 'T';
            case 'sci':   return v.toExponential(2).replace('e+', 'e');
            default:      return String(Math.trunc(v));
        }
    },

    /**
     * Contribution popups ("+5 pips" chips over the dice). Small integers
     * almost always; falls back to display() for massive boon triggers.
     * @param {number} n
     */
    contrib(n) {
        const v = Number(n);
        if (!Number.isFinite(v)) return '0';
        if (Math.abs(v) < 1e4 && v === Math.trunc(v)) return String(Math.trunc(v));
        return this.display(v);
    },

    /**
     * Favour multiplier. Small favour values (< 10) may carry a ×0.5 fraction
     * from boons; keep one decimal for those, otherwise fall through to
     * display() so huge favour totals abbreviate like pips.
     * @param {number} n
     */
    favour(n) {
        const v = Number(n);
        if (!Number.isFinite(v) || v <= 0) return '1';
        if (Math.abs(v) < 10 && v !== Math.trunc(v)) {
            return (Math.round(v * 10) / 10).toFixed(1).replace(/\.0$/, '');
        }
        return this.display(Math.round(v));
    },

    /**
     * Tiny formatter for fractional favour contributions like "×0.5" from
     * Pegasus Flight. Keeps one decimal, otherwise integer.
     * @param {number} n
     */
    favourContrib(n) {
        const v = Number(n);
        if (!Number.isFinite(v) || v <= 0) return '0';
        if (v === Math.trunc(v)) return this.contrib(v);
        return (Math.round(v * 10) / 10).toFixed(1).replace(/\.0$/, '');
    }
};

if (typeof window !== 'undefined') window.NumberFormat = NumberFormat;
