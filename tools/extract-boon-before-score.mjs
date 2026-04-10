import fs from 'fs';

const text = fs.readFileSync('game/js/classes/Boon.js', 'utf8');
const startMarker = '    applyBeforeScoreEffect(gameState, result) {';
const endMarker = '    // Balatro-inspired timing effect methods';
const i0 = text.indexOf(startMarker);
const i1 = text.indexOf(endMarker, i0);
if (i0 < 0 || i1 < 0) {
  console.error('markers not found', i0, i1);
  process.exit(1);
}
const block = text.slice(i0, i1);
const sw = block.indexOf('        switch (this.id) {');
const closeSw = block.indexOf('\n        }\n\n        return result;');
if (sw < 0 || closeSw < 0) {
  console.error('switch/close not found', sw, closeSw);
  process.exit(1);
}
const switchBody = block.slice(sw + '        switch (this.id) {'.length, closeSw);
// Handlers use `boon` instead of `this` (called from BoonTimingHandlers.runBeforeScore)
// Do not trimStart — it would strip indent before the first `case`.
const out = switchBody.replace(/\bthis\./g, 'boon.');
fs.writeFileSync('tools/_extracted_before_score_switch.txt', out);
console.log('wrote tools/_extracted_before_score_switch.txt', out.length);
