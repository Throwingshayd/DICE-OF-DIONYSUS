#!/usr/bin/env node
/**
 * Extract boon data from gameData.js into boon-data.json for the Boon Card Factory.
 * Run: node tools/extract-boons.cjs
 * Run after updating game/js/data/gameData.js jokers.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const gameDataPath = path.join(root, 'game', 'js', 'data', 'gameData.js');
const outPath = path.join(root, 'game', 'public', 'boon-data.json');

global.RARITY_WEIGHTS = { RUSTIC: 1, VIBRANT: 1, EPIC: 1, WORSHIP: 1, LIBATION: 1, ARTIFACT: 1 };

const code = fs.readFileSync(gameDataPath, 'utf8');
const match = code.match(/jokers:\s*(\[[\s\S]*?\])\s*,\s*consumables/);
if (!match) {
  console.error('Could not extract jokers array from gameData.js');
  process.exit(1);
}

const jokers = eval(match[1]);
const out = jokers.map((j) => ({
  id: j.id,
  name: j.name,
  rarity: j.rarity,
  cost: j.cost,
  sellValue: j.sellValue,
  effect: j.effect,
  description: j.description || '',
  god: j.god || '',
}));

fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log(`Wrote ${out.length} boons to game/public/boon-data.json`);

// Also extract jokers asset mapping for Boon Factory
const assetMappingPath = path.join(root, 'game', 'js', 'data', 'assetMapping.js');
const assetCode = fs.readFileSync(assetMappingPath, 'utf8');
const jokersBlock = assetCode.match(/jokers:\s*\{([\s\S]*?)\}\s*,\s*\n\s*\/\/ Worship/);
const assetMapping = {};
if (jokersBlock) {
  const pairs = jokersBlock[1].matchAll(/\s*['"]([^'"]+)['"]\s*:\s*['"]([^'"]+)['"]/g);
  for (const m of pairs) assetMapping[m[1]] = m[2];
}
const mappingPath = path.join(root, 'game', 'public', 'asset-mapping.json');
fs.writeFileSync(mappingPath, JSON.stringify(assetMapping, null, 2));
console.log(`Wrote ${Object.keys(assetMapping).length} asset mappings to game/public/asset-mapping.json`);
