const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../game/js/game/GameEngine.js');
const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);

/** 1-based inclusive ranges to remove */
const REMOVE = [
    [1109, 1317],
    [1366, 1499],
    [1549, 1761],
];

const removeSet = new Set();
REMOVE.forEach(([a, b]) => {
    for (let i = a; i <= b; i++) removeSet.add(i);
});

const kept = lines.filter((_, i) => !removeSet.has(i + 1));

const insertAt = kept.findIndex((l) => l.includes('/** Balatro: G.SETTINGS.GAMESPEED'));
const delegate = [
    '',
    '    ensureScoringAnimation() {',
    "        if (!this.scoringAnimation && typeof ScoringAnimation !== 'undefined') {",
    '            this.scoringAnimation = new ScoringAnimation(this);',
    '        }',
    '        return this.scoringAnimation;',
    '    }',
    '',
    '    /** @param {Function} callback Called when animation completes */',
    '    animateScoreUpdate(category, pips, favour, finalScore, targetCategory, callback) {',
    '        this.ensureScoringAnimation()?.playReveal(category, pips, favour, finalScore, targetCategory, callback);',
    '    }',
];

kept.splice(insertAt, 0, ...delegate);

const out = kept.join('\n');
fs.writeFileSync(file, out);
console.log('GameEngine.js', lines.length, '->', kept.length, 'lines');
