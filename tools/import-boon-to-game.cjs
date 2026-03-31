#!/usr/bin/env node
/**
 * Import a boon from boon-export.json into the game.
 * Run: npm run import-boon
 * Or: node tools/import-boon-to-game.cjs [path-to-boon-export.json]
 *
 * Default: tools/exports/boon-export.json, fallback to project root boon-export.json.
 * Updates gameData.js and assetMapping.js, saves image to ART/ if provided.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const defaultPaths = [
  path.join(root, 'tools', 'exports', 'boon-export.json'),
  path.join(root, 'boon-export.json'),
];
const exportPath = process.argv[2] || defaultPaths.find(p => fs.existsSync(p)) || defaultPaths[0];
const gameDataPath = path.join(root, 'game', 'js', 'data', 'gameData.js');
const assetMappingPath = path.join(root, 'game', 'js', 'data', 'assetMapping.js');
const artDir = path.join(root, 'game', 'public', 'ART');

if (!fs.existsSync(exportPath)) {
  console.error('boon-export.json not found. Export from Boon Card Factory first.');
  console.error('Save to tools/exports/boon-export.json or project root boon-export.json');
  console.error('Or pass path: npm run import-boon tools/exports/<id>-export.json');
  process.exit(1);
}

const exportData = JSON.parse(fs.readFileSync(exportPath, 'utf8'));
const { id, name, effect, description, god, cost, sellValue, rarity, timing, imageBase64, imageFilename } = exportData;

if (!id || !name || !effect) {
  console.error('Export must have id, name, and effect.');
  process.exit(1);
}

const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// 1. Save image if provided
const filename = imageFilename || id.replace(/_/g, ' ') + '.png';
if (imageBase64 && imageBase64.startsWith('data:')) {
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
  const buf = Buffer.from(base64Data, 'base64');
  if (!fs.existsSync(artDir)) fs.mkdirSync(artDir, { recursive: true });
  fs.writeFileSync(path.join(artDir, filename), buf);
  console.log(`Saved image: ART/${filename}`);
}

// 2. Update gameData.js
let gameDataCode = fs.readFileSync(gameDataPath, 'utf8');
const boonEntry = `        { 
            id: "${id}", 
            name: "${name}", 
            rarity: "${rarity || 'rustic'}", 
            cost: ${cost ?? 5}, 
            sellValue: ${sellValue ?? 1}, 
            effect: "${(effect || '').replace(/"/g, '\\"')}",${description ? `\n            description: "${description.replace(/"/g, '\\"')}",` : ''}${god ? `\n            god: "${god}",` : ''}
            timing: ${JSON.stringify(timing || { before_score: true })}
        }`;

const existingBoonRegex = new RegExp(`\\{\\s*id:\\s*["']${escapedId}["'][\\s\\S]*?\\n\\s*\\},?`, 'm');
if (existingBoonRegex.test(gameDataCode)) {
  gameDataCode = gameDataCode.replace(existingBoonRegex, boonEntry + ',');
  console.log(`Updated boon "${name}" in gameData.js`);
} else {
  const insertPoint = gameDataCode.indexOf('boons: [') + 8;
  gameDataCode = gameDataCode.slice(0, insertPoint) + '\n' + boonEntry + ',\n        ' + gameDataCode.slice(insertPoint);
  console.log(`Added boon "${name}" to gameData.js`);
}
fs.writeFileSync(gameDataPath, gameDataCode);

// 3. Update assetMapping.js
let assetCode = fs.readFileSync(assetMappingPath, 'utf8');
const mappingLine = `        '${id}': '${filename}'`;
const mappingRegex = new RegExp(`['"]${escapedId}['"]\\s*:\\s*['"][^'"]+['"]`);
if (mappingRegex.test(assetCode)) {
  assetCode = assetCode.replace(mappingRegex, `'${id}': '${filename}'`);
  console.log(`Updated asset mapping for "${id}"`);
} else {
  assetCode = assetCode.replace(
    /(\n        '[^']+': '[^']+'(?:[^\n,]*))(\n    \},\n\n    \/\/ Worship Card Assets)/,
    `$1,\n${mappingLine}$2`
  );
  console.log(`Added asset mapping for "${id}"`);
}
fs.writeFileSync(assetMappingPath, assetCode);

// 4. Update asset-mapping.json for Boon Factory
const assetMappingJsonPath = path.join(root, 'game', 'public', 'asset-mapping.json');
if (fs.existsSync(assetMappingJsonPath)) {
  const mapping = JSON.parse(fs.readFileSync(assetMappingJsonPath, 'utf8'));
  mapping[id] = filename;
  fs.writeFileSync(assetMappingJsonPath, JSON.stringify(mapping, null, 2));
  console.log('Updated asset-mapping.json for Boon Factory');
}

console.log('Done! Run npm run extract-boons to refresh boon-data.json for the factory.');
