const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../game/js/game/GameEngine.js');
const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);

/** 1-based inclusive line ranges from GameEngine.js */
const RANGES = [
    [1118, 1317],
    [1371, 1499],
    [1553, 1675],
    [1722, 1761],
];

let body = RANGES.map(([start, end]) => lines.slice(start - 1, end).join('\n')).join('\n\n');

const engineProps = ['state', 'dom', 'domReady', 'isScoring', 'prng', 'lastScoredBreakdown'];
engineProps.forEach((p) => {
    body = body.replace(new RegExp(`\\bthis\\.${p}\\b`, 'g'), `this.engine.${p}`);
});

const engineMethods = [
    'scaleDelay', 'formatDisplay', 'formatFavour', 'formatFavourContrib',
    'getLiveOfferingTitle', 'getGodForCategory', 'updateAllUI', 'animateNumberCount',
    'ensureLiveScore', 'getDieFaceValue',
];
engineMethods.forEach((m) => {
    body = body.replace(new RegExp(`this\\.${m}\\(`, 'g'), `this.engine.${m}(`);
});

body = body
    .replace(/animateScoreUpdate\(/g, 'playReveal(')
    .replace(/this\.animateSequentialScoring\(/g, 'this.playSequential(')
    .replace(/animateSequentialScoring\(/g, 'playSequential(');

const out = [
    '/**',
    ' * ScoringAnimation — Balatro-style sequential score reveal (dice, boons, pantheon).',
    ' */',
    '',
    'class ScoringAnimation {',
    '    /** @param {GameEngine} engine */',
    '    constructor(engine) {',
    '        this.engine = engine;',
    '    }',
    '',
    body,
    '}',
    '',
    "if (typeof window !== 'undefined') window.ScoringAnimation = ScoringAnimation;",
    '',
].join('\n');

const outPath = path.join(__dirname, '../game/js/ui/ScoringAnimation.js');
fs.writeFileSync(outPath, out);
console.log('Wrote', outPath, out.split('\n').length, 'lines');
