import fs from 'fs';

const path = 'game/js/classes/Boon.js';
let s = fs.readFileSync(path, 'utf8');
const start = s.indexOf('    applyBeforeScoreEffect(gameState, result) {');
const end = s.indexOf('    // Balatro-inspired timing effect methods', start);
if (start < 0 || end < 0) {
  console.error('markers not found');
  process.exit(1);
}
const before = s.slice(0, start);
const after = s.slice(end);
const replacement = `    applyBeforeScoreEffect(gameState, result) {
        if (result.favourMult === undefined) {
            result.favourMult = 1;
        }
        if (typeof BoonTimingHandlers !== 'undefined' && typeof BoonTimingHandlers.runBeforeScore === 'function') {
            BoonTimingHandlers.runBeforeScore(this, gameState, result);
        } else {
            Logger.warn('BoonTimingHandlers.runBeforeScore missing — before_score skipped');
        }
        return result;
    }

`;
fs.writeFileSync(path, before + replacement + after);
console.log('Patched Boon.js applyBeforeScoreEffect');
