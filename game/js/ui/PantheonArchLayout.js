/**
 * PantheonArchLayout — place score chips along a symmetric amphitheatre arch.
 * Runs after scorecard updates so visible chip count (e.g. Sevens–Nines) reflows cleanly.
 */
const PantheonArchLayout = {
    UPPER_ORDER: [
        'Chance',
        'Three of a Kind',
        'Small Straight',
        'Full House',
        'Yahtzee',
        'Large Straight',
        'Four of a Kind',
        "Pandora's Box",
    ],
    LOWER_ORDER: [
        'Ones', 'Twos', 'Threes', 'Fours', 'Fives', 'Sixes',
        'Sevens', 'Eights', 'Nines',
    ],

    isVisible(chip) {
        if (!chip) return false;
        return getComputedStyle(chip).display !== 'none';
    },

    /**
     * @param {HTMLElement} tierEl
     * @param {string[]} categoryOrder
     * @param {{ spreadPct?: number, apexPy?: number, depthPy?: number, maxRot?: number }} opts
     */
    layoutTierByOrder(tierEl, categoryOrder, opts = {}) {
        const {
            spreadPct = 42,
            apexPy = 24,
            depthPy = 120,
            maxRot = 9,
        } = opts;

        const chips = categoryOrder
            .map((cat) => tierEl.querySelector(`.pantheon-chip[data-category="${cat}"]`))
            .filter((chip) => this.isVisible(chip));

        const n = chips.length;
        if (n === 0) return;

        chips.forEach((chip, i) => {
            const t = n === 1 ? 0 : (i / (n - 1)) * 2 - 1;
            const px = 50 + t * spreadPct;
            const py = apexPy + (t * t) * depthPy;
            const rot = t * maxRot;
            chip.style.setProperty('--px', `${px}%`);
            chip.style.setProperty('--py', `${py}px`);
            chip.style.setProperty('--chip-rot', `${rot}deg`);
        });
    },

    layoutAll() {
        const frieze = document.querySelector('.pantheon-frieze');
        if (!frieze) return;

        const upper = frieze.querySelector('.pantheon-tier-upper');
        const lower = frieze.querySelector('.pantheon-tier-lower');

        if (upper) {
            this.layoutTierByOrder(upper, this.UPPER_ORDER, {
                spreadPct: 43,
                apexPy: 28,
                depthPy: 152,
                maxRot: 10,
            });
        }
        if (lower) {
            this.layoutTierByOrder(lower, this.LOWER_ORDER, {
                spreadPct: 44,
                apexPy: 18,
                depthPy: 96,
                maxRot: 8,
            });
        }
    },
};

if (typeof window !== 'undefined') window.PantheonArchLayout = PantheonArchLayout;
