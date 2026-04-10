import fs from 'fs';

const inner = fs.readFileSync('tools/_extracted_before_score_switch.txt', 'utf8');

const header = `/* global GAME_BALANCE, BOON_EFFECTS, Logger, CATEGORY_TO_NUMBER, GodUtils, window */
/* exported BoonTimingHandlers */

/**
 * before_score effects (extracted from Boon.js). Mutates the score result object in place.
 * Load before Boon.js — see game/index.html.
 */
const BoonTimingHandlers = {
    runBeforeScore(boon, gameState, result) {
        switch (boon.id) {
`;

const footer = `
        }
    }
};

if (typeof window !== 'undefined') {
    window.BoonTimingHandlers = BoonTimingHandlers;
}
`;

fs.writeFileSync('game/js/classes/boonTimingHandlers.js', header + inner + footer);
console.log('Wrote game/js/classes/boonTimingHandlers.js');
